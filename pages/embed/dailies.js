import Link from 'next/link';
import Button from '@/components/ui/Button';
import React from 'react';
import { supabase } from '@/utils/supabase-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import Countdown from '@/components/Widgets/DailiesCountdown/countdown';

import HabitGroups from '@/components/Habits/habit_groups';

import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';

// import Input from '@/components/ui/Input';

// functions
import {
  fetchPlayerStats,
  fetchDailies,
  fetchDailiesCompletedToday,
  dailyBonusButtons,
  claimDailyBonus,
  lookupPlayerFromAuth,
  fetchHabitChanges
} from '@/components/Fetch/fetchMaster';
import { downloadImage } from '@/utils/downloadImage';
import LoadingDots from '@/components/ui/LoadingDots';
import DailiesSkeleton from '@/components/Skeletons/DailiesSkeleton';
import PlayDailies from '@/components/Habits/play_habits';
import EditDailies from '@/components/Habits/edit_habits';

export default function dailies() {
  const [levelUp, setLevelUp] = useState(false);
  const [activeMode, setActiveMode] = useState(1);
  const [playerStats, setPlayerStats] = useState(null);

  const [backgroundUrl, setBackgroundUrl] = useState(
    '/'
  );

  const [newToSeason, setNewToSeason] = useState(null);

  const router = useRouter();

  // grab details from URL

  useEffect(() => {
    if (!router.isReady) return;

    // codes using router.query
    const { auth } = router.query;
    if (!auth) {
      setInvalidCredentials(true);
    }

  }, [router.isReady]);

  const { auth } = router.query;
  const { style } = router.query;
  const { opacity } = router.query;
  const { display } = router.query;

  async function changeMode(mode_id) {
    setActiveMode(mode_id);
  }

  // check on the player using the auth key

  const [player, setPlayer] = useState(null);
  const [invalidCredentials, setInvalidCredentials] = useState(null);

  useEffect(() => {
    if (auth && display !== 'demo') (lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials));
  }, [auth]);

  const [userOnboarding, setUserOnboarding] = useState(null);

  // if there is a player, check for onboarding state

  useEffect(() => {
    if (player) checkUserOnboarding();
  }, [player]);

  async function checkUserOnboarding() {
    try {
      const { data, error } = await supabase.from('onboarding').select('*').eq('id', player).single().limit(1);
      setUserOnboarding(data);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
    }
  }

  // if there is an onboarding state, load player

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        // loadPlayer();
        refreshStats();
      } else {
        router.replace('/player');
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // If player is ready to load, go for it!

  async function refreshStats() {
    console.log('Refreshing Stats');
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
  }


  useEffect(() => {
    if (playerStats && style != 'dark') loadBackgroundURL();
  }, [playerStats]);

  async function loadBackgroundURL() {
    if (playerStats.background_url) {
      setBackgroundUrl(await downloadImage(playerStats.background_url, 'background'));
    } else {
      setBackgroundUrl('/background/dailies.jpg')
    }
  }

  // if display is demo
  const demoPlayerStats = {
    player_rank: 17,
    next_rank: 0,
    full_name: 'Conrad',
    current_level: 1,
    total_exp: 75,
    exp_progress: 75,
    level_exp: 200,
    total_gold: 25,
    player: '0',
    name: 'Make My Bed',
    type: 'Daily Quest',
    exp_reward: 25,
    gold_reward: 0,
    avatar_url: '0.4857466039220286.png',
    background_url: '0.5372695271833878.jpg',
    role: 'Party Leader, Contributor',
    title: 'Party Leader ✊',
    previous_level: 1,
    exp_earned_today: 25,
    gold_earned_today: 0,
    season: '2S',
    latest: true
  };

  const demoHabits =
    [
      {
        "id": 112,
        "habit": "Drink Water!",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Recurring",
        "group_sort": 1,
        "exp_reward": 25,
        "icon": "FaFillDrip",
        "habit_type": "Counter",
        "sort": 1,
        "latest_details": "1"
      },
      {
        "id": 440,
        "habit": "Review",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Recurring",
        "group_sort": 1,
        "exp_reward": 25,
        "icon": "FaThinkPeaks",
        "habit_type": "Counter",
        "sort": 1,
        "latest_details": "1"
      },
      {
        "id": 14,
        "habit": "Meditate",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Recurring",
        "group_sort": 1,
        "exp_reward": 25,
        "icon": "FaPray",
        "habit_type": "Counter",
        "sort": 2,
        "latest_details": "1"
      },
      {
        "id": 86,
        "habit": "Morning Mood",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Morning",
        "group_sort": 2,
        "exp_reward": 25,
        "icon": "FaStreetView",
        "habit_type": "Feeling",
        "sort": 0,
        "latest_details": "happy"
      },
      {
        "id": 12,
        "habit": "Make My Bed",
        "description": null,
        "streak_duration": 1,
        "streak_start": "2022-01-10T19:06:22.328+00:00",
        "streak_end": "2022-01-10T19:06:22.328+00:00",
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Morning",
        "group_sort": 2,
        "exp_reward": 25,
        "icon": "FaBed",
        "habit_type": "Checkbox",
        "sort": 3,
        "latest_details": null
      },
      {
        "id": 37,
        "habit": "Plan My Day",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Morning",
        "group_sort": 2,
        "exp_reward": 25,
        "icon": "FaBrain",
        "habit_type": "Checkbox",
        "sort": 5,
        "latest_details": null
      },
      {
        "id": 104,
        "habit": "Mid-Day Mood",
        "description": null,
        "streak_duration": 1,
        "streak_start": "2022-01-10T19:06:55.166+00:00",
        "streak_end": "2022-01-10T19:06:55.166+00:00",
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Mid-Day",
        "group_sort": 5,
        "exp_reward": 25,
        "icon": "FaSun",
        "habit_type": "Feeling",
        "sort": 0,
        "latest_details": "happy"
      },
      {
        "id": 16,
        "habit": "Emails",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Mid-Day",
        "group_sort": 5,
        "exp_reward": 25,
        "icon": "FaMailBulk",
        "habit_type": "Checkbox",
        "sort": 1,
        "latest_details": null
      },
      {
        "id": 2,
        "habit": "Take A Picture",
        "description": null,
        "streak_duration": 1,
        "streak_start": "2022-01-10T19:06:53.39+00:00",
        "streak_end": "2022-01-10T19:06:53.39+00:00",
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Mid-Day",
        "group_sort": 5,
        "exp_reward": 25,
        "icon": "FaCameraRetro",
        "habit_type": "Checkbox",
        "sort": 2,
        "latest_details": null
      },
      {
        "id": 105,
        "habit": "Evening Mood",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Evening",
        "group_sort": 6,
        "exp_reward": 25,
        "icon": "FaPersonBooth",
        "habit_type": "Feeling",
        "sort": 0,
        "latest_details": "happy"
      },
      {
        "id": 13,
        "habit": "Clean Up Inbox",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Evening",
        "group_sort": 6,
        "exp_reward": 25,
        "icon": "FaRegLightbulb",
        "habit_type": "Checkbox",
        "sort": 1,
        "latest_details": null
      },
      {
        "id": 9,
        "habit": "Tidy Up",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Evening",
        "group_sort": 6,
        "exp_reward": 25,
        "icon": "FaBroom",
        "habit_type": "Location",
        "sort": 3,
        "latest_details": "Did Laundry"
      },
      {
        "id": 110,
        "habit": "Bedtime Mood",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Bedtime",
        "group_sort": 7,
        "exp_reward": 25,
        "icon": "FaAngellist",
        "habit_type": "Feeling",
        "sort": 0,
        "latest_details": "happy"
      },
      {
        "id": 38,
        "habit": "Personal Hygeine",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Bedtime",
        "group_sort": 7,
        "exp_reward": 25,
        "icon": "FaTeeth",
        "habit_type": "Checkbox",
        "sort": 1,
        "latest_details": null
      },
      {
        "id": 6,
        "habit": "Reflection",
        "description": null,
        "streak_duration": null,
        "streak_start": null,
        "streak_end": null,
        "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
        "is_active": true,
        "habit_group": "Bedtime",
        "group_sort": 7,
        "exp_reward": 25,
        "icon": "FaBookReader",
        "habit_type": "Checkbox",
        "sort": 4,
        "latest_details": null
      }
    ]

  const demoModalStats = {
    area: 'Make Work Fun',
    closing_date: '2021-10-08',
    database_nickname: null,
    difficulty: 1,
    do_date: '2021-10-07',
    entered_on: '2021-10-07T16:19:54.619076Z',
    exp_reward: 25,
    gif_url: null,
    gold_reward: 25,
    health_reward: null,
    id: 0,
    impact: '10x 🔺',
    name: 'My First Win',
    notion_id: '',
    party_id: null,
    player: '',
    punctuality: +1,
    trend: 'up',
    type: 'Task',
    upstream: 'Starting My Adventure',
    upstream_id: ''
  };


  useEffect(() => {
    if (display == 'demo') {
      setPlayerStats(demoPlayerStats);
    }
  }, [display]);

  if (!playerStats) {
    return (
      <>
        <DailiesSkeleton />
        {
          invalidCredentials ?
            <ModalOnboarding onboardingState={'invalid_auth'} />
            : null
        }
        {
          newToSeason ?
            <ModalOnboarding onboardingState={'new_season_embed'} />
            : null
        }
      </>
    )
  }

  return (
    <>
      <section className="animate-slow-fade-in justify-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}>

        <div className=" max-w-6xl mx-auto py-0 sm:py-8 md:pt-24 px-0 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded-0 sm:rounded opacity-95">
            <div className="pb-5 py-10 px-4">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies">
                Daily Quests
              </h1>
              <p className="mt-5 text-xl text-dailies text-center sm:text-2xl max-w-2xl m-auto">
                Complete 80% of your daily quests to receive bonus rewards!
              </p>
            </div>

            <div className="text-center bg-black bg-opacity-90 py-10 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-14">
              {
                display == 'demo' ?
                  <HabitGroups
                    habits={demoHabits}
                    display={display}
                  />
                  :
                  <><div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 w-full rounded-0 sm:rounded-xl sm:max-w-md h-14 align-middle shadow-xl grid grid-cols-3 place-items-center text-lg fontmedium px-2 gap-2">
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeMode == 1
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => changeMode(1)}
                    >
                      Play
                    </div>
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeMode == 2
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => changeMode(2)}
                    >
                      Manage
                    </div>
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeMode == 3
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => changeMode(3)}
                    >
                      Track
                    </div>
                  </div>
                    {activeMode == 1 ?
                      <>
                        <PlayDailies
                          player={player}
                          setLevelUp={setLevelUp}
                          changeMode={changeMode}
                        />
                      </> : null}
                    {activeMode == 2 ?
                      <>
                        <EditDailies player={player} changeMode={changeMode} />
                      </> : null}
                    {activeMode == 3 ?
                      <>
                        <div className="font-semibold">
                          Analytics Coming Soon!
                        </div>
                      </> : null}
                  </>
              }
            </div>
          </div>
        </div>
      </section>
      {/* level up modal */}
      {levelUp ? (
        <ModalLevelUp
          playerLevel={levelUp}
          setLevelUp={setLevelUp}
        />
      ) : (
        null
      )}
    </>
  );
}