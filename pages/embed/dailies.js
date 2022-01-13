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
  fetchLatestWin,
  fetchDailies,
  fetchDailiesCompletedToday,
  dailyBonusButtons,
  claimDailyBonus,
  lookupPlayerFromAuth
} from '@/components/Fetch/fetchMaster';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import { downloadImage } from '@/utils/downloadImage';
import LoadingDots from '@/components/ui/LoadingDots';
import DailiesSkeleton from '@/components/Skeletons/DailiesSkeleton';

export default function dailies() {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailiesCount, setDailiesCount] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(null);

  const [levelUp, setLevelUp] = useState(false);

  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
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
  const { win } = router.query;
  const { lvl } = router.query;
  const { opacity } = router.query;
  const { display } = router.query;

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
      alert(error.message)
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
        loadPlayer();
      } else {
        // this needs to show an error message to go to the app to continue setup
        router.replace('/player');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }


  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    fetchDailies(player, setHabits, setLevelUp, setDailiesCount);
    refreshStats();
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal,
      player
    );
  }

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    dailyBonusButtons(player, setDailyBonus);
    setLoading(false);
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
      setHabits(demoHabits);
      setLoading(false);
      setActiveModalStats(demoModalStats);
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
            <ModalOnboarding onboardingState={5} />
            : null
        }
      </>
    )
  }

  return (
    <>
      <section className="animate-slow-fade-in justify-center bg-fixed bg-cover bg-center bg-dark"
        style={{ backgroundImage: `url(${backgroundUrl})` }}>
        {display == 'demo' ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center bg-dark py-4 px-4">
            <Button
              className="w-full sm:w-auto"
              variant="incognito"
              onClick={() => setShowWinModal(true)}
            >
              Demo: New Win
            </Button>

            <Button
              className=" w-full sm:w-auto"
              variant="incognito"
              onClick={() => setLevelUp(2)}
            >
              Demo: Level Up!
            </Button>
          </div>
        ) : null}
        <div className=" max-w-6xl mx-auto py-0 sm:py-8 md:pt-24 px-0 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded-0 sm:rounded opacity-95">
            <div className="pb-5 py-10 px-4 sm:px-10">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
                Daily Quests
              </h1>
              <div className="text-center mb-5">
                {/* <div className="font-semibold text-dailies text-xl mb-3">
                Complete 4 comissions daily to receive bonus rewards!{' '}
              </div> */}

                <div className="w-24 h-24 border-4 border-dailies-dark shadow-lg text-center inline-flex items-center justify-center mx-auto text-black my-2 font-semibold uppercase rounded-full text-4xl">
                  {dailiesCount}/4
                </div>
                {/* {Array.from({ length: dailiesCount }, (_, i) => <span key={i}><i className="text-yellow-400 fas fa-star"/></span>)} */}
                {dailiesCount >= 4 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                    </div>
                    {dailyBonus ? (
                      <div>
                        <Button
                          variant="prominent"
                          className="animate-fade-in-up mt-5 text-center font-bold"
                          onClick={() => claimDailyBonus(player, setDailyBonus)}
                        >
                          Claim Rewards
                        </Button>

                        <div className="mt-3 animate-fade-in-up">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-2">
                            +50 💰{' '}
                          </span>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
                            +100 XP
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant="prominent"
                          disabled={true}
                          className="animate-fade-in-up mt-5 text-center font-bold"
                        >
                          Rewards Claimed!
                        </Button>
                        <div className="mt-3 animate-fade-in-up">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-2">
                            +50 💰{' '}
                          </span>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-1">
                            +100 XP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : dailiesCount >= 3 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>
                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                ) : dailiesCount >= 2 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>

                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                ) : dailiesCount >= 1 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>

                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl">
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>
                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                )}
                {/* <div className="w-72 mx-auto">
                  <div className="mb-2 font-semibold text-dailies text-left">
                    Time Travel
                  </div>

                  <div className="">
                    <Input
                      className="text-xl font-semibold rounded"
                      type="date"
                      value={entryDate || ''}
                      onChange={setEntryDate}
                    />
                  </div>
                </div> */}
              </div>
            </div>
            {/* <button onClick={() => console.log(habits)}>
          Push me to check if data is pulled properly
        </button>  */}
            <div className="text-center bg-black bg-opacity-90 py-10 px-4 sm:px-10 rounded-0 sm:rounded-b relative pt-14">
              <div className="text-center">
                {habits != null ? (
                  habits.length != 0 ? (
                    <HabitGroups
                      habits={habits}
                      fetchDailies={fetchDailies}
                      fetchDailiesCompletedToday={fetchDailiesCompletedToday}
                      player={player}
                      setHabits={setHabits}
                      setLevelUp={setLevelUp}
                      setDailiesCount={setDailiesCount}
                      display={display}
                    />
                  ) : (
                    <span className="text-center text-dailies font-semibold text-md">
                      You have no active habits...let's change that!
                    </span>
                  )
                ) : null}
              </div>
              {display != 'demo' ?
                <div className="text-center my-5">
                  <Link href="/dailies/edit">
                    <button className="px-5 border-2 border-dailies-dark text-center text-dailies font-bold py-2 rounded hover:border-white hover:text-white">
                      Edit Dailies
                    </button>
                  </Link>
                </div>
                : null}
            </div>
          </div>
        </div>
      </section>
      {/* level up modal */}
      {levelUp && (lvl || display == 'demo') ? (
        <ModalLevelUp
          playerLevel={levelUp}
          setLevelUp={setLevelUp}
        />
      ) : (
        null
      )}

      {/* // Modal Section */}
      {showWinModal && (win || display == 'demo') ? (
        <>
          <WinModal
            page={'dailies'}
            activeModalStats={activeModalStats}
            setShowWinModal={setShowWinModal}
            playerStats={playerStats}
            refreshStats={refreshStats}
            display={display}
          />
        </>
      ) : null}
    </>
  );
}