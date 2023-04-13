export async function shareWithCircle(playerStats, activeModalStats, activeGIF, setSharedWithFamily, email) {
  setSharedWithFamily('Sending...')
  let textNextRank = '';
  let userResponse = '';
  if (playerStats.next_rank) {
    textNextRank = `(${playerStats.next_rank} EXP to next rank)`;
  }

  var requestOptions = {
    method: 'POST',
    body: JSON.stringify({
      name: `${activeModalStats.name}`,
      win: `Finished a ${activeModalStats.type}`,
      rewards: `+${activeModalStats.gold_reward} 💰 | +${activeModalStats.exp_reward} XP ${activeModalStats.upstream ? ` | ${activeModalStats.upstream}` : ``}`,
      leaderboard: `#${playerStats.player_rank} ${textNextRank}`,
      url: `https://makework.fun/player?utm_source=notification&win_id=${activeModalStats.id}`,
      image: `${activeGIF}`,
      user_email: `${email ? email : ""}`,
      // user_email: `test123@conradlin.com`,
    }),
  };

  fetch("https://n8n.x3.family/webhook/share-with-circle", requestOptions)
    .then(response => response.text())
    .then(result => setSharedWithFamily((JSON.parse(result)).message))
    .catch(error => console.log('error', error));
}