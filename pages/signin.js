import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState, createRef } from 'react';
import { createPopper } from '@popperjs/core';

import { supabase } from '../utils/supabase-client';

import Button from '@/components/ui/Button';
import GitHub from '@/components/icons/GitHub';
import Input from '@/components/ui/Input';
import LoadingDots from '@/components/ui/LoadingDots';
import { useUser } from '@/utils/useUser';
import CardAvatarSkeleton from '@/components/Skeletons/CardAvatarSkeleton';

import Avatar from '@/components/Cards/CardAvatar';
import { fetchLeaderboardStats } from '@/components/Fetch/fetchMaster';
import CardAreaStats from '@/components/Cards/CardAreaStats';
import CardStats from '@/components/Cards/CardStats';
import CardLineChart from '@/components/Cards/CardLineChart';

const postData = (url, data = {}) =>
  fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data)
  }).then((res) => res.json());


const SignIn = ({ user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authView, setAuthView] = useState('magic');
  const [loading, setLoading] = useState(true);
  const [signLoading, setSignLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();
  const { signIn, passwordReset, userOnboarding, session, signUp } = useUser();

  // This is a dirty way to make sure the cookie stays active if the session is...
  useEffect
  if (!user && session) {
    refreshCookie();
  }

  async function refreshCookie() {
    const event = 'SIGNED_IN';
    // This is what forwards the session to our auth API route which sets/deletes the cookie:
    await postData('/api/auth', {
      event,
      session: session
    });
  }

  const handleSignin = async (e) => {
    e.preventDefault();

    setSignLoading(true);
    setMessage({});

    const { error } = await signIn({ email, password });
    if (error) {
      setMessage({ type: 'error', content: error.message });
      setSignLoading(false)
    }
    if (!password) {
      setMessage({
        type: 'note',
        content: 'Check your email for the magic link.'
      });
      setSignLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    setSignLoading(true);
    setMessage({});

    const { error } = await passwordReset(email);
    if (error) {
      setMessage({ type: 'error', content: error.message });
    }
    if (!password) {
      setMessage({
        type: 'note',
        content:
          'If your account exists, you will receive an email with reset instructions.'
      });
    }
    setSignLoading(false);
  };

  const handleOAuthSignIn = async (provider) => {
    setSignLoading(true);
    const { error } = await signIn({ provider });
    if (error) {
      setMessage({ type: 'error', content: error.message });
    }
    setSignLoading(false);
  };

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  useEffect(() => {
    if (!user) setLoading(false);
  }, [user]);


  const { redirect } = router.query;

  function initializePlayer() {
    try {
      if (redirect) {
        router.push(redirect);
        console.log('Redirecting to previous page');
      } else {
        router.push('/player');
        console.log('Redirecting to player page');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // signup logic
  const [signType, setSignType] = useState('signin');

  const handleSignup = async (e) => {
    e.preventDefault();

    setSignLoading(true);
    setMessage({});
    const { error, user } = await signUp({ email, password });
    if (error) {
      setMessage({ type: 'error', content: error.message });
    }
    if (user) {
      setMessage({
        type: 'note',
        content: "Check your email for a confirmation link from 'mail.app.supabase.io.'"
      });
    }
    setSignLoading(false);
  };


  // demo deets

  const demoPlayerStats = {
    player_rank: 17,
    next_rank: 0,
    full_name: 'Your Name Here',
    current_level: 1,
    total_exp: 75,
    exp_progress: 75,
    level_exp: 200,
    total_gold: 1950,
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
      area: 'Lifestyle',
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


  const [playerStats, setPlayerStats] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const [showHide, setShowHide] = useState(true);
  const [areaStats, setAreaStats] = useState(null);
  const [weekWins, setWeekWins] = useState(null);
  const [background_url, setBackgroundUrl] = useState('/background/cityscape.jpg');



  useEffect(() => {
    setPlayerStats(demoPlayerStats);
    setAreaStats(demoAreaStats);
    setWeekWins(demoWeekWins);
  }, []);


  // popover stuff


  const [popoverShow, setPopoverShow] = React.useState(false);
  const btnRef = React.createRef();
  const popoverRef = React.createRef();
  const openTooltip = () => {
    createPopper(btnRef.current, popoverRef.current, {
      placement: 'top'
    });
    setPopoverShow(true);
  };
  const closeTooltip = () => {
    setPopoverShow(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!user)
    return (
      <div className='animate-slow-fade-in grid grid-cols-5 height-screen-helper'>
        {signLoading ?
          <div className="flex justify-center col-span-5 lg:col-span-2">
            <LoadingDots />
          </div> : signType == 'signin' ?
            <div className="flex justify-center h-full col-span-5 lg:col-span-2">
              <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
                <Link href="/" ><i className="fas fa-chevron-circle-left cursor-pointer text-xl w-4" /></Link>
                <div className="flex justify-center pb-12 ">
                  <Link href="/" ><img src="logo-white.svg" width="64px" height="64px" className="cursor-pointer" /></Link>
                </div>
                <div className="flex flex-col space-y-4">
                  {message.content && (
                    <div
                      className={`${message.type === 'error' ? 'text-error' : 'text-green'
                        } border ${message.type === 'error' ? 'border-error' : 'border-green'
                        } p-3`}
                    >
                      {message.content}
                    </div>
                  )}

                  {authView === 'magic' && (
                    <form
                      onSubmit={handleSignin}
                      className="animate-fade-in-up flex flex-col space-y-4 mb-2"
                    >
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={setEmail}
                        required
                      />
                      <Button
                        variant="prominent"
                        type="submit"
                        loading={loading}
                        disabled={!email.length}
                      >
                        Send magic link
                      </Button>
                    </form>
                  )}

                  {authView === 'password' && (
                    <form
                      onSubmit={handleSignin}
                      className="animate-fade-in-up flex flex-col space-y-4"
                    >
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={setEmail}
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={setPassword}
                        required
                      />
                      <Button
                        className="mt-1"
                        variant="prominent"
                        type="submit"
                        loading={loading}
                        disabled={!password.length || !email.length}
                      >
                        Sign in
                      </Button>
                    </form>
                  )}

                  {authView === 'reset' && (
                    <form
                      onSubmit={handlePasswordReset}
                      className="animate-fade-in-up flex flex-col space-y-4 mb-2"
                    >
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={setEmail}
                        required
                      />
                      <Button
                        variant="prominent"
                        type="submit"
                        loading={loading}
                        disabled={!email.length}
                      >
                        Reset Password
                      </Button>
                    </form>
                  )}

                  {authView === 'password' ? (
                    <div className="pt-2 text-center text-sm">
                      <span className="text-accents-7">Forgot your password?</span>
                      {` `}
                      <a
                        href="#"
                        className="text-accents-7 text-accent-9 font-bold hover:underline cursor-pointer"
                        onClick={() => {
                          if (authView == 'password') setPassword('');
                          setAuthView('reset');
                          setMessage({});
                        }}
                      >
                        Reset.
                      </a>
                      <div className="flex items-center my-6">
                        <div
                          className="border-t border-accents-2 flex-grow mr-3"
                          aria-hidden="true"
                        ></div>
                        <div className="text-accents-4">Or</div>
                        <div
                          className="border-t border-accents-2 flex-grow ml-3"
                          aria-hidden="true"
                        ></div>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}

                  <span className="text-center text-sm">
                    <a
                      href="#"
                      className="text-accents-7 text-accent-9 hover:underline cursor-pointer"
                      onClick={() => {
                        if (authView) {
                          setPassword('');
                          setMessage({});
                          if (authView === 'magic') {
                            setAuthView('password');
                          } else {
                            setAuthView('magic');
                          }
                        }
                      }}
                    >
                      {`Sign in with ${authView === 'magic' ? 'password' : 'magic link'
                        }.`}
                    </a>
                  </span>

                  <span className="pt-1 text-center text-sm">
                    <span className="text-accents-7">Don't have an account?</span>
                    {` `}
                    <a className="text-accent-9 font-bold hover:underline cursor-pointer" onClick={() => setSignType('signup')}>
                      Sign up.
                    </a>
                  </span>
                </div>

                {/* <div className="flex items-center my-6">
            <div
              className="border-t border-accents-2 flex-grow mr-3"
              aria-hidden="true"
            ></div>
            <div className="text-accents-4">Or</div>
            <div
              className="border-t border-accents-2 flex-grow ml-3"
              aria-hidden="true"
            ></div>
          </div> */}

                {/* <Button
            variant="slim"
            type="submit"
            disabled={loading}
            onClick={() => handleOAuthSignIn('github')}
          >
            <GitHub />
            <span className="ml-2">Continue with GitHub</span>
          </Button> */}
              </div>
            </div>
            :
            <div className="flex justify-center height-screen-helper col-span-5 lg:col-span-2">
              <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
                <i className="fas fa-chevron-circle-left cursor-pointer text-xl w-4" onClick={() => setSignType('signin')} />
                <div className="flex justify-center pb-12 ">
                  <Link href="/" ><img src="logo-white.svg" width="64px" height="64px" className="cursor-pointer" /></Link>
                </div>
                <form
                  onSubmit={handleSignup}
                  className="animate-fade-in-up flex flex-col space-y-4"
                >
                  {message.content && (
                    <div
                      className={`${message.type === 'error' ? 'text-pink' : 'text-green'
                        } border ${message.type === 'error' ? 'border-pink' : 'border-green'
                        } p-3`}
                    >
                      {message.content}
                    </div>
                  )}
                  {/* <Input placeholder="Name" onChange={setName} /> */}
                  <Input
                    type="email"
                    placeholder="Email"
                    onChange={setEmail}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    onChange={setPassword}
                  />
                  <div className="pt-2 w-full flex flex-col">
                    <Button
                      variant="prominent"
                      type="submit"
                      loading={loading}
                      disabled={loading || !email.length || !password.length}
                    >
                      Sign up
                    </Button>
                  </div>

                  <span className="pt-1 text-center text-sm">
                    <span className="text-accents-7">Do you have an account?</span>
                    {` `}
                    <a className="text-accent-9 font-bold hover:underline cursor-pointer" onClick={() => setSignType('signin')}>
                      Sign in.
                    </a>
                  </span>
                </form>
              </div>
            </div>}

        <div className="hidden lg:flex justify-center height-screen-helper col-span-3 ">

          <section
            className="bg-fixed bg-cover bg-center w-full responsiveBackground"
            style={{ backgroundImage: `url(${background_url})` }}
          >
            <div
              className={`bg-black bg-opacity-50 responsiveBackground flex`
              }
            >

              <div className="px-4 md:px-10 my-auto mx-auto w-full">
                <div className="relative py-10">
                  <div className="px-4 md:px-10 mx-auto w-full">
                    <div>
                      {/* Card stats */}
                      <div className="flex flex-wrap xl:flex-nowrap items-center gap-5 opacity-90">
                        <div className="w-full mx-auto mt-2 md:mt-0 mb-6 md:mb-0 xs:w-1/4 sm:w-2/3 lg:w-1/2 3xl:w-1/3 h-full text-center relative">
                          <div
                            className={`${showHide ? 'hidden' : ''
                              } animate-fade-in`}
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

                            <img
                              className="avatar image h-auto m-auto cursor-pointer animate-wiggle"
                              src="/img/default_avatar.png"
                              alt="Avatar"
                              onClick={() => {
                                showHide ? setShowHide(false) : setShowHide(true);
                              }}

                              onMouseEnter={openTooltip}
                              onMouseLeave={closeTooltip}
                              ref={btnRef}
                            />

                          </div>
                          <div
                            className={
                              (popoverShow ? '' : 'hidden ') +
                              'caption-bubble bg-blueGray-900 border-0 mr-3 block z-50 font-normal leading-normal text-sm max-w-xs text-left no-underline break-words rounded-lg'
                            }
                            ref={popoverRef}
                          >
                            <div className='p-2'>
                              <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 font-bold">We're here to help your growth journey.</p>
                              <p className="text-lg text-white ">✅ Track your life progress in real time<br/>
                              ✅ Join party quests to level up together<br/>
                              ✅ Turn daily chores into daily quests<br/>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow w-full sm:w-2/3 sm:ml-10 lg:ml-0 sm:items-right lg:w-1/2 h-full py-0 sm:py-5">
                          <div className="flex 3xl:flex-row flex-col gap-4">
                            <div className="3xl:w-1/2 w-full">
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
                                statPlayer={null}
                                displayMode={'demo'}
                              />
                            </div>
                            <div className="3xl:w-1/2 w-full 2xl:pt-0">
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
        </div>
      </div>
    );

  return (
    <div className="h-screen flex justify-center">
      <LoadingDots />
    </div>
  );
};

export default SignIn;

export async function getServerSideProps({ req }) {
  // Get the user's session based on the request
  const { user } = await supabase.auth.api.getUserByCookie(req);
  console.log(user);

  return {
    props: { user }
  };
}

