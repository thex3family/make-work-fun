import Link from 'next/link';
import Button from '@/components/ui/Button';
import React from 'react';
import { supabase } from '../utils/supabase-client';
import { useState, useEffect } from 'react';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import moment from 'moment';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import Countdown from '@/components/Widgets/DailiesCountdown/countdown';

import HabitGroups from '@/components/Habits/habit_groups';

import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import notifyMe from '@/components/Notify/win_notification';

// functions
import {
  fetchPlayerStats,
  fetchLatestWin
} from '@/components/Fetch/fetchMaster';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';

export default function dallies() {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailiesCount, setDailiesCount] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(null);

  const [levelUp, setLevelUp] = useState(false);

  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);

  const router = useRouter();
  const {
    userLoaded,
    user,
    session,
    userDetails,
    userOnboarding,
    subscription
  } = useUser();

  // Redirects user to sign in if they are not logged in yet

  useEffect(() => {
    if (!user) router.replace('/signin');
  }, [user]);

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        router.replace('/account');
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
    fetchDailies();
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal
    );
  }

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats());
    setLoading(false);
  }

  async function fetchDailies(click) {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('dailies')
        .select('*')
        .eq('player', user.id)
        .eq('is_active', true);

      setHabits(data);

      if (click === 'click') {
        const player = await fetchPlayerStats();

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
      setLoading(false);
      fetchDailiesCompletedToday();
      // console.log(habits);
    }
  }

  async function dailyBonusButtons() {
    try {
      const user = supabase.auth.user();

      // See if bonus has already been claimed
      const { data, error } = await supabase
        .from('success_plan')
        .select('*')
        .eq('player', user.id)
        .eq('name', 'Daily Quest Bonus Reward')
        .gte('entered_on', moment().startOf('day').utc().format());

      if (error && status !== 406) {
        throw error;
      }
      console.log(data);
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

  async function claimDailyBonus() {
    try {
      const user = supabase.auth.user();

      let testDateStr = new Date();
      // console.log('testDateStr: ' + testDateStr);

      const { data, error } = await supabase.from('success_plan').insert([
        {
          player: user.id,
          difficulty: 1,
          do_date: testDateStr,
          closing_date: testDateStr,
          trend: 'check',
          type: 'Bonus',
          punctuality: 0,
          exp_reward: 100,
          gold_reward: 50,
          name: 'Daily Quest Bonus Reward'
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

  async function fetchDailiesCompletedToday() {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('player', user.id)
        .gte('closing_date', moment().startOf('day').utc().format());

      // console.log(data.length);
      setDailiesCount(data.length);
      dailyBonusButtons();

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="animate-slow-fade-in justify-center bg-dailies-pattern bg-fixed bg-cover">
        <BottomNavbar />
        <div className=" max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded p-10 opacity-90">
            <div className="pb-5">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
                Dailies
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
                          onClick={() => claimDailyBonus()}
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
              </div>
            </div>
            {/* <button onClick={() => console.log(habits)}>
          Push me to check if data is pulled properly
        </button>  */}
            <div className="text-center">
              {habits != null ? (
                habits.length != 0 ? (
                  <HabitGroups
                    habits={habits}
                    fetchDailies={fetchDailies}
                    fetchDailiesCompletedToday={fetchDailiesCompletedToday}
                  />
                ) : (
                  <span className="text-center text-dailies font-semibold text-md">
                    You have no active habits...let's change that!
                  </span>
                )
              ) : null}
            </div>

            <div className="text-center my-5">
              <Link href="/dailies/edit">
                <button className="px-5 border-2 border-dailies-dark text-center text-dailies font-bold py-2 rounded">
                  Edit Dailies
                </button>
              </Link>
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

      {/* // Modal Section */}
      {showWinModal ? (
        <>
          <WinModal
            page={'dailies'}
            activeModalStats={activeModalStats}
            setShowWinModal={setShowWinModal}
            playerStats={playerStats}
            refreshStats={refreshStats}
          />
        </>
      ) : null}
    </>
  );
}
