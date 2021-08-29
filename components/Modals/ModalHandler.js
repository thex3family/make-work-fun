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
) {
  setActiveWinStats(wins);
  // show modal
  setShowCardWin(await fetchPlayerStats(wins.player));
}