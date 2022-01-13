import { useState, useEffect } from 'react';
import CardStats from 'components/Cards/CardStats.js';
import LoadingDots from '@/components/ui/LoadingDots';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';
import CardAreaStats from '@/components/Cards/CardAreaStats';
import CardLineChart from 'components/Cards/CardLineChart.js';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';

import {
  fetchPlayerStats,
  fetchAreaStats,
  fetchWeekWins,
  fetchLatestWin,
  lookupPlayerFromAuth
} from '@/components/Fetch/fetchMaster';

import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import Button from '@/components/ui/Button';

export default function playerDetails() {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHide, setShowHide] = useState(true);
  const [areaStats, setAreaStats] = useState(null);
  const [weekWins, setWeekWins] = useState(null);
  const [background_url, setBackgroundUrl] = useState('/');

  const [newToSeason, setNewToSeason] = useState(null);

  const [avatar_url, setAvatarUrl] = useState(null);

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

  const demoAreaStats = [
    {
      area: 'Make Work Fun',
      current_level: 19,
      total_exp: 16025,
      exp_progress: 950,
      level_exp: 1550
    },
    {
      area: 'Sustainable',
      current_level: 9,
      total_exp: 4375,
      exp_progress: 675,
      level_exp: 800
    },
    {
      area: 'Mindset',
      current_level: 9,
      total_exp: 4325,
      exp_progress: 625,
      level_exp: 800
    },
    {
      area: 'Knowledge',
      current_level: 7,
      total_exp: 2925,
      exp_progress: 600,
      level_exp: 650
    },
    {
      area: 'Sharing',
      current_level: 7,
      total_exp: 2500,
      exp_progress: 175,
      level_exp: 650
    },
    {
      area: 'Family',
      current_level: 5,
      total_exp: 1300,
      exp_progress: 50,
      level_exp: 500
    }
  ];

  const demoWeekWins = {
    w0d0: 4,
    w0d1: 3,
    w0d2: 7,
    w0d3: 4,
    w0d4: 5,
    w0d5: 6,
    w0d6: 3,
    w0d7: 6,
    w1d0: 8,
    w1d1: 4,
    w1d2: 5,
    w1d3: 7,
    w1d4: 2,
    w1d5: 5,
    w1d6: 6,
    w1d7: 9
  };

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

  const { auth } = router.query;
  const { style } = router.query;
  const { win } = router.query;
  const { lvl } = router.query;
  const { opacity } = router.query;
  const { display } = router.query;

  let bg_opacity = 'bg-opacity-50';

  // check on the player using the auth key

  const [player, setPlayer] = useState(null);
  const [invalidCredentials, setInvalidCredentials] = useState(null);

  useEffect(() => {
    if (auth && display !== 'demo') (lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials));
  }, [auth]);

  // win modal stuff

  const [showWinModal, setShowWinModal] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);

  useEffect(() => {
    if (player) refreshStats();
    if (player)
      fetchLatestWin(
        setActiveModalStats,
        refreshStats,
        setLevelUp,
        triggerWinModal,
        setShowWinModal,
        player
      );
  }, [player]);

  useEffect(() => {
    if (display == 'demo') {
      setPlayerStats(demoPlayerStats);
      setAreaStats(demoAreaStats);
      setWeekWins(demoWeekWins);
      downloadImage(demoPlayerStats.avatar_url);
      setActiveModalStats(demoModalStats);
      setLoading(false);
    }
  }, [display]);

  async function refreshStats() {
    console.log('statsRefreshing');
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    setAreaStats(await fetchAreaStats(player));
    setWeekWins(await fetchWeekWins(player));
    setLoading(false);
  }

  useEffect(() => {
    if (playerStats) {
      if (!playerStats.avatar_url) {
        setAvatarStatus('Missing');
      } else {
        setAvatarUrl(playerStats.avatar_url);
      }
      fetchPlayerBackground(playerStats.background_url);
    }
  }, [playerStats]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error.message);
    } finally {
      setAvatarStatus('Exists');
    }
  }

  async function fetchPlayerBackground(path) {
    if (style == 'dark') {
    } else {
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
        setBackgroundUrl('/background/cityscape.jpg');
      }
    }
  }

  if (!playerStats) {
    return <>
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
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
  }

  return (
    <>
      <section
        className="animate-slow-fade-in bg-fixed bg-cover bg-center bg-dark responsiveBackground"
        style={{ backgroundImage: `url(${background_url})` }}
      >
        <div
          className={
            style == 'dark'
              ? null
              : `bg-black ${bg_opacity} responsiveBackground`
          }
        >
          {display == 'demo' ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center bg-dark py-4 px-4">
              <Button
                className="w-full sm:w-auto"
                variant="incognito"
                onClick={()=>setShowWinModal(true)}
              >
                Demo: New Win
              </Button>

              <Button
                className=" w-full sm:w-auto"
                variant="incognito"
                onClick={()=>setLevelUp(2)}
              >
                Demo: Level Up!
              </Button>
            </div>
          ) : null}
          <div className="px-4 md:px-10 mx-auto w-full">
            <div className="relative py-10">
              <div className="px-4 md:px-10 mx-auto w-full">
                <div>
                  {/* Card stats */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-5 opacity-90">
                    <div className="w-full mx-auto mt-2 md:mt-0 mb-6 md:mb-0 xs:w-1/4 sm:w-2/3 lg:w-1/2 2xl:w-1/3 h-full text-center relative">
                      <div
                        className={`${
                          showHide ? 'hidden' : ''
                        } animate-fade-in`}
                        onClick={() => {
                          showHide ? setShowHide(false) : setShowHide(true);
                        }}
                      >
                        <CardAreaStats areaStats={areaStats} />
                      </div>
                      <div
                        className={`${
                          showHide ? '' : 'hidden'
                        } animate-fade-in`}
                      >
                        {avatarStatus == 'Missing' ? (
                          <img
                            className="avatar image h-auto m-auto cursor-pointer"
                            src="/img/default_avatar.png"
                            alt="Avatar"
                            onClick={() => {
                              showHide ? setShowHide(false) : setShowHide(true);
                            }}
                          />
                        ) : (
                          <img
                            className="avatar image h-auto m-auto cursor-pointer"
                            src={avatar_url}
                            alt="Avatar"
                            onClick={() => {
                              showHide ? setShowHide(false) : setShowHide(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-grow w-full sm:w-2/3 sm:ml-10 lg:ml-0 sm:items-right lg:w-1/2 h-full py-0 sm:py-5">
                      <div className="flex 2xl:flex-row flex-col gap-4">
                        <div className="2xl:w-1/2 w-full">
                          <CardStats
                            statTitle={playerStats.title}
                            statName={playerStats.full_name}
                            statLevel={playerStats.current_level}
                            statMaxLevel={100}
                            statEXP={playerStats.total_exp}
                            statLevelEXP={playerStats.level_exp}
                            statEXPProgress={playerStats.exp_progress}
                            statEXPPercent={Math.floor(
                              (playerStats.exp_progress /
                                playerStats.level_exp) *
                                100
                            )}
                            statGold={playerStats.total_gold}
                            statArrow="up"
                            statPercent="0"
                            statPercentColor="text-white"
                            statDescription="since last week"
                            statIconName="fas fa-cogs"
                            statIconColor="bg-transparent-500"
                            statPlayer={player}
                          />
                        </div>
                        <div className="2xl:w-1/2 w-full 2xl:pt-0">
                          {weekWins ? (
                            <CardLineChart weekWins={weekWins} />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* // Modal Section */}
      {showWinModal && (win || display == 'demo') ? (
        <>
          <WinModal
            page={'player'}
            activeModalStats={activeModalStats}
            setShowWinModal={setShowWinModal}
            playerStats={playerStats}
            refreshStats={refreshStats}
            display={display}
          />
        </>
      ) : null}

      {/* level up modal */}
      {levelUp && (lvl || display == 'demo') ? (
        <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
      ) : null}
    </>
  );
}
