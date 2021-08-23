import { useState, useEffect } from 'react';
import CardStats from 'components/Cards/CardStats.js';
import LoadingDots from '@/components/ui/LoadingDots';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';
import CardAreaStats from '@/components/Cards/CardAreaStats';
import CardLineChart from 'components/Cards/CardLineChart.js';
import Avatar from '@/components/Cards/CardAvatar';

import {
  fetchPlayerStats,
  fetchAreaStats,
  fetchWeekWins,
  fetchLatestWin
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

  async function refreshStats() {
    console.log('statsRefreshing');
    setPlayerStats(await fetchPlayerStats(null, player));
    setAreaStats(await fetchAreaStats(player));
    setWeekWins(await fetchWeekWins(player));
    setLoading(false);
  }

  // useEffect(() => {
  //   if (playerStats) {
  //     if (playerStats.avatar_url) downloadImage(playerStats.avatar_url);
  //     if (!playerStats.avatar_url) setAvatarStatus('Missing');
  //     fetchPlayerBackground(playerStats.background_url);
  //   }
  // }, [playerStats]);

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

  // async function fetchPlayerBackground(path) {
  //   if (style == 'dark') {
  //   } else {
  //     if (path) {
  //       try {
  //         const { data, error } = await supabase.storage
  //           .from('backgrounds')
  //           .download(path);
  //         if (error) {
  //           throw error;
  //         }
  //         const url = URL.createObjectURL(data);
  //         setBackgroundUrl(url);
  //       } catch (error) {
  //         console.log('Error downloading image: ', error.message);
  //       } finally {
  //       }
  //     } else {
  //       setBackgroundUrl('background/cityscape.jpg');
  //     }
  //   }
  // }

  if (loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <>
      <section className={`animate-slow-fade-in h-screen ${style == 'dark' ? 'bg-dark' : 'bg-white'}`}>
        <div className="mx-5 pt-5">
        <Avatar
          statRank={playerStats.player_rank}
          statName={playerStats.full_name}
          statLevel={playerStats.current_level}
          statEXP={playerStats.total_exp}
          statEXPProgress={playerStats.exp_progress}
          statLevelEXP={playerStats.level_exp}
          statGold={playerStats.total_gold}
          statWinName={playerStats.name}
          statWinType={playerStats.type}
          statWinGold={playerStats.gold_reward}
          statWinEXP={playerStats.exp_reward}
          avatar_url={playerStats.avatar_url}
          background_url={playerStats.background_url}
          statTitle={playerStats.title}
          statEXPEarnedToday={playerStats.exp_earned_today}
          statGoldEarnedToday={playerStats.gold_earned_today}
        />
        </div>
      </section>
    </>
  );
}
