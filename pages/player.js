import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import { userContent } from '@/utils/useUser';

import { supabase } from '../utils/supabase-client';

import React from 'react';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';

import TitleModal from '@/components/Modals/ModalTitle';

import PlayerSkeleton from '@/components/Skeletons/PlayerSkeleton';
import RecentWinsSkeleton from '@/components/Skeletons/RecentWinsSkeleton';

import moment from 'moment';

// functions

import {
  fetchPlayerStats,
  fetchWins,
  fetchWeekWins,
  fetchAreaStats,
  fetchTitles,
  fetchSpecificWin
} from '@/components/Fetch/fetchMaster';

import { pushTitle } from '@/components/Push/pushMaster';

// components

import HeaderStats from 'components/Headers/HeaderStats.js';
import DataTable, { createTheme } from 'react-data-table-component';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';
import Button from '@/components/ui/Button';

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

export default function Player({ metaBase, setMeta, refreshChildStats, setRefreshChildStats }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, userLoaded, userOnboarding } = userContent();
  const [wins, setWins] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [background_url, setBackgroundUrl] = useState('/');
  const [levelUp, setLevelUp] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [weekWins, setWeekWins] = useState([]);
  const [areaStats, setAreaStats] = useState([]);
  const [titles, setTitles] = useState([]);

  const [onboardingState, setOnboardingState] = useState(null);

  const [newToSeason, setNewToSeason] = useState(null);

  const currentHour = new Date().getHours();
  
  const [today_wins, setToday_wins] = useState(null);

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
        ? 'Keep it up - you can do it! 🥳'
        : currentHour > 17 || currentHour < 4 // after 5:59pm or before 4:00AM (to accommodate night owls)
          ? 'Remember to take a breather to relax.' // if for some reason the calculation didn't work
          : 'Are you ready for your next adventure?';

  const NameCustom = (row) => (
    <div data-tag="allowRowEvents" className="">
      <p
        data-tag="allowRowEvents"
        className="font-semibold text-sm mb-1 truncate w-32 sm:w-96"
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

  // sets the meta tags

  useEffect(() => {
    const meta = {
      title: 'Player - ' + metaBase.titleBase
    }
    setMeta(meta)
  }, []);

  // Waits until database fetches user state before loading anything

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  // Set player background when the information loads

  useEffect(() => {
    if (playerStats) setAvatarUrl(playerStats.avatar_url)
    if (playerStats) fetchPlayerBackground(playerStats.background_url);
  }, playerStats);

  // Checks if the user is ready to load

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        setOnboardingState(parseInt(userOnboarding.onboarding_state, 10));
        console.log('Setting onboarding state...', parseInt(userOnboarding.onboarding_state, 10))
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
    if (win_id) loadSpecificWin(win_id);
  }
  
  useEffect(() => {
    if(refreshChildStats){
      refreshStats();
      setRefreshChildStats(false);
    }
  }, [refreshChildStats]);

  async function refreshStats() {
    console.log('Refreshing Stats');
    setPlayerStats(await fetchPlayerStats(null, setNewToSeason));
    setWeekWins(await fetchWeekWins());
    setLoading(false);
    setTitles(await fetchTitles());
    setAreaStats(await fetchAreaStats());
    setWins(await fetchWins());
  }

  useEffect(() => {
    if(wins){
      const today = moment().local().format('YYYY-MM-DD');
      const win_count = wins.reduce((acc, cur) => cur.closing_date === today ? ++acc : acc, 0);
      setToday_wins(win_count);
    }
  }, [wins]);

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
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function modalHandler(wins) {
    triggerWinModal(setActiveModalStats, setShowWinModal, wins);
  }

  // if specific win is called on

  const { win_id } = router.query;

  async function loadSpecificWin(win) {
    const specific_win = await fetchSpecificWin(win);
    if (specific_win) {
      triggerWinModal(setActiveModalStats, setShowWinModal, specific_win);
    }
  }

  if (loading) {
    return <>
      <PlayerSkeleton />
      {onboardingState ? (
        <ModalOnboarding onboardingState={onboardingState} />
      ) : null}
    </>;
  }

  if (newToSeason && !playerStats) {
    // need to add a case to handle if no wins this season, how can they initialize their character

    return (
      <>
        <PlayerSkeleton />
        <ModalOnboarding onboardingState={5} />
      </>
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
        className="animate-slow-fade-in bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${background_url})` }}
      >
        <div className="bg-black bg-opacity-70 sm:bg-opacity-0">
          <div className="max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
            <div className="rounded sm:bg-black sm:bg-opacity-90 bg-none bg-opacity-100 opacity-95">
              <div className="pt-0 sm:pt-10 pb-5">
                <h1 className="text-4xl font-extrabold text-white text-center sm:text-6xl">
                  {greetingMessage},{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                    {playerStats ? playerStats.full_name ? playerStats.full_name : 'Adventurer'  : (
                      <LoadingDots />
                    )}
                    !
                  </span>
                </h1>
                <p className="mt-5 px-2 text-xl text-accents-6 text-center sm:text-2xl max-w-xl md:max-w-3xl m-auto">
                {(today_wins ? "You've completed " + today_wins + (today_wins > 1 ? " wins" : " win") + " today! " : '') +  greetingBlurb}
                </p>
              </div>
              <div className="max-w-6xl px-0 sm:px-4 md:px-10 mx-auto w-full -m-24">
                <HeaderStats
                  playerStats={playerStats}
                  avatarUrl={avatar_url}
                  setAvatarUrl={setAvatarUrl}
                  fetchPlayerBackground={fetchPlayerBackground}
                  updateProfile={updateProfile}
                  weekWins={weekWins}
                  areaStats={areaStats}
                  setShowTitleModal={setShowTitleModal}
                  titles={titles}
                  user_id={user.id}
                />
                {wins ? (
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
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                      />
                      {/* <TailwindTable wins={wins} /> */}
                    </div>
                  </div>
                ) : (
                  <RecentWinsSkeleton />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {showTitleModal ? (
        <TitleModal
          setShowTitleModal={setShowTitleModal}
          titles={titles}
          playerStats={playerStats}
          pushTitle={pushTitle}
          refreshStats={refreshStats}
        />
      ) : null}
      {onboardingState ? (
        <ModalOnboarding onboardingState={onboardingState} />
      ) : null}
    </>
  );
}

export async function getServerSideProps({ req }) {
  // Get the user's session based on the request
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return {
      redirect: {
        destination: '/signin?redirect=player',
        permanent: false
      }
    };
  }

  return {
    props: { user }
  };
}
