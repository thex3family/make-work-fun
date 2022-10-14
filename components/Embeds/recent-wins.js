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

export default function RecentWins({utility, hideAttribution, hideDelete, hideShareWithFamily}) {
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
    if (auth && display !== 'demo') (lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials, utility));
  }, [auth]);

  const demoWins = [
    {
      "id": 4,
      "name": "Launch My Side Project",
      "type": "Key Result",
      "punctuality": 0,
      "closing_date": "2022-10-04",
      "gold_reward": 0,
      "exp_reward": 250,
      "upstream": "🗃 Have Courage",
      "trend": "check",
      "notion_id": null,
      "gif_url": "https://media3.giphy.com/media/12UlfHpF05ielO/giphy.gif?cid=083ffd94be51c603562f87807a6bad1311e9c1e122ca1e0f&rid=giphy.gif&ct=g",
      "entered_on": "2022-08-03T12:31:34.120418",
      "database_nickname": "Success Plan",
      "player": "17ae471a-3096-4c57-af41-1cf67e52dd67"
    },
    {
      "id": 3,
      "name": "Daily Quest Bonus Reward",
      "type": "Bonus",
      "punctuality": 0,
      "closing_date": "2022-10-03",
      "gold_reward": 50,
      "exp_reward": 100,
      "upstream": null,
      "trend": "check",
      "notion_id": null,
      "gif_url": "https://media2.giphy.com/media/ZE6HYckyroMWwSp11C/giphy.gif?cid=083ffd9438915b712d4eda3816ca3c17b8fc80f418b01242&rid=giphy.gif&ct=g",
      "entered_on": "2022-09-05T05:33:43.841104",
      "database_nickname": null,
      "player": "32bf9641-f33f-43bb-8006-a264d07261ec"
    },
    {
      "id": 2,
      "name": "Help A Community Member",
      "type": "Task",
      "punctuality": 0,
      "closing_date": "2022-10-02",
      "gold_reward": 100,
      "exp_reward": 100,
      "upstream": "🗃 Care For Family And Friends",
      "trend": "check",
      "notion_id": null,
      "gif_url": "https://media3.giphy.com/media/LkjlH3rVETgsg/giphy.gif?cid=083ffd9483b8af7636e82c73a90f0d3ad678852dcf368ebe&rid=giphy.gif&ct=g",
      "entered_on": "2022-08-26T03:08:13.7346",
      "database_nickname": "Success Plan",
      "player": "17ae471a-3096-4c57-af41-1cf67e52dd67"
    },
    {
      "id": 1,
      "name": "My First Win This Season",
      "type": "Bonus",
      "punctuality": 0,
      "closing_date": "2022-10-01",
      "gold_reward": 25,
      "exp_reward": 25,
      "upstream": null,
      "trend": "check",
      "notion_id": null,
      "gif_url": "https://media4.giphy.com/media/YRtLgsajXrz1FNJ6oy/giphy.gif?cid=083ffd9416d1a990ae35cc3205b23af83aaf21d67b3726bc&rid=giphy.gif&ct=g",
      "entered_on": "2022-10-03T08:49:42.115519",
      "database_nickname": null,
      "player": "32bf9641-f33f-43bb-8006-a264d07261ec"
    }
  ];

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
      setWins(demoWins);
      setLoading(false);
    }
  }, [display]);

  if (!wins || loading) {
    return <>
      <div className={`h-screen ${style == 'dark' ? 'bg-dark' : 'bg-white'}`}>
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
        className={`h-screen responsiveBackground ${style == 'dark' ? 'bg-dark' : 'bg-white'
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
        {!hideAttribution ? <div className='flex justify-center pb-10'>
            <a
              className='hideLinkBorder rounded py-2 px-4 text-white bg-primary bg-opacity-80 shadow-md'
              href="https://makework.fun?utm_source=embed"
              target="_blank">
              ⚡ Powered By Make Work Fun
            </a>
          </div> : null}
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
            hideShareWithFamily={hideShareWithFamily}
            hideDelete={hideDelete}
          />
        </>
      ) : null}
    </>
  );
}
