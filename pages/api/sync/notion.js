// Pulls new wins from each player's Notion Success Plan into success_plan.
//
// Replaces the n8n "Notion Win > Supabase" workflow. Triggered by pg_cron via
// pg_net (see supabase/README-cron.md), not by user traffic.
//
// Design notes:
//
//  * TIERED POLLING. The old workflow polled all 1,430 healthy credentials
//    every 3 minutes -- ~686k Notion calls/day to discover ~24 wins/month.
//    Credentials belonging to recently-active players are polled every run;
//    everything else is swept round-robin, oldest-first, a slice at a time.
//
//  * UPSERT, NOT DELETE-THEN-INSERT. The old workflow fanned out to a DELETE
//    and an INSERT in parallel branches; when the delete landed second the win
//    vanished, and when it landed early the win doubled. 247 duplicate
//    (notion_id, player) rows in the table are the evidence.
//
//  * REAL PAGINATION. The old workflow capped at 100 results with no cursor,
//    so a player with a backlog silently lost the remainder.
//
//  * HONEST ERROR STATE. A credential is only marked dead after
//    MAX_CONSECUTIVE_FAILURES consecutive failures, and the reason is recorded.
//    The old workflow flagged on any single failure by comparing n8n execution
//    ids, which is how 9,938 of 12,150 rows ended up flagged.

import { createClient } from '@supabase/supabase-js';
import { Client } from '@notionhq/client';

import { calculateRewards } from '@/utils/rewards';

// Keep a run comfortably inside Vercel's function timeout (10s on Hobby).
// The cron cadence catches up on whatever a run doesn't reach.
const DEFAULT_BATCH_SIZE = 15;
// Small pages: every fetched win is marked in Notion in the same run, and
// Notion rate-limits a burst of 100 marks enough to push a run past 9s
// (seen 25 Nov 2026). A backlog drains 25 wins per page instead.
const NOTION_PAGE_SIZE = 25;
const MAX_PAGES_PER_CREDENTIAL = 10;
const MAX_CONSECUTIVE_FAILURES = 5;
// Timing, against Vercel's 10s limit (Hobby), measured from the start of the
// request. Everything a run does must finish by RUN_DEADLINE_MS, leaving room
// for the cold start that comes before the handler runs.
//  - A credential is started only if CREDENTIAL_MIN_MS remain: enough for
//    the usual case, a quick query that finds nothing new.
//  - A Notion query gets at most QUERY_TIMEOUT_MS, and paging stops while
//    MARK_RESERVE_MS + SAVE_RESERVE_MS still remain.
//  - Wins are stored only if there is time to mark them in Notion in the
//    same run. Otherwise they are left alone and fetched again next time,
//    rather than stored unmarked (and refetched on every run).
const RUN_DEADLINE_MS = 7000;
const CREDENTIAL_MIN_MS = 2500;
const QUERY_TIMEOUT_MS = 3000;
const SAVE_RESERVE_MS = 700;
const MARK_RESERVE_MS = 2000;
const SHARED_MARKER = 'Shared With Family';

const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

function notionFilter(collaborator) {
  const and = [
    {
      property: 'Family Connection',
      rich_text: { does_not_contain: SHARED_MARKER }
    },
    {
      property: 'Share With Family?',
      checkbox: { equals: true }
    }
  ];

  if (collaborator) {
    and.push({ property: 'Collaborators', people: { contains: collaborator } });
  }

  return { and };
}

// Notion property readers. Every one of these has to tolerate the property
// being absent or a different type -- these are user-owned databases and the
// schema is whatever they made it.
const plainText = (prop) => {
  if (!prop) return null;
  const parts = prop.rich_text || prop.title;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  return parts.map((p) => p.plain_text).join('').trim() || null;
};

const selectName = (prop) => {
  if (!prop) return null;
  if (prop.select) return prop.select.name || null;
  if (Array.isArray(prop.multi_select) && prop.multi_select.length) {
    return prop.multi_select[0].name || null;
  }
  return null;
};

const numberValue = (prop) =>
  prop && typeof prop.number === 'number' ? prop.number : null;

// A Notion date range: prefer the end of a span, else its start.
const dateValue = (prop, preferEnd = false) => {
  if (!prop || !prop.date) return null;
  if (preferEnd && prop.date.end) return prop.date.end.split('T')[0];
  return prop.date.start ? prop.date.start.split('T')[0] : null;
};

function toRow(page, credential) {
  const props = page.properties || {};
  const today = new Date().toISOString().split('T')[0];

  const name = plainText(props['Name']);
  if (!name) return null; // a page with no title is not a win

  const closingDate = dateValue(props['Closing Date']) || today;
  const doDate = dateValue(props['Do Date'], true) || today;
  const type = selectName(props['Type']) || 'Uncategorized';

  const rewards = calculateRewards({
    type,
    difficulty: numberValue(props['Difficulty']),
    closingDate,
    doDate
  });

  return {
    notion_id: page.id,
    player: credential.player,
    name,
    type,
    do_date: doDate,
    closing_date: closingDate,
    area: selectName(props['Area']),
    impact: selectName(props['Impact']),
    upstream: plainText(props['Upstream (Sum)']),
    upstream_id: plainText(props['Upstream']),
    database_nickname: credential.nickname,
    source: 'notion',
    ...rewards
  };
}

// Errors that say nothing about whether the credential is healthy: Notion was
// slow, rate-limited or down, or the network dropped. These are recorded but
// don't count toward disabling the credential.
const TRANSIENT_CODES = new Set([
  'notionhq_client_request_timeout',
  'rate_limited',
  'internal_server_error',
  'service_unavailable',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EAI_AGAIN'
]);

function isTransient(err) {
  return TRANSIENT_CODES.has(err?.code) || (err?.status >= 500 && err?.status < 600);
}

async function syncCredential(db, credential, deadline) {
  const left = () => deadline - Date.now();
  // A hung call must fail on its own: the client's default wait is 60s, which
  // let one slow credential run every request into Vercel's limit.
  const notion = (timeoutMs) =>
    new Client({ auth: credential.api_secret_key, timeoutMs: Math.max(500, timeoutMs) });

  const rows = [];
  let cursor;
  let pages = 0;

  do {
    const response = await notion(
      Math.min(QUERY_TIMEOUT_MS, left() - 300)
    ).databases.query({
      database_id: credential.database_id,
      filter: notionFilter(credential.collaborator),
      page_size: NOTION_PAGE_SIZE,
      start_cursor: cursor
    });

    for (const page of response.results) {
      const row = toRow(page, credential);
      if (row) rows.push(row);
    }

    cursor = response.has_more ? response.next_cursor : undefined;
    pages += 1;
  } while (
    cursor &&
    pages < MAX_PAGES_PER_CREDENTIAL &&
    left() > QUERY_TIMEOUT_MS + SAVE_RESERVE_MS + MARK_RESERVE_MS
  );

  if (rows.length === 0) return { wins: 0, truncated: Boolean(cursor) };

  if (left() < SAVE_RESERVE_MS + MARK_RESERVE_MS) {
    return { wins: 0, postponed: rows.length, truncated: true };
  }

  // Insert only: a win already stored is left exactly as it is. Pages are
  // fetched only until they're marked, so a repeat means an earlier run stored
  // the win but didn't mark it -- and re-writing it would move a missing
  // Closing/Do Date to today and re-price the reward.
  const { error: upsertError } = await db
    .from('success_plan')
    .upsert(rows, { onConflict: 'notion_id,player', ignoreDuplicates: true });

  if (upsertError) throw new Error(`upsert failed: ${upsertError.message}`);

  // Only stamp Notion once the win is durably stored. A page that fails to be
  // marked is fetched again next run, which the insert-only write makes safe.
  const markClient = notion(left() - 300);
  const marked = await Promise.allSettled(
    rows.map((row) =>
      markClient.pages.update({
        page_id: row.notion_id,
        properties: {
          'Family Connection': {
            rich_text: [{ text: { content: SHARED_MARKER } }]
          }
        }
      })
    )
  );

  const unmarked = marked.filter((m) => m.status === 'rejected').length;

  return { wins: rows.length, unmarked, truncated: Boolean(cursor) };
}

export default async function handler(req, res) {
  const startedAt = Date.now();
  const deadline = startedAt + RUN_DEADLINE_MS;
  const secret = process.env.SYNC_SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'SYNC_SECRET is not configured' });
  }
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const batchSize = Math.min(
    Number(req.query.batch) || DEFAULT_BATCH_SIZE,
    50
  );

  const db = admin();

  // sync_candidates orders hot credentials (recently-active players) ahead of
  // the round-robin sweep. See the migration for its definition.
  const { data: credentials, error } = await db
    .from('sync_candidates')
    .select('*')
    .limit(batchSize);

  if (error) {
    return res.status(500).json({ error: `candidate query: ${error.message}` });
  }

  const summary = { scanned: 0, wins: 0, failed: 0, deferred: 0, details: [] };

  for (const credential of credentials || []) {
    if (deadline - Date.now() < CREDENTIAL_MIN_MS) {
      summary.deferred += 1; // still at the head of the queue for the next run
      continue;
    }

    // Claim it before working on it. If Vercel kills the run part-way, this
    // credential has still moved to the back of sync_candidates, so one that
    // keeps timing out can't sit at the head of the queue and stall every run
    // (it did, from 30 Oct to 25 Nov 2026).
    const { error: claimError } = await db
      .from('notion_credentials')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', credential.id);
    if (claimError) {
      console.error(`claim ${credential.id} failed: ${claimError.message}`);
      summary.deferred += 1;
      continue;
    }
    summary.scanned += 1;

    try {
      const result = await syncCredential(db, credential, deadline);
      summary.wins += result.wins;

      await db
        .from('notion_credentials')
        .update({
          last_synced_at: new Date().toISOString(),
          consecutive_failures: 0,
          last_error: null
        })
        .eq('id', credential.id);

      if (result.wins > 0 || result.postponed || result.truncated) {
        summary.details.push({ id: credential.id, ...result });
      }
    } catch (err) {
      summary.failed += 1;

      const message = String(err.message || err).slice(0, 500);
      const transient = isTransient(err);
      const failures = (credential.consecutive_failures || 0) + (transient ? 0 : 1);

      await db
        .from('notion_credentials')
        .update({
          last_synced_at: new Date().toISOString(),
          consecutive_failures: failures,
          last_error: transient ? `(transient) ${message}` : message,
          // Only give up after repeated real failures, and record why.
          error: failures >= MAX_CONSECUTIVE_FAILURES
        })
        .eq('id', credential.id);

      summary.details.push({ id: credential.id, failures, transient, error: message.slice(0, 200) });
    }
  }

  summary.ms = Date.now() - startedAt;
  return res.status(200).json(summary);
}
