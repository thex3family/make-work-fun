import { useState, useEffect } from 'react';
import CardStats from 'components/Cards/CardStats.js';
import LoadingDots from '@/components/ui/LoadingDots';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';
import CardAreaStats from '@/components/Cards/CardAreaStats';
import CardLineChart from 'components/Cards/CardLineChart.js';
import Avatar from '@/components/Cards/CardAvatar';
import CardWin from '@/components/Cards/CardWin';

import {
  fetchPlayerStats,
  fetchAreaStats,
  fetchWeekWins,
  fetchLatestWin,
  fetchSpecificPlayers,
  lookupPlayerFromAuth
} from '@/components/Fetch/fetchMaster';

import { triggerWinModal, triggerCardWin } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';

export default function playerDetails() {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [specificPlayers, setSpecificPlayers] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHide, setShowHide] = useState(true);
  const [areaStats, setAreaStats] = useState([]);
  const [weekWins, setWeekWins] = useState([]);
  const [background_url, setBackgroundUrl] = useState('/');

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

  let bg_opacity = 'bg-opacity-50';

  // win modal stuff

  const [showWinModal, setShowWinModal] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);

  // Card Win Stuff
  const [activeWinStats, setActiveWinStats] = useState(null);
  const [showCardWin, setShowCardWin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [friends, setFriends] = useState(null);

  useEffect(() => {
    if (player || id) refreshStats();
    if (player)
      fetchLatestWin(
        setActiveModalStats,
        refreshStats,
        setLevelUp,
        triggerWinModal,
        setShowWinModal,
        player
      );
    if (id) 
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal,
      null,
      triggerCardWin,
      setShowCardWin,
      setActiveWinStats,
      friends
    );
  }, [player, id, friends]);

  async function refreshStats() {
    console.log('statsRefreshing');
    if (player) setPlayerStats(await fetchPlayerStats(player, setNewToSeason));
    if (id) setSpecificPlayers(await fetchSpecificPlayers(id, setFriends));
    if (id) setPlayerStats("Placeholder");
    setLoading(false);
  }

  
  useEffect(() => {
    if (display == 'demo') {
      setPlayerStats(demoPlayerStats);
      setLoading(false);
    }
  }, [display]);

  // useEffect(() => {
  //   if (playerStats) {
  //     if (playerStats.avatar_url) downloadImage(playerStats.avatar_url);
  //     if (!playerStats.avatar_url) setAvatarStatus('Missing');
  //     fetchPlayerBackground(playerStats.background_url);
  //   }
  // }, [playerStats]);

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

  if (!playerStats || loading) {
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
          <ModalOnboarding onboardingState={'new_season_embed'} />
          : null
      }
    </>
  }

  return (
    <>
      <section
        className={`animate-slow-fade-in h-screen responsiveBackground ${
          style == 'dark' ? 'bg-dark' : 'bg-white'
        }`}
      >
        <div className="mx-5 py-5">
          {player || display == "demo" ? (
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
              statEXPEarned={player.exp_earned_today}
              statGoldEarned={player.exp_earned_today}
              statEarnedDuration={'today'}
            />
          ) : null}
        </div>
        {specificPlayers ? (
          <div className="mx-5 sm:mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl gap-12 pb-10">
            {specificPlayers.map((player, i) => (
              <Avatar
                key={i}
                statRank={player.player_rank}
                statName={player.full_name}
                statLevel={player.current_level}
                statEXP={player.total_exp}
                statEXPProgress={player.exp_progress}
                statLevelEXP={player.level_exp}
                statGold={player.total_gold}
                statWinName={player.name}
                statWinType={player.type}
                statWinGold={player.gold_reward}
                statWinEXP={player.exp_reward}
                avatar_url={player.avatar_url}
                background_url={player.background_url}
                statTitle={player.title}
                statEXPEarned={player.exp_earned_today}
                statGoldEarned={player.exp_earned_today}
                statEarnedDuration={'today'}
              />
            ))}
          </div>
        ) : null}
      </section>
      {showCardWin ? (
        <CardWin
          setShowCardWin={setShowCardWin}
          win={activeWinStats}
          player_name={showCardWin.full_name}
          avatarUrl={showCardWin.avatar_url}
          position={'top'}
        />
      ) : null}
    </>
  );
}
