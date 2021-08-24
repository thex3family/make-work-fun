import { fetchPlayerStats } from '@/components/Fetch/fetchMaster';

export async function triggerWinModal(
  setActiveModalStats,
  setShowWinModal,
  wins
) {
  setActiveModalStats(wins);
  // show modal
  setShowWinModal(true);
}

export async function triggerCardWin(
  setActiveWinStats,
  setShowCardWin,
  wins,
  setAvatarUrl
) {
  const player = await fetchPlayerStats(setAvatarUrl, wins.player)
  setActiveWinStats(wins);
  // show modal
  setShowCardWin(player.full_name);
}