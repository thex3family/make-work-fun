import { Client } from '@notionhq/client';
import { useRouter } from 'next/router';
import React from 'react';
import { useUser } from '@/utils/useUser';
import { supabase } from '../utils/supabase-client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';

import {
  fetchLatestWin,
  fetchPlayerStats
} from '@/components/Fetch/fetchMaster';

export default function NotionWizard({ response, nickname }) {
  const router = useRouter();
  const [openTab, setOpenTab] = React.useState(1);
  const { userOnboarding } = useUser();
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [levelUp, setLevelUp] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    if (userOnboarding) initializePlayer();
    if (userOnboarding) loadPlayer();
  }, [userOnboarding]);

  useEffect(() => {
    if (showWinModal) setShowRequiredModal(false);
    if (showWinModal) setShowReadyModal(false);
  }, [showWinModal]);

  function loadAndRefresh() {
    setLoading(true);
    router.reload(window.location.pathname);
  }

  async function loadPlayer() {
    console.log('Loading Player');
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal
    );
  }

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats());
  }

  function initializePlayer() {
    try {
      if (
        response.properties.hasOwnProperty('Name') &&
        // response.properties.hasOwnProperty('Status') &&
        response.properties.hasOwnProperty('Share With Family?') &&
        response.properties.hasOwnProperty('Family Connection')
      ) {
        if (
          response.properties.Name.type.includes('title') &&
          // response.properties.Status.type.includes('select') &&
          response.properties['Share With Family?'].type.includes('checkbox') &&
          response.properties['Family Connection'].type.includes('text')
        ) {
          if (userOnboarding.onboarding_state.includes('4')) {
            setShowReadyModal(true);
          } else {
            setShowRequiredModal(true);
          }
        }
      } else {
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  return (
    <>
      <section className="animate-fade-in-up">
        <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col h-auto justify-center">
          <div className="pb-10">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Let's Get You Connected
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
              Be data conscious. Get back to this page any time by testing your
              connection from{' '}
              <span className="text-emerald-500 font-semibold">
                <Link href="/account">account.</Link>
              </span>
            </p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pb-8 px-4 sm:px-6 lg:px-8 ">
          <div className="relative my-6 mx-auto h-auto rounded bg-white">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                <div className="text-2xl font-semibold">
                  {response.title[0].plain_text}{' '}
                  {nickname ? `(${nickname})` : null}
                </div>
                <button
                  className="p-1 ml-auto bg-transparent border-0 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={() => loadAndRefresh()}
                  disabled={loading}
                  loading={loading}
                >
                  <span className="hidden md:inline-block">
                    {loading ? 'Loading' : 'Click here to refresh'}
                  </span>
                  <i className="ml-3 fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
            {/*body*/}
            <p className="text-black my-6 mx-6">
              When you connect your Notion database, we look for the following
              properties to calculate rewards for your wins. The properties are{' '}
              <i>case and type sensitive</i>, so use this page to check if you
              have everything you need to get started and learn more about the
              data we use!
            </p>
            <div className="flex flex-col md:flex-row my-6 mx-6 gap-3">
              <div className="md:w-1/3 scroll-tab-header">
                <ul
                  className="flex mb-0 list-none pb-5 px-2 md:pb-0 md:px-0 flex-nowrap overflow-scroll md:overflow-visible flex-row md:flex-col gap-3"
                  role="tablist"
                >
                  <li className="mr-2 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 1
                          ? response.properties.hasOwnProperty('Name')
                            ? response.properties.Name.type.includes('title')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Name')
                          ? response.properties.Name.type.includes('title')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(1);
                      }}
                      data-toggle="tab"
                      href="#link1"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Name')
                            ? response.properties.Name.type.includes('title')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Name{' '}
                      <span className="text-xs font-medium">(Required)</span>
                    </a>
                  </li>
                  {/* <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 2
                          ? response.properties.hasOwnProperty('Status')
                            ? response.properties.Status.type.includes('select')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Status')
                          ? response.properties.Status.type.includes('select')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(2);
                      }}
                      data-toggle="tab"
                      href="#link2"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Status')
                            ? response.properties.Status.type.includes('select')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Status{' '}
                      <span className="text-xs font-medium">(Required)</span>
                    </a>
                  </li> */}
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 4
                          ? response.properties.hasOwnProperty(
                              'Share With Family?'
                            )
                            ? response.properties[
                                'Share With Family?'
                              ].type.includes('checkbox')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty(
                              'Share With Family?'
                            )
                          ? response.properties[
                              'Share With Family?'
                            ].type.includes('checkbox')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(4);
                      }}
                      data-toggle="tab"
                      href="#link4"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty(
                            'Share With Family?'
                          )
                            ? response.properties[
                                'Share With Family?'
                              ].type.includes('checkbox')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Share With Family?{' '}
                      <span className="text-xs font-medium">(Required)</span>
                    </a>
                  </li>
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 5
                          ? response.properties.hasOwnProperty(
                              'Family Connection'
                            )
                            ? response.properties[
                                'Family Connection'
                              ].type.includes('text')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty(
                              'Family Connection'
                            )
                          ? response.properties[
                              'Family Connection'
                            ].type.includes('text')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(5);
                      }}
                      data-toggle="tab"
                      href="#link5"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty(
                            'Family Connection'
                          )
                            ? response.properties[
                                'Family Connection'
                              ].type.includes('text')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Family Connection{' '}
                      <span className="text-xs font-medium">(Required)</span>
                    </a>
                  </li>
                  <hr />
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 3
                          ? response.properties.hasOwnProperty('Type')
                            ? response.properties.Type.type.includes('select')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Type')
                          ? response.properties.Type.type.includes('select')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(3);
                      }}
                      data-toggle="tab"
                      href="#link3"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Type')
                            ? response.properties.Type.type.includes('select')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Type{' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>
                  <li className="-mb-px mr-2 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 6
                          ? response.properties.hasOwnProperty('Difficulty')
                            ? response.properties.Difficulty.type.includes(
                                'select'
                              ) ||
                              response.properties.Difficulty.type.includes(
                                'number'
                              ) ||
                              response.properties.Difficulty.type.includes(
                                'formula'
                              ) ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Difficulty')
                          ? response.properties.Difficulty.type.includes(
                              'select'
                            ) ||
                            response.properties.Difficulty.type.includes(
                              'number'
                            ) ||
                            response.properties.Difficulty.type.includes(
                              'formula'
                            ) ?  'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(6);
                      }}
                      data-toggle="tab"
                      href="#link6"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Difficulty')
                            ? response.properties.Difficulty.type.includes(
                                'select'
                              ) ||
                              response.properties.Difficulty.type.includes(
                                'number'
                              ) ||
                              response.properties.Difficulty.type.includes(
                                'formula'
                              ) ?  'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Difficulty{' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 7
                          ? response.properties.hasOwnProperty('Do Date')
                            ? response.properties['Do Date'].type.includes(
                                'date'
                              )
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Do Date')
                          ? response.properties['Do Date'].type.includes('date')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(7);
                      }}
                      data-toggle="tab"
                      href="#link7"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Do Date')
                            ? response.properties['Do Date'].type.includes(
                                'date'
                              )
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Do Date{' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 8
                          ? response.properties.hasOwnProperty('Closing Date')
                            ? response.properties['Closing Date'].type.includes(
                                'date'
                              )
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Closing Date')
                          ? response.properties['Closing Date'].type.includes(
                              'date'
                            )
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(8);
                      }}
                      data-toggle="tab"
                      href="#link8"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Closing Date')
                            ? response.properties['Closing Date'].type.includes(
                                'date'
                              )
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Closing Date{' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 9
                          ? response.properties.hasOwnProperty('Upstream (Sum)')
                            ? response.properties[
                                'Upstream (Sum)'
                              ].type.includes('formula') ||
                              response.properties[
                                'Upstream (Sum)'
                              ].type.includes('text')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Upstream (Sum)')
                          ? response.properties['Upstream (Sum)'].type.includes(
                              'formula'
                            ) ||
                            response.properties['Upstream (Sum)'].type.includes(
                              'text'
                            )
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(9);
                      }}
                      data-toggle="tab"
                      href="#link9"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Upstream (Sum)')
                            ? response.properties[
                                'Upstream (Sum)'
                              ].type.includes('formula') ||
                              response.properties[
                                'Upstream (Sum)'
                              ].type.includes('text')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Upstream (Sum){' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>

                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 10
                          ? response.properties.hasOwnProperty('Area')
                            ? response.properties.Area.type.includes('select')
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Area')
                          ? response.properties.Area.type.includes('select')
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(10);
                      }}
                      data-toggle="tab"
                      href="#link10"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Area')
                            ? response.properties.Area.type.includes('select')
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Area{' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-left min-w-max">
                    <a
                      className={
                        'text-md font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal align-middle ' +
                        (openTab === 11
                          ? response.properties.hasOwnProperty('Collaborators')
                            ? response.properties.Collaborators.type.includes(
                                'people'
                              )
                              ? 'text-white bg-emerald-500'
                              : 'text-white bg-red-500'
                            : 'text-white bg-red-500'
                          : response.properties.hasOwnProperty('Collaborators')
                          ? response.properties.Collaborators.type.includes(
                              'people'
                            )
                            ? 'text-emerald-500 bg-white'
                            : 'text-red-500 bg-white'
                          : 'text-red-500 bg-white')
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTab(11);
                      }}
                      data-toggle="tab"
                      href="#link11"
                      role="tablist"
                    >
                      <i
                        className={
                          'mr-2 ' +
                          (response.properties.hasOwnProperty('Collaborators')
                            ? response.properties.Collaborators.type.includes(
                                'people'
                              )
                              ? 'fas fa-check'
                              : 'fas fa-exclamation-triangle'
                            : 'text-xl ml-0.5 mr-2.5 align-middle fas fa-times')
                        }
                      />
                      Collaborators{' '}
                      <span className="text-xs font-medium">(Optional)</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="flex w-full md:w-3/4 h-full">
                <div className="relative flex min-w-0 break-words bg-white text-black w-full mb-6 shadow-lg rounded border">
                  <div className="px-4 py-5 flex-auto">
                    <div className="tab-content tab-space">
                      <div
                        className={openTab === 1 ? 'block' : 'hidden'}
                        id="link1"
                      >
                        {response.properties.hasOwnProperty('Name') ? (
                          response.properties.Name.type.includes('title') ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}

                        <p className="font-semibold">Recommended Type: Title</p>
                        <p>
                          We use this property to determine the name of the win
                          that you are handing in. The title property is called
                          'Name' on default whenever you create a new table.
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/name_prop.PNG"
                        ></img>
                      </div>
                      {/* <div
                        className={openTab === 2 ? 'block' : 'hidden'}
                        id="link2"
                      >
                        {response.properties.hasOwnProperty('Status') ? (
                          response.properties.Status.type.includes('select') ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">
                          Recommended Type: Select or Multi-Select
                        </p>
                        <p>
                          We use this property to determine when we should
                          capture your win. This property should have an option
                          for
                          <span className="px-1.5 py-0.5 ml-1 bg-emerald-200 rounded text-black">
                            Complete
                          </span>{' '}
                          which determines when a win should be counted.
                          <br />
                          <br />
                          <i>
                            The app won't read wins until both{' '}
                            <span className="font-semibold">
                              Status = Complete
                            </span>{' '}
                            and{' '}
                            <span className="font-semibold">
                              Share With Family? = ✔
                            </span>
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/status_prop.PNG"
                        ></img>
                      </div> */}
                      <div
                        className={openTab === 3 ? 'block' : 'hidden'}
                        id="link2"
                      >
                        {response.properties.hasOwnProperty('Type') ? (
                          response.properties.Type.type.includes('select') ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">
                          Recommended Type: Select / Multi-Select / Formula
                        </p>
                        <p>
                          We use this property to determine how to calculate
                          your rewards. This property should have options for
                          different wins that you will be accomplishing.
                          <br />
                          <br />
                          <i>Currently supported: </i>
                          <div className="px-1.5 py-0.5 mb-1 bg-emerald-200 rounded text-black">
                            Goal = 250 XP
                          </div>
                          <div className="px-1.5 py-0.5 mb-1 bg-yellow-200 rounded text-black">
                            Key Result = 100 XP
                          </div>
                          <div className="px-1.5 py-0.5 mb-1 bg-purple-200 rounded text-black">
                            Project = 50 XP + 50 💰
                          </div>
                          <div className="px-1.5 py-0.5 mb-1 bg-red-200 rounded text-black">
                            Task = 25 XP + 25 💰
                          </div>
                          <br />
                          <i>
                            Any unsupported types will default to a task reward.
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/type_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 4 ? 'block' : 'hidden'}
                        id="link3"
                      >
                        {response.properties.hasOwnProperty(
                          'Share With Family?'
                        ) ? (
                          response.properties[
                            'Share With Family?'
                          ].type.includes('checkbox') ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">
                          Recommended Type: Checkbox
                        </p>
                        <p>
                          We use this property to determine what wins we should
                          read from your database. Think of it like a send email
                          button - check this when you are ready to share your
                          win with the world. Keep this property unchecked for
                          any entries you want to keep private.
                          {/* <br />
                          <br />
                          <i>
                            The app won't read wins until both{' '}
                            <span className="font-semibold">
                              Status = Complete
                            </span>{' '}
                            and{' '}
                            <span className="font-semibold">
                              Share With Family? = ✔
                            </span>
                          </i> */}
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/share_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 5 ? 'block' : 'hidden'}
                        id="link4"
                      >
                        {response.properties.hasOwnProperty(
                          'Family Connection'
                        ) ? (
                          response.properties[
                            'Family Connection'
                          ].type.includes('text') ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">Recommended Type: Text</p>
                        <p>
                          We use this property to let your database know that
                          the win has already been counted. Content will be
                          entered automatically by our API whenever a new win is
                          handed in.
                          <br />
                          <br />
                          <i>
                            If you ever want to re-submit a win, simply clear
                            the data in this property for the specific page.
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/family_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 6 ? 'block' : 'hidden'}
                        id="link4"
                      >
                        {response.properties.hasOwnProperty('Difficulty') ? (
                          response.properties.Difficulty.type.includes(
                            'select'
                          ) ||
                          response.properties.Difficulty.type.includes(
                            'number'
                          ) ||
                          response.properties.Difficulty.type.includes(
                            'formula'
                          ) ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">
                          Recommended Type: Select / Number / Formula
                        </p>
                        <p>
                          We use this property to reward you bonus exp and gold
                          for difficult quests. In real life, this translates to
                          the time and effort needed to get this job done. The
                          number will multiply the rewards earned.
                          <br />
                          <br />
                          <i>
                            If you don't have this property or leave it blank,
                            it will default to 1. Bonuses cap at 10.
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/difficulty_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 7 ? 'block' : 'hidden'}
                        id="link4"
                      >
                        {response.properties.hasOwnProperty('Do Date') ? (
                          response.properties['Do Date'].type.includes(
                            'date'
                          ) ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">Recommended Type: Date</p>
                        <p>
                          We use this property to check when you started the
                          quest, and should not be confused with the Due Date.
                          This will be matched with the{' '}
                          <span className="font-semibold">Closing Date</span> to
                          determine your punctuality and show you trends.
                          <br />
                          <br />
                          <i>
                            If you don't have this property or leave it blank,
                            it will default to the day you share the win.
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/do_date_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 8 ? 'block' : 'hidden'}
                        id="link4"
                      >
                        {response.properties.hasOwnProperty('Closing Date') ? (
                          response.properties['Closing Date'].type.includes(
                            'date'
                          ) ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">Recommended Type: Date</p>
                        <p>
                          We use this property to check when you completed the
                          quest. This will be matched with the{' '}
                          <span className="font-semibold">Do Date</span> to
                          determine your punctuality and show you trends.
                          <br />
                          <br />
                          <i>
                            If you don't have this property or leave it blank,
                            it will default to the day you share the win.
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/closing_date_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 9 ? 'block' : 'hidden'}
                        id="link4"
                      >
                        {response.properties.hasOwnProperty(
                          'Upstream (Sum)'
                        ) ? (
                          response.properties['Upstream (Sum)'].type.includes(
                            'formula'
                          ) ||
                          response.properties['Upstream (Sum)'].type.includes(
                            'text'
                          ) ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">
                          Recommended Type: Formula / Text
                        </p>
                        <p>
                          We use this property to show you the higher level
                          goals, key results, or projects each win is building
                          up to. You can think of this as the storyline that
                          this quest is completing.
                          <br />
                          <br />
                          <i>
                            If you don't have this property or leave it blank,
                            you will not be able to see your storyline.
                          </i>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/upstream_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 10 ? 'block' : 'hidden'}
                        id="link10"
                      >
                        {response.properties.hasOwnProperty('Area') ? (
                          response.properties.Area.type.includes('select') ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">
                          Recommended Type: Select / Formula
                        </p>
                        <p>
                          We use this property to connect your wins with the
                          areas of competence you are building in your life. If
                          you hand in a quest without this property, the win
                          will be Uncategorized.
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/area_prop.PNG"
                        ></img>
                      </div>
                      <div
                        className={openTab === 11 ? 'block' : 'hidden'}
                        id="link11"
                      >
                        {response.properties.hasOwnProperty('Collaborators') ? (
                          response.properties.Collaborators.type.includes(
                            'people'
                          ) ? (
                            <h2 className="text-xl text-bold text-emerald-600 mb-3">
                              <i className="fas fa-check mr-2"></i>Your database
                              has this property!
                            </h2>
                          ) : (
                            <h2 className="text-xl text-bold text-red-600 mb-3">
                              <i className="fas fa-exclamation-triangle mr-2"></i>
                              Your database has this property but not the
                              recommended type.
                            </h2>
                          )
                        ) : (
                          <h2 className="text-xl text-bold text-red-600 mb-3">
                            <i className="fas fa-times mr-2"></i>Your database
                            is missing this property!
                          </h2>
                        )}
                        <p className="font-semibold">Mandatory Type: People</p>
                        <p>
                          We use this property to distinguish who the win should
                          be attributed to, if more than 1 person is sharing a
                          database.{' '}
                          <a
                            className="text-emerald-500"
                            href="https://academy.co-x3.com/en/articles/5486715-what-if-my-database-is-currently-being-shared-with-multiple-people"
                            target="_blank"
                          >
                            Learn more about how to utilize this property.
                          </a>
                        </p>
                        <img
                          className="w-auto pt-5"
                          src="/wizard/collaborators_prop.PNG"
                        ></img>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative text-blueGray-500">
              {/*footer*/}
              <div className="flex items-center py-4 justify-end border-t border-solid border-blueGray-200 rounded-b">
                <a
                  href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection?utm_source=family-connection"
                  target="_blank"
                  className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                >
                  Troubleshoot
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showReadyModal ? (
        <>
          <div className="h-screen flex justify-center">
            <div
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              // onClick={() => setShowModal(false)}
            >
              <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                    <h3 className="text-2xl font-semibold text-white">
                      🚀 Your avatar is ready!
                    </h3>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 text-blueGray-500">
                    <img
                      src="img/default_avatar.png"
                      height="auto"
                      className="w-3/4 mx-auto pb-2"
                    />
                    <div className="text-center">
                      <p className="text-lg text-primary-2 font-semibold mx-0 sm:mx-10">
                        We've connected to your database successfully and
                        retrieved your wins.
                      </p>
                    </div>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <Link href="/player">
                      <Button className="w-full" variant="prominent">
                        Start Playing
                      </Button>
                    </Link>
                  </div>
                  <div className="text-center mb-6">
                    <button
                      className="text-md font-semibold text-red-600"
                      onClick={() => setShowReadyModal(false)}
                    >
                      I'll do this later!
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </div>
        </>
      ) : null}

      {showRequiredModal ? (
        <>
          <div className="h-screen flex justify-center">
            <div
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              // onClick={() => setShowModal(false)}
            >
              <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      ⚔ You've Met The Requirements
                    </h3>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 text-blueGray-500">
                    <div className="text-center">
                      <p className="text-xl text-primary-2 font-semibold">
                        It's time to hand in your first quest!
                      </p>
                      <ol className="text-sm text-black text-left sm:text-lg max-w-2xl m-auto px-0 sm:px-8 pt-6">
                        <li>
                          1. Make sure the required properties have been set
                        </li>
                        <li>
                          2. Utilize optional properties to get more value
                        </li>
                        <li>
                          3. Mark quest as{' '}
                          <span className="px-1.5 py-0.5 bg-emerald-200 rounded text-black font-semibold">
                            Complete
                          </span>{' '}
                          and{' '}
                          <span className="font-semibold">
                            ✔ Share With Family
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  <iframe
                    width="auto"
                    height="315"
                    src="https://www.loom.com/embed/e5eaaa19fcf64297b2859ed7c64171ad"
                    title="How To Hand In Quests"
                    frameborder="0"
                    allow="accelerometer; 
                    autoplay; 
                    clipboard-write; 
                    encrypted-media; 
                    gyroscope; 
                    picture-in-picture"
                  ></iframe>
                  {/* <img src="img/default_avatar.png" height="auto" className="w-3/4 mx-auto pb-2" /> */}
                  {/*footer*/}
                  <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <div className="text-center mx-auto">
                      <button
                        className="text-md font-semibold text-red-600"
                        onClick={() => setShowRequiredModal(false)}
                      >
                        I'll do this later!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </div>
        </>
      ) : null}

      {/* level up modal */}
      {levelUp ? (
        <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
      ) : null}

      {/* // Modal Section */}
      {showWinModal ? (
        <>
          <WinModal
            page={'validator'}
            activeModalStats={activeModalStats}
            setShowWinModal={setShowWinModal}
            playerStats={playerStats}
            refreshStats={refreshStats}
          />
        </>
      ) : null}
    </>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Get credentials from Supabase
    const { user } = await supabase.auth.api.getUserByCookie(req);

    const key = await supabase
      .from('notion_credentials_validation')
      .select('test_pair')
      .eq('player', user.id)
      .limit(1)
      .single();
    const data = await supabase
      .from('notion_credentials')
      .select('nickname, api_secret_key, database_id')
      .eq('id', key.data.test_pair)
      .limit(1)
      .single();
    const credentials = data.body;
    const nickname = data.body.nickname;

    // Send credentials to Notion API
    const notion = new Client({ auth: credentials.api_secret_key });
    const response = await notion.databases.retrieve({
      database_id: credentials.database_id
    });

    return { props: { response, nickname } };
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
