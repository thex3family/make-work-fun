import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';
import Countdown from '@/components/Widgets/Countdown/countdown';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import { useUser } from '@/utils/useUser';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase-client';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API);
  const { userOnboarding } = useUser();

  const [activeType, setActiveType] = useState(null);
  const [activeName, setActiveName] = useState(null);
  const [activeUpstream, setActiveUpstream] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeGold, setActiveGold] = useState(null);
  const [activeEXP, setActiveEXP] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeGIF, setActiveGIF] = useState(null);
  const [players, setPlayers] = useState([]);

  const [playerName, setPlayerName] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);

  useEffect(() => {
    getLeaderboardStats();
    fetchLatestWin();
  }, []);

  async function getLeaderboardStats() {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_exp', { ascending: false });

      if (data) {
        setPlayers(data);
      }

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        fetchLatestWin();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // check if there is a win (only works when the app is open)

  async function fetchLatestWin() {
    console.log('Fetching Latest Win');
    try {
      const { data, error } = await supabase
        .from('success_plan')
        .on('INSERT', async (payload) => {
          console.log('New Win Incoming!', payload, payload.new.player);
          // Updating all stats
          getLeaderboardStats();

          // checking if the win is assigned to the current user (only if logged in)

          if (userOnboarding) {
            if (userOnboarding.onboarding_state.includes('4')) {
              fetchPlayerStats();
              const user = supabase.auth.user();
              if (payload.new.player === user.id) {
                setActiveType(payload.new.type);
                setActiveName(payload.new.name);
                setActiveUpstream(payload.new.upstream);
                setActiveDate(payload.new.closing_date);
                setActiveGold(payload.new.gold_reward);
                setActiveEXP(payload.new.exp_reward);

                const slug = payload.new.notion_id.replace(/-/g, '');
                setActiveSlug(slug);

                // show modal (early because I will have to load the gif anyways)
                setShowModal(true);

                // generate a random GIF
                const { data: gifs } = await gf.random({
                  tag: 'excited dog cat',
                  rating: 'g'
                });
                setActiveGIF(gifs.image_original_url);

                // update the row

                const { data, error } = await supabase
                  .from('success_plan')
                  .update({ gif_url: gifs.image_original_url })
                  .eq('id', payload.new.id);
              }
            }
          }
        })
        .subscribe();

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
    }
  }

  const [boxClass, setBoxClass] = useState("");

  function openBox() {
    boxClass != 'hide-box' ? setBoxClass('open-box') : '';
  }

  function closeModal() {
    setShowModal(false);
    setBoxClass('');
  }

  async function fetchPlayerStats() {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('player', user.id)
        .single();

      setPlayerName(data.full_name);
      setPlayerRank(data.player_rank);
      setNextRank(data.next_rank);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
    }
  }

  // checks if should send win to guilded

  async function sendWebhook() {
    fetch(process.env.NEXT_PUBLIC_GUILDED_WEBHOOK, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: null,
        // embeds to be sent

        embeds: [
          {
            // decimal number colour of the side of the embed
            color: null,
            author: {
              name: `🎉 ${playerName} completed a ${activeType}!`
            },
            // author
            // - icon next to text at top (text is a link)
            // embed title
            // - link on 2nd row
            title: `${activeName}`,
            url: `https://www.notion.so/${activeSlug}`,
            // thumbnail
            thumbnail: {
              url: `${activeGIF}`
            },
            // embed description
            // - text on 3rd row
            description: `Completed On: ${activeDate}`,
            // custom embed fields: bold title/name, normal content/value below title
            // - located below description, above image.
            fields: [
              {
                name: '🏆 Leaderboard Position',
                value: `#${playerRank} (${nextRank} EXP to next rank)`
              }
            ],
            // image
            // - picture below description(and fields) - this needs to be the gif that we fetch from random whatever.
            // image: {
            //   url:
            //     'http://makework.fun/img/celebratory-cat.gif',
            // },
            // footer
            // - icon next to text at bottom
            footer: {
              text: `+${activeGold} 💰 | +${activeEXP} XP | ${activeUpstream}`
            }
          },
          {
            color: null,
            author: {
              name: '💬 Start a discussion!'
              // url: 'https://toolbox.co-x3.com/family-connection/?utm_source=guilded',
            }
          }
        ]
      })
    });
  }

  return (
    <>
      <section className="justify-center">
        <div className="bg-player-pattern bg-fixed h-4/5">
          <div className="bg-black bg-opacity-90 h-4/5">
            <div className="pt-8 md:pt-24 pb-10 max-w-7xl mx-auto">
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
                <div className="w-full md:w-3/5 py-6 text-center">
                  <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg">
                    <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      Season 1 Starts In...
                    </h1>
                    <h1 className="rounded-lg pt-5 w-3/4 lg:w-full mx-auto text-xl font-semibold text-center lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                      <Countdown date="2021-07-02T21:00:00-05:00" />
                    </h1>
                    {/* <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
          Unlock multiplayer for personal development.
        </p> */}
                    {/* <Link href="/player">
          <Button className="w-auto mx-auto my-10" variant="prominent">
            Get Started 🚀
          </Button>
        </Link> */}
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
        <h1 className="text-xl sm:text-3xl font-bold text-center bg-gradient-to-r from-emerald-500 to-blue-500 p-3 sm:p-4">
          Leaderboard 🏆
        </h1>
        {loading ? (
          <div className="mb-24 mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl">
            <div className="px-8 mt-10 w-full sm:w-1/2 md:1/2 lg:w-1/3 xl:w-1/4 shadow-xl">
              <div className="bg-primary-2 rounded mx-auto">
                <div className="h-60 bg-gray-600 rounded-tr rounded-tl animate-pulse"></div>

                <div className="p-8">
                  <div className="grid grid-cols-4 gap-1 pb-1">
                    <div className="row-start-1 col-span-2 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-2 col-span-3 h-6 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-3 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse mb-3"></div>
                    <div className="row-start-4 col-span-4 h-4 rounded-full bg-gray-600 animate-pulse mb-3"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-5">
                    <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 mb-2">
                    <div className="row-start-1 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-2 col-span-4 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    <div className="row-start-1 col-start-4 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-1 col-start-5 co-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-1 col-start-6 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 mt-10 w-full sm:w-1/2 md:1/2 lg:w-1/3 xl:w-1/4 shadow-xl">
              <div className="bg-primary-2 rounded mx-auto">
                <div className="h-60 bg-gray-600 rounded-tr rounded-tl animate-pulse"></div>

                <div className="p-8">
                  <div className="grid grid-cols-4 gap-1 pb-1">
                    <div className="row-start-1 col-span-2 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-2 col-span-3 h-6 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-3 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse mb-3"></div>
                    <div className="row-start-4 col-span-4 h-4 rounded-full bg-gray-600 animate-pulse mb-3"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-5">
                    <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 mb-2">
                    <div className="row-start-1 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-2 col-span-4 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    <div className="row-start-1 col-start-4 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-1 col-start-5 co-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-1 col-start-6 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 mt-10 w-full sm:w-1/2 md:1/2 lg:w-1/3 xl:w-1/4 shadow-xl">
              <div className="bg-primary-2 rounded mx-auto">
                <div className="h-60 bg-gray-600 rounded-tr rounded-tl animate-pulse"></div>

                <div className="p-8">
                  <div className="grid grid-cols-4 gap-1 pb-1">
                    <div className="row-start-1 col-span-2 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-2 col-span-3 h-6 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-3 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse mb-3"></div>
                    <div className="row-start-4 col-span-4 h-4 rounded-full bg-gray-600 animate-pulse mb-3"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-5">
                    <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 mb-2">
                    <div className="row-start-1 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-2 col-span-4 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    <div className="row-start-1 col-start-4 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-1 col-start-5 co-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                    <div className="row-start-1 col-start-6 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-24 mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl">
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
                url={player.avatar_url}
              />
            ))}
          </div>
        )}
      </section>
      {/* // Modal Section */}
      {showModal ? (
        <>
          <div className="h-screen flex justify-center">
            <div
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              // onClick={() => setShowModal(false)}
            >
              <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      🎉 You've completed a{' '}
                      <span className="font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
                        {activeType}!
                      </span>
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 flex-auto text-blueGray-500 text-center">
                    <div className="my-4">
                      <p className="text-xl sm:text-2xl leading-none text-primary-2 font-bold">
                        {activeName}
                        <br />
                        <span className="text-sm">{activeUpstream}</span>
                      </p>
                      <p className="my-2 font-light text-sm">{activeDate}</p>
                    </div>
                    <table className="w-full text-xl mb-6 border text-primary-2">
                      <tbody>
                        <tr>
                          <td className="p-4 border">+{activeGold} 💰</td>
                          <td className="p-4 border">+{activeEXP} EXP</td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <div className="w-full">
                      <div className="box">
                        <a onClick={openBox} className="box-container">
                          <div className={`${boxClass} box-body`}>
                            <div className={`${boxClass} box-lid`}>
                              <div className={`${boxClass} box-bowtie`}></div>
                            </div>
                          </div>

                          <img
                            src={activeGIF}
                            className={`${boxClass} absolute box-image`}
                          />
                        </a>
                      </div>
                    </div>

                    <p className="mt-2">It's time to celebrate! 😄</p>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => closeModal()}
                    >
                      Close
                    </button>
                    <a
                      href="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/43bb8933-cd8a-4ec2-90c8-607338b60c38/chat"
                      target="_blank"
                    >
                      <button
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => sendWebhook()}
                      >
                        Share With Family
                      </button>
                    </a>
                  </div>
                  <div className="flex items-center p-3 border-t border-solid border-blueGray-200 rounded-b bg-primary-3">
                    <Link href="/player">
                      <button
                        className="text-emerald-500 background-transparent mx-auto font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none ease-linear transition-all duration-150"
                        type="button"
                      >
                        View Character Stats
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </div>
        </>
      ) : null}
    </>
  );
}
