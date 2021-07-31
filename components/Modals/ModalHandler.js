export async function triggerWinModal(
  setActiveModalStats,
  setShowWinModal,
  wins
) {
  setActiveModalStats(wins);
  // show modal
  setShowWinModal(true);
}