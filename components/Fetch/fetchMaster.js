import { supabase } from '@/utils/supabase-client';
import notifyMe from '@/components/Notify/win_notification';
import { downloadImage } from '@/utils/downloadImage';
import moment from 'moment';

// export async function fetchLatestWin(
//   setActiveModalStats,
//   refreshStats,
//   setLevelUp,
//   triggerWinModal,
//   setShowWinModal,
//   player_id,
//   triggerCardWin,
//   setShowCardWin,
//   setActiveWinStats,
//   friends
// ) {
//   try {
//     // check if there is any win (only works when the app is open) - future will move it to a server
//     if (!player_id) {
//       console.log('Checking for wins');
//       const user = supabase.auth.user();
//       const { data, error } = await supabase
//         .from('success_plan')
//         .on('INSERT', async (payload) => {
//           console.log('New Win Incoming!', payload, payload.new.player);

//           // checking if the win is assigned to the current user
//           if (user) {
//             if (payload.new.player === user.id) {
//               // Get the latest updated stats of the user
//               const player = await fetchPlayerStats();
//               // check if user leveled up

//               if (player.current_level > player.previous_level) {
//                 // level up animation
//                 setLevelUp(player.current_level);
//                 notifyMe('level', player.current_level);
//               }

//               // If win is from success plan, set up the modal
//               // if(payload.new.type !== 'Daily Quest'){
//               triggerWinModal(
//                 setActiveModalStats,
//                 setShowWinModal,
//                 payload.new
//               );
//               notifyMe('win', payload.new);
//               // }
//             } else {
//               // if it is not the current user
//               // if Show Card Win Exists (usually on leaderboard)
//               if (triggerCardWin) {
//                 triggerCardWin(setActiveWinStats, setShowCardWin, payload.new);
//               }
//             }
//           } else {
//             // if not logged in
//             // if Show Card Win Exists (usually on leaderboard)
//             if (triggerCardWin) {
//               if (friends) {
//                 if (friends.includes(payload.new.player)) {
//                   triggerCardWin(
//                     setActiveWinStats,
//                     setShowCardWin,
//                     payload.new
//                   );
//                 }
//               } else {
//                 triggerCardWin(setActiveWinStats, setShowCardWin, payload.new);
//               }
//             }
//           }
//           refreshStats();
//         })
//         .subscribe();
//     }

//     if (player_id) {
//       console.log('Checking for wins for ', player_id);
//       const { data, error } = await supabase
//         .from('success_plan')
//         .on('INSERT', async (payload) => {
//           console.log(
//             'New Specific Win Incoming!',
//             payload,
//             payload.new.player
//           );

//           // checking if the win is assigned to the current user
//           if (player_id) {
//             if (payload.new.player === player_id) {
//               // Get the latest updated stats of the user
//               const player = await fetchPlayerStats(player_id);

//               // check if user leveled up

//               if (player.current_level > player.previous_level) {
//                 // level up animation
//                 setLevelUp(player.current_level);
//                 notifyMe('level', player.current_level);
//               }

//               // If win is from success plan, set up the modal
//               // if(payload.new.type !== 'Daily Quest'){
//               triggerWinModal(
//                 setActiveModalStats,
//                 setShowWinModal,
//                 payload.new
//               );
//               notifyMe('win', payload.new);
//               // }
//             }
//           }
//           refreshStats();
//         })
//         .subscribe();
//     }
//   } catch (error) {
//     // alert(error.message);
//     console.log(error.message);
//   } finally {
//   }
// }

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

// Returns null rather than throwing when the player has no all-time leaderboard
// row. `.single()` answers 406 for zero rows, so a player who has never logged a
// win used to make this reject -- and callers await it in the middle of a
// refresh sequence, so the throw aborted every later step in that sequence.
export async function fetchAllTimeStatsForPlayer() {
  try {
    const user = supabase.auth.user();

    if (!user) return null;

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('player', user.id)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    return null;
  }
}

export async function fetchWins(user) {
  try {

    const { data, error } = await supabase
      .from('success_plan')
      .select(
        'id, name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend, notion_id, gif_url, entered_on, database_nickname, player)'
      )
      .eq('player', user)
      .order('closing_date', { ascending: false })
      .order('entered_on', { ascending: false });
    if (data) {
      return data;
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message);
    console.log(error.message);
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
      .like('upstream_id', '%' + upstream_id + '%')
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

// The homepage's three hero numbers (player count, level-ups, total EXP) used
// to be derived client-side by pulling the entire ~5000-row all-time
// leaderboard (2.18MB) on every visit. leaderboard_stats is a one-row view over
// the same matview that computes them in Postgres -- ~60 bytes instead.
export async function fetchLeaderboardTotals(setStats) {
  try {
    const { data } = await supabase
      .from('leaderboard_stats')
      .select('*')
      .single();

    if (data) {
      setStats(data);
    }
  } catch (error) {
    // leave the previous stats in place on failure
  }
}

export async function fetchLeaderboardStats(setPlayers, setLoading, season) {
  try {
    if (season) {
      const { data, error } = await supabase
        .from('leaderboard_season')
        .select('*')
        .order('total_exp', { ascending: false })
        .eq('latest', true);

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

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// party_details rather than party, so the listed status matches the one the
// details page shows -- the view derives In Review from a passed due date.
export async function fetchAllParties() {
  try {
    const { data, error } = await supabase
      .from('party_details')
      .select('*')
      .order('due_date', { ascending: false })

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
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

// Callers render the result directly, so this must always resolve to an array.
//
// It previously returned `undefined` on every failure path: the trailing
// `if (error && status !== 406)` referenced an `error` that was block-scoped
// inside the two branches above, so it threw ReferenceError, the empty catch
// swallowed it, and the function fell off the end. Consumers then called
// .map() on undefined and took the page down -- including the public embeds.
export async function fetchAreaStats(player) {
  try {
    const playerId = player || supabase.auth.user()?.id;

    if (!playerId) return [];

    const { data, error } = await supabase
      .from('area_stats')
      .select('*')
      .eq('player', playerId)
      .limit(6);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function fetchTitles() {
  try {
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .eq('active', true)
      .order('level_requirement', { ascending: true })

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

export async function fetchAllPartyDetails(party_slug) {
  try {
    const { data, error } = await supabase
      .from('party_win_member_details')
      .select('*')
      .eq('party_slug', party_slug)

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// null means "no such party" -- the details page renders its Party Not Found
// state off that. `.single()` reports zero rows as a 406 error, not as empty
// data, so an unknown slug lands in the catch.
export async function fetchParty(party_slug) {
  try {
    const { data, error } = await supabase
      .from('party_details')
      .select('*')
      .eq('slug', party_slug)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    return null;
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

    if (error) {
      throw error;
    }

    // Avatar/background URLs are handed to the caller as storage paths and
    // resolved per-card. Pre-resolving them all here was too slow.
    return data || [];
  } catch (error) {
    return [];
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
    // alert(error.message);
    console.log(error.message);
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
    // alert(error.message);
    console.log(error.message);
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
      .gte('completed_on', moment().startOf('day').format());

    if (data) {
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


export async function fetchDailiesCompleted(player) {
  try {
    const { data, error } = await supabase
      .from('completed_habits')
      .select('*, habit(name)')
      .eq('player', player)

    if (data) {
      console.log(data);
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
    // alert(error.message);
    console.log(error.message);
  } finally {
    // How do I show the null state?
  }
}

export async function claimDailyBonus(player, setDailyBonus, setBonusLoading) {
  setBonusLoading(true);
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
    // alert(error.message);
    console.log(error.message);
  } finally {
    setBonusLoading(false);
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


export async function lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials, utility) {

  try {
    const { data, error } = await supabase
      .from('authentication_links')
      .select('*')
      .eq('id', auth)
      .eq('utility', utility)
      .single()

    if (data) {
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

export async function fetchItemShop(player) {
  try {

    // See if bonus has already been claimed
    const { data, error } = await supabase
      .from('item_shop')
      .select('*')
      .eq('player', player)
      .order('id', { ascending: true })


    if (error && status !== 406) {
      throw error;
    }
    return data;

  } catch (error) {
    // alert(error.message);
    console.log(error.message);
  } finally {

  }
}

export async function fetchShopkeeper(player, setShopKeeperIntro, setShopKeeperTagline, setShopkeeperImage) {
  try {

    const { data, error } = await supabase
      .from('users')
      .select('shopkeeper_intro, shopkeeper_tagline, shopkeeper_url')
      .eq('id', player)
      .single();


    if (error && status !== 406) {
      throw error;
    }
    if (data?.shopkeeper_intro) {
      setShopKeeperIntro(data.shopkeeper_intro);
    }
    if (data?.shopkeeper_tagline) {
      setShopKeeperTagline(data.shopkeeper_tagline);
    }
    if (data?.shopkeeper_url) {
      setShopkeeperImage(await downloadImage(data?.shopkeeper_url, 'shopkeepers'))
    } else {
      setShopkeeperImage('missing')
    }

  } catch (error) {
    // alert(error.message);
    console.log(error.message);
  } finally {
  }
}

export async function fetchActiveTimer(player, setActiveTimer) {
  try {

    const { data, error } = await supabase
      .from('item_purchases')
      .select('*, item:item_id (name)')
      .eq('player', player)
      .gte('expiry_time', new Date().toISOString())
      .order('expiry_time', { ascending: true })


    if (error && status !== 406) {
      throw error;
    }

    setActiveTimer(data);

  } catch (error) {
    // alert(error.message);
    console.log(error.message);
  } finally {
  }
}

// export async function fetchHabitChanges(player, refreshDailies) {
//   console.log('Checking for habit changes')
//     const habitSubscription = await supabase
//       .from(`completed_habits:player=eq.${player}`)
//       .on('INSERT', payload => {
//         console.log('Habit Completed', payload)
//         refreshDailies();
//       })
//       .on('UPDATE', payload => {
//         console.log('Habit Updated', payload)
//         refreshDailies();
//       })
//       .on('DELETE', payload => {
//         console.log('Habit Deleted', payload)
//         refreshDailies();
//       })
//       .subscribe()

//     const subscriptions = supabase.getSubscriptions();
//     console.log(subscriptions);
// }