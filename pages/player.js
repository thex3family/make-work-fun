import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { useUser } from '@/utils/useUser';
import { postData } from '@/utils/helpers';

import { supabase } from '../utils/supabase-client';
import Datatable, { createTheme } from 'react-data-table-component';

import React from "react";

// components

import CardTable from 'components/Cards/CardTable.js';
import CardLineChart from "components/Cards/CardLineChart.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import DataTable from 'react-data-table-component';
import NotificationDropdown from '@/components/Dropdowns/TableDropdown';

function Card({ title, description, footer, children }) {
  return (
    <div className="border border-accents-1	max-w-3xl w-full p rounded-md m-auto my-8">
      <div className="px-5 py-4">
        <h3 className="text-2xl mb-1 font-medium">{title}</h3>
        <p className="text-accents-5">{description}</p>
        {children}
      </div>
      <div className="border-t border-accents-1 bg-primary-2 p-4 text-accents-3 rounded-b-md">
        {footer}
      </div>
    </div>
  );
}

createTheme('game', {
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(0,0,0,.12)',
  },
  background: {
    default: '#111111',
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#ffffff',
  },
  highlightOnHover: {
    default: "#10b981",
    text: 'rgba(255, 255, 255, 1)',
  },
  sortFocus: {
    default: 'rgba(255, 255, 255, .54)',
  },
  selected: {
    default: 'rgba(0, 0, 0, .7)',
    text: '#FFFFFF',
  },
});


export default function Player() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { userLoaded, user, session, userDetails, userOnboarding, subscription } = useUser();

  const[wins, setWins] = useState([])

  const[playerLevel, setPlayerLevel] = React.useState(null);
  const[playerName, setPlayerName] = React.useState(null);
  const[playerGold, setPlayerGold] = React.useState(null);
  const[playerEXP, setPlayerEXP] = React.useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  
  const [showModal, setShowModal] = React.useState(false);
  // const [showIntroModal, setShowIntroModal] = React.useState(false);

  const [activeType, setActiveType] = React.useState(null);
  const [activeName, setActiveName] = React.useState(null);
  const [activeUpstream, setActiveUpstream] = React.useState(null);
  const [activeDate, setActiveDate] = React.useState(null);
  const [activeGold, setActiveGold] = React.useState(null);
  const [activeEXP, setActiveEXP] = React.useState(null);

  
  const[weekWins, setWeekWins] = useState([])

  const columns = [
    {
      name: 'NAME',
      selector: 'name'
    },
    {
      name: 'TYPE',
      selector: 'type'
    },
    {
      name: 'COMPLETED',
      selector: 'closing_date',
      sortable: true
    },
    {
      name: 'TREND',
      selector: 'trend',
      sortable: true
    },
    {
      name: 'GOLD REWARD',
      selector: 'gold_reward',
      sortable: true
    },
    {
      name: 'EXP REWARD',
      selector: 'exp_reward',
      sortable: true
    },
  ];


  // Redirects user to sign in if they are not logged in yet


 useEffect(() => {
  if (!user) router.replace('/signin');
 }, [user]);

  // Waits until database fetches user state before loading anything

  useEffect(() => {
    if (userOnboarding) initializePlayer()
  }, [userOnboarding])

  // Checks if the user is ready to load

  function initializePlayer() {
    try {
        if(userOnboarding.onboarding_state.includes('4')){
          loadPlayer();
        } else {
          router.replace('/account');
        }
      } catch (error) {
          alert(error.message)
      } finally {
        console.log("InitializedPlayer")
      }
      
    }

  // If player is ready to load, go for it!

  async function loadPlayer(){
    console.log('Loading Player')
    fetchPlayerStats()
    fetchWins()
    fetchLatestWin()
    fetchWeekWins()
  }

  async function fetchWeekWins() {
    try {
      const user = supabase.auth.user()

      const { data, error } = await supabase
      .from('week_win_count')
      .select('*')
      .eq('player', user.id)
      .single()
      
      if(data){
      setWeekWins(data)
      }
      

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPlayerStats() {
    try {
      const user = supabase.auth.user()
      
      const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('player', user.id)
      .single()

      setPlayerName(data.full_name);
      setPlayerLevel(data.total_level);
      setPlayerGold(data.total_gold);
      setPlayerEXP(data.total_exp);
      setAvatarUrl(data.avatar_url);  

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      alert(error.message)
    } finally {
    }
  }

  async function fetchWins() {
    try {
      const user = supabase.auth.user()
      
      const { data, error } = await supabase
      .from('success_plan')
      .select('name, type, punctuality, closing_date, gold_reward, exp_reward, upstream, trend')
      .eq('player', user.id)
      
      setWins(data)

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      alert(error.message)
    } finally {
    }
  }

  async function fetchLatestWin() {
    try {
      const user = supabase.auth.user()
      
      const { data, error } = await supabase
      .from('success_plan')
      .select('name, type, closing_date, gold_reward, exp_reward, entered_on, upstream')
      .eq('player', user.id) 
      .order('entered_on', { ascending: false })
      .limit(1)
      .single()
      
      setShowModal(true);
      setActiveType(data.type);
      setActiveName(data.name);
      setActiveUpstream(data.upstream);
      setActiveDate(data.closing_date);
      setActiveGold(data.gold_reward);
      setActiveEXP(data.exp_reward);

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      alert(error.message)
    } finally {
    }
  }

  // specific update for avatar URL, and other stuff late

  async function updateProfile({ avatar_url }) {
    try {
      setLoading(true)
      if (userDetails) {
      const user = supabase.auth.user()
      let { error } =   await supabase
      .from('users')
      .update({
        avatar_url: avatar_url
      })
      .eq('id', user.id);

      if (error) {
        throw error
      }
    }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const modalHandler = (wins) => {
    setShowModal(true);
    setActiveType(wins.type);
    setActiveName(wins.name);
    setActiveUpstream(wins.upstream);
    setActiveDate(wins.closing_date);
    setActiveGold(wins.gold_reward);
    setActiveEXP(wins.exp_reward);
  }  

  if (loading) {
    return (
        <div className="h-screen flex justify-center">
          <LoadingDots/>
        </div>
    );
  }

  // if (showIntroModal) {
  //   return (
  //     <div className="h-screen flex justify-center">
  //         <div
  //           className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
  //           // onClick={() => setShowModal(false)}
  //         >
  //           <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen">
  //             {/*content*/}
  //             <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
  //               {/*header*/}
  //               <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-emerald-500">
  //                 <h3 className="text-2xl font-semibold text-white">
  //                 👋 Welcome. Let's get you all set up!
  //                 </h3>
                  
  //                 <button
  //                   className="p-1 ml-auto bg-transparent border-0 float-right text-2xl leading-none font-semibold outline-none focus:outline-none"
  //                   onClick={() => router.reload(window.location.pathname)}
  //                 >
  //                   <i className="fas fa-sync-alt"></i>
  //                 </button>
  //               </div>
  //               {/*body*/}
  //               <div className="relative p-6 text-blueGray-500">
  //                 <div className="my-2 flex flex-col">
  //                 {userOnboarding ? userOnboarding.onboarding_state.includes('1') ?
  //                 <div>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect To Notion
  //                 </Button>
  //                 </Link>
  //                 </div> 
  //                 : userOnboarding.onboarding_state.includes('2') ?
  //                 <div>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" disabled={true} className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect To Notion
  //                 </Button>
  //                 </Link>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect Your Database
  //                 </Button>
  //                 </Link>
  //                 </div>
  //                 :
  //                 <div>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" disabled={true} className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect To Notion
  //                 </Button>
  //                 </Link>
  //                 <Link href="/account">
  //                 <Button variant="onboarding" disabled={true} className="text-lg leading-none text-primary-2 font-bold mb-2 w-full">
  //                 <i className={"fas fa-link mr-3"}></i>
  //                 Connect Your Database
  //                 </Button>
  //                 </Link>
  //                 <a href="https://notion.so/" target="_blank">
  //                 <Button variant="onboarding" className="text-lg leading-none text-primary-2 font-bold w-full">
  //                 <i className={"fas fa-check-square mr-3"}></i>
  //                 Share A Win With Our Family
  //                 </Button>
  //                 </a>
  //                 </div>
  //                 :
  //                 <div></div>
  //                 }
  //                 </div>
  //               </div>
  //               {/*footer*/}
  //               <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
  //                 <a href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection?utm_source=family-connection"target="_blank"
  //                   className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
  //                 >
  //                   Troubleshoot
  //                 </a>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //         <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
  //         </div>
  //   );
  // }

  return (
  
  <>
    <section className="bg-black bg-player-pattern bg-fixed">
      <div className="bg-black max-w-6xl mx-auto pb-32 bg-opacity-90">
      <div className="pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col align-center">
          <h1 className="text-4xl font-extrabold text-white text-center sm:text-6xl">
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">{playerName ? (
              `${playerName ?? 'Player 1'}`
            ) : (
                <LoadingDots />
            )}!</span>
          </h1>
          <p className="mt-5 text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Are you ready for your next adventure?
          </p>
        </div>
      </div>
      <div className="max-w-6xl px-4 md:px-10 mx-auto w-full -m-24">
        
      <HeaderStats 
        full_name={playerName} 
        total_level={playerLevel} 
        total_gold={playerGold} 
        total_exp={playerEXP} 
        avatar_url={avatar_url}
        setAvatarUrl={setAvatarUrl}
        updateProfile={updateProfile}
        weekWins={weekWins}
        />
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
        {/* <CardTable color="dark" data={wins} /> */}
        <DataTable className="border"
          title="Recent Wins 👀"
          columns={columns}
          data={wins}
          onRowClicked={modalHandler}
          highlightOnHover={true}
          pointerOnHover={true}
          fixedHeader={true}
          defaultSortField="closing_date"
          defaultSortAsc={false}
          theme="game"
        />
        </div>
      </div>
      </div>
      </div>
    </section>

    {/* // Modal Section */}
    {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            // onClick={() => setShowModal(false)}
          >
            <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-emerald-500">
                  <h3 className="text-2xl font-semibold text-white">
                  🎉 You've completed a <span className="font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">{activeType}!</span>
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
                  <p className="text-2xl leading-none text-primary-2 font-bold">
                    {activeName}
                    <br />
                    <span className="text-sm">{activeUpstream}</span>
                  </p>
                  <p className="my-2 font-light text-sm">{activeDate}</p>
                  </div>
                  <table className="w-full text-xl mb-6 border text-primary-2">
                    <tbody>
                    <tr><td className="p-4 border">+{activeGold} 💰</td>
                    <td className="p-4 border">+{activeEXP} EXP</td>
                    </tr>
                    </tbody>
                  </table>
                <img src="img/celebratory-cat.gif" height="auto" className="mx-auto pb-2" />
                It's time to celebrate! 😄
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Send To Guilded
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

    
    </>
  );
}
