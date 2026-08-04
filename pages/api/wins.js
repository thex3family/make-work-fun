// Accepts a win submitted programmatically with an API key.
//
// Replaces the n8n "API_Win > Supabase" webhook, which lived at
// https://n8n.x3.family/webhook/new-win and went offline with the n8n box.
// Same contract, so keys already issued keep working:
//
//   POST /api/wins
//   Content-Type: application/json
//   { "api_key": "<uuid>", "name": "Test" }
//
// `name` is the only required field beyond the key. An Authorization: Bearer
// header is also accepted, since that is the more conventional place for a
// credential -- the body form is kept for backwards compatibility.
//
// The player is always derived from the API key. It is never read from the
// request body: that is the same mistake /api/account-data had, where a
// caller-supplied user id let anyone act as anyone.

import { supabaseAdmin } from '@/utils/supabase-admin';
import { calculateRewards } from '@/utils/rewards';

// success_plan.type is NOT NULL. The n8n version coerced anything unrecognised
// to 'Task', which also matches the column default.
const KNOWN_TYPES = ['Goal', 'Key Result', 'Project', 'Task'];

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    const bearer = (req.headers.authorization || '').replace(/^Bearer /i, '');
    const apiKey = str(bearer) || str(body.api_key);

    if (!apiKey) {
      return res.status(401).json({ error: 'Missing api_key' });
    }

    // api_keys is RLS-scoped to its owner, so this lookup has to run as
    // service_role -- the caller has an API key, not a session.
    // Not .single(): it treats zero rows as an error, and an unknown key is an
    // ordinary 401, not an exception. Not .maybeSingle() either -- it exists in
    // the pinned postgrest-js 0.37.1, but nothing else in this codebase uses it
    // and this route cannot be exercised locally, so stick to the proven shape.
    const { data: keyRows, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('player')
      .eq('id', apiKey)
      .limit(1);

    const keyRow = keyRows && keyRows[0];

    if (keyError || !keyRow) {
      // Same answer for malformed, unknown and revoked keys -- no oracle.
      return res.status(401).json({ error: 'Invalid api_key' });
    }

    const name = str(body.name);
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const rawType = str(body.type);
    const type = KNOWN_TYPES.includes(rawType) ? rawType : 'Task';

    const today = new Date().toISOString().split('T')[0];
    const closingDate = str(body.closing_date) || today;
    const doDate = str(body.do_date) || today;

    // The n8n version read difficulty off the wrong node, so it was silently
    // always 1 no matter what the caller sent. Honouring it here is a
    // deliberate deviation -- no API win has been submitted since Feb 2025, so
    // nothing historical is re-priced.
    const rewards = calculateRewards({
      type,
      difficulty: body.difficulty,
      closingDate,
      doDate
    });

    const row = {
      player: keyRow.player,
      name,
      type,
      do_date: doDate,
      closing_date: closingDate,
      upstream: str(body.upstream),
      upstream_id: str(body.upstream_id),
      area: str(body.area),
      impact: str(body.impact),
      database_nickname: str(body.database_nickname),
      source: 'api',
      ...rewards
    };

    const { data, error } = await supabaseAdmin
      .from('success_plan')
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json({
      id: data.id,
      name: data.name,
      type: data.type,
      exp_reward: data.exp_reward,
      gold_reward: data.gold_reward,
      trend: data.trend,
      closing_date: data.closing_date
    });
  } catch (error) {
    console.error('POST /api/wins failed:', error.message);
    return res.status(500).json({ error: 'Could not record the win' });
  }
}
