import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import { useUser } from '@/utils/useUser';

import { supabase } from '../utils/supabase-client';
import Datatable, { createTheme } from 'react-data-table-component';

import ModalLevelUp from '@/components/Modals/ModalLevelUp';

import React from 'react';

import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';

import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin'

// functions

import {
  fetchPlayerStats,
  fetchWins,
  fetchWeekWins,
  fetchLatestWin,
  fetchAreaStats
} from '@/components/Fetch/fetchMaster';

// components

import HeaderStats from 'components/Headers/HeaderStats.js';
import DataTable from 'react-data-table-component';

createTheme('game', {
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(0,0,0,.12)'
  },
  background: {
    default: '#111111'
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF'
  },
  divider: {
    default: '#ffffff'
  },
  button: {
    default: '#FFFFFF',
    focus: 'rgba(255, 255, 255, .54)',
    hover: 'rgba(255, 255, 255, .12)',
    disabled: 'rgba(255, 255, 255, .18)'
  },
  highlightOnHover: {
    default: '#9CA3AF15',
    text: 'rgba(255, 255, 255, 1)'
  },
  sortFocus: {
    default: 'rgba(255, 255, 255, .54)'
  },
  selected: {
    default: 'rgba(0, 0, 0, .7)',
    text: '#FFFFFF'
  }
});

export default function Player() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {
    userLoaded,
    user,
    session,
    userDetails,
    userOnboarding,
    subscription
  } = useUser();

  const [wins, setWins] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [background_url, setBackgroundUrl] = useState('/');
  const [levelUp, setLevelUp] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [weekWins, setWeekWins] = useState([]);
  const [areaStats, setAreaStats] = useState([]);

  const currentHour = new Date().getHours();
  const greetingMessage =
    currentHour >= 4 && currentHour < 12 // after 4:00AM and before 12:00PM
      ? 'Morning'
      : currentHour >= 12 && currentHour <= 17 // after 12:00PM and before 6:00pm
      ? 'Afternoon'
      : currentHour > 17 || currentHour < 4 // after 5:59pm or before 4:00AM (to accommodate night owls)
      ? 'Evening' // if for some reason the calculation didn't work
      : 'Welcome';

  const greetingBlurb =
    currentHour >= 4 && currentHour < 12 // after 4:00AM and before 12:00PM
      ? 'Are you ready for your next adventure?'
      : currentHour >= 12 && currentHour <= 17 // after 12:00PM and before 6:00pm
      ? 'Keep it up - you can do it!'
      : currentHour > 17 || currentHour < 4 // after 5:59pm or before 4:00AM (to accommodate night owls)
      ? 'Remember to take a breather to relax.' // if for some reason the calculation didn't work
      : 'Are you ready for your next adventure?';

  const NameCustom = (row) => (
    <div data-tag="allowRowEvents" className="truncateWrapper">
      <p
        data-tag="allowRowEvents"
        className="font-semibold text-sm mb-1 truncate"
      >
        {row.name}
      </p>
      <p
        data-tag="allowRowEvents"
        className="text-sm px-2 inline-flex font-semibold rounded bg-emerald-100 text-emerald-800"
      >
        {row.type}
      </p>
    </div>
  );
  const RewardCustom = (row) => (
    <div data-tag="allowRowEvents">
      <p data-tag="allowRowEvents" className="font-semibold text-sm">
        +{row.gold_reward} 💰
      </p>
      <p data-tag="allowRowEvents">+{row.exp_reward} XP</p>
    </div>
  );
  const TrendCustom = (row) => (
    <i
      data-tag="allowRowEvents"
      className={
        row.trend === 'up'
          ? 'fas fa-arrow-up text-emerald-600'
          : row.trend === 'down'
          ? 'fas fa-arrow-down text-red-600'
          : row.trend === 'check'
          ? 'fas fa-check text-emerald-600'
          : ''
      }
    />
  );

  const columns = [
    {
      name: 'RECENT WINS',
      selector: 'name',
      cell: (row) => <NameCustom {...row} />,
      grow: 2
    },
    {
      name: 'COMPLETED',
      selector: 'closing_date',
      right: true,
      maxWidth: '10px',
      sortable: true
    },
    {
      name: 'TREND',
      selector: 'trend',
      center: true,
      maxWidth: '25px',
      cell: (row) => <TrendCustom {...row} />
    },
    {
      name: 'REWARDS',
      selector: 'gold_reward',
      sortable: true,
      right: true,
      maxWidth: '25px',
      cell: (row) => <RewardCustom {...row} />
    }
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: 'red',
        backgroundImage: 'linear-gradient(to right, #10b981, #3b82f6)',
        minHeight: '48px',
        borderRadius: '6px 6px 0 0',
        paddingLeft: '8px',
        paddingRight: '8px'
      }
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: 600,
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    rows: {
      style: {
        minHeight: '72px', // override the row height
        paddingLeft: '8px',
        paddingRight: '8px'
      }
    }
  };

  // Redirects user to sign in if they are not logged in yet

  useEffect(() => {
    if (!user) router.replace('/signin');
  }, [user]);

  // Waits until database fetches user state before loading anything

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  // Set player background when the information loads

  useEffect(() => {
    if (playerStats) fetchPlayerBackground(playerStats.background_url);
  }, (playerStats));

  // Checks if the user is ready to load

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
    await refreshStats();
    fetchLatestWin(setActiveModalStats, refreshStats, setLevelUp, triggerWinModal, setShowWinModal);
  }

  async function refreshStats() {
    console.log('statsRefreshing')
    setPlayerStats(await fetchPlayerStats(setAvatarUrl));
    setWins(await fetchWins());
    setWeekWins(await fetchWeekWins());
    setAreaStats(await fetchAreaStats());
    setLoading(false);
  }

  async function fetchPlayerBackground(path) {
    if (path) {
      try {
        const { data, error } = await supabase.storage
          .from('backgrounds')
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        setBackgroundUrl(url);
      } catch (error) {
        console.log('Error downloading image: ', error.message);
      } finally {
      }
    } else {
      setBackgroundUrl('background/cityscape.jpg');
    }
  }

  // specific update for avatar URL, and other stuff late

  async function updateProfile({ image_url, type }) {
    try {
      setLoading(true);
      if (userDetails) {
        const user = supabase.auth.user();
        if (type === 'avatar') {
          let { error } = await supabase
            .from('users')
            .update({
              avatar_url: image_url
            })
            .eq('id', user.id);
          if (error) {
            throw error;
          }
        } else if (type === 'background') {
          let { error } = await supabase
            .from('users')
            .update({
              background_url: image_url
            })
            .eq('id', user.id);

          if (error) {
            throw error;
          }
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function modalHandler(wins) {
    triggerWinModal(setActiveModalStats, setShowWinModal, wins);
  }

  if (loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="h-screen flex flex-col justify-center">
        <div className="-mt-40 mx-auto">
          <h1 className="mb-5 text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Loading Wins This Season...
          </h1>
          <div className="flex justify-center">
            <LoadingDots />
          </div>
        </div>
      </div>
    );
  }

  // if (showIntroModal) {
  //   return (
  //     <div className="h-screen flex justify-center">
  //         <div
  //           className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
  //           // onClick={() => setShowWinModal(false)}
  //         >
  //           <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen">
  //             {/*content*/}
  //             <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
  //               {/*header*/}
  //               <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-emerald-500">
  //                 <h3 className="text-2xl font-semibold text-white">
  //                 👋 Welcome. Let's get you all set up!
  //                 </h3>

  //                 <button
  //                   className="p-1 ml-auto bg-transparent border-0 float-right text-2xl leading-none font-semibold outline-none focus:outline-none"
  //                   onClick={() => router.reload(window.location.pathname)}
  //                 >
  //                   <i className="fas fa-sync-alt"></i>
  //                 </button>
  //               </div>
  //               {/*body*/}
  //               <div className="relative p-6 text-blueGray-500">
  //                 <div className="my-2 flex flex-col">
  //                 {userOnboarding ? userOnboarding.onboarding_state.includes('1') ?
  //                 <div>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect To Notion
  //                 </Button>
  //                 </Link>
  //                 </div>
  //                 : userOnboarding.onboarding_state.includes('2') ?
  //                 <div>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" disabled={true} className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect To Notion
  //                 </Button>
  //                 </Link>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect Your Database
  //                 </Button>
  //                 </Link>
  //                 </div>
  //                 :
  //                 <div>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" disabled={true} className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect To Notion
  //                 </Button>
  //                 </Link>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" disabled={true} className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect Your Database
  //                 </Button>
  //                 </Link>
  //                 <a href="https://notion.so/" target="_blank">
  //                 <Button variant="onboarding" className="text-lg leading-none text-primary-2 font-bold w-full">
  //                 <i className={"fas fa-check-square mr-3"}></i>
  //                 Share A Win With Our Family
  //                 </Button>
  //                 </a>
  //                 </div>
  //                 :
  //                 <div></div>
  //                 }
  //                 </div>
  //               </div>
  //               {/*footer*/}
  //               <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
  //                 <a href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection?utm_source=family-connection"target="_blank"
  //                   className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
  //                 >
  //                   Troubleshoot
  //                 </a>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //         <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
  //         </div>
  //   );
  // }

  return (
    <>
      {/* <section className="bg-player-pattern bg-fixed bg-cover"> */}
      <section
        className="animate-slow-fade-in bg-fixed bg-cover "
        style={{ backgroundImage: `url(${background_url})` }}
      >
        <BottomNavbar />
        <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-black rounded opacity-90">
            <div className="pt-10 pb-5">
              <h1 className="text-4xl font-extrabold text-white text-center sm:text-6xl">
                {greetingMessage},{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                  {playerStats.full_name ? (
                    `${playerStats.full_name ?? 'Adventurer'}`
                  ) : (
                    <LoadingDots />
                  )}
                  !
                </span>
              </h1>
              <p className="mt-5 text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
                {greetingBlurb}
              </p>
            </div>
            <div className="animate-fade-in-up max-w-6xl px-4 md:px-10 mx-auto w-full -m-24">
              <HeaderStats
                playerStats={playerStats}
                avatar_url={avatar_url}
                setAvatarUrl={setAvatarUrl}
                fetchPlayerBackground={fetchPlayerBackground}
                updateProfile={updateProfile}
                weekWins={weekWins}
                areaStats={areaStats}
              />
              <div className="flex flex-wrap mt-4">
                <div className="w-full pb-36 px-4">
                  {/* <CardTable color="dark" data={wins} /> */}
                  <DataTable
                    className=""
                    title="Recent Wins 👀"
                    noHeader
                    columns={columns}
                    data={wins}
                    onRowClicked={modalHandler}
                    // highlightOnHover={true}
                    pointerOnHover={true}
                    fixedHeader={true}
                    customStyles={customStyles}
                    pagination={true}
                    theme="game"
                  />
                  {/* <TailwindTable wins={wins} /> */}
                </div>
              </div>
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
        <div></div>
      )}

      {/* // Modal Section */}
      {showWinModal ? (
        <>
          <WinModal
            page={'player'}
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
