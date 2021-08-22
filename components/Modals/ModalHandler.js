export async function triggerWinModal(
  setActiveModalStats,
  setShowWinModal,
  wins
) {
  console.log(wins)
  setActiveModalStats(wins);
  // show modal
  setShowWinModal(true);
}