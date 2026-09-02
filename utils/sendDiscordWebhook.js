import { supabase } from './supabase-client';

// Shares a win to the community Discord channel.
//
// The webhook URL used to live here as NEXT_PUBLIC_DISCORD_WEBHOOK, which Next
// inlines into the client bundle -- so it was readable by anyone who fetched
// the app chunk, and a scanner duly found it and posted into the channel. The
// URL now lives server-side in DISCORD_WEBHOOK and this only talks to our own
// authenticated route.
//
// The server re-reads the win and the player's standing from the database, so
// only the win id and the chosen GIF need to travel.
export async function shareWithDiscord(
  playerStats,
  activeModalStats,
  activeGIF,
  setSharedWithFamily
) {
  try {
    const accessToken = supabase.auth.session()?.access_token;

    if (!accessToken) {
      setSharedWithFamily('Sign in to share');
      return;
    }

    const res = await fetch('/api/share/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        win: { id: activeModalStats?.id },
        gif: activeGIF
      })
    });

    if (!res.ok) {
      throw new Error(`share failed: ${res.status}`);
    }

    setSharedWithFamily('Win Shared');
  } catch (error) {
    // Previously this fired and forgot, so a failed share still said "Win
    // Shared". Tell the truth instead.
    console.error('Share to Discord failed:', error.message);
    setSharedWithFamily('Share failed, try again');
  }
}
