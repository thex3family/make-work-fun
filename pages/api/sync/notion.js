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
const NOTION_PAGE_SIZE = 100;
const MAX_PAGES_PER_CREDENTIAL = 10;
const MAX_CONSECUTIVE_FAILURES = 5;
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

async function syncCredential(db, credential) {
  const notion = new Client({ auth: credential.api_secret_key });

  const rows = [];
  let cursor;
  let pages = 0;

  do {
    const response = await notion.databases.query({
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
  } while (cursor && pages < MAX_PAGES_PER_CREDENTIAL);

  if (rows.length === 0) return { wins: 0, truncated: Boolean(cursor) };

  // Idempotent: re-running over the same pages updates in place rather than
  // duplicating. Requires the unique index on (notion_id, player).
  const { error: upsertError } = await db
    .from('success_plan')
    .upsert(rows, { onConflict: 'notion_id,player' });

  if (upsertError) throw new Error(`upsert failed: ${upsertError.message}`);

  // Only stamp Notion once the win is durably stored. If this half fails the
  // page stays unmarked and the next run upserts it again -- which is safe
  // precisely because the write above is an upsert.
  const marked = await Promise.allSettled(
    rows.map((row) =>
      notion.pages.update({
        page_id: row.notion_id,
        properties: {
          'Family Connection': {
            rich_text: [{ text: { content: SHARED_MARKER } }]
          }
        }
      })
    )
  );

  const failedMarks = marked.filter((m) => m.status === 'rejected').length;

  return { wins: rows.length, failedMarks, truncated: Boolean(cursor) };
}

export default async function handler(req, res) {
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

  const summary = { scanned: 0, wins: 0, failed: 0, details: [] };

  for (const credential of credentials || []) {
    summary.scanned += 1;

    try {
      const result = await syncCredential(db, credential);
      summary.wins += result.wins;

      await db
        .from('notion_credentials')
        .update({
          last_synced_at: new Date().toISOString(),
          consecutive_failures: 0,
          last_error: null
        })
        .eq('id', credential.id);

      if (result.wins > 0 || result.truncated) {
        summary.details.push({ id: credential.id, ...result });
      }
    } catch (err) {
      summary.failed += 1;

      const failures = (credential.consecutive_failures || 0) + 1;

      await db
        .from('notion_credentials')
        .update({
          last_synced_at: new Date().toISOString(),
          consecutive_failures: failures,
          last_error: String(err.message || err).slice(0, 500),
          // Only give up after repeated failures, and record why.
          error: failures >= MAX_CONSECUTIVE_FAILURES
        })
        .eq('id', credential.id);

      summary.details.push({
        id: credential.id,
        failures,
        error: String(err.message || err).slice(0, 200)
      });
    }
  }

  return res.status(200).json(summary);
}
