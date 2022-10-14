import { useState, useEffect } from 'react';
import LoadingDots from '@/components/ui/LoadingDots';
import { useRouter } from 'next/router';
import Avatar from '@/components/Cards/CardAvatar';
import CardAvatarSkeleton from '@/components/Skeletons/CardAvatarSkeleton';

import {
  fetchPlayerStats,
  fetchSpecificPlayers,
  lookupPlayerFromAuth
} from '@/components/Fetch/fetchMaster';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';

export default function playerDetails() {
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [specificPlayers, setSpecificPlayers] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (auth && display !== 'demo') (lookupPlayerFromAuth(auth, setPlayer, setInvalidCredentials, 'player-card'));
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

  const [friends, setFriends] = useState(null);

  useEffect(() => {
    if (player || id) refreshStats();
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

  if (!playerStats || loading) {
    return <>
      <div className={`h-screen flex justify-center ${style == 'dark' ? 'bg-dark' : 'bg-white'}`}>
        <div
          className="py-5"
        >
          <CardAvatarSkeleton displayMode={'short'} /></div>
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
        className={`h-screen responsiveBackground ${style == 'dark' ? 'bg-dark' : 'bg-white'
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
              statEXPEarned={playerStats.exp_earned_today}
              statGoldEarned={playerStats.exp_earned_today}
              statEarnedDuration={'today'}
            />
          ) : null}
        </div>
        {specificPlayers ? (
          <div className="mx-5 px-0 sm:px-12 sm:mx-auto flex justify-left flex-col flex-wrap sm:flex-row max-w-screen-2xl gap-12 pb-10">
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
    </>
  );
}
