import { useState, useEffect } from 'react';
import CardStats from 'components/Cards/CardStats.js';
import LoadingDots from '@/components/ui/LoadingDots';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';
import CardAreaStats from '@/components/Cards/CardAreaStats';
import CardLineChart from 'components/Cards/CardLineChart.js';

import {
  fetchPlayerStats,
  fetchAreaStats,
  fetchWeekWins,
  fetchLatestWin,
} from '@/components/Fetch/fetchMaster';

import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import ModalLevelUp from '@/components/Modals/ModalLevelUp';

export default function playerDetails() {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHide, setShowHide] = useState(true);
  const [areaStats, setAreaStats] = useState([]);
  const [weekWins, setWeekWins] = useState([]);
  const [background_url, setBackgroundUrl] = useState('/');

  const { player } = router.query;
  const { style } = router.query;
  const { opacity } = router.query;

  let bg_opacity = 'bg-opacity-50';


  // win modal stuff
  
  const [showWinModal, setShowWinModal] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);


  useEffect(() => {
    if (player) refreshStats();
    if (player) fetchLatestWin(
        setActiveModalStats,
        refreshStats,
        setLevelUp,
        triggerWinModal,
        setShowWinModal,
        player
      );
  }, [player]);

  async function refreshStats() {
    console.log('statsRefreshing');
    setPlayerStats(await fetchPlayerStats(null, player));
    setAreaStats(await fetchAreaStats(player));
    setWeekWins(await fetchWeekWins(player));
    setLoading(false);
  }

  useEffect(() => {
    if (playerStats) {
      if (playerStats.avatar_url) downloadImage(playerStats.avatar_url);
      if (!playerStats.avatar_url) setAvatarStatus('Missing');
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
        setBackgroundUrl('background/cityscape.jpg');
      }
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <>
      <section
        className="animate-slow-fade-in bg-fixed bg-cover bg-dark"
        style={{ backgroundImage: `url(${background_url})` }}
      >
        <div className={style == 'dark' ? null : `bg-black ${bg_opacity}`}>
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
                        {avatarStatus == 'Exists' ? (
                          <img
                            className="avatar image h-auto m-auto cursor-pointer"
                            src={avatar_url}
                            alt="Avatar"
                            onClick={() => {
                              showHide ? setShowHide(false) : setShowHide(true);
                            }}
                          />
                        ) : avatarStatus == 'Missing' ? (
                          <img
                            className="avatar image h-auto m-auto cursor-pointer"
                            src="img/default_avatar.png"
                            alt="Avatar"
                            onClick={() => {
                              showHide ? setShowHide(false) : setShowHide(true);
                            }}
                          />
                        ) : (
                          <div className="flex avatar image m-auto justify-center">
                            <LoadingDots />
                          </div>
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
                          (playerStats.exp_progress / playerStats.level_exp) *
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
      
      {/* level up modal */}
      {levelUp ? (
        <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
      ) : null}

    </>
  );
}
