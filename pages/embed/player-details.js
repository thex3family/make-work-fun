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
  fetchTitles,
  fetchWeekWins,
  lookupPlayerFromAuth
} from '@/components/Fetch/fetchMaster';

import { pushTitle } from '@/components/Push/pushMaster';
import TitleModal from '@/components/Modals/ModalTitle';

export default function playerDetails({ setManualPlayerID, setManualPlayerStats }) {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHide, setShowHide] = useState(true);
  const [areaStats, setAreaStats] = useState(null);
  const [titles, setTitles] = useState([]);
  const [weekWins, setWeekWins] = useState(null);
  const [background_url, setBackgroundUrl] = useState('/');

  const [newToSeason, setNewToSeason] = useState(null);

  const [avatar_url, setAvatarUrl] = useState(null);

  const [showTitleModal, setShowTitleModal] = useState(false);

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
  // const { win } = router.query;
  // const { lvl } = router.query;
  const { opacity } = router.query;
  const { display } = router.query;

  let bg_opacity = 'bg-opacity-50';

  // check on the player using the auth key

  const [player, setPlayer] = useState(null);
  const [invalidCredentials, setInvalidCredentials] = useState(null);

  useEffect(() => {
    if (auth && display !== 'demo') (lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials, 'player-details'));
  }, [auth]);


  useEffect(() => {
    if (player) refreshStats();
    if (player) setManualPlayerID(player);
  }, [player]);

  useEffect(() => {
    if (display == 'demo') {
      setPlayerStats(demoPlayerStats);
      setAreaStats(demoAreaStats);
      setWeekWins(demoWeekWins);
      // setActiveModalStats(demoModalStats);
      setLoading(false);
    }
  }, [display]);

  async function refreshStats() {
    console.log('statsRefreshing');
    setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    setAreaStats(await fetchAreaStats(player));
    setTitles(await fetchTitles());
    setWeekWins(await fetchWeekWins(player));
    setLoading(false);
  }

  useEffect(() => {
    if (playerStats) {
      if (!playerStats.avatar_url) {
        setAvatarStatus('Missing');
      } else {
        if (playerStats.avatar_url.includes('blob:')) {
          setAvatarUrl(playerStats.avatar_url);
        } else {
          downloadImage(playerStats.avatar_url)
        }
      }
      fetchPlayerBackground(playerStats.background_url);
      setManualPlayerStats(playerStats);
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

  if (!playerStats || loading) {
    return <>
      <div className={`h-screen flex justify-center ${style == 'dark' ? 'bg-dark' : 'bg-white'}`}>
        <LoadingDots />
      </div>
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
  }

  return (
    <>
      <section
        className="bg-fixed bg-cover bg-center bg-dark responsiveBackground"
        style={{ backgroundImage: `url(${background_url})` }}
      >
        <div
          className={
            style == 'dark'
              ? null
              : `bg-black ${bg_opacity} responsiveBackground`
          }
        >
          <div className="px-4 md:px-10 mx-auto w-full">
            <div className="relative py-10">
              <div className="px-4 md:px-10 mx-auto w-full">
                <div>
                  {/* Card stats */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-5 opacity-90">
                    <div className="w-full mx-auto py-4 xs:w-1/4 md:w-2/3 lg:w-1/2 xl:w-1/3 h-full text-center relative"
                      onMouseEnter={() => setShowHide(false)}
                      onMouseLeave={() => setShowHide(true)}>
                      <div
                        className={`w-full ${showHide ? 'hidden' : ''} animate-fade-in`}
                        onClick={() => {
                          showHide ? setShowHide(false) : setShowHide(true);
                        }}
                      >
                        <CardAreaStats areaStats={areaStats} />
                      </div>
                      <div
                        className={`${showHide ? '' : 'hidden'
                          } animate-fade-in`}
                      >
                        {avatarStatus == 'Missing' ? (
                          <img
                            className="avatar image h-40 sm:h-72 md:h-auto m-auto cursor-pointer"
                            src="/img/default_avatar.png"
                            alt="Avatar"
                            onClick={() => {
                              showHide ? setShowHide(false) : setShowHide(true);
                            }}
                          />
                        ) : avatar_url ? (
                          <img
                            className="avatar image h-40 sm:h-72 md:h-auto m-auto cursor-pointer"
                            src={avatar_url}
                            alt="Avatar"
                            onClick={() => {
                              showHide ? setShowHide(false) : setShowHide(true);
                            }}
                          />
                        ) : <LoadingDots />}
                      </div>
                    </div>
                    <div className="flex-grow w-full sm:w-2/3 sm:items-right lg:w-1/2 h-full py-0 sm:py-5">
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
                            displayMode={display}
                            statEnergy={playerStats.energy_level}
                            user_id={player}
                            setShowTitleModal={setShowTitleModal}
                            refreshStats={refreshStats}
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

      {showTitleModal ? (
        <TitleModal
          setShowTitleModal={setShowTitleModal}
          titles={titles}
          playerStats={playerStats}
          pushTitle={pushTitle}
          user_id={player}
          refreshStats={refreshStats}
        />
      ) : null}
    </>
  );
}
