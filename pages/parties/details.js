import Countdown from '@/components/Widgets/Countdown/countdown';
import { useState, useEffect, createRef } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LoadingDots from '@/components/ui/LoadingDots';
import {
  fetchParty,
  fetchLatestWin,
  fetchPlayerStats,
  fetchWins,
  fetchPartyPlayers
} from '@/components/Fetch/fetchMaster';
import CardPartyPlayer from '@/components/Cards/CardPartyPlayer';
import ModalLevelUp from '@/components/Modals/ModalLevelUp';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import WinModal from '@/components/Modals/ModalWin';
import { useUser } from '@/utils/useUser';
import Input from '@/components/ui/Input';
import { createPopper } from '@popperjs/core';
import { supabase } from '@/utils/supabase-client';

// Table Components
import PartyStatistics from '@/components/Widgets/Statistics/PartyStatistics';

export default function partyDetail() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  const [party, setParty] = useState(null);
  const [partyPlayers, setPartyPlayers] = useState(null);
  const [specificPartyPlayer, setSpecificPartyPlayer] = useState(null);
  const { user, userOnboarding } = useUser();

  const [levelUp, setLevelUp] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);

  const [showDetails, setShowDetails] = useState(true);

  const [dailyTarget, setDailyTarget] = useState(null);
  const [due_date, setDue_Date] = useState(null);
  const [dragon_name, setDragonName] = useState(null);
  const [dragon_id, setDragonID] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [cumulativeWins, setCumulativeWins] = useState([0]);
  const [cumulativeEXP, setCumulativeEXP] = useState([0]);

  // Waits until database fetches user state before loading anything

  useEffect(() => {
    if (userOnboarding && id) initializePlayer();
  }, [userOnboarding, id]);

  useEffect(() => {
    if (party) {
      loadPartyDetails();
      if (party.status != 1) setShowDetails(false);
    } else {
      setShowDetails(true);
    }
  }, [party]);

  // Checks if the user is ready to load

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        router.push('/account');
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
    await refreshStats();
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal
    );
  }

  async function refreshStats() {
    console.log('statsRefreshing');
    setPlayerStats(await fetchPlayerStats());
    setParty(await fetchParty(id));
    setLoading(false);
  }

  async function loadPartyDetails() {
    setPartyPlayers(await fetchPartyPlayers(party.id));
    setDailyTarget(party.daily_target);
    setDue_Date(party.due_date);
  }

  async function savePartyDetails(target, deadline) {
    try {
      if (target) {
        const { data, error } = await supabase
          .from('party')
          .update({
            daily_target: target
          })
          .eq('id', party.id);

        if (error && status !== 406) {
          throw error;
        }
      }

      if (deadline) {
        const { data, error } = await supabase
          .from('party')
          .update({
            due_date: deadline
          })
          .eq('id', party.id);

        if (error && status !== 406) {
          throw error;
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      refreshStats();
    }
  }

  useEffect(() => {
    if (partyPlayers)
      setSpecificPartyPlayer(partyPlayers.find((x) => x.player === user.id));
  }, [partyPlayers]);

  useEffect(() => {
    if (specificPartyPlayer)
      setDragonName(specificPartyPlayer.notion_page_name);
    if (specificPartyPlayer) setDragonID(specificPartyPlayer.notion_page_id);
  }, [specificPartyPlayer]);

  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = createRef();
  const popoverDropdownRef = createRef();
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: 'bottom-start'
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  // background upload

  async function uploadBackground(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onBackgroundUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    console.log('Wins', cumulativeWins)
    console.log('EXP', cumulativeEXP)
  }, [cumulativeWins, cumulativeEXP]);

  if (!id || loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }
  if (party) {
    return (
      <>
        {/* <section className="animate-fade-in-up bg-black mb-32">
        <div className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Best Party Ever
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
              We're in it to win it.
            </p>
          </div>
        </div>
        <div className="w-full py-3 text-center">
          <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg">
            <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
              Challenge Ends In...
            </h1>
            <h1 className=" rounded-lg pt-5 w-3/4 lg:w-full mx-auto text-xl font-semibold text-center lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
              <Countdown date="2021-07-02T21:00:00-05:00" />
            </h1>
          </div>
        </div>
      </section> */}
        <section className="justify-center">
          <div className="bg-player-pattern bg-fixed h-4/5">
            <div className="bg-black bg-opacity-90 h-4/5">
              <div className="animate-fade-in-up  pt-8 md:pt-24 pb-10 max-w-7xl mx-auto">
                <div className="px-8 lg:container lg:px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
                  <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
                    <h1 className="mx-auto md:mx-0 text-4xl font-extrabold sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                      {party.name}
                    </h1>
                    <p className="mx-auto md:mx-0 text-xl text-accents-6 sm:text-2xl max-w-2xl pr-2">
                      {party.description}
                    </p>
                    <div className="inline-block mx-auto md:mx-0 mt-5">
                      {/* <a href="https://makeworkfun.club" target="_blank">
                      <Button
                        className="w-auto mx-auto mr-5 my-4"
                        variant="incognito"
                      >
                        See Progress
                      </Button>
                    </a> */}
                      {/* <Link href="/player">
                        <Button
                          className="w-auto mx-auto md:mx-0"
                          variant="prominent"
                        >
                          See Progress 🚀
                        </Button>
                      </Link> */}
                    </div>
                  </div>

                  <div className="w-full md:w-3/5 py-6 text-center">
                    <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 ml-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg items-center">
                      {party.status == 1 ? (
                        <>
                          <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                            STATUS: In Recruitment
                          </h1>
                          <div className="flex flex-col space-y-4">
                            <div className="mt-4 text-error border border-error p-3">
                              <b>
                                The challenge can be started by the party leader
                                after:
                              </b>
                              <div>- There are 2 or more party members</div>
                              <div>- Conrad shares their dragon</div>
                              <div>- Vivian shares their dragon</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                            Challenge Ends In...
                          </h1>
                          <h1 className="rounded-lg pt-5 w-11/12 lg:w-full mx-auto text-sm font-semibold text-center lg:text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                            <Countdown date={party.due_date} />
                          </h1>
                          <div className="text-center text-accents-4 text-sm max-w-sm">
                            You'll deplete <b>1 health</b> every day until the
                            challenge ends. Earn ❤ by completing party missions!
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="max-w-6xl mx-auto pb-8 px-2 sm:px-6 lg:px-8">
                  <div className="bg-black bg-opacity-30 rounded-md mx-auto overflow-hidden flex flex-row shadow-xl mb-6">
                    <div className="py-6 px-4 w-full">
                      <div className="flex items-center">
                        <div
                          className="border-t-2 border-accents-2 flex-grow mb-6 sm:mb-3 mr-3"
                          aria-hidden="true"
                        ></div>

                        <div
                          className="font-semibold text-xl text-white-700 pb-5 cursor-pointer inline-block"
                          onClick={() => {
                            showDetails
                              ? setShowDetails(false)
                              : setShowDetails(true);
                          }}
                        >
                          Party Details{' '}
                          <i
                            className={
                              (showDetails
                                ? 'fas fa-chevron-up'
                                : 'fas fa-chevron-down') + ''
                            }
                          />
                        </div>
                        <div
                          className="border-t-2 border-accents-2 flex-grow mb-6 sm:mb-3 ml-3"
                          aria-hidden="true"
                        ></div>
                      </div>
                      {showDetails ? (
                        <>
                          <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <div className="mb-2 font-semibold">
                                  🎯 Daily Target{' '}
                                  <span className="text-accents-4 text-xs">
                                    Editable By Leader
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-3">
                                  <div className="col-span-2">
                                    <Input
                                      className="text-xl font-semibold rounded"
                                      type="number"
                                      value={dailyTarget || ''}
                                      onChange={setDailyTarget}
                                    />
                                  </div>
                                  <Button
                                    className=""
                                    variant="incognito"
                                    onClick={() =>
                                      savePartyDetails(dailyTarget)
                                    }
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <div className="mb-2 font-semibold">
                                  📅 Deadline{' '}
                                  <span className="text-accents-4 text-xs">
                                    Editable By Leader
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-3">
                                  <div className="col-span-2">
                                    <Input
                                      className="text-xl font-semibold rounded"
                                      type="datetime-local"
                                      value={due_date || ''}
                                      onChange={setDue_Date}
                                    />
                                  </div>
                                  <Button
                                    className=""
                                    variant="incognito"
                                    onClick={() =>
                                      savePartyDetails(null, due_date)
                                    }
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="">
                              <div className="mb-2 font-semibold">
                                🐉 Share Your Dragon!
                              </div>
                              <div className="grid grid-cols-5 items-center gap-3">
                                <div className="col-span-4">
                                  <Input
                                    className="text-xl font-semibold rounded"
                                    value={dragon_id || ''}
                                    onChange={setDragonID}
                                  />
                                </div>
                                <Button
                                  className="col-span-1"
                                  variant="incognito"
                                  onClick={() => copyEmbedLink()}
                                >
                                  Save
                                </Button>
                              </div>
                              <div className="mt-2 flex flex-row text-sm font-semibold">
                                <div className="">{dragon_name}</div>
                                <div className="ml-2 ">
                                  <label
                                    className="cursor-pointer text-emerald-500"
                                    htmlFor="background"
                                    variant="incognito"
                                  >
                                    {uploading
                                      ? 'Uploading ...'
                                      : '🖼 Upload Image'}
                                  </label>
                                  <input
                                    type="file"
                                    id="background"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={uploadBackground}
                                    disabled={uploading}
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              className="mt-3"
                              variant="prominent"
                              onClick={() => copyEmbedLink()}
                            >
                              Start Party Quest
                            </Button>
                            <div className="text-center text-accents-4 text-sm">
                              You won't be able to change your details once the
                              party quest starts.
                            </div>
                          </div>
                        </>
                      ) : (
                        // <div className="flex flex-row items-center gap-4 text-2xl">
                        //   <div
                        //     variant="slim"
                        //     className="mt-4 w-1/2 text-center font-bold border py-2 rounded"
                        //   >
                        //     40 ⚔
                        //   </div>
                        //   <div
                        //     variant="slim"
                        //     className="mt-4 w-1/2 text-center font-bold border py-2 rounded"
                        //   >
                        //     550 💰
                        //   </div>
                        //   <div
                        //     variant="slim"
                        //     className="mt-4 w-1/2 text-center font-bold border py-2 rounded"
                        //   >
                        //     1200 XP
                        //   </div>
                        // </div>
                        <>
                          <h1 className=" rounded-lg pt-5 w-11/12 lg:w-full mx-auto text-sm font-semibold text-center lg:text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
                            <PartyStatistics
                              players={partyPlayers ? partyPlayers.length : 0}
                              wins={cumulativeWins.reduce((a, b) => a + b, 0)}
                              exp_earned={cumulativeEXP.reduce((a, b) => a + b, 0)}
                            />
                          </h1>

                          <div className="text-center text-white text-lg mb-2 font-semibold">
                            Party Missions
                          </div>
                          <div className="mb-5 max-w-lg mx-auto font-semibold shadow-lg rounded border-2 bg-emerald-100 text-emerald-700 border-emerald-500">
                            <div className="flex flex-row ml-3 gap-3">
                              <p className="text-2xl py-2 mb-1">🎯</p>
                              <p className="text-sm sm:text-lg w-full py-2 mb-1">
                                Complete {party.daily_target}{' '}
                                {party.daily_target > 1 ? 'Tasks' : 'Task'}{' '}
                                <i className="fas fa-retweet" />
                                <div className="flex flex-row mt-1">
                                  <span className="text-xs sm:text-sm font-semibold py-1 px-2 uppercase rounded-full text-emerald-700 bg-emerald-200 border border-emerald-500">
                                    0 / {dailyTarget}
                                  </span>
                                </div>
                              </p>
                              <div className="hidden sm:flex justify-center items-center gap-2 py-2">
                                <div className="px-5 rounded bg-red-200 border border-red-500 flex justify-center items-center h-16">
                                  <div className="my-auto">
                                    <div className="text-red-600 fas fa-heart text-xl" />
                                    <p className="text-red-700 text-xs text-center">
                                      +1
                                    </p>
                                  </div>
                                </div>
                                <div className="px-5 rounded bg-emerald-200 border border-emerald-500 flex justify-center items-center h-16">
                                  <div className="my-auto">
                                    <div className="text-emerald-700 text-xl">
                                      XP
                                    </div>
                                    <p className="text-emerald-700 text-xs text-center">
                                      +50
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="w-1/3 bg-dailies-light border-l-2 border-emerald-500 flex justify-center items-center px-2">
                                <p className="text-sm text-center text-emerald-600">
                                  In Progress
                                </p>
                                {/* <Button variant="prominent">Claim</Button> */}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center mt-8">
                            <div className="text-lg mb-2 font-semibold text-center">
                              How are you feeling about your adventure today?
                            </div>

                            <Button
                              className=""
                              variant="incognito"
                              ref={btnDropdownRef}
                              onClick={() => {
                                dropdownPopoverShow
                                  ? closeDropdownPopover()
                                  : openDropdownPopover();
                              }}
                            >
                              Status: Fighting{' '}
                              <i
                                className={
                                  (dropdownPopoverShow
                                    ? 'fas fa-chevron-up '
                                    : 'fas fa-chevron-down ') + 'ml-2'
                                }
                              />
                            </Button>
                            <div
                              ref={popoverDropdownRef}
                              className={
                                (dropdownPopoverShow ? 'block ' : 'hidden ') +
                                'bg-primary-2 border border-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 w-44 '
                              }
                            >
                              <a
                                onClick={() => changeEmbed(1)}
                                className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                              >
                                Fighting
                              </a>
                              <a
                                onClick={() => changeEmbed(2)}
                                className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                              >
                                Need Healing
                              </a>
                              <a
                                onClick={() => changeEmbed(2)}
                                className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                              >
                                Completed
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="animate-fade-in-up  text-xl sm:text-3xl font-bold text-center bg-gradient-to-r from-emerald-500 to-blue-500 p-3 sm:p-4">
            Leaderboard 🏆
          </h1>
          <div className="mx-5">
            {/* <div className="grid grid-cols-3 mt-8 items-center gap-3">
              <div className="col-span-2">
                <Input
                  className="text-xl font-semibold rounded"
                  value={'embed_link'}
                />
              </div>
              <Button
                className=""
                variant="slim"
                onClick={() => copyEmbedLink()}
              >
                Copy Embed Link
              </Button>
            </div> */}
            <div className="mx-auto flex flex-row max-w-screen-2xl gap-6 pt-10 mb-10 overflow-x-auto flex-nowrap lg:justify-center">
              {partyPlayers
                ? partyPlayers.map((player, i) => (
                    <CardPartyPlayer
                      key={i}
                      player={player}
                      cumulativeWins={cumulativeWins}
                      setCumulativeWins={setCumulativeWins}
                      cumulativeEXP={cumulativeEXP}
                      setCumulativeEXP={setCumulativeEXP}
                    />
                  ))
                : null}
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
              page={'parties'}
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
  return null;
}
