import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { supabase } from '../utils/supabase-client';
import { userContent } from '@/utils/useUser';
import { useRouter } from 'next/router';
import CardParty from '@/components/Cards/CardParty';
import Kanban from '@/components/Parties/Kanban';
import RecruitingBoard from '@/components/Parties/RecruitingBoard';
import { triggerWinModal } from '@/components/Modals/ModalHandler';
import {
  fetchAllParties,
  fetchAllTimeStatsForPlayer,
  fetchPlayerStats
} from '@/components/Fetch/fetchMaster';
import { downloadImage } from '@/utils/downloadImage';
import ModalParty from '@/components/Modals/ModalParty';
import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import PartiesSkeleton from '@/components/Skeletons/PartiesSkeleton';
import DataTable, { createTheme } from 'react-data-table-component';
import RecentWinsSkeleton from '@/components/Skeletons/RecentWinsSkeleton';
import moment from 'moment';
import ModalOnboarding from '@/components/Modals/ModalOnboarding';
import { Tooltip } from '@mantine/core';

createTheme('game', {
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(0,0,0,.12)'
  },
  background: {
    default: '#111111'
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF'
  },
  divider: {
    default: '#ffffff'
  },
  button: {
    default: '#FFFFFF',
    focus: 'rgba(255, 255, 255, .54)',
    hover: 'rgba(255, 255, 255, .12)',
    disabled: 'rgba(255, 255, 255, .18)'
  },
  highlightOnHover: {
    default: '#9CA3AF15',
    text: 'rgba(255, 255, 255, 1)'
  },
  sortFocus: {
    default: 'rgba(255, 255, 255, .54)'
  },
  selected: {
    default: 'rgba(0, 0, 0, .7)',
    text: '#FFFFFF'
  }
});

export default function parties({ metaBase, setMeta, refreshChildStats, setRefreshChildStats }) {
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
  const [playerAllTimeStats, setPlayerAllTimeStats] = useState(null);

  const [backgroundUrl, setBackgroundUrl] = useState('/');

  const { user, userLoaded, userDetails, userOnboarding } = userContent();
  const [createParty, setCreateParty] = useState(null);

  const [activeTab, setActiveTab] = useState(1);

  const [allParties, setAllParties] = useState(null);

  const [newToSeason, setNewToSeason] = useState(null);

  const { tab } = router.query;

  useEffect(() => {
    if (tab == 'active') {
      setActiveTab(1);
    }
    if (tab == 'leaderboard') {
      setActiveTab(2);
    }
  }, []);


  async function changeTab(tab_id) {
    if (tab_id == 1) {
      router.push(`parties/?tab=active`, undefined, { shallow: true })
    }
    if (tab_id == 2) {
      router.push(`parties/?tab=leaderboard`, undefined, { shallow: true })
    }
    setActiveTab(tab_id);
  }

  // sets the meta tags

  useEffect(() => {
    const meta = {
      title: 'Parties - ' + metaBase.titleBase,
      description: 'Do tasks with your friends and get extra points!'
    }
    setMeta(meta)
  }, []);


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
      // alert(error.message);
      console.log(error.message);
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
  }

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats(null, setNewToSeason));
    setPlayerAllTimeStats(await fetchAllTimeStatsForPlayer());
    setLoading(false);
    setAllParties(await fetchAllParties());
  }

  useEffect(() => {
    if (refreshChildStats) {
      refreshStats();
      setRefreshChildStats(false);
    }
  }, [refreshChildStats]);

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
        .neq('party_status', 4)
        .eq('player', user.id);

      var parties_you_are_in = data;

      // // only use the parties that are in progress
      // setActiveParties(parties_you_are_in.filter((party) => party.status == 2));

      setActiveParties(parties_you_are_in);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
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
        .or('status.eq.1,status.eq.2')
        .order('status', { ascending: true })

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

  const NameCustom = (row) => (
    <div data-tag="allowRowEvents" className="text-left w-96">
      <p className="font-semibold text-sm mb-1 truncate w-full">
        {row.name}
      </p>
      <div data-tag="allowRowEvents">
        {row.challenge == 1 ? (
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-pink-600 bg-pink-200 last:mr-0 mr-1 mb-1">
            ⏱ Time Challenge
          </span>
        ) : row.challenge == 2 ? (
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-indigo-600 bg-indigo-200 last:mr-0 mr-1 mb-1">
            🐉 Slay Your Dragon
          </span>
        ) : (
          ''
        )}
      </div>
    </div>
  );
  const RankCustom = (row) => (
    <div
      data-tag="allowRowEvents"
      className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200"
    >
      {
        row.status >= 3 ?
          "A"
          : "-"
      }

    </div>
  );
  const DateCustom = (row) => (
    <div data-tag="allowRowEvents" className="text-left w-48">
      <div data-tag="allowRowEvents">
        {row.start_date
          ? moment(row.start_date).local().format('YYYY-MM-DD hh:mm a')
          : 'In Recruitment'}
      </div>{' '}
      <div data-tag="allowRowEvents">
        {moment(row.due_date).local().format('YYYY-MM-DD hh:mm a')}
      </div>
    </div>
  );
  const StatusCustom = (row) => (
    <div data-tag="allowRowEvents" className="text-left">
      <div>
        {row.status == 1 ? (
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-red-600 bg-red-200">
            Recruiting
          </span>
        ) : row.status == 2 ? (
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200">
            In Progress
          </span>
        ) : row.status == 3 ? (
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-purple-600 bg-purple-200">
            In Review
          </span>
        ) : (
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
            Complete
          </span>
        )}
      </div>
    </div>
  );

  async function goToDetails(row) {
    router.push("/parties/details/?id=" + row.slug);
  }

  const columns = [
    {
      name: 'RANK',
      selector: 'rank',
      center: true,
      maxWidth: '25px',
      cell: (row) => <RankCustom {...row} />
    },
    {
      name: 'PARTY',
      selector: 'name',
      cell: (row) => <NameCustom {...row} />,
      grow: 2
    },
    {
      name: 'QUEST DURATION',
      selector: 'start_date',
      right: true,
      sortable: true,
      cell: (row) => <DateCustom {...row} />
    },
    {
      name: 'STATUS',
      cell: (row) => <StatusCustom {...row} />,
      center: true,
      grow: 2
    }

  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: 'red',
        backgroundImage: 'linear-gradient(to right, #10b981, #3b82f6)',
        minHeight: '48px',
        borderRadius: '6px 6px 0 0',
        paddingLeft: '8px',
        paddingRight: '8px'
      }
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: 600,
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    },
    rows: {
      style: {
        minHeight: '72px', // override the row height
        paddingLeft: '8px',
        paddingRight: '8px'
      }
    }
  };

  if (!playerStats) {
    return (
      <>
        <PartiesSkeleton />
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
        className="animate-slow-fade-in justify-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="max-w-6xl mx-auto py-0 sm:py-8 md:pt-24 px-0 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up bg-dailies-default rounded-0 sm:rounded opacity-95">
            <div className="pb-5 py-10 px-4">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies">
                Party Quests
              </h1>
              <p className="mt-5 text-xl text-dailies text-center sm:text-2xl max-w-2xl m-auto">
                Do tasks with your friends and get extra points!
                <a
                  href="https://academy.co-x3.com/make-work-fun-app/aXV29eQnHfmsNGacNfqLUz/what-are-party-quests-in-make-work-fun/acWsZEpEicSEFgJPRfid4d?utm_source=makeworkfun"
                  target="_blank"
                  className="ml-1.5 text-xl fas fa-question-circle"
                />
              </p>
            </div>

            <div className="text-center bg-black bg-opacity-90 py-10 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-14">
              <div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 w-full rounded-0 sm:rounded-xl sm:max-w-md h-14 align-middle shadow-xl grid grid-cols-2 place-items-center text-lg fontmedium px-2 gap-2">
                <div
                  className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 1
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                    : 'text-blueGray-500'
                    }`}
                  onClick={() => changeTab(1)}
                >
                  My Parties
                </div>
                <div
                  className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 2
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                    : 'text-blueGray-500'
                    }`}
                  onClick={() => changeTab(2)}
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
                    {activeParties?.length != 0 ?
                      <section className="mb-8">
                        <div className="flex items-center">
                          <div
                            className="border-t-2 border-white flex-grow mb-6 sm:mb-3 mr-3"
                            aria-hidden="true"
                          ></div>
                          <h2 className="mx-auto text-3xl align-middle justify-center inline-flex font-bold text-primary mb-5">
                            Your Active Parties{' '}
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

                          {activeParties?.map((party) => (
                            <CardParty key={party.id} party={party} />
                          ))}

                        </div>
                      </section>
                      : "You do not have any active parties."}
                    <div className="text-center my-5">
                      <Tooltip
                        placement="center"
                        label="Your all-time level must be at least level 10"
                        withArrow
                        arrowSize={3}
                        disabled={playerAllTimeStats && playerAllTimeStats.current_level >= 10}
                      >
                        <Button
                          onClick={() => setCreateParty(true)}
                          className="px-5 font-bold py-2 rounded"
                          variant="dailies"
                          disabled={playerAllTimeStats && playerAllTimeStats.current_level < 10}
                        >
                          <i className="text-yellow-500 fas fa-crown mr-2" />
                          Create Party
                        </Button>
                      </Tooltip>
                    </div>
                    <section>
                      <div className="flex items-center mt-4">
                        <div
                          className="border-t-2 border-white flex-grow mt-2 mr-3"
                          aria-hidden="true"
                        ></div>
                        <h2 className="text-3xl align-middle justify-center inline-flex font-bold text-primary">
                          Join A Party
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
                  {allParties ? (
                    <>
                      <div className="flex flex-wrap mt-4">
                        <div className="w-full pb-12 px-4">
                          {/* <CardTable color="dark" data={wins} /> */}
                          <DataTable
                            className=""
                            title="Recent Wins 👀"
                            noHeader
                            columns={columns}
                            data={allParties}
                            // highlightOnHover={true}
                            pointerOnHover={true}
                            fixedHeader={true}
                            onRowClicked={goToDetails}
                            customStyles={customStyles}
                            pagination={true}
                            theme="game"
                            paginationPerPage={5}
                            paginationRowsPerPageOptions={[5, 10, 15, 20]}
                          />
                          {/* <TailwindTable wins={wins} /> */}
                        </div>
                      </div>
                      <div className="font-semibold">
                        More Features Coming Soon!
                      </div>
                    </>
                  ) : (
                    <RecentWinsSkeleton />
                  )}
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
        destination: '/signin?redirect=parties',
        permanent: false
      }
    };
  }

  return {
    props: { user }
  };
}
