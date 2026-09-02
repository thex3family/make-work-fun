// Posts a "win shared" embed to the community Discord channel.
//
// This used to run in the browser via utils/sendDiscordWebhook.js, reading
// process.env.NEXT_PUBLIC_DISCORD_WEBHOOK. The NEXT_PUBLIC_ prefix means Next
// inlines the value into the client bundle, so the webhook URL was readable by
// anyone who fetched /_next/static/chunks/pages/_app-*.js -- which is how an
// automated scanner found it and posted a "vt_probe" marker into the channel.
//
// The URL now lives in DISCORD_WEBHOOK (no NEXT_PUBLIC_ prefix), server-side
// only, and never reaches the browser.
//
// This route is authenticated on purpose. An open endpoint that relays to a
// webhook is the same spam problem one layer removed: the caller's Supabase
// access token is verified, and the win must belong to them.

import { supabaseAdmin } from '@/utils/supabase-admin';

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhook = process.env.DISCORD_WEBHOOK;
  if (!webhook) {
    return res.status(500).json({ error: 'DISCORD_WEBHOOK is not configured' });
  }

  try {
    const token = (req.headers.authorization || '').replace(/^Bearer /i, '');
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user, error: authError } =
      await supabaseAdmin.auth.api.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { win, gif } = req.body && typeof req.body === 'object' ? req.body : {};
    const winId = win && win.id;

    if (!winId) {
      return res.status(400).json({ error: 'win.id is required' });
    }

    // Re-read the win from the database rather than trusting the body. The
    // client could otherwise post arbitrary text, or somebody else's win, into
    // a public channel.
    const { data: rows, error: winError } = await supabaseAdmin
      .from('success_plan')
      .select('id, name, type, closing_date, exp_reward, gold_reward, player')
      .eq('id', winId)
      .limit(1);

    const row = rows && rows[0];

    if (winError || !row) {
      return res.status(404).json({ error: 'Win not found' });
    }
    if (row.player !== user.id) {
      return res.status(403).json({ error: 'That win is not yours' });
    }

    // Leaderboard standing comes from the server too, for the same reason.
    const { data: standing } = await supabaseAdmin
      .from('leaderboard_season')
      .select('full_name, player_rank, next_rank')
      .eq('player', user.id)
      .eq('latest', true)
      .limit(1);

    const me = (standing && standing[0]) || {};
    const nextRank = me.next_rank ? `(${me.next_rank} EXP to next rank)` : '';

    const payload = {
      content: null,
      embeds: [
        {
          color: null,
          author: { name: `🎉 ${me.full_name || 'A player'} completed a ${row.type}!` },
          title: `${row.name}`,
          url: `https://makework.fun/player?utm_source=community&utm_medium=sharewithfamily&win_id=${row.id}`,
          thumbnail: { url: str(gif) || undefined },
          description: `Completed On: ${row.closing_date}`,
          fields: [
            {
              name: `Leaderboard Position #${me.player_rank ?? '-'}`,
              value: nextRank || '​'
            }
          ],
          footer: {
            text: `Rewards: +${row.gold_reward} 💰 | +${row.exp_reward} XP`
          }
        },
        {
          color: null,
          author: { name: '💬 Reply or Create Thread To Start A Discussion!' }
        }
      ]
    };

    const discord = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!discord.ok) {
      const detail = await discord.text().catch(() => '');
      console.error('Discord webhook rejected:', discord.status, detail.slice(0, 200));
      return res.status(502).json({ error: 'Discord rejected the message' });
    }

    return res.status(200).json({ shared: true });
  } catch (error) {
    console.error('POST /api/share/discord failed:', error.message);
    return res.status(500).json({ error: 'Could not share the win' });
  }
}
