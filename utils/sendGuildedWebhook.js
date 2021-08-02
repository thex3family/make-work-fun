export async function shareWithGuilded(playerStats, activeModalStats, activeGIF) {
    let textNextRank = '';
    if (playerStats.next_rank) {
      textNextRank = `(${playerStats.next_rank} EXP to next rank)`;
    }

    fetch(process.env.NEXT_PUBLIC_GUILDED_WEBHOOK, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: null,
        // embeds to be sent

        embeds: [
          {
            // decimal number colour of the side of the embed
            color: null,
            author: {
              name: `🎉 ${playerStats.full_name} completed a ${activeModalStats.type}!`
            },
            // author
            // - icon next to text at top (text is a link)
            // embed title
            // - link on 2nd row
            title: `${activeModalStats.name}`,
            url: `${activeModalStats.notion_id ? `https://www.notion.so/${activeModalStats.notion_id.replace(/-/g, '')}` : `https://makework.fun/dailies/`}`,
            // thumbnail
            thumbnail: {
              url: `${activeGIF}`
            },
            // embed description
            // - text on 3rd row
            description: `Completed On: ${activeModalStats.closing_date}`,
            // custom embed fields: bold title/name, normal content/value below title
            // - located below description, above image.
            fields: [
              {
                name: '🏆 Leaderboard Position',
                value: `#${playerStats.player_rank} ${textNextRank}` ////
              }
            ],
            // image
            // - picture below description(and fields) - this needs to be the gif that we fetch from random whatever.
            // image: {
            //   url:
            //     'http://makework.fun/img/celebratory-cat.gif',
            // },
            // footer
            // - icon next to text at bottom
            footer: {
              text: `+${activeModalStats.gold_reward} 💰 | +${activeModalStats.exp_reward} XP | ${activeModalStats.upstream}`
            }
          },
          {
            color: null,
            author: {
              name: '💬 Start a discussion!'
              // url: 'https://toolbox.co-x3.com/family-connection/?utm_source=guilded',
            }
          }
        ]
      })
    });
  }