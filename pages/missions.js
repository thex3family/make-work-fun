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

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [playerStats, setPlayerStats] = useState(null);
  const [background_url, setBackgroundUrl] = useState('background/cityscape.jpg');
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



  function changeUrl(url) {
    let oldUrl = new URL(url);
    let newUrl = new URL(url);

    newUrl.hostname = 'thex3family.notion.site';
    newUrl.pathname = newUrl.pathname.replace('/thex3family', '');

    return newUrl.toString();
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
                    Adventurer!
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
                  className='flex-col gap-4'
                >
                  <CardAdventure/>
                  <div className="inline-block mx-auto mt-4">
                  <a href="https://thex3family.notion.site/Adventurer-Benefits-09e49fd7a0e44d478db6abe48ee91b63" target="_blank">
                    <Button
                      className="w-auto mx-auto my-4"
                      variant="prominent"
                    >
                      Unlock My Adventurer Card 🙄
                    </Button>
                  </a>
                </div>
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
                        className="p-1 ml-auto bg-transparent border-0 float-right text-xl my-auto leading-none font-semibold outline-none focus:outline-none hideLinkBorder"
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
                            <a href={changeUrl(task.url)} target="_blank" className='p-4 rounded bg-black bg-opacity-80 text-center hover:bg-white hover:text-black hover:scale-105 transition duration-500 ease-out transform cursor-pointer hideLinkBorder'>
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
    // const { user } = await supabase.auth.api.getUserByCookie(req);

    // if (!user) {
    //   return {
    //     redirect: {
    //       destination: '/signin?redirect=missions',
    //       permanent: false
    //     }
    //   };
    // }

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
          property: 'Do Date',
          direction: 'ascending',
        },
        {
          property: 'Impact',
          direction: 'ascending',
        },
      ],
    });

    return { props: { tasks } };

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