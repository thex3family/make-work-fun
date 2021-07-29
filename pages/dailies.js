import Link from 'next/link';
import Button from '@/components/ui/Button';
import React from 'react';
import { supabase } from '../utils/supabase-client';
import { useState, useEffect } from 'react';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import { data } from 'autoprefixer';
import moment from 'moment';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import Countdown from '@/components/Widgets/DailiesCountdown/countdown';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';

import HabitGroups from '@/components/Habits/habit_groups'

import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import notifyMe from '@/components/Notify/win_notification'

export default function dallies() {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailiesCount, setDailiesCount] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(null);

  const [levelUp, setLevelUp] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [activeType, setActiveType] = useState(null);
  const [activeName, setActiveName] = useState(null);
  const [activeUpstream, setActiveUpstream] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeGold, setActiveGold] = useState(null);
  const [activeEXP, setActiveEXP] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeGIF, setActiveGIF] = useState(null);

  const [playerName, setPlayerName] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  const [playerLevel, setPlayerLevel] = useState(null);

  const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API);

  const router = useRouter();
  const {
    userLoaded,
    user,
    session,
    userDetails,
    userOnboarding,
    subscription
  } = useUser();

  // Redirects user to sign in if they are not logged in yet

  useEffect(() => {
    if (!user) router.replace('/signin');
  }, [user]);

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        router.replace('/account');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    fetchDailies();
    fetchLatestWin();
  }

  async function fetchDailies(click) {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('dailies')
        .select('*')
        .eq('player', user.id)
        .eq('is_active', true);

      setHabits(data);

      if(click === 'click'){
      const player = await fetchPlayerStats();
      // check if user leveled up
      if (player.current_level > player.previous_level) {
        // level up animation
        setLevelUp(true);
        notifyMe('level', player.current_level);
      }
      }

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
      fetchDailiesCompletedToday();
      console.log(habits);
    }
  }

  // check if there is a win (only works when the app is open)

  async function fetchLatestWin() {
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('success_plan')
        .on('INSERT', async (payload) => {
          console.log('New Win Incoming!', payload, payload.new.player);

          // checking if the win is assigned to the current user

          if (payload.new.player === user.id) {
            const player = await fetchPlayerStats();
            // check if user leveled up
            if (player.current_level > player.previous_level) {
              // level up animation
              setLevelUp(true);
              console.log('You should level up here!');
            }

            // continue

            setActiveType(payload.new.type);
            setActiveName(payload.new.name);
            setActiveUpstream(payload.new.upstream);
            setActiveDate(payload.new.closing_date);
            setActiveGold(payload.new.gold_reward);
            setActiveEXP(payload.new.exp_reward);
            const slug = payload.new.notion_id.replace(/-/g, '');
            setActiveSlug(slug);

            // shows the modal

            setShowModal(true);
            window.navigator.vibrate([200, 100, 200]);
            notifyMe('win', payload.new.type);

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

  const [boxClass, setBoxClass] = useState('');

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
        .from('s1_leaderboard')
        .select('*')
        .eq('player', user.id)
        .single();

      setPlayerName(data.full_name);
      setPlayerRank(data.player_rank);
      setPlayerLevel(data.current_level);
      setNextRank(data.next_rank);
      console.log(data);

      if (error && status !== 406) {
        throw error;
      }

      return data;
    } catch (error) {
      alert(error.message);
    } finally {
    }
  }

  // checks if should send win to guilded

  async function sendWebhook() {
    let textNextRank = '';
    if (nextRank) {
      textNextRank = `(${nextRank} EXP to next rank)`;
    }

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
                value: `#${playerRank} ${textNextRank}` ////
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

  async function dailyBonusButtons() {
    try {
      const user = supabase.auth.user();

      // See if bonus has already been claimed
      const { data, error } = await supabase
        .from('success_plan')
        .select('*')
        .eq('player', user.id)
        .eq('name', 'Daily Quest Bonus Reward')
        .gte('entered_on', moment().startOf('day').utc().format());

      if (error && status !== 406) {
        throw error;
      }
      console.log(data);
      const fetchData = data;

      if (fetchData.length == 0) {
        setDailyBonus(true);
      } else {
        setDailyBonus(false);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      // How do I show the null state?
    }
  }

  async function claimDailyBonus() {
    try {
      const user = supabase.auth.user();

      let testDateStr = new Date();
      console.log('testDateStr: ' + testDateStr);

      const { data, error } = await supabase.from('success_plan').insert([
        {
          player: user.id,
          difficulty: 1,
          do_date: testDateStr,
          closing_date: testDateStr,
          trend: 'check',
          type: 'Bonus',
          punctuality: 0,
          exp_reward: 100,
          gold_reward: 50,
          name: 'Daily Quest Bonus Reward'
        }
      ]);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setDailyBonus(false);
    }
  }

  async function fetchDailiesCompletedToday() {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('player', user.id)
        .gte('closing_date', moment().startOf('day').utc().format());

      console.log(data.length);
      setDailiesCount(data.length);
      dailyBonusButtons();

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="animate-slow-fade-in justify-center bg-dailies-pattern bg-fixed bg-cover">
        <BottomNavbar />
        <div className=" max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded p-10 opacity-95">
            <div className="pb-5">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
                Dailies
              </h1>
              <div className="text-center mb-5">
                {/* <div className="font-semibold text-dailies text-xl mb-3">
                Complete 4 comissions daily to receive bonus rewards!{' '}
              </div> */}

                <div className="w-24 h-24 border-4 border-dailies-dark shadow-lg text-center inline-flex items-center justify-center mx-auto text-black my-2 font-semibold uppercase rounded-full text-4xl">
                  {dailiesCount}/4
                </div>
                {/* {Array.from({ length: dailiesCount }, (_, i) => <span key={i}><i className="text-yellow-400 fas fa-star"/></span>)} */}
                {dailiesCount >= 4 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                    </div>
                    {dailyBonus ? (
                      <div>
                      <Button
                        variant="prominent"
                        className="animate-fade-in-up mt-5 text-center font-bold"
                        onClick={() => claimDailyBonus()}
                      >
                        Claim Rewards
                      </Button>
                      
        <div className="mt-3 animate-fade-in-up">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-2">
                  +50 💰{' '}
                </span>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
                  +100 XP
                </span>
              </div>
                      </div>
                    ) : (
                      <div>
                      <Button
                        variant="prominent"
                        disabled={true}
                        className="animate-fade-in-up mt-5 text-center font-bold"
                      >
                        Rewards Claimed!
                      </Button>
        <div className="mt-3 animate-fade-in-up">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-2">
                  +50 💰{' '}
                </span>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-1">
                  +100 XP
                </span>
              </div>
                      </div>
                    )}
                  </div>
                ) : dailiesCount >= 3 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>
                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                ) : dailiesCount >= 2 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>

                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                ) : dailiesCount >= 1 ? (
                  <div>
                    <div className="text-3xl">
                      <i className="text-yellow-400 fas fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>

                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl">
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                      <i className="text-gray-800 far fa-star" />
                    </div>
                    <Countdown date={moment().endOf('day').utc().format()} />
                  </div>
                )}
              </div>
            </div>
            {/* <button onClick={() => console.log(habits)}>
          Push me to check if data is pulled properly
        </button>  */}
            <div className="text-center">
              {habits != null
                ? habits.length != 0
                  ? <HabitGroups habits = {habits} fetchDailies = {fetchDailies} fetchDailiesCompletedToday = {fetchDailiesCompletedToday} />
                  : <span className="text-center text-dailies font-semibold text-md">You have no active habits...let's change that!</span>
                : null}
            </div>

            <div className="text-center my-5">
              <Link href="/dailies/edit">
                <button className="px-5 border-2 border-dailies-dark text-center text-dailies font-bold py-2 rounded">
                  Edit Dailies
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* level up modal */}
      <ModalLevelUp
        levelUp={levelUp}
        playerLevel={playerLevel}
        setLevelUp={setLevelUp}
      />

      {/* // Modal Section */}
      {showModal ? (
        <>
          <div className="h-screen flex justify-center">
            <div
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-40 outline-none focus:outline-none"
              // onClick={() => setShowModal(false)}
            >
              <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      🎉 You've completed a{' '}
                      <span className="font-semibold inline-block py-1 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
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
                          <div
                            className={`${boxClass} box-body animate-wiggle`}
                          >
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
            <div className="opacity-25 fixed inset-0 z-30 bg-black"></div>
          </div>
        </>
      ) : null}
    </>
  );
}
