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
  setActiveModalStats,
  setShowCardWin,
  wins,
  setAvatarUrl
) {
  const player = await fetchPlayerStats(setAvatarUrl, wins.player)
  setActiveModalStats(wins);
  // show modal
  setShowCardWin(player.full_name);
}