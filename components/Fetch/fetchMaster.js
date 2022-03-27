import { supabase } from '@/utils/supabase-client';
import notifyMe from '@/components/Notify/win_notification';
import { downloadImage } from '@/utils/downloadImage';
import moment from 'moment';

export async function fetchLatestWin(
  setActiveModalStats,
  refreshStats,
  setLevelUp,
  triggerWinModal,
  setShowWinModal,
  player_id,
  triggerCardWin,
  setShowCardWin,
  setActiveWinStats,
  friends
) {
  try {
    console.log('Checking for wins')
    // check if there is any win (only works when the app is open) - future will move it to a server
    if (!player_id) {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('success_plan')
        .on('INSERT', async (payload) => {
          console.log('New Win Incoming!', payload, payload.new.player);

          // checking if the win is assigned to the current user
          if (user) {
            if (payload.new.player === user.id) {
              // Get the latest updated stats of the user
              const player = await fetchPlayerStats();
              // check if user leveled up

              if (player.current_level > player.previous_level) {
                // level up animation
                setLevelUp(player.current_level);
                notifyMe('level', player.current_level);
              }

              // If win is from success plan, set up the modal
              // if(payload.new.type !== 'Daily Quest'){
              triggerWinModal(
                setActiveModalStats,
                setShowWinModal,
                payload.new
              );
              notifyMe('win', payload.new);
              // }
            } else {
              // if it is not the current user
              // if Show Card Win Exists (usually on leaderboard)
              if (triggerCardWin) {
                triggerCardWin(setActiveWinStats, setShowCardWin, payload.new);
              }
            }
          } else {
            // if not logged in
            // if Show Card Win Exists (usually on leaderboard)
            if (triggerCardWin) {
              if (friends) {
                if (friends.includes(payload.new.player)) {
                  triggerCardWin(
                    setActiveWinStats,
                    setShowCardWin,
                    payload.new
                  );
                }
              } else {
                triggerCardWin(setActiveWinStats, setShowCardWin, payload.new);
              }
            }
          }
          refreshStats();
        })
        .subscribe();
    }

    if (player_id) {
      const { data, error } = await supabase
        .from('success_plan')
        .on('INSERT', async (payload) => {
          console.log(
            'New Specific Win Incoming!',
            payload,
            payload.new.player
          );

          // checking if the win is assigned to the current user
          if (player_id) {
            if (payload.new.player === player_id) {
              // Get the latest updated stats of the user
              const player = await fetchPlayerStats(player_id);

              // check if user leveled up

              if (player.current_level > player.previous_level) {
                // level up animation
                setLevelUp(player.current_level);
                notifyMe('level', player.current_level);
              }

              // If win is from success plan, set up the modal
              // if(payload.new.type !== 'Daily Quest'){
              triggerWinModal(
                setActiveModalStats,
                setShowWinModal,
                payload.new
              );
              notifyMe('win', payload.new);
              // }
            }
          }
          refreshStats();
        })
        .subscribe();
    }
  } catch (error) {
    alert(error.message);
  } finally {
  }
}

export async function fetchPlayerStats(player, setNewToSeason) {
  try {
    // gets the latest information about the user from the latest leaderboard
    if (!player) {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('leaderboard_season')
        .select('*')
        .eq('player', user.id)
        .eq('latest', true)
        .single();

      if (data) {
        var newData = {
          ...data,
          avatar_url: data.avatar_url
            ? await downloadImage(data.avatar_url, 'avatar')
            : null
        };

        return newData;
      } else {
        setNewToSeason(true)
      }
    }

    if (player) {
      const { data, error } = await supabase
        .from('leaderboard_season')
        .select('*')
        .eq('player', player)
        .eq('latest', true)
        .single();

      if (data) {
        var newData = {
          ...data,
          avatar_url: data.avatar_url
            ? await downloadImage(data.avatar_url, 'avatar')
            : null
        };

        return newData;
      } else {
        setNewToSeason(true)
      }
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message);
  } finally {
  }
}

export async function fetchWins() {
  try {
    const user = supabase.auth.user();

    const { data, error } = await supabase
      .from('success_plan')
      .select(
        'id, name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend, notion_id, gif_url, entered_on, database_nickname, player)'
      )
      .eq('player', user.id)
      .order('closing_date', { ascending: false })
      .order('entered_on', { ascending: false });
    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    alert(error.message);
  } finally {
  }
}

export async function fetchSpecificWin(win_id) {
  try {
    const user = supabase.auth.user();

    const { data, error } = await supabase
      .from('success_plan')
      .select(
        'id, name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend, notion_id, gif_url, entered_on, database_nickname'
      )
      .eq('player', user.id)
      .eq('id', win_id)
      .order('closing_date', { ascending: false })
      .order('entered_on', { ascending: false })
      .single();

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    console.log('No Specific win found!');
  } finally {
  }
}

export async function fetchSpecificWins(upstream_id, start_date, due_date) {

  try {
    const { data, error } = await supabase
      .from('success_plan')
      .select(
        'id, name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend, notion_id, gif_url, entered_on, database_nickname'
      )
      .like('upstream_id', '%'+upstream_id+'%')
      .gte('closing_date', start_date)
      .lte('closing_date', due_date)
      .order('closing_date', { ascending: false })
      .order('entered_on', { ascending: false });

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    console.log('No Specific Wins found!');
  } finally {
  }
}

export async function fetchWinsPastDate(player, start_date, due_date) {
  
  try {
    const { data, error } = await supabase
      .from('success_plan')
      .select(
        'id, name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend, notion_id, gif_url, entered_on, database_nickname'
      )
      .eq('player', player)
      .gte('closing_date', start_date)
      .lte('closing_date', due_date)
      .order('closing_date', { ascending: false })
      .order('entered_on', { ascending: false });

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    console.log('No Specific Wins found!');
  } finally {
  }
}

export async function fetchWeekWins(player) {
  try {
    if (!player) {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('week_win_count')
        .select('*')
        .eq('player', user.id)
        .single();

      if (data) {
        return data;
      }
    }

    if (player) {
      const { data, error } = await supabase
        .from('week_win_count')
        .select('*')
        .eq('player', player)
        .single();

      if (data) {
        return data;
      }
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchLeaderboardStats(setPlayers, setLoading, season) {
  try {
    if (season) {
      const { data, error } = await supabase
        .from('leaderboard_season')
        .select('*')
        .order('total_exp', { ascending: false })
        .eq('season', season);

      if (data) {
        // var newData = data;

        // for (let i = 0; i < data.length; i++) {
        //   let oldData = data[i];
        //   newData[i] = {
        //     ...oldData,
        //     avatar_url: (oldData.avatar_url ? await downloadImage(oldData.avatar_url, 'avatar') : null),
        //     background_url: (oldData.background_url ? await downloadImage(oldData.background_url, 'background') : null)
        //   };
        // }
        // setPlayers(newData);

        // above makes the loading of data too slow.

        setPlayers(data);
      }

      if (error && status !== 406) {
        throw error;
      }
    } else {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_exp', { ascending: false });

      if (data) {
        // var newData = data;

        // for (let i = 0; i < data.length; i++) {
        //   let oldData = data[i];
        //   newData[i] = {
        //     ...oldData,
        //     avatar_url: (oldData.avatar_url ? await downloadImage(oldData.avatar_url, 'avatar') : null),
        //     background_url: (oldData.background_url ? await downloadImage(oldData.background_url, 'background') : null)
        //   };
        // }
        // setPlayers(newData);

        // above makes the loading of data too slow.

        setPlayers(data);
      }

      if (error && status !== 406) {
        throw error;
      }
    }
  } catch (error) {
    // alert(error.message)
  } finally {
    setLoading(false);
  }
}

export async function fetchPlayers(setPlayers) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_exp', { ascending: false });

    if (data) {
      setPlayers(data);
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

// may not need this
export async function fetchPartyPlayers(party_id) {
  try {
    const { data, error } = await supabase
      .from('party_member_details')
      .select('*')
      .order('role', { ascending: false })
      .eq('party_id', party_id);

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchAllParties() {
  try {
    const { data, error } = await supabase
      .from('party')
      .select('*')
      .order('due_date', { ascending: false })

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchSpecificPlayers(id, setFriends) {
  try {
    const { data } = await supabase
      .from('friendship_links')
      .select('*')
      .eq('id', id)
      .single();

    const friends = (
      JSON.stringify(data.friends) +
      ',player.eq.' +
      JSON.stringify(data.user)
    ).replace(/"/g, '');
    setFriends(friends);

    if (friends) {
      const { data, error } = await supabase
        .from('leaderboard_season')
        .select('*')
        .eq('latest', true)
        .order('total_exp', { ascending: false })
        .or(friends);
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchFriendships(setFriendships) {
  try {
    const user = supabase.auth.user();
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('user', user.id);

    if (data) {
      var friendData = [];
      data.map((friend) => friendData.push('player.eq.' + friend.friend));
      setFriendships(friendData.toString());
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchFriendshipLink(setFriendshipLink) {
  try {
    const user = supabase.auth.user();
    const { data, error } = await supabase
      .from('friendship_links')
      .select('*')
      .eq('user', user.id)
      .single();

    if (data) {
      setFriendshipLink(data);
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchAreaStats(player) {
  try {
    if (!player) {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('area_stats')
        .select('*')
        .eq('player', user.id)
        .limit(6);

      if (data) {
        return data;
      }
    }
    if (player) {
      const { data, error } = await supabase
        .from('area_stats')
        .select('*')
        .eq('player', player)
        .limit(6);

      if (data) {
        return data;
      }
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchTitles() {
  try {
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .eq('active', true);

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchParty(party_slug) {
  try {
    const { data, error } = await supabase
      .from('party_details')
      .select('*')
      .eq('slug', party_slug)
      .single();

    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function fetchPartyMembers(party_id) {
  try {
    const { data, error } = await supabase
      .from('party_member_details')
      .select('*')
      .order('role', { ascending: false })
      .order('notion_page_name', { ascending: false })
      .eq('party_id', party_id);

    if (data) {
      var newData = data;

      for (let i = 0; i < data.length; i++) {
        let oldData = data[i];
        newData[i] = {
          ...oldData,
          avatar_url: oldData.avatar_url
            ? await downloadImage(oldData.avatar_url, 'avatar')
            : null,
          background_url: oldData.background_url
            ? await downloadImage(oldData.background_url, 'background')
            : null,
          dragon_bg_url: oldData.dragon_bg_url
            ? await downloadImage(oldData.dragon_bg_url, 'background')
            : null
        };
      }
      return newData;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    alert(error.message);
  } finally {
  }
}

export async function fetchNotionCredentials() {
  try {
    // setLoading(true);
    const user = supabase.auth.user();

    let { data, error, status } = await supabase
      .from('notion_credentials')
      .select(`*`)
      .eq('player', user.id)
      .order('id', { ascending: true });

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    alert(error.message);
  } finally {
    // setLoading(false);
  }
}

export async function fetchAPIKeys() {
  try {
    const user = supabase.auth.user();

    let { data, error, status } = await supabase
      .from('api_keys')
      .select(`*`)
      .eq('player', user.id)
      .order('created_at', { ascending: true });

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    alert(error.message);
  } finally {
    // setLoading(false);
  }
}

export async function fetchDailies(player, setHabits, setLevelUp, setDailiesCount, click) {
  try {
    const { data, error } = await supabase
      .from('dailies')
      .select('*')
      .eq('player', player)
      .eq('is_active', true);

    if (data) {
      setHabits(data);
    }

    if (click === 'click') {
      const player = await fetchPlayerStats(player);

      // check if user leveled up
      if (player.current_level > player.previous_level) {
        // level up animation
        setLevelUp(player.current_level);
        notifyMe('level', player.current_level);
      }
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
    setDailiesCount(await fetchDailiesCompletedToday(player));
  }
}

export async function fetchDailiesCompletedToday(player) {
  try {
    const { data, error } = await supabase
      .from('completed_habits')
      .select('*')
      .eq('player', player)
      .gte('closing_date', moment().startOf('day').utc().format());

    if(data){
      return data.length;
    }
    //dailyBonusButtons();

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
  }
}

export async function dailyBonusButtons(player, setDailyBonus) {
  try {

    // See if bonus has already been claimed
    const { data, error } = await supabase
      .from('success_plan')
      .select('*')
      .eq('player', player)
      .eq('name', 'Daily Quest Bonus Reward')
      .gte('entered_on', moment().startOf('day').utc().format());

    if (error && status !== 406) {
      throw error;
    }
    const fetchData = data;

    if (fetchData.length == 0) {
      setDailyBonus(true);
    } else {
      setDailyBonus(false);
    }
  } catch (error) {
    alert(error.message);
  } finally {
    // How do I show the null state?
  }
}

export async function claimDailyBonus(player, setDailyBonus) {
  try {

    let testDateStr = new Date();

    const { data, error } = await supabase.from('success_plan').insert([
      {
        player: player,
        difficulty: 1,
        do_date: testDateStr,
        closing_date: testDateStr,
        trend: 'check',
        type: 'Bonus',
        punctuality: 0,
        exp_reward: 100,
        gold_reward: 50,
        name: 'Daily Quest Bonus Reward',
        area: 'Daily Quest'
      }
    ]);
    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    alert(error.message);
  } finally {
    setDailyBonus(false);
  }
}

export async function fetchAuthenticationLink(utility, setAuthenticationLink, setLoading) {
  try {
    const user = supabase.auth.user();
    const { data, error } = await supabase
      .from('authentication_links')
      .select('*')
      .eq('user', user.id)
      .eq('utility', utility)
      .single()
      .limit(1);

    if (data) {
      setAuthenticationLink(data.id);
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
    setLoading(false)
  }
}


export async function lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials) {
 
    try {
      const { data, error } = await supabase
        .from('authentication_links')
        .select('*')
        .eq('id', auth)
        .single()
  
      if(data){
        setPlayer(data.user);
      } else {
        setInvalidCredentials(true)
      }
  
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
    }
  
}