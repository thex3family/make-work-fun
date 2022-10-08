import { useState, useEffect } from 'react';
import LoadingDots from '@/components/ui/LoadingDots';
import { useRouter } from 'next/router';
import Avatar from '@/components/Cards/CardAvatar';

import {
  fetchPlayerStats,
  lookupPlayerFromAuth,
  fetchWins
} from '@/components/Fetch/fetchMaster';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';
import DataTable, { createTheme } from 'react-data-table-component';
import RecentWinsSkeleton from '@/components/Skeletons/RecentWinsSkeleton';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';


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

export default function recentWins() {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);

  const [newToSeason, setNewToSeason] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    // codes using router.query
    const { auth } = router.query;
    if (!auth && !id) {
      setInvalidCredentials(true);
    }

  }, [router.isReady]);

  const { auth } = router.query;
  const { style } = router.query;
  const { id } = router.query;
  const { opacity } = router.query;
  const { display } = router.query;

  // check on the player using the auth key

  const [player, setPlayer] = useState(null);
  const [invalidCredentials, setInvalidCredentials] = useState(null);

  useEffect(() => {
    if (auth && display !== 'demo') (lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials));
  }, [auth]);

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
    exp_earned_today: 2575,
    gold_earned_today: 1250,
    season: '2S',
    latest: true
  };

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

  const [wins, setWins] = useState(null);

  async function modalHandler(wins) {
    triggerWinModal(setActiveModalStats, setShowWinModal, wins);
  }

  useEffect(() => {
    if (player) refreshStats();
  }, [player]);

  async function refreshStats() {
    console.log('statsRefreshing', player);
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    setWins(await fetchWins(player));
    setLoading(false);
  }


  useEffect(() => {
    if (display == 'demo') {
      // need to add demo case
      setWins(demoPlayerStats);
      setLoading(false);
    }
  }, [display]);

  if (!wins || loading) {
    return <>
      <div className="h-screen">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="flex flex-wrap mt-4">
            <div className="w-full px-4">
              <div className="w-full h-96 bg-primary-2 rounded">
                <div className="h-12 bg-gray-600 rounded-tr rounded-tl animate-pulse" />
                <div className="grid grid-cols-4 sm:grid-cols-12 px-4 pt-4 gap-4 place-items-center">
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse sm:col-span-5" />
                  <div className="hidden sm:inline sm:col-span-4" />
                  <div className="w-full h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-10 h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-12 px-4 pt-4 gap-4 place-items-center">
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse sm:col-span-5" />
                  <div className="hidden sm:inline sm:col-span-4" />
                  <div className="w-full h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-10 h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-12 px-4 pt-4 gap-4 place-items-center">
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse sm:col-span-5" />
                  <div className="hidden sm:inline sm:col-span-4" />
                  <div className="w-full h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-10 h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-12 px-4 pt-4 gap-4 place-items-center">
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse sm:col-span-5" />
                  <div className="hidden sm:inline sm:col-span-4" />
                  <div className="w-full h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-10 h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-12 px-4 pt-4 gap-4 place-items-center">
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse sm:col-span-5" />
                  <div className="hidden sm:inline sm:col-span-4" />
                  <div className="w-full h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-10 h-6 rounded-sm bg-gray-600 animate-pulse" />
                  <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        invalidCredentials ?
          <ModalOnboarding onboardingState={'invalid_auth'} />
          : null
      }
      {/* {
        newToSeason ?
          <ModalOnboarding onboardingState={'new_season_embed'} />
          : null
      } */}
    </>
  }

  return (
    <>
      <section
        className={`animate-slow-fade-in h-screen responsiveBackground ${style == 'dark' ? 'bg-dark' : 'bg-white'
          }`}
      >
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="flex flex-wrap mt-4">
            <div className="rounded-md bg-none bg-opacity-100 opacity-95 w-full px-4">
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
            hideShareWithFamily={true}
            hideDelete={true}
          />
        </>
      ) : null}
    </>
  );
}
