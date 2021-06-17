import React from "react";
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { supabase } from '@/utils/supabase-client'
import LoadingDots from '@/components/ui/LoadingDots';

export default function Avatar({
  statName,
  statLevel,
  statEXP,
  statGold,
  statWinName,
  statWinType,
  statWinGold,
  statWinEXP,
  url
}) {

  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarStatus, setAvatarStatus] = useState(null)
  
  useEffect(() => {
    if (url) downloadImage(url)
    if (!url) setAvatarStatus('Missing')
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    } finally {
      setAvatarStatus('Exists')
    }
  }
  
  const statTitle = "Newbie";
  const statMaxLevel = "100";
  const statLevelEXP = 500*(statLevel+1);
  const statEXPPercent =  Math.round(((statEXP - (statLevel * 500)) / 500)*100);
  const statArrow = "up";
  const statPercent = "0";
  const statPercentColor = "text-white";
  const statIconName = "fas fa-chevron-up";
  const statIconColor = "bg-transparent-500";


    return (
        <>


<div className="px-8 mt-10 w-full sm:w-1/2 md:1/2 lg:w-1/3 xl:w-1/4">
<div className="bg-primary-2 rounded mx-auto">
  <div className="rounded-tr-md rounded-tl-md w-auto bg-cover bg-player-pattern">
    <div className ="rounded bg-black bg-opacity-80">
    {/* {avatarUrl ? (
        <img
          className="avatar image m-auto py-5 h-60"
          src={avatarUrl}
          alt="Avatar"
        />
      ) : (
        <img className="avatar image m-auto py-5 h-60" src='img/default_avatar.png'/>
      )} */}
      
      {avatarStatus == 'Exists' ? 
        (<img
        className="avatar image m-auto py-5 h-60"
        src={avatarUrl}
        alt="Avatar"
        />)
        : avatarStatus == 'Missing' ? 
        (<img
        className="avatar image m-auto py-5 h-60"
        src='img/default_avatar.png'
        alt="Avatar"
        />)
        : 
        (<div className="flex avatar image m-auto py-5 h-60 justify-center">
        <LoadingDots /> 
        </div>)
      }
  </div>
  </div>
  <div className="p-8 rounded-bl-md rounded-br-md">
              <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              <h5 className="text-emerald-400 uppercase font-bold text-xs">
                {statTitle}
              </h5>
              <p className="font-semibold text-xl text-white-700">
                {statName}
              </p>
              <span className="font-semibold text-l text-white-700">
                Level {statLevel} 
              </span>
              <span className="font-semibold text-l text-blueGray-700">
              &nbsp;/ {statMaxLevel}
              </span>
            </div>
            
            {/* <div className="relative w-auto pl-4 flex-initial">
              <button 
                className={
                  "text-white p-3 text-center inline-flex items-center justify-center w-10 h-10 border shadow-lg rounded-full " +
                  statIconColor
                }
              >
                <i className={statIconName}></i>
              </button>
            </div> */}
          </div>
          <div className="font-semibold text-sm text-right -mt-3">{statEXP} / {statLevelEXP} XP</div>
          <div className="flex flex-wrap">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <div className="flex items-center">
                    <span className="mr-2 text-emerald-500 ">{statEXPPercent}%</span>
                    <div className="relative w-full">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200">
                        <div
                          style={{ width: `${statEXPPercent}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                        ></div>
                      </div>
                    </div>
                  </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div variant="slim" className="mt-4 w-1/2 text-center font-bold border py-2 rounded">{statGold} 💰</div>
            <div variant="slim" className="mt-4 w-1/2 text-center font-bold border py-2 rounded">
              <span className={statPercentColor + " mr-2"}>
                <i
                  className={
                    statArrow === "up"
                      ? "fas fa-arrow-up"
                      : statArrow === "down"
                      ? "fas fa-arrow-down"
                      : ""
                  }
                ></i>{" "}
                {statPercent}%
              </span>
              
              </div>
        </div>
    <div className="mt-6">
      <div className="">
        <div className="">
          <p className="text-white text-md font-semibold w-3/5">Latest Win 👀</p>
          <p className="text-white text-sm">{statWinName}</p>
          <p className="text-xs mt-3 text-right"><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-lightBlue-700 bg-lightBlue-200 uppercase last:mr-0 mr-1">{statWinType}</span><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 uppercase last:mr-0 mr-1">+{statWinGold} 💰 </span><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">+{statWinEXP}XP</span></p>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

</>
);
}