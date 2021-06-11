import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { useUser } from '@/utils/useUser';
import { postData } from '@/utils/helpers';

import { supabase } from '../utils/supabase-client';
import Datatable, { createTheme } from 'react-data-table-component';

import Avatar from '@/components/avatar';

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userLoaded, user, session, userDetails, subscription } = useUser();

  const[wins, setWins] = useState([])

  const[playerLevel, setPlayerLevel] = React.useState(false);
  const[playerGold, setPlayerGold] = React.useState(false);
  const[playerEXP, setPlayerEXP] = React.useState(false);
  
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState(false);
  const [activeName, setActiveName] = React.useState(false);
  const [activeDate, setActiveDate] = React.useState(false);
  const [activeGold, setActiveGold] = React.useState(false);
  const [activeEXP, setActiveEXP] = React.useState(false);
  
  const [avatar_url, setAvatarUrl] = React.useState(false);

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
      name: 'PUNCTUALITY',
      selector: 'punctuality'
    },
    {
      name: 'COMPLETED',
      selector: 'closing_date',
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


  const subscriptionName = subscription && subscription.prices.products.name;
  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription.prices.currency,
      minimumFractionDigits: 0
    }).format(subscription.prices.unit_amount / 100);


  
  useEffect(() => {
    if (!user) router.replace('/signin');
  }, [user]);


  useEffect(() => {
    if (user) fetchPlayerStats()
    if (user) fetchWins()
    if (user) fetchLatestWin()
  }, [])

  async function fetchPlayerStats() {
    try {
      setLoading(true)
      const user = supabase.auth.user()
      console.log('leaderboard');
      const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('player', user.id)
      .single()

      console.log(data);

      setPlayerLevel(data.total_level);
      setPlayerGold(data.total_exp);
      setPlayerEXP(data.total_gold);

    

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWins() {
    try {
      setLoading(true)
      const user = supabase.auth.user()
      
      const { data, error } = await supabase
      .from('success_plan')
      .select('name, type, punctuality, closing_date, gold_reward, exp_reward')
      .eq('player', user.id)

      setWins(data)

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLatestWin() {
    try {
      setLoading(true)
      const user = supabase.auth.user()
      
      const { data, error } = await supabase
      .from('success_plan')
      .select('name, type, punctuality, closing_date, gold_reward, exp_reward, entered_on')
      .eq('player', user.id) 
      .order('entered_on', { ascending: false })
      .limit(1)
      .single()
      
      setShowModal(true);
      setActiveType(data.type);
      setActiveName(data.name);
      setActiveDate(data.closing_date);
      setActiveGold(data.gold_reward);
      setActiveEXP(data.exp_reward);

    if (error && status !== 406) {
            throw error
    }

    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ avatar_url }) {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      const updates = {
        id: user.id,
        avatar_url
      }
      console.log('5users');
      let { error } = await supabase.from('users').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
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
    setActiveDate(wins.closing_date);
    setActiveGold(wins.gold_reward);
    setActiveEXP(wins.exp_reward);
  }  


  return (

  <>
    <section className="bg-black bg-player-pattern bg-fixed">
      <div className="bg-black max-w-6xl mx-auto pb-32 bg-opacity-90">
      <div className="pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col align-center">
          <h1 className="text-4xl font-extrabold text-white text-center sm:text-6xl">
            Welcome, <span className="text-emerald-500">{userDetails ? (
              `${userDetails?.full_name ?? 'Player 1'}`
            ) : (
                <LoadingDots />
            )}!</span>
          </h1>
          <p className="mt-5 text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Are you ready for your next adventure?
          </p>
        </div>
      </div>
      <div className="form-widget">
    {/* Add to the body */}
    <Avatar
      url={avatar_url}
      size={150}
      onUpload={(url) => {
        setAvatarUrl(url)
        updateProfile({ avatar_url: url })
      }}
    />
    {/* ... */}
  </div>
      <div className="max-w-6xl px-4 md:px-10 mx-auto w-full -m-24">
      <HeaderStats 
        full_name={userDetails?.full_name} 
        total_level={playerLevel} 
        total_gold={playerGold} 
        total_exp={playerEXP} />
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
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
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
                    {/* <br />
                    <span className="text-sm">📁 Personal Life Management</span> */}
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
