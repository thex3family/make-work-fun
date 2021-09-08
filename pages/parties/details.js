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
  fetchPartyPlayers,
  fetchWinsPastDate,
  fetchSpecificWins,
  fetchPartyMembers
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
import AvatarPlayer from '@/components/Avatars/AvatarPlayer';
import moment from 'moment';
import ModalParty from '@/components/Modals/ModalParty';
import ValidateDragon from '@/components/Modals/ModalValidateDragon';

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
  const [dailyTarget_Achieved, setDailyTarget_Achieved] = useState(null);
  const [due_date, setDue_Date] = useState(null);
  const [dragon_name, setDragonName] = useState(null);
  const [dragon_id, setDragonID] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null);

  const [saving, setSaving] = useState(null);

  const [cumulativeWins, setCumulativeWins] = useState([0]);
  const [cumulativeEXP, setCumulativeEXP] = useState([0]);

  const [editParty, setEditParty] = useState(null);
  const [showValidateDragon, setShowValidateDragon] = useState(null);

  const [allMembersReady, setAllMembersReady] = useState(null);

  const notionLink = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
  const notionID = /^\(?([0-9a-zA-Z]{8})\)?[-. ]?([0-9a-zA-Z]{4})[-. ]?([0-9a-zA-Z]{4})[-. ]?([0-9a-zA-Z]{4})[-. ]?([0-9a-zA-Z]{12})$/;

  const [dailyTargetRewardClaimed, setDailyTargetRewardClaimed] = useState(
    false
  );

  // Waits until database fetches user state before loading anything

  useEffect(() => {
    if (userOnboarding && id) initializePlayer();
  }, [userOnboarding, id]);

  useEffect(() => {
    if (party) {
      loadPartyDetails();
      if (party.status != 1) {
        setShowDetails(false);
        checkMissionReward();
      }
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
    setPartyPlayers(await fetchPartyMembers(party.id));
    setDailyTarget(party.daily_target);
    setDue_Date(moment(party.due_date).local().format('YYYY-MM-DDTHH:mm:ss'));
    if (party.challenge == 1)
      setDailyTarget_Achieved(
        await fetchWinsPastDate(user.id, moment().local().format('YYYY-MM-DD'))
      );
    if (party.challenge == 2)
      setDailyTarget_Achieved(
        await fetchSpecificWins(
          dragon_id,
          moment().local().format('YYYY-MM-DD')
        )
      );
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
            due_date: deadline + moment().format('Z')
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
    if (partyPlayers) {
      setSpecificPartyPlayer(partyPlayers.find((x) => x.player === user.id));
      if (partyPlayers.filter((d) => d.status === 'Not Ready').length == 0) {
        setAllMembersReady(true);
      } else {
        setAllMembersReady(false);
      }
    }
  }, [partyPlayers]);

  useEffect(() => {
    if (specificPartyPlayer)
      setDragonName(specificPartyPlayer.notion_page_name);
    if (specificPartyPlayer) setDragonID(specificPartyPlayer.notion_page_id);
    if (specificPartyPlayer) setPlayerStatus(specificPartyPlayer.status);
    console.log('Specific Party Player', specificPartyPlayer);
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

  // async function uploadBackground(event) {
  //   try {
  //     setUploading(true);

  //     if (!event.target.files || event.target.files.length === 0) {
  //       throw new Error('You must select an image to upload.');
  //     }

  //     const file = event.target.files[0];
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${Math.random()}.${fileExt}`;
  //     const filePath = `${fileName}`;

  // this needs to save to backend - need to setup a new storage unit

  //     let { error: uploadError } = await supabase.storage
  //       .from('backgrounds')
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       throw uploadError;
  //     }

  //     onBackgroundUpload(filePath);
  //   } catch (error) {
  //     alert(error.message);
  //   } finally {
  //     setUploading(false);
  //   }
  // }

  useEffect(() => {
    console.log('Wins', cumulativeWins);
    console.log('EXP', cumulativeEXP);
  }, [cumulativeWins, cumulativeEXP]);

  async function changePlayerStatus(status) {
    setPlayerStatus(status);
    closeDropdownPopover();
    try {
      const { data, error } = await supabase
        .from('party_members')
        .update({
          status: status
        })
        .eq('id', specificPartyPlayer.party_member_id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      await refreshStats();
    }
  }

  async function saveDragon(database_id, party_member_id) {
    setSaving(true);
    try {
      const user = supabase.auth.user();

      // if matches a url, then change the format

      if (database_id.match(notionLink)) {
        const url = database_id;
        const url3 = url.replace(/.*[\-]/, '');
        // const url3 = url2.substring(url.lastIndexOf('/') + 1);
        database_id =
          url3.substr(0, 8) +
          '-' +
          url3.substr(8, 4) +
          '-' +
          url3.substr(12, 4) +
          '-' +
          url3.substr(16, 4) +
          '-' +
          url3.substr(20);
        setDragonID(database_id);
      }
      if (database_id.match(notionID)) {
        const { data, error } = await supabase
          .from('party_members')
          .update({ notion_page_id: database_id })
          .eq('id', specificPartyPlayer.party_member_id);

        console.log('error', data, error);
        setShowValidateDragon(true);

        if (error && status !== 406) {
          throw error;
        } else {
          changePlayerStatus('Ready');
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
      refreshStats();
    }
  }

  async function startChallenge() {
    try {
      const { data, error } = await supabase
        .from('party')
        .update({
          status: 2,
          start_date: moment().local().format('YYYY-MM-DDTHH:mm:ssZ')
        })
        .eq('id', party.id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      await refreshStats();
    }
  }

  async function checkMissionReward() {
    try {
      const user = supabase.auth.user();

      // See if reward has already been claimed
      const { data, error } = await supabase
        .from('success_plan')
        .select('*')
        .eq('party_id', party.id)
        .eq('player', user.id)
        .eq('type', 'Party Mission')
        .ilike('name', 'Daily Target')
        .gte('entered_on', moment().startOf('day').utc().format());

      if (error && status !== 406) {
        throw error;
      }
      console.log('Daily Target stuff', data);
      const fetchData = data;

      if (fetchData.length == 0) {
        setDailyTargetRewardClaimed(true);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      // How do I show the null state?
    }
  }

  async function claimMissionReward(mission_name, health_reward, exp_reward) {
    try {
      const user = supabase.auth.user();

      let testDateStr = new Date();
      // console.log('testDateStr: ' + testDateStr);

      const { data, error } = await supabase.from('success_plan').insert([
        {
          player: user.id,
          difficulty: 1,
          do_date: testDateStr,
          closing_date: testDateStr,
          trend: 'check',
          type: 'Party Mission',
          punctuality: 0,
          health_reward: health_reward,
          exp_reward: exp_reward,
          gold_reward: 0,
          name: mission_name + ' - ' + party.name
        }
      ]);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      if(mission_name == 'Daily Target') setDailyTargetRewardClaimed(true);
    }
  }

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
                    {specificPartyPlayer ? (
                      specificPartyPlayer.role == 'Party Leader' &&
                      party.status == 1 ? (
                        <div className="inline-block mx-auto md:mx-0 mt-5">
                          {/* <a href="https://makeworkfun.club" target="_blank">
                      <Button
                        className="w-auto mx-auto mr-5 my-4"
                        variant="incognito"
                      >
                        See Progress
                      </Button>
                    </a> */}
                          <Button
                            className="w-auto mx-auto md:mx-0"
                            variant="prominent"
                            onClick={() => setEditParty(true)}
                          >
                            Edit Name
                          </Button>
                        </div>
                      ) : null
                    ) : null}
                  </div>

                  <div className="w-full md:w-3/5 py-6 text-center">
                    <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 ml-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg items-center">
                      {party.status == 1 ? (
                        <>
                          {/* <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                            STATUS: In Recruitment
                          </h1>
                          {partyPlayers ? (
                            <>
                              <div className="flex flex-col space-y-4">
                                <div className="mt-4 p-3 text-left font-semibold">
                                  <div
                                    className={`
                                  ${
                                    partyPlayers.length < 2
                                      ? 'text-error'
                                      : 'text-green'
                                  }`}
                                  >
                                    <i
                                      className={`mr-2
                                  ${
                                    partyPlayers.length < 2
                                      ? 'text-error fas fa-times'
                                      : 'text-green fas fa-check'
                                  }`}
                                    />
                                    2+ party members
                                  </div>
                                  <div className="mt-5 flex flex-row justify-center flex-nowrap text-center">
                                    {partyPlayers
                                      ? partyPlayers.map((player, i) => (
                                          <AvatarPlayer
                                            key={i}
                                            player={player}
                                          />
                                        ))
                                      : null}
                                  </div>
                                </div>
                              </div> */}
                          <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                            STATUS: In Recruitment
                          </h1>
                          <h1 className="rounded-lg pt-5 w-11/12 lg:w-full mx-auto text-sm font-semibold text-center lg:text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                            <Countdown date={'2021-07-02T21:00:00-05:00'} />
                          </h1>
                          <div className="text-center text-accents-4 text-sm max-w-sm">
                            The challenge can begin when all members are ready
                            and the party leader starts! Confirm your loadout
                            below.
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
                      {party.status > 1 ? (
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
                      ) : null}
                      {showDetails && specificPartyPlayer ? (
                        <>
                          <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-5">
                              <div className="col-span-2 sm:col-span-1">
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
                                      min="0"
                                      max="10"
                                      onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                          event.preventDefault();
                                        }
                                      }}
                                      value={dailyTarget || ''}
                                      onChange={setDailyTarget}
                                      disabled={
                                        (specificPartyPlayer.role !=
                                          'Party Leader' &&
                                          party.status == 1) ||
                                        party.status > 1
                                      }
                                    />
                                  </div>
                                  <Button
                                    className=""
                                    variant="incognito"
                                    onClick={() =>
                                      savePartyDetails(dailyTarget)
                                    }
                                    disabled={
                                      (specificPartyPlayer.role !=
                                        'Party Leader' &&
                                        party.status == 1) ||
                                      party.status > 1
                                    }
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>

                              <div className="col-span-2 sm:col-span-1">
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
                                      disabled={
                                        (specificPartyPlayer.role !=
                                          'Party Leader' &&
                                          party.status == 1) ||
                                        party.status > 1
                                      }
                                    />
                                  </div>
                                  <Button
                                    className=""
                                    variant="incognito"
                                    onClick={() =>
                                      savePartyDetails(null, due_date)
                                    }
                                    disabled={
                                      (specificPartyPlayer.role !=
                                        'Party Leader' &&
                                        party.status == 1) ||
                                      party.status > 1
                                    }
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="">
                              {party.challenge == 1 ? (
                                <div className="text-emerald-600 border-2 bg-emerald-100 border-emerald-700 rounded p-3 mb-3 font-semibold">
                                  <i className="fas fa-clock mr-2" />
                                  This is a time challenge! Once the challenge
                                  starts, all wins that you do will count
                                  towards the challenge.
                                </div>
                              ) : (
                                <>
                                  <div className="text-emerald-600 border-2 bg-emerald-100 border-emerald-700 rounded p-3 mb-3 font-semibold">
                                    <i className="fas fa-dragon mr-2" />
                                    This is a dragon quest! Tell your party
                                    members what project you're fighting, and
                                    we'll pull wins downstream.
                                  </div>

                                  <div className="mt-2 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
                                    <p className="font-semibold w-full sm:w-auto">
                                      🐉 Share Your Dragon!
                                    </p>
                                    <a
                                      className="text-right font-semibold text-emerald-500"
                                      href="https://academy.co-x3.com/en/articles/5547184-what-are-party-quests#h_2fb532658e"
                                      target="_blank"
                                    >
                                      Where do I find this?
                                    </a>
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
                                      onClick={() => saveDragon(dragon_id)}
                                      disabled={saving}
                                    >
                                      {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                  </div>
                                  <div className="mt-2 flex flex-row text-sm font-semibold">
                                    <div className="">{dragon_name}</div>
                                    {/* <div className="ml-2 ">
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
                                </div> */}
                                  </div>
                                </>
                              )}
                            </div>
                            {party.status == 1 ? (
                              party.challenge == 1 ? (
                                <Button
                                  className="mt-3"
                                  variant="prominent"
                                  onClick={() => changePlayerStatus('Ready')}
                                  disabled={
                                    specificPartyPlayer.status == 'Ready'
                                  }
                                >
                                  <i className="fas fa-check mr-2" />
                                  I'm Ready!
                                </Button>
                              ) : null
                            ) : null}
                            {party.status == 1 ? (
                              specificPartyPlayer ? (
                                specificPartyPlayer.role == 'Party Leader' ? (
                                  <Button
                                    className=""
                                    variant="prominent"
                                    onClick={() => startChallenge()}
                                    disabled={!allMembersReady}
                                  >
                                    Start Party Quest
                                  </Button>
                                ) : null
                              ) : null
                            ) : null}
                            <div className="text-center text-accents-4 text-sm">
                              You won't be able to change your details once the
                              party quest starts.
                            </div>
                          </div>
                        </>
                      ) : party.status > 1 ? (
                        <>
                          <h1 className=" rounded-lg pt-5 w-11/12 lg:w-full mx-auto text-sm font-semibold text-center lg:text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
                            <PartyStatistics
                              players={partyPlayers ? partyPlayers.length : 0}
                              wins={cumulativeWins.reduce((a, b) => a + b, 0)}
                              exp_earned={cumulativeEXP.reduce(
                                (a, b) => a + b,
                                0
                              )}
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
                                    {dailyTarget_Achieved
                                      ? dailyTarget_Achieved.length
                                      : 0}{' '}
                                    / {party.daily_target}
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
                                {dailyTarget_Achieved ? dailyTarget_Achieved.length >= party.daily_target ? (
                                  dailyTargetRewardClaimed ? (
                                    <Button variant="prominent" disabled={true}>
                                      Claimed
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="prominent"
                                      onClick={() =>
                                        claimMissionReward(
                                          'Daily Target',
                                          '1',
                                          '50'
                                        )
                                      }
                                    >
                                      Claim
                                    </Button>
                                  )
                                ) : (
                                  <p className="text-sm text-center text-emerald-600">
                                    In Progress
                                  </p>
                                ) : <p className="text-sm text-center text-emerald-600">
                                In Progress
                              </p>}
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
                              Status: {playerStatus}{' '}
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
                                onClick={() => changePlayerStatus('Fighting')}
                                className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                              >
                                Fighting
                              </a>
                              <a
                                onClick={() =>
                                  changePlayerStatus('Need Healing')
                                }
                                className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                              >
                                Need Healing
                              </a>
                              {party.challenge == 2 ? (
                                <a
                                  onClick={() =>
                                    changePlayerStatus('Dragon Slain')
                                  }
                                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                                >
                                  Dragon Slain
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="mx-auto flex flex-row max-w-screen-2xl gap-6 pt-10 mb-10 justify-center">
                          <LoadingDots />
                        </div>
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
            {partyPlayers ? (
              <div
                className={`mx-auto flex flex-row max-w-screen-2xl gap-6 pt-10 mb-10 overflow-x-auto flex-nowrap ${
                  partyPlayers.length >= 3 ? '' : 'lg:justify-center'
                }`}
              >
                {partyPlayers.map((player, i) => (
                  <CardPartyPlayer
                    key={i}
                    player={player}
                    cumulativeWins={cumulativeWins}
                    setCumulativeWins={setCumulativeWins}
                    cumulativeEXP={cumulativeEXP}
                    setCumulativeEXP={setCumulativeEXP}
                    party={party}
                  />
                ))}
              </div>
            ) : (
              <div className="mx-auto flex flex-row max-w-screen-2xl gap-6 pt-10 mb-10 justify-center">
                <LoadingDots />
              </div>
            )}
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

        {editParty ? (
          <ModalParty setCreateParty={setEditParty} party={party} />
        ) : null}
        {showValidateDragon ? (
          <ValidateDragon
            specificPartyPlayer={specificPartyPlayer}
            setShowValidateDragon={setShowValidateDragon}
          />
        ) : null}
      </>
    );
  }
  return (
    <section className="justify-center">
      <div className="animate-fade-in-up max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Party Not Found
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Looks like we stumbled into unknown territory here.
          </p>
        </div>
        <img className="w-3/5 m-auto" src="/img/notfound.png" />
        <Link href="/parties">
          <Button className="w-auto mx-auto my-10" variant="prominent">
            Explore All Parties
          </Button>
        </Link>
      </div>
    </section>
  );
}
