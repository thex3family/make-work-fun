import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';
import LeaderboardStatistics from '@/components/Widgets/Statistics/LeaderboardStatistics';
import { useState, useEffect, useRef } from 'react';

import CardAvatarSkeleton from '@/components/Skeletons/CardAvatarSkeleton';
import RecoverPassword from '@/components/Auth/RecoverPassword';

// functions

import {
  fetchPlayerStats,
  fetchLatestWin,
  fetchLeaderboardStats
} from '@/components/Fetch/fetchMaster';
import {
  triggerWinModal,
  triggerCardWin
} from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import CardWin from '@/components/Cards/CardWin';
import Pagination from '@/components/Pagination';
import { downloadImage } from '@/utils/downloadImage';
import PlayerCard from '@/components/Embeds/PlayerCard';
import DailiesEntry from '@/components/Embeds/DailiesEntry';
import CardParty from '@/components/Cards/CardParty';

export default function HomePage() {
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [players, setPlayers] = useState([]);
  const [sNPlayers, setsNPlayers] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPlayers = activePlayers.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [levelUp, setLevelUp] = useState(false);

  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [activeWinStats, setActiveWinStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [showCardWin, setShowCardWin] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(null);

  const [openTab, setOpenTab] = useState(1);

  const [benefitTab, setBenefitTab] = useState(1);

  const benefitTabs = [
    { image: '/img/benefits-1.png', header: 'Header 1', body: 'Body 1' },
    { image: '/img/benefits-2.png', header: 'Header 2', body: 'Body 2' },
    { image: '/img/benefits-3.png', header: 'Header 3', body: 'Body 3' },
    { image: '/img/benefits-4.png', header: 'Header 4', body: 'Body 4' }
  ];

  const [embedTab, setEmbedTab] = useState(0);

  const embedTabs = [
    { image: '/img/benefits-1.png', header: 'Header 1', body: 'Body 1' },
    { image: '/img/benefits-2.png', header: 'Header 2', body: 'Body 2' },
    { image: '/img/benefits-3.png', header: 'Header 3', body: 'Body 3' },
    { image: '/img/benefits-4.png', header: 'Header 4', body: 'Body 4' }
  ];

  const demoParties = [
    {
      player: '17ae471a-3096-4c57-af41-1cf67e52dd67',
      notion_page_id: null,
      role: 'Party Leader',
      notion_page_name: null,
      status: 'Ready',
      health: 10,
      dragon_bg_url: null,
      full_name: 'Conrad',
      avatar_url: '0.4857466039220286.png',
      background_url: '0.5372695271833878.jpg',
      party_id: 35,
      party_member_id: 61,
      party_slug: 'quaint-quiet-jewellery',
      party_name: 'Time Challenge',
      party_description:
        "Let's race to see who can get the most wins in a week!",
      party_challenge: 1,
      party_start_date: null,
      party_due_date: '2021-10-30T16:00:59+00:00',
      party_status: 1,
      health_modifier: null,
      review_be_helpful: null,
      review_party_rating: null
    },
    {
      player: '17ae471a-3096-4c57-af41-1cf67e52dd67',
      notion_page_id: '33a1b5d4-a8eb-47ad-88dc-058d5089d506',
      role: 'Adventurer',
      notion_page_name: 'Staying On Top Of My Finances',
      status: 'Ready',
      health: 9,
      dragon_bg_url: null,
      full_name: 'Conrad',
      avatar_url: '0.4857466039220286.png',
      background_url: '0.5372695271833878.jpg',
      party_id: 31,
      party_member_id: 38,
      party_slug: 'breezy-enough-teacher',
      party_name: 'Slay That Dragon',
      party_description:
        "Got any tough projects you have to do that you've been putting off?",
      party_challenge: 2,
      party_start_date: '2021-09-11T17:27:18+00:00',
      party_due_date: '2021-10-04T01:00:00+00:00',
      party_status: 3,
      health_modifier: null,
      review_be_helpful: null,
      review_party_rating: null
    },

    {
      player: '17ae471a-3096-4c57-af41-1cf67e52dd67',
      notion_page_id: '33a1b5d4-a8eb-47ad-88dc-058d5089d506',
      role: 'Adventurer',
      notion_page_name: 'Staying On Top Of My Finances',
      status: 'Ready',
      health: 10,
      party_slug: 'breezy-enough-teacher',
      party_name: 'Your Next Party!',
      party_description: 'Become a party leader and make your own party!',
      party_challenge: 1,
      party_start_date: '2021-09-11T17:27:18+00:00',
      party_due_date: '2021-10-04T01:00:00+00:00',
      party_status: 2,
      health_modifier: null
    }
    // {
    //   player: '17ae471a-3096-4c57-af41-1cf67e52dd67',
    //   notion_page_id: null,
    //   role: 'Adventurer',
    //   notion_page_name: null,
    //   status: 'Fighting',
    //   health: 4,
    //   dragon_bg_url: null,
    //   full_name: 'Conrad',
    //   avatar_url: '0.4857466039220286.png',
    //   background_url: '0.5372695271833878.jpg',
    //   party_id: 32,
    //   party_member_id: 45,
    //   party_slug: 'prickly-nutty-woman',
    //   party_name: 'Your Next Party',
    //   party_description: 'Become A Party Leader And Make Your Own!',
    //   party_challenge: 1,
    //   party_start_date: '2021-09-12T18:48:59+00:00',
    //   party_due_date: '2021-09-19T10:02:25+00:00',
    //   party_status: 1,
    //   health_modifier: null,
    //   review_be_helpful: null,
    //   review_party_rating: null
    // }
  ];

  useEffect(() => {
    if (openTab == 1 && sNPlayers) setActivePlayers(sNPlayers);
    if (openTab == 2 && players) setActivePlayers(players);
    setCurrentPage(1);
  }, [openTab, sNPlayers]);

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
      setActiveWinStats
    );
  }, []);

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats());
    fetchLeaderboardStats(setsNPlayers, setLoading, '2S');
    fetchLeaderboardStats(setPlayers, setLoading);
  }

  // useEffect(() => {
  //   if (sNPlayers) loadPlayerImages(sNPlayers, setsNPlayers);
  // }, [sNPlayers]);

  // useEffect(() => {
  //   if (players) loadPlayerImages(players, setPlayers);
  // }, [players]);

  // async function loadPlayerImages(data, setData) {
  //   var newData = data;

  //   for (let i = 0; i < data.length; i++) {
  //     let oldData = data[i];
  //     newData[i] = {
  //       ...oldData,
  //       avatar_url: oldData.avatar_url
  //         ? await downloadImage(oldData.avatar_url, 'avatar')
  //         : null,
  //       background_url: oldData.background_url
  //         ? await downloadImage(oldData.background_url, 'background')
  //         : null
  //     };
  //   }
  //   setData(newData);
  // }

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
            <div className="animate-fade-in-up pt-8 md:pt-24 lg:pt-8 pb-10 max-w-8xl mx-auto">
              <div className="px-8 lg:container lg:px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
                <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
                  <h1 className="sm:-mt-20 mx-auto md:mx-0 text-4xl font-extrabold sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                    Make Work Fun
                  </h1>
                  <p className="mx-auto md:mx-0 text-xl text-accents-6 sm:text-2xl max-w-2xl">
                    Unlock multiplayer for personal development!
                  </p>
                  <div className="w-full pt-8 px-0 my-auto ">
                    {/* <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      Lifetime Statistics
                    </h1> */}
                    <p className="text-sm text-accents-3 font-semibold">
                      Lifetime Statistics Since July 2021
                    </p>
                    <h1 className="rounded-lg w-11/12 sm:-ml-3 lg:w-full mx-auto text-sm font-semibold text-center sm:text-left lg:text-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      <LeaderboardStatistics
                        players={players.length}
                        levels_earned={
                          players.reduce(
                            (a, v) => (a = a + v.current_level),
                            0
                          ) - players.length
                        }
                        exp_earned={players.reduce(
                          (a, v) => (a = a + v.total_exp),
                          0
                        )}
                      />
                    </h1>
                  </div>
                  <div className="inline-block mx-auto md:mx-0">
                    <Link href="/player">
                      <Button
                        className="w-auto mx-auto my-4 md:mx-0"
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
                  <div className="max-w-6xl w-full md:w-11/12 lg:w-full xl:w-11/12 ml-auto py-8 px-0 sm:px-6 lg:px-8 my-auto bg-black bg-opacity-50 rounded-lg mt-4">
                    <Link href="leaderboard">
                      <>
                        <h1 className="cursor-pointer text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                          Top Players This Season
                        </h1>
                      </>
                    </Link>

                    <div
                      className="mx-5 flex flex-no-wrap flex-row max-w-screen-2xl gap-12 pt-10 overflow-x-scroll pb-10"
                      id="container"
                    >
                      {loading ? (
                        <>
                          <CardAvatarSkeleton displayMode={'short'} />
                          <CardAvatarSkeleton displayMode={'short'} />
                          <CardAvatarSkeleton displayMode={'short'} />
                        </>
                      ) : (
                        <>
                          {currentPlayers.map((player, i) => (
                            <Avatar
                              key={i}
                              displayMode={'short'}
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
                          <Link href="leaderboard">
                            <Button
                              className="w-auto flex-shrink-0 mx-10 my-auto"
                              variant="prominent"
                            >
                              🏆 See Leaderboard
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
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
      </section>
      <section className="text-gray-600 body-font bg-black">
        <div className="container px-5 py-24 mx-auto flex flex-wrap flex-col">
          <div class="animate-fade-in-up container w-full sm:w-3/4 mx-auto flex flex-row flex-wrap pt-10 mb-32">
            <div class="w-full -mb-14 sm:-mb-40 rounded-lg overflow-hidden self-center">
              <div class="flex flex-col mb-10 px-5 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                  Works With Tools You Love.
                </h1>
                <p class="text-white text-xl mb-2 font-semibold">
                  The ultimate companion app for Notion to gamify your
                  productivity experience.
                </p>
                <p class="text-blueGray-500 text-sm font-semibold">
                  Coming Up: Airtable, Clickup, and Jira support!
                </p>
              </div>
            </div>
            <div class="flex flex-col flex-wrap w-full">
              <img
                alt="feature"
                class="object-cover object-center w-full"
                src="/img/companion-app.png"
              />
            </div>
          </div>

          <div className="w-full mb-4 flex flex-col items-center">
            <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">
              Core Features
            </h1>
          </div>
          <div class="flex mx-auto flex-wrap mb-14 cursor-pointer bg-gray-700 rounded-xl align-middle shadow-xl text-lg font-medium px-2 py-1">
            {/* <a
              onClick={() => setBenefitTab(0)}
              className={`rounded-lg sm:px-6 py-3 w-1/2 sm:w-auto justify-center sm:justify-start title-font font-medium inline-flex items-center leading-none tracking-wider ' ${
                benefitTab == 0
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-xl'
                  : null
              }`}
            >
              <span
                className={benefitTab == 0 ? 'text-white' : 'text-blueGray-500'}
              >
                <i className="fas fa-link mr-2" />
                Connect
              </span>
            </a> */}
            <a
              onClick={() => setBenefitTab(1)}
              className={`rounded-lg sm:px-6 py-3 w-1/2 sm:w-auto justify-center sm:justify-start title-font font-medium inline-flex items-center leading-none tracking-wider '  ${
                benefitTab == 1
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-xl'
                  : null
              }`}
            >
              <span
                className={benefitTab == 1 ? 'text-white' : 'text-blueGray-500'}
              >
                <i className="fas fa-user-circle mr-2" />
                Player
              </span>
            </a>
            <a
              onClick={() => setBenefitTab(2)}
              className={`rounded-lg sm:px-6 py-3 w-1/2 sm:w-auto justify-center sm:justify-start title-font font-medium inline-flex items-center leading-none tracking-wider '  ${
                benefitTab == 2
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-xl'
                  : null
              }`}
            >
              <span
                className={benefitTab == 2 ? 'text-white' : 'text-blueGray-500'}
              >
                <i className="fas fa-dragon mr-2" />
                Party
              </span>
            </a>
            <a
              onClick={() => setBenefitTab(3)}
              className={`rounded-lg sm:px-6 py-3 w-full sm:w-auto justify-center sm:justify-start title-font font-medium inline-flex items-center leading-none tracking-wider '  ${
                benefitTab == 3
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-xl'
                  : null
              }`}
            >
              <span
                className={benefitTab == 3 ? 'text-white' : 'text-blueGray-500'}
              >
                <i className="fas fa-star mr-2" />
                Dailies
              </span>
            </a>
          </div>
          {/* <button
            onClick={() => setDark(dark ? false : true)}
            className={`text-lg font-semibold w-auto mx-auto items-center justify-center px-2 py-2 leading-none rounded text-emerald-700 bg-emerald-100 border-2 border-emerald-500 mb-10`}
          >
            <i className={`mr-2 mt-0.5 fas fa-check`} />
            Show Example Win
          </button> */}

          <div
            className={`w-full lg:w-3/4 mx-auto ${
              benefitTab == 1 ? '' : 'hidden'
            }`}
          >
            <div className="animate-fade-in-up flex items-center mb-6">
              <div
                className="border-t border-accents-2 flex-grow mr-3"
                aria-hidden="true"
              ></div>
              <p className="text-center text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                Track Your Life Progress In Real Time
              </p>
              <div
                className="border-t border-accents-2 flex-grow ml-3"
                aria-hidden="true"
              ></div>
            </div>
            <iframe
              id="player-details"
              className={`w-full rounded-lg`}
              height="725"
              src="/embed/player-details?display=demo"
            />
          </div>

          {benefitTab == 2 ? (
            <div className="animate-fade-in-up w-full lg:w-3/4 mx-auto">
              <div className="flex items-center mb-6">
                <div
                  className="border-t border-accents-2 flex-grow mr-3"
                  aria-hidden="true"
                ></div>
                <p className="text-center text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                  Join Party Quests To Level Up Together
                </p>
                <div
                  className="border-t border-accents-2 flex-grow ml-3"
                  aria-hidden="true"
                ></div>
              </div>
              {demoParties?.map((party) => (
                <CardParty key={party.id} party={party} displayMode="demo" />
              ))}
            </div>
          ) : null}
          {benefitTab == 3 ? (
            <div className="animate-fade-in-up w-full lg:w-3/4 mx-auto">
              <div className="flex items-center mb-6">
                <div
                  className="border-t border-accents-2 flex-grow mr-3"
                  aria-hidden="true"
                ></div>
                <p className="text-center text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                  Transform Your Daily Chores Into Daily Quests!
                </p>
                <div
                  className="border-t border-accents-2 flex-grow ml-3"
                  aria-hidden="true"
                ></div>
              </div>
              <DailiesEntry />
            </div>
          ) : null}
          {/* <img
            className="w-3/4 block mx-auto mb-10 object-cover object-center rounded"
            alt="hero"
            src={benefitTabs[benefitTab].image}
          /> */}

          {/* <div className="flex flex-col text-center w-full">
            <h1 className="text-xl font-medium title-font mb-4 text-gray-900">{benefitTabs[benefitTab].header}</h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-black">{benefitTabs[benefitTab].body}</p>
          </div> */}
        </div>
      </section>
      <section class="text-gray-600 body-font bg-black">
        <div class="container px-5 py-0 sm:py-24 mx-auto flex flex-wrap-reverse">
          <div class="lg:w-1/3 w-full mb-10 lg:mb-0 rounded-lg overflow-hidden">
            <div
              className={`${embedTab == 0 || embedTab == 1 ? '' : 'hidden'}`}
            >
              <PlayerCard embedTab={embedTab} />
            </div>
            {embedTab == 2 ? <img src="/img/mobile-view.png" /> : null}
          </div>
          <div class="flex flex-col flex-wrap w-full lg:py-6 lg:w-2/3 lg:pl-12 lg:text-left text-center">
            <div class="flex flex-col mb-10 lg:items-start items-center px-5">
              <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">
                Bring Your Character Anywhere.
              </h1>
            </div>
            <div class="flex flex-col mb-10 lg:items-start items-center px-5">
              <div class="flex-grow w-full">
                <div
                  onClick={() => setEmbedTab(0)}
                  className={`cursor-pointer text-left mb-6 ${
                    embedTab == 0
                      ? 'bg-white bg-opacity-20 rounded-lg px-6 py-4 -ml-3'
                      : ''
                  }`}
                >
                  <h2 class="text-white text-lg title-font font-medium mb-3">
                    1 . Customize Your Component
                  </h2>
                  <p class="leading-relaxed text-white">
                    Set options like dark mode, friends, win notifications, etc.
                  </p>
                </div>

                <div
                  onClick={() => setEmbedTab(1)}
                  className={`cursor-pointer text-left mb-6 ${
                    embedTab == 1
                      ? 'bg-white bg-opacity-20 rounded-lg px-6 py-4 -ml-3'
                      : ''
                  }`}
                >
                  <h2 class="text-white text-lg title-font font-medium mb-3">
                    2 . Paste Anywhere You Want
                  </h2>
                  <p class="leading-relaxed text-white">
                    Copy the embed link and bring it to your favourite Notion
                    pages or websites!
                  </p>
                </div>
                <div
                  onClick={() => setEmbedTab(2)}
                  className={`cursor-pointer text-left mb-6 ${
                    embedTab == 2
                      ? 'bg-white bg-opacity-20 rounded-lg px-6 py-4 -ml-3'
                      : ''
                  }`}
                >
                  <h2 class="text-white text-lg title-font font-medium mb-3">
                    3 . Celebrate Your Wins Anywhere, Anytime.
                  </h2>
                  <p class="leading-relaxed text-white">
                    From embeds to mobile apps, be excited about your wins
                    everywhere you go.
                  </p>
                </div>
                <div className="inline-block mx-auto md:mx-0 mt-4">
                  <Link href="/player">
                    <Button
                      className="w-auto mx-auto my-4 md:mx-0"
                      variant="prominent"
                    >
                      Get Started 🚀
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <CardWin
          setShowCardWin={setShowCardWin}
          win={activeWinStats}
          player_name={showCardWin.full_name}
          avatarUrl={showCardWin.avatar_url}
        />
      ) : null}
    </>
  );
}
