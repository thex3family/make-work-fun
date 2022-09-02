import Link from 'next/link';
import Button from '@/components/ui/Button';
import React from 'react';
import { supabase } from '../utils/supabase-client';
import { useState, useEffect } from 'react';
import { userContent } from '@/utils/useUser';
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
  fetchHabitChanges
} from '@/components/Fetch/fetchMaster';
import { downloadImage } from '@/utils/downloadImage';
import LoadingDots from '@/components/ui/LoadingDots';
import DailiesSkeleton from '@/components/Skeletons/DailiesSkeleton';
import EditDailies from '@/components/Habits/edit_habits';

export default function dailies({ user, metaBase, setMeta, refreshChildStats, setRefreshChildStats }) {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [dailiesCount, setDailiesCount] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(null);


  const [levelUp, setLevelUp] = useState(false);

  const [playerStats, setPlayerStats] = useState(null);

  const [activeMode, setActiveMode] = useState(1);
  const router = useRouter();

  const { mode } = router.query;

  useEffect(() => {
    if (mode == 'play') {
      setActiveMode(1);
    }
    if (mode == 'edit') {
      setActiveMode(2);
    }
  }, []);

  async function changeMode(mode_id) {
    if (mode_id == 1) {
      router.push(`dailies/?mode=play`, undefined, { shallow: true })
    }
    if (mode_id == 2) {
      router.push(`dailies/?mode=edit`, undefined, { shallow: true })
    }
    setActiveMode(mode_id);
  }


  // Get the last 7 days 

  // const dates = [];
  // const NUM_OF_DAYS = 7;

  // for (let i = 0; i < NUM_OF_DAYS; i++) {
  //   const date = moment().subtract(i, 'days');
  //   dates.push(date);
  // }

  // console.log(dates)

  // handle the empty array

  // [{ name: ccc, sat:false, sunday:false},{...}]

  // habits = [...] 
  // init = []
  // for i < habits.length 
  //   init.pish({name: habit:name, x:false,x:false,x:false,x:false,x:false,x:false,x:false})
  // for habits (pull it from completed)
  //   if(init[0].date === h.date) {
  //     init[0].x = calculatecomplexthing(h[0])
  //   }

  const [backgroundUrl, setBackgroundUrl] = useState(
    '/'
  );

  const [newToSeason, setNewToSeason] = useState(null);

  // const [entryDate, setEntryDate] = useState(moment().startOf('day').format('yyyy-MM-DD'));
  // const [entryDate, setEntryDate] = useState(null);

  const {
    userOnboarding,
  } = userContent();

  // sets the meta tags

  useEffect(() => {
    const meta = {
      title: 'Dailies - ' + metaBase.titleBase
    }
    setMeta(meta)
  }, []);

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
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

  const player = user.id;

  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    refreshDailies();
    fetchHabitChanges(player, refreshDailies);
    refreshStats();
  }

  useEffect(() => {
    if (refreshChildStats) {
      refreshStats();
      setRefreshChildStats(false);
    }
  }, [refreshChildStats]);

  async function refreshStats() {
    console.log('Refreshing Stats');
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    dailyBonusButtons(player, setDailyBonus);
    setLoading(false);
  }

  const [downstreamHabitRefresh, setDownstreamHabitRefresh] = useState(false);

  async function refreshDailies() {
    console.log('Refreshing Dailies');
    fetchDailies(player, setHabits, setLevelUp, setDailiesCount);
    setDownstreamHabitRefresh(true);
  }

  useEffect(() => {
    if (playerStats) loadBackgroundURL();
  }, [playerStats]);

  async function loadBackgroundURL() {
    console.log('Loading Background')
    if (playerStats.background_url) {
      setBackgroundUrl(await downloadImage(playerStats.background_url, 'background'));
    } else {
      setBackgroundUrl('/background/dailies.jpg')
    }
  }

  if (!playerStats) {
    return (
      <>
        <DailiesSkeleton />
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
      <section className="animate-slow-fade-in justify-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}>

        <div className=" max-w-6xl mx-auto py-0 sm:py-8 md:pt-24 px-0 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded-0 sm:rounded opacity-95">
            <div className="pb-5 py-10 px-4 sm:px-10">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
                Daily Quests
              </h1>
              {habits?.length != 0 ?
                <div className="text-center mb-5">
                  <div className="font-semibold text-dailies text-xl mb-3">
                    Complete 80% of your daily quests to receive bonus rewards!
                  </div>

                  <div className="w-24 h-24 border-4 border-dailies-dark shadow-lg text-center inline-flex items-center justify-center mx-auto text-black my-2 font-semibold uppercase rounded-full text-4xl">
                    {dailiesCount}/{Math.floor(habits.length * 0.8)}
                  </div>
                  {/* {Array.from({ length: dailiesCount }, (_, i) => <span key={i}><i className="text-yellow-400 fas fa-star"/></span>)} */}
                  <div>
                    <div className="text-3xl">
                      {/* {
                        dailiesCount ?
                          Array.from({ length: dailiesCount }, (item, index) =>
                            <i className="text-yellow-400 fas fa-star" />
                          )
                          : null
                      }
                      {
                        habits ?
                          Array.from({ length: (Math.floor(habits.length * 0.8) - dailiesCount) }, (item, index) =>
                            <i className="text-gray-800 far fa-star" />
                          )
                          : null
                      } */}
                      <div className="flex flex-wrap">
                        <div className="relative w-full m-auto max-w-sm flex-grow flex-1">
                          <div className="flex items-center">
                            <span className="mr-2 text-dailies font-semibold text-lg">
                              {Math.floor((dailiesCount / Math.floor(habits.length * 0.8)) * 100)}%
                            </span>
                            <div className="relative w-full">
                              <div className="overflow-hidden h-3 text-xs flex rounded-lg bg-dailies-light">
                                <div
                                  style={{ width: `${(dailiesCount / Math.floor(habits.length * 0.8)) * 100}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-dailies-dark"
                                ></div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                    {dailiesCount >= Math.floor(habits.length * 0.8) ? (dailyBonus ?
                      (
                        <div>
                          <Button
                            variant="prominent"
                            className="animate-fade-in-up mt-5 text-center font-bold"
                            disabled={bonusLoading}
                            onClick={() => claimDailyBonus(player, setDailyBonus, setBonusLoading)}
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
                      )) : <Countdown date={moment().endOf('day').utc().format()} />}
                  </div>

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
                : null}
            </div>
            {/* <button onClick={() => console.log(habits)}>
          Push me to check if data is pulled properly
        </button>  */}

            <div className="text-center bg-black bg-opacity-90 py-10 px-4 sm:px-10 rounded-0 sm:rounded-b relative pt-14">
              {activeMode == 1 ?
                <>
                  <div className="text-center">
                    {habits != null ? (
                      habits.length != 0 ? (
                        <>
                          <div className='grid grid-cols-6 sm:grid-cols-5 lg:grid-cols-4 mb-4'>
                            <div className='col-span-4 sm:col-span-3 lg:col-span-2'>
                            </div>
                            <div className='col-span-2 text-white'>
                              <div className='grid grid-cols-2 justify-items-center pr-5'>
                                <div>
                                  <div className='font-bold sm:text-base text-sm hidden sm:block'>Yesterday</div>
                                  <div className='text-xs sm:text-sm font-semibold'>{moment().subtract(1, "days").format('ddd')}</div>
                                </div>
                                <div>
                                  <div className='font-bold sm:text-base text-sm hidden sm:block'>Today</div>
                                  <div className='text-xs sm:text-sm font-semibold'>{moment().format('ddd')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <HabitGroups
                            habits={habits}
                            fetchDailies={fetchDailies}
                            fetchDailiesCompletedToday={fetchDailiesCompletedToday}
                            player={user.id}
                            setHabits={setHabits}
                            setLevelUp={setLevelUp}
                            setDailiesCount={setDailiesCount}
                            downstreamHabitRefresh={downstreamHabitRefresh}
                            setDownstreamHabitRefresh={setDownstreamHabitRefresh}
                          />
                        </>

                      ) : (
                        <span className="text-center text-accents-6 font-semibold text-md">
                          You have no active habits...let's change that!
                        </span>
                      )
                    ) : null}
                  </div>
                  <div className="text-center my-5">
                    <button className="px-5 border-2 border-dailies-dark text-center text-dailies bg-dailies-light font-bold py-2 rounded hover:bg-dailies-dark hover:border-white hover:text-white"
                      onClick={() => (changeMode(2), setDownstreamHabitRefresh(true))}>
                      Edit Dailies
                    </button>
                  </div>
                </>
                : null }

                {activeMode == 2 ?
                <>
                  <EditDailies player={player} changeMode={changeMode} />
                  
                </> : null}
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

export async function getServerSideProps({ req }) {
  // Get the user's session based on the request
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return {
      redirect: {
        destination: '/signin?redirect=dailies',
        permanent: false,
      },
    }
  }

  return {
    props: { user },
  }
}