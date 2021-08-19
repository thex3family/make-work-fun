import { supabase } from '@/utils/supabase-client';
import notifyMe from '@/components/Notify/win_notification';

export async function fetchLatestWin(
  setActiveModalStats,
  refreshStats,
  setLevelUp,
  triggerWinModal,
  setShowWinModal,
  player_id
) {
  try {
    // check if there is any win (only works when the app is open) - future will move it to a server
    if (!player_id){
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
              triggerWinModal(setActiveModalStats, setShowWinModal, payload.new);
              notifyMe('win', payload.new);
              // }
            }
          }
          refreshStats();
        })
        .subscribe();
    } 

    if (player_id){
    const { data, error } = await supabase
      .from('success_plan')
      .on('INSERT', async (payload) => {
        console.log('New Win Incoming!', payload, payload.new.player);

        // checking if the win is assigned to the current user
        if (player_id) {
          if (payload.new.player === player_id) {
            // Get the latest updated stats of the user
            const player = await fetchPlayerStats(null, player_id);

            // check if user leveled up

            if (player.current_level > player.previous_level) {
              // level up animation
              setLevelUp(player.current_level);
              notifyMe('level', player.current_level);
            }

            // If win is from success plan, set up the modal
            // if(payload.new.type !== 'Daily Quest'){
            triggerWinModal(setActiveModalStats, setShowWinModal, payload.new);
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

export async function fetchPlayerStats(setAvatarUrl, player) {
  try {
    // gets the latest information about the user from the latest leaderboard
    if (!player) {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('s1_leaderboard')
        .select('*')
        .eq('player', user.id)
        .single();

      if (data) {
        if (setAvatarUrl) {
          setAvatarUrl(data.avatar_url);
        }
        return data;
      }
    }

    if (player) {
      const { data, error } = await supabase
        .from('s1_leaderboard')
        .select('*')
        .eq('player', player)
        .single();

      return data;
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
        'id, name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend, notion_id, gif_url, entered_on, database_nickname'
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

export async function fetchWeekWins(player) {
  try {
    if(!player){
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
    
    if(player){
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

export async function fetchLeaderboardStats(
  setS1Players,
  setPlayers,
  setLoading
) {
  try {
    const { data, error } = await supabase
      .from('s1_leaderboard')
      .select('*')
      .order('total_exp', { ascending: false });

    if (data) {
      setS1Players(data);
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error) {
    // alert(error.message)
  } finally {
    setLoading(false);
  }
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
    setLoading(false);
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
    const user = supabase.auth.user();

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
