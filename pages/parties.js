import React from 'react';
import { useState, useEffect } from 'react';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { supabase } from '../utils/supabase-client';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import CardParty from '@/components/Cards/CardParty';
import Kanban from '@/components/Parties/Kanban';
import RecruitingBoard from '@/components/Parties/RecruitingBoard';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import {
  fetchLatestWin,
  fetchPlayerStats
} from '@/components/Fetch/fetchMaster';
import { downloadImage } from '@/utils/downloadImage';
import ModalParty from '@/components/Modals/ModalParty';
import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import PartiesSkeleton from '@/components/Skeletons/PartiesSkeleton';

export default function parties() {
  const [activeParties, setActiveParties] = useState(null);
  const [recruitingParties, setRecruitingParties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partyLimit, setPartyLimit] = useState(false);
  const [partyLimitNo, setPartyLimitNo] = useState(3);

  const router = useRouter();
  const [levelUp, setLevelUp] = useState(false);

  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);

  const [backgroundUrl, setBackgroundUrl] = useState('/');

  const { user, userLoaded, session, userDetails, userOnboarding } = useUser();
  const [createParty, setCreateParty] = useState(null);

  const [activeTab, setActiveTab] = useState(1);

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
    fetchActiveParties();
    fetchRecruitingParties();
    refreshStats();
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
    setLoading(false);
  }

  useEffect(() => {
    if (playerStats) loadBackgroundURL();
    if (playerStats?.role?.includes('Party Leader')) {
      setPartyLimitNo(5);
    } else {
      setPartyLimitNo(3);
    }
  }, [playerStats]);

  async function loadBackgroundURL() {
    if (playerStats.background_url) {
      setBackgroundUrl(
        await downloadImage(playerStats.background_url, 'background')
      );
    } else {
      setBackgroundUrl('/background/great-hall.jpg');
    }
  }

  useEffect(() => {
    if (activeParties?.length >= partyLimitNo) setPartyLimit(true);
  }, [partyLimitNo]);

  async function fetchActiveParties() {
    try {
      const user = supabase.auth.user();

      // get the parties that the user is a part of and return the associated party properties instead
      // Note: Related table column values are returned as objects. ex. For the party's id, you will get { id: {id: 2} }
      // const { data, error } = await supabase
      //   .from('party_members')
      //   .select(
      //     'id: party (id), name: party (name), challenge: party(challenge), description: party(description), due_date: party(due_date), status: party(status), start_date: party(start_date), slug: party(slug), health'
      //   )
      //   .eq('player', user.id);

      // // Put the data into the right format
      // var parties_you_are_in = data.map((party) => {
      //   return {
      //     id: party.id.id,
      //     name: party.name.name,
      //     description: party.description.description,
      //     challenge: party.challenge.challenge,
      //     status: party.status.status,
      //     start_date: party.start_date.start_date,
      //     due_date: party.due_date.due_date,
      //     slug: party.slug.slug,
      //     health: party.health
      //     // party_members: party.party_members.party_members,
      //   };
      // });

      const { data, error } = await supabase
        .from('party_member_details')
        .select('*')
        .order('party_status', { ascending: true })
        .eq('player', user.id);

      var parties_you_are_in = data;

      // // only use the parties that are in progress
      // setActiveParties(parties_you_are_in.filter((party) => party.status == 2));

      console.log("Active Parties:", parties_you_are_in);

      setActiveParties(parties_you_are_in);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // async function fetchPartyMemberAvatarURLs(party_id) {
  //   var party_members_avatar_urls = [];

  //   try {
  //     const { data, error } = await supabase
  //       .from('party_members')
  //       .select('player_avatar_url: users (avatar_url)')
  //       .eq('party_id', party_id);

  //     party_members_avatar_urls = data.map((member) => {
  //       return member.player_avatar_url.avatar_url;
  //     });

  //     if (error && status !== 406) {
  //       throw error;
  //     }
  //   } catch (error) {
  //     // alert(error.message)
  //   } finally {
  //     setLoading(false);
  //     return party_members_avatar_urls;
  //   }
  // }

  // async function addChallengeNameAndMemberAvatars(recruitingParties) {
  //   for (var i = 0; i < recruitingParties.length; i++) {
  //     var tempParty = recruitingParties[i];
  //     var member_avatar_urls = await fetchPartyMemberAvatarURLs(tempParty.id);
  //     recruitingParties[i] = {
  //       ...tempParty,
  //       member_avatar_urls: member_avatar_urls
  //     };
  //   }

  //   return recruitingParties.map((party) => {
  //     return { ...party, challenge_name: party.challenge_name.name };
  //   });
  // }

  async function fetchRecruitingParties() {
    try {
      const { data, error } = await supabase
        .from('party')
        .select('*')
        .eq('status', 1);

      var recruitingParties = data;

      // recruitingParties = await addChallengeNameAndMemberAvatars(
      //   recruitingParties
      // );

      setRecruitingParties(recruitingParties);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  // if (loading) {
  //   return(
  //     <LoadingDots />
  //   );
  // }

  if (!playerStats) {
    return (
        <PartiesSkeleton/>
    );
  }

  return (
    <>
      <section
        className="animate-slow-fade-in justify-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="max-w-6xl mx-auto py-0 sm:py-8 sm:pt-24 px-0 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded-0 sm:rounded opacity-95">
            <div className="pb-5 py-10 px-4">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies">
                Party Quests
              </h1>
              <p className="mt-5 text-xl text-dailies text-center sm:text-2xl max-w-2xl m-auto">
                Do tasks with your friends and get extra points!
                <a
                  href="https://academy.co-x3.com/en/articles/5547184-what-is-the-party-quests-feature"
                  target="_blank"
                  className="ml-1.5 text-xl fas fa-question-circle"
                />
              </p>
            </div>

            <div className="text-center bg-black bg-opacity-90 py-10 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-14">
              <div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 rounded-0 sm:rounded-xl max-w-md h-14 align-middle shadow-xl grid grid-cols-2 place-items-center text-lg fontmedium px-2 gap-2">
                <div
                  className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${
                    activeTab == 1
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                      : 'text-blueGray-500'
                  }`}
                  onClick={() => setActiveTab(1)}
                >
                  My Parties
                </div>
                <div
                  className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${
                    activeTab == 2
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                      : 'text-blueGray-500'
                  }`}
                  onClick={() => setActiveTab(2)}
                >
                  Leaderboard
                </div>
              </div>
              {/* <section className="mb-8">
                <div className="flex items-center">
                  <div
                    className="border-t-2 border-dailies-dark flex-grow mb-6 sm:mb-3 mr-3"
                    aria-hidden="true"
                  ></div>
                  <h2 className="mx-auto text-3xl align-middle justify-center inline-flex font-bold text-dailies mb-5">
                    Active Parties{' '}
                    <span className="align-middle my-auto ml-2 px-3 py-1 shadow-md bg-white rounded-full text-lg">
                      {activeParties ? activeParties.length : 0}
                    </span>
                  </h2>
                  <div
                    className="border-t-2 border-dailies-dark flex-grow mb-6 sm:mb-3 ml-3"
                    aria-hidden="true"
                  ></div>
                </div>

                
              </section> */}

              {activeTab == 1 ? (
                <>
                  <div className="animate-fade-in">
                    <div className="text-center mb-5">
                      <Button
                        onClick={() => setCreateParty(true)}
                        className="px-5 font-bold py-2 rounded"
                        variant="dailies"
                        disabled={
                          !partyLimit
                            ? playerStats
                              ? playerStats.role
                                ? !playerStats.role.includes('Party Leader')
                                : true
                              : true
                            : true
                        }
                      >
                        <i className="text-yellow-500 fas fa-crown mr-2" />
                        Create Party
                      </Button>
                      <div className="mt-1 text-xs text-accents-4">
                        For Party Leaders Only!
                      </div>
                    </div>
                    <section className="mb-8">
                      <div className="flex items-center">
                        <div
                          className="border-t-2 border-white flex-grow mb-6 sm:mb-3 mr-3"
                          aria-hidden="true"
                        ></div>
                        <h2 className="mx-auto text-3xl align-middle justify-center inline-flex font-bold text-primary mb-5">
                          Your Parties{' '}
                          <span className="align-middle my-auto ml-2 px-3 py-1 border-2 shadow-md border-emerald-700 bg-emerald-300 text-emerald-700 rounded-full text-lg">
                            {activeParties ? activeParties.length : 0}/
                            {partyLimitNo}
                          </span>
                        </h2>
                        <div
                          className="border-t-2 border-white flex-grow mb-6 sm:mb-3 ml-3"
                          aria-hidden="true"
                        ></div>
                      </div>
                      <div className="flex flex-col gap-4">
                        {
                          activeParties ? (activeParties.length != 0 ? (
                            activeParties.map((party) => (
                              <CardParty key={party.party_id} party={party} />
                            ))
                          ) : (
                            <div className="border border-accents-4 mx-auto p-4 font-semibold text-dailies">
                              You aren't a part of any parties.
                            </div>
                          )) : null
                        }
                      </div>
                    </section>
                    <section>
                      <div className="flex items-center mt-4">
                        <div
                          className="border-t-2 border-white flex-grow mt-2 mr-3"
                          aria-hidden="true"
                        ></div>
                        <h2 className="text-3xl align-middle justify-center inline-flex font-bold text-primary">
                          Parties Recruiting
                        </h2>
                        <div
                          className="border-t-2 border-white flex-grow mt-2 ml-3"
                          aria-hidden="true"
                        ></div>
                      </div>
                      {/* {recruitingParties ? (
                <Kanban recruitingParties={recruitingParties} />
              ) : null} */}
                      {recruitingParties && activeParties ? (
                        <RecruitingBoard
                          partyLimit={partyLimit}
                          recruitingParties={recruitingParties}
                          activePartiesID={activeParties.map(function (el) {
                            return el.party_id;
                          })}
                        />
                      ) : null}
                    </section>
                  </div>
                </>
              ) : (
                <div className="animate-fade-in">
                  <div className="font-semibold">Feature Coming Soon!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {createParty ? <ModalParty setCreateParty={setCreateParty} /> : null}
    </>
  );
}

export async function getServerSideProps({ req }) {
  // Get the user's session based on the request
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    };
  }

  return {
    props: { user }
  };
}
