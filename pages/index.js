import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';
import LeaderboardStatistics from '@/components/Widgets/Statistics/LeaderboardStatistics';
import { useState, useEffect } from 'react';

import CardAvatarSkeleton from '@/components/Cards/CardAvatarSkeleton';
import RecoverPassword from '@/components/Auth/RecoverPassword';

// functions

import {
  fetchPlayerStats,
  fetchLatestWin,
  fetchLeaderboardStats
} from '@/components/Fetch/fetchMaster';
import { triggerWinModal, triggerCardWin } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import CardWin from '@/components/Cards/CardWin';

export default function HomePage() {
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [players, setPlayers] = useState([]);
  const [s1Players, setS1Players] = useState([]);

  const [levelUp, setLevelUp] = useState(false);

  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [activeWinStats, setActiveWinStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [showCardWin, setShowCardWin] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [openTab, setOpenTab] = useState(1);

  // Redirects user to reset password

  useEffect(() => {
    /* Recovery url is of the form
     * <SITE_URL>#access_token=x&refresh_token=y&expires_in=z&token_type=bearer&type=recovery
     * Read more on https://supabase.io/docs/reference/javascript/reset-password-email#notes
     */
    let url = window.location.hash;
    let query = url.substr(1);
    let result = {};

    query.split('&').forEach((part) => {
      const item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });

    if (result.type === 'recovery') {
      setRecoveryToken(result.access_token);
    }
  }, []);

  useEffect(() => {
    refreshStats();
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal,
      null,
      triggerCardWin,
      setShowCardWin,
      setAvatarUrl,
      setActiveWinStats,
    );
  }, []);

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats());
    fetchLeaderboardStats(setS1Players, setPlayers, setLoading);
  }

  if (recoveryToken) {
    return (
      <RecoverPassword
        token={recoveryToken}
        setRecoveryToken={setRecoveryToken}
      />
    );
  }

  return (
    <>
      <section className="justify-center">
        <div className="bg-player-pattern bg-fixed h-4/5">
          <div className="bg-black bg-opacity-90 h-4/5">
            <div className="animate-fade-in-up  pt-8 md:pt-24 pb-10 max-w-7xl mx-auto">
              <div className="px-8 lg:container lg:px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
                <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
                  <h1 className="mx-auto md:mx-0 text-4xl font-extrabold sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                    Join Our Family
                  </h1>
                  <p className="mx-auto md:mx-0 text-xl text-accents-6 sm:text-2xl max-w-2xl">
                    Unlock multiplayer for personal development.
                  </p>
                  <div className="inline-block mx-auto md:mx-0">
                    <a href="https://makeworkfun.club" target="_blank">
                      <Button
                        className="w-auto mx-auto mr-5 my-4"
                        variant="incognito"
                      >
                        Learn More
                      </Button>
                    </a>
                    <Link href="/player">
                      <Button
                        className="w-auto mx-auto md:mx-0"
                        variant="prominent"
                      >
                        Get Started 🚀
                      </Button>
                    </Link>
                  </div>
                </div>

                {/*  countdown for seasons

                <div className="w-full md:w-3/5 py-6 text-center">
                  <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg">
                    <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      Season 1 Starts In...
                    </h1>
                    <h1 className=" rounded-lg pt-5 w-3/4 lg:w-full mx-auto text-xl font-semibold text-center lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      <Countdown date="2021-07-02T21:00:00-05:00" />
                    </h1>
                  </div>
                </div> */}

                <div className="w-full md:w-3/5 py-6 text-center">
                  <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg">
                    <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      Season 1 Statistics
                    </h1>
                    <p className="text-sm text-accents-3 font-semibold">
                      July 1 - August 31
                    </p>
                    <h1 className=" rounded-lg pt-5 w-3/4 lg:w-full mx-auto text-xl font-semibold text-center lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      <LeaderboardStatistics
                        players={s1Players.length}
                        levels_earned={
                          s1Players.reduce(
                            (a, v) => (a = a + v.current_level),
                            0
                          ) - s1Players.length
                        }
                        exp_earned={s1Players.reduce(
                          (a, v) => (a = a + v.total_exp),
                          0
                        )}
                      />
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="relative -mt-12 lg:-mt-24">
        <svg
          viewBox="0 0 1428 174"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g
              transform="translate(-2.000000, 44.000000)"
              fill="#FFFFFF"
              fill-rule="nonzero"
            >
              <path
                d="M0,0 C90.7283404,0.927527913 147.912752,27.187927 291.910178,59.9119003 C387.908462,81.7278826 543.605069,89.334785 759,82.7326078 C469.336065,156.254352 216.336065,153.6679 0,74.9732496"
                opacity="0.100000001"
              ></path>
              <path
                d="M100,104.708498 C277.413333,72.2345949 426.147877,52.5246657 546.203633,45.5787101 C666.259389,38.6327546 810.524845,41.7979068 979,55.0741668 C931.069965,56.122511 810.303266,74.8455141 616.699903,111.243176 C423.096539,147.640838 250.863238,145.462612 100,104.708498 Z"
                opacity="0.100000001"
              ></path>
              <path
                d="M1046,51.6521276 C1130.83045,29.328812 1279.08318,17.607883 1439,40.1656806 L1439,120 C1271.17211,77.9435312 1140.17211,55.1609071 1046,51.6521276 Z"
                id="Path-4"
                opacity="0.200000003"
              ></path>
            </g>
            <g
              transform="translate(-4.000000, 76.000000)"
              fill="#000000"
              fill-rule="nonzero"
            >
              <path d="M0.457,34.035 C57.086,53.198 98.208,65.809 123.822,71.865 C181.454,85.495 234.295,90.29 272.033,93.459 C311.355,96.759 396.635,95.801 461.025,91.663 C486.76,90.01 518.727,86.372 556.926,80.752 C595.747,74.596 622.372,70.008 636.799,66.991 C663.913,61.324 712.501,49.503 727.605,46.128 C780.47,34.317 818.839,22.532 856.324,15.904 C922.689,4.169 955.676,2.522 1011.185,0.432 C1060.705,1.477 1097.39,3.129 1121.236,5.387 C1161.703,9.219 1208.621,17.821 1235.4,22.304 C1285.855,30.748 1354.351,47.432 1440.886,72.354 L1441.191,104.352 L1.121,104.031 L0.457,34.035 Z"></path>
            </g>
          </g>
        </svg>
      </div> */}
        <h1 className="animate-fade-in-up  text-xl sm:text-3xl font-bold text-center bg-gradient-to-r from-emerald-500 to-blue-500 p-3 sm:p-4">
          Leaderboard 🏆
        </h1>
        {loading ? (
          <div className="animate-fade-in-up  mb-24 mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl">
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
            <CardAvatarSkeleton />
          </div>
        ) : (
          <div className="flex flex-wrap">
            <div className="w-full">
              <ul
                className="max-w-screen-lg mx-auto flex mb-0 mt-6 list-none flex-wrap pt-3 pb-4 flex-row"
                role="tablist"
              >
                <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                  <a
                    className={
                      'text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ' +
                      (openTab === 1
                        ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-600 bg-white')
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenTab(1);
                    }}
                    data-toggle="tab"
                    href="#link1"
                    role="tablist"
                  >
                    Season One
                    <div
                      className={
                        'text-white p-3 ml-1 text-center inline-flex items-center justify-center relative leading-tight w-3 h-3 border-2 shadow-lg rounded-full font-bold ' +
                        (openTab === 1
                          ? 'border-white'
                          : 'text-blueGray-600 border-blueGray-600')
                      }
                    >
                      {s1Players.length}
                    </div>
                  </a>
                </li>
                <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                  <a
                    className={
                      'text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ' +
                      (openTab === 2
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-600 bg-white')
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenTab(2);
                    }}
                    data-toggle="tab"
                    href="#link2"
                    role="tablist"
                  >
                    All Time{' '}
                    <div
                      className={
                        'text-white p-3 ml-1 text-center inline-flex items-center justify-center relative leading-tight w-3 h-3 border-2 shadow-lg rounded-full font-bold ' +
                        (openTab === 2
                          ? 'border-white'
                          : 'text-blueGray-600 border-blueGray-600')
                      }
                    >
                      {players.length}
                    </div>
                  </a>
                </li>
              </ul>
              <div
                className={
                  openTab === 1
                    ? 'mb-24 mx-5 sm:mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl gap-12 pt-10'
                    : 'hidden'
                }
                id="link1"
              >
                {s1Players.map((player, i) => (
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
                    statEXPEarnedToday={player.exp_earned_today}
                    statGoldEarnedToday={player.gold_earned_today}
                  />
                ))}
              </div>
              <div
                className={
                  openTab === 2
                    ? 'mb-24 mx-5 mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl gap-12 pt-10'
                    : 'hidden'
                }
                id="link2"
              >
                {players.map((player, i) => (
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
                    statEXPEarnedToday={player.exp_earned_today}
                    statGoldEarnedToday={player.gold_earned_today}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* level up modal */}
      {levelUp ? (
        <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
      ) : null}

      {/* // Modal Section */}
      {showWinModal ? (
        <>
          <WinModal
            page={'leaderboard'}
            activeModalStats={activeModalStats}
            setShowWinModal={setShowWinModal}
            playerStats={playerStats}
            refreshStats={refreshStats}
          />
        </>
      ) : null}

      {showCardWin ? (
        <CardWin setShowCardWin={setShowCardWin} win={activeWinStats} player_name={showCardWin} avatarUrl={avatarUrl} />
      ) : null}
    </>
  );
}
