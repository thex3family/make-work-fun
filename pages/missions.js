import { Client } from '@notionhq/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import { userContent } from '@/utils/useUser';

import { supabase } from '../utils/supabase-client';

import React from 'react';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';

import TitleModal from '@/components/Modals/ModalTitle';

import PlayerSkeleton from '@/components/Skeletons/PlayerSkeleton';
import RecentWinsSkeleton from '@/components/Skeletons/RecentWinsSkeleton';

import moment from 'moment';

// functions

import {
  fetchPlayerStats,
  fetchWins,
  fetchWeekWins,
  fetchAreaStats,
  fetchTitles,
  fetchSpecificWin
} from '@/components/Fetch/fetchMaster';

import { pushTitle } from '@/components/Push/pushMaster';

// components

import HeaderStats from 'components/Headers/HeaderStats.js';
import DataTable, { createTheme } from 'react-data-table-component';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';
import Button from '@/components/ui/Button';
import CardAdventure from '@/components/Cards/CardAdventure';

export default function Missions({ metaBase, setMeta, refreshChildStats, setRefreshChildStats, tasks }) {
  console.log(tasks);

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, userLoaded, userOnboarding } = userContent();
  const [playerStats, setPlayerStats] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [background_url, setBackgroundUrl] = useState('/');
  const [openTab, setOpenTab] = useState(null);

  const [onboardingState, setOnboardingState] = useState(null);

  const [newToSeason, setNewToSeason] = useState(null);

  function loadAndRefresh() {
    setLoading(true);
    router.reload(window.location.pathname);
  }

  // sets the meta tags

  useEffect(() => {
    const meta = {
      title: 'Missions - ' + metaBase.titleBase
    }
    setMeta(meta)
  }, []);

  // Waits until database fetches user state before loading anything

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  // Set player background when the information loads

  useEffect(() => {
    if (playerStats) setAvatarUrl(playerStats.avatar_url)
    if (playerStats) fetchPlayerBackground(playerStats.background_url);
  }, playerStats);

  // Checks if the user is ready to load

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        setOnboardingState(parseInt(userOnboarding.onboarding_state, 10));
        console.log('Setting onboarding state...', parseInt(userOnboarding.onboarding_state, 10))
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    await refreshStats();
  }

  async function refreshStats() {
    console.log('Refreshing Stats');
    setPlayerStats(await fetchPlayerStats(null, setNewToSeason));
    setLoading(false);
  }

  useEffect(() => {
    if (refreshChildStats) {
      refreshStats();
      setRefreshChildStats(false);
    }
  }, [refreshChildStats]);

  async function fetchPlayerBackground(path) {
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

  function changeUrl(url) {
    let oldUrl = new URL(url);
    let newUrl = new URL(url);
    
    newUrl.hostname = 'thex3family.notion.site'; 
    newUrl.pathname = newUrl.pathname.replace('/thex3family', '');

    return newUrl.toString();
}


if (!playerStats) {
  return (
    <>
      <PlayerSkeleton />
      {
        newToSeason ?
          <ModalOnboarding onboardingState={5} />
          : null
      }
    </>
  )
}

  return (
    <>
      <section
        className="animate-slow-fade-in bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${background_url})` }}
      >
        <div className="bg-black bg-opacity-70 sm:bg-opacity-0">
          <div className="max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
            <div className="rounded sm:bg-black sm:bg-opacity-90 bg-none bg-opacity-100 opacity-95">
              <div className="pt-0 sm:pt-10 pb-5">
                <h1 className="text-4xl font-extrabold text-white text-center sm:text-6xl">
                  Welcome,{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                    {playerStats ? playerStats.full_name ? playerStats.full_name : 'Adventurer' : (
                      <LoadingDots />
                    )}
                    !
                  </span>
                </h1>
                <p className="mt-5 px-2 text-xl text-accents-6 text-center sm:text-2xl max-w-xl md:max-w-3xl m-auto">
                  Let's make a positive impact on the world.
                </p>
              </div>
              <div className="px-0 sm:px-4 md:px-10 mx-auto w-full my-10">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CardAdventure />
                </div>
              </div>
              <div className="max-w-6xl mx-auto pb-8 px-4 sm:px-6 lg:px-8 ">
                <div className="relative my-6 mx-auto h-auto rounded bg-white bg-opacity-10">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex items-start justify-between p-5 border-b border-solid bg-black bg-opacity-90 rounded-t">
                      <div className="text-2xl font-semibold">
                        Mission Board
                      </div>
                      <button
                        className="p-1 ml-auto bg-transparent border-0 float-right text-xl my-auto leading-none font-semibold outline-none focus:outline-none"
                        onClick={() => loadAndRefresh()}
                        disabled={loading}
                        loading={loading}
                      >
                        <span className="hidden md:inline-block">
                          {loading ? 'Loading' : 'Refresh'}
                        </span>
                        <i className="ml-3 fas fa-sync-alt"></i>
                      </button>
                    </div>
                  </div>
                  {/*body*/}
                  <p className="text-white my-6 mx-6">
                    Collaborative adventures with our community where we are slaying new dragons and exploring new worlds.
                  </p>
                  <div className="flex flex-col md:flex-row my-6 mx-6 gap-3">
                    {/* <div className="md:w-1/2 scroll-tab-header">
                      <ul
                        className="flex mb-0 list-none pb-5 px-2 md:pb-0 md:px-0 flex-nowrap overflow-scroll no-scrollbar md:overflow-visible flex-row md:flex-col gap-3"
                        role="tablist"
                      >
                        <li className="mr-2 flex-auto text-left min-w-max">
                              <a
                                className={
                                  'font-semibold uppercase px-5 py-3 rounded block leading-normal align-middle hideLinkBorder hover:bg-gray-100 hover:text-black ' +
                                  (openTab === null
                                    ? 'text-black bg-gray-100 font-bold'
                                    : 'text-gray-200')
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenTab(null);
                                }}
                                data-toggle="tab"
                                href="#"
                                role="tablist"
                              >
                                All Quests
                              </a>
                            </li>
                        {projects ?
                          projects.results.map((project) => (
                            <li className="mr-2 flex-auto text-left min-w-max">
                              <a
                                className={
                                  'font-semibold uppercase px-5 py-3 rounded block leading-normal align-middle hideLinkBorder hover:bg-gray-100 hover:text-black ' +
                                  (openTab === project.properties.Name.title[0].plain_text
                                    ? 'text-black bg-gray-100 font-bold'
                                    : 'text-gray-200')
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenTab(project.properties.Name.title[0].plain_text);
                                }}
                                data-toggle="tab"
                                href="#"
                                role="tablist"
                              >
                                {project.properties.Name.title[0].plain_text}
                                <p className="text-xs font-medium">{project.properties.Details.formula.string}</p>
                              </a>
                            </li>
                          ))
                          : null}
                      </ul>
                    </div> */}
                    <div className="w-full mb-6">
                      <div className="grid grid-cols-3 gap-2 p-2 bg-white text-white shadow-lg rounded border">
                        {tasks ?
                          tasks.results.map((task) => (
                            <a href={changeUrl(task.url)} target="_blank" className='p-4 border rounded bg-black bg-opacity-80 text-center hover:bg-gray-100 hover:text-black cursor-pointer hideLinkBorder'>
                              <p className="font-semibold truncate mb-1">{task.properties.Name.title[0].plain_text}</p>
                              <p className="font-normal">{task.properties["Upstream (Sum)"].formula.string}</p>
                              {/* <p className="font-normal">{task.properties.Status?.select?.name}</p> */}
                              <p className="font-normal">{task.properties.Reward.formula.string}</p>
                            </a>
                          )) : null}
                      </div>
                    </div>
                  </div>
                  {/* <div className="relative text-blueGray-500">
                    <div className="flex items-center py-4 justify-end border-t border-solid border-blueGray-200 rounded-b">
                      <a
                        href="https://academy.co-x3.com/make-work-fun-app/aXV29eQnHfmsNGacNfqLUz/how-do-i-easily-connect-any-notion-database-to-the-make-work-fun-app/rNSULyAdfLaRE55EMVpvwf#required-properties?utm_source=makeworkfun"
                        target="_blank"
                        className="hideLinkBorder text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        Troubleshoot
                      </a>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {onboardingState ? (
        <ModalOnboarding onboardingState={onboardingState} />
      ) : null}
    </>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Get the user's session based on the request
    const { user } = await supabase.auth.api.getUserByCookie(req);

    if (!user) {
      return {
        redirect: {
          destination: '/signin?redirect=player',
          permanent: false
        }
      };
    }

    // Send credentials to Notion API
    const notion = new Client({ auth: process.env.IMPACT_SECRET_KEY });
    // const projects = await notion.databases.query({
    //   database_id: process.env.IMPACT_DATABASE_ID,
    //   filter: {
    //     and: [
    //       {
    //         property: 'Type',
    //         select: {
    //           equals: 'Project',
    //         },
    //       },
    //       {
    //         property: 'Sub-Type (Optional)',
    //         multi_select: {
    //           contains: 'World Boss',
    //         },
    //       },
    //       {
    //         property: 'Status',
    //         select: {
    //           does_not_equal: 'Complete',
    //         },
    //       },
    //     ],
    //   },
    //   sorts: [
    //     {
    //       property: 'Days To Go',
    //       direction: 'ascending',
    //     },
    //     {
    //       property: 'Impact',
    //       direction: 'ascending',
    //     },
    //   ],
    // });

    const tasks = await notion.databases.query({
      database_id: process.env.IMPACT_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Type',
            select: {
              equals: 'Task',
            },
          },
          {
            property: 'Upstream Sub-Type',
            rollup: {
              any: {
                multi_select: {
                  contains: "World Boss"
                }
              }
            },
          },
          {
            property: 'Status',
            select: {
              does_not_equal: 'Complete',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Days To Go',
          direction: 'ascending',
        },
        {
          property: 'Impact',
          direction: 'ascending',
        },
      ],
    });

    return { props: { user, tasks } };

  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: '/credentials-invalid',
        permanent: false
      }
    };
  }
}