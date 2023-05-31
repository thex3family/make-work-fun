import React from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase-client';
import { useState, useEffect } from 'react';
import { userContent } from '@/utils/useUser';

import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';

// functions
import {
  fetchPlayerStats
} from '@/components/Fetch/fetchMaster';
import { downloadImage } from '@/utils/downloadImage';
import LoadingDots from '@/components/ui/LoadingDots';
import DailiesSkeleton from '@/components/Skeletons/DailiesSkeleton';
import EditDailies from '@/components/Habits/edit_habits';
import PlayDailies from '@/components/Habits/play_habits';
import { Modal } from '@mantine/core';

export default function dailies({ user, metaBase, setMeta, refreshChildStats, setRefreshChildStats }) {
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [showDayModal, setShowDayModal] = useState(false);

  const checkDayAndRefresh = () => {
    const now = new Date();
    if (now.getDay() !== currentDay) {
      setShowDayModal(true);
    }
  }

  useEffect(() => {
    const interval = setInterval(checkDayAndRefresh, 1000 * 60 * 60); // Check every hour

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [currentDay]);

  useEffect(() => {
    // Register focus event listener
    window.addEventListener('focus', checkDayAndRefresh);

    // Cleanup event listener on unmount
    return () => window.removeEventListener('focus', checkDayAndRefresh);
  }, [currentDay]);

  const handleModalClose = () => {
    router.reload(window.location.pathname);
  }

  const [levelUp, setLevelUp] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const [activeMode, setActiveMode] = useState(1);

  const { mode } = router.query;

  useEffect(() => {
    if (mode == 'play') {
      setActiveMode(1);
    }
    if (mode == 'edit') {
      setActiveMode(2);
    }
    if (mode == 'track') {
      setActiveMode(3);
    }
  }, []);

  async function changeMode(mode_id) {
    if (mode_id == 1) {
      router.push(`dailies/?mode=play`, undefined, { shallow: true })
    }
    if (mode_id == 2) {
      router.push(`dailies/?mode=edit`, undefined, { shallow: true })
    }
    if (mode_id == 3) {
      router.push(`dailies/?mode=track`, undefined, { shallow: true })
    }
    setActiveMode(mode_id);
  }

  const [backgroundUrl, setBackgroundUrl] = useState(
    '/'
  );

  const [newToSeason, setNewToSeason] = useState(null);

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

  const player = user.id;

  // If player is ready to load, go for it!

  // async function loadPlayer() {
  //   console.log('Loading Player');
  //   refreshDailies();
  //   fetchHabitChanges(player, refreshDailies);
  //   refreshStats();
  // }

  useEffect(() => {
    if (refreshChildStats) {
      refreshStats();
      setRefreshChildStats(false);
    }
  }, [refreshChildStats]);

  async function refreshStats() {
    console.log('Refreshing Stats');
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    // dailyBonusButtons(player, setDailyBonus);
    // setLoading(false);
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
            <div className="pb-5 py-10 px-4">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies">
                Daily Quests
              </h1>
              <p className="mt-5 text-xl text-dailies text-center sm:text-2xl max-w-2xl m-auto">
                Complete 80% of your daily quests to receive bonus rewards!
              </p>
            </div>

            <div className="text-center bg-black bg-opacity-90 py-10 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-14">
              <div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 w-full rounded-0 sm:rounded-xl sm:max-w-md h-14 align-middle shadow-xl grid grid-cols-3 place-items-center text-lg fontmedium px-2 gap-2">
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
      { showDayModal ? 
       <Modal
          centered
          opened={setShowDayModal}
          onClose={() => handleModalClose()}
          classNames={{
            modal: 'text-white bg-dark hideLinkBorder',
            title: 'hidden',
            close: 'hidden',
          }}
        >
          <div class="relative rounded-lg text-left ">
            <div class="">
              <div class="sm:flex sm:items-center sm:gap-2">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                  <i className='fas fa-sun text-emerald-800'/>
                </div>
                <div class="text-center m-2 sm:text-left">
                    <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">It's a brand new day!</h3>
                  <div class="mt-2">
                    <p class="text-sm text-white-500">Your quests for the day have been reset.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="mt-4 mb-5 flex justify-center">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => handleModalClose()}
            >OK</button></div>

        </Modal>
        : null }
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