import React from 'react';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';
import LoadingDots from '@/components/ui/LoadingDots';
import { createPopper } from '@popperjs/core';
import CardAvatarSkeleton from '@/components/Cards/CardAvatarSkeleton';

export default function Avatar({
  statRank,
  statName,
  statLevel,
  statEXP,
  statEXPProgress,
  statLevelEXP,
  statGold,
  statWinName,
  statWinType,
  statWinGold,
  statWinEXP,
  avatar_url,
  background_url,
  statTitle,
  statEXPEarnedToday,
  statGoldEarnedToday,
}) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(
    '/background/cityscape.jpg'
  );
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (avatar_url) downloadImage(avatar_url, 'avatar');
    if (!avatar_url) setAvatarStatus('Missing');
    if (background_url) downloadImage(background_url, 'background');
  }, [avatar_url, background_url]);

  async function downloadImage(path, type) {
    setAvatarStatus(null);
    try {
      if (type === 'avatar') {
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
        setAvatarStatus('Exists');
      } else if (type === 'background') {
        const { data, error } = await supabase.storage
          .from('backgrounds')
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        setBackgroundUrl(url);
      }
    } catch (error) {
      console.log('Error downloading image: ', error.message);
    } finally {
      
    }
  }

  const statMaxLevel = '100';
  const statEXPPercent = Math.floor((statEXPProgress / statLevelEXP) * 100);

  const statArrow = 'up';
  const statPercent = '0';
  const statPercentColor = 'text-white';
  const statIconName = 'fas fa-chevron-up';
  const statIconColor = 'bg-transparent-500';

  const [popoverShow, setPopoverShow] = React.useState(false);
  const btnRef = React.createRef();
  const popoverRef = React.createRef();
  const openTooltip = () => {
    createPopper(btnRef.current, popoverRef.current, {
      placement: 'bottom'
    });
    setPopoverShow(true);
  };
  const closeTooltip = () => {
    setPopoverShow(false);
  };

  if (loading) {
    return (
      <CardAvatarSkeleton />
    );
  }

  return (
    <>
      <div className="w-full xs:w-1/2 sm:w-1/3 md:1/3 lg:w-1/4 xl:w-1/4 2xl:w-1/5 shadow-xl">
        <div className="bg-primary-2 rounded-md mx-auto overflow-hidden">
          <div
            className="rounded-tr-md rounded-tl-md w-auto bg-cover"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          >
            <div className="bg-black bg-opacity-70">
              {/* {avatarUrl ? (
        <img
          className="avatar image m-auto py-5 h-60"
          src={avatarUrl}
          alt="Avatar"
        />
      ) : (
        <img className="avatar image m-auto py-5 h-60" src='img/default_avatar.png'/>
      )} */}

              {avatarStatus == 'Exists' ? (
                <img
                  className="avatar image m-auto py-5 h-60"
                  src={avatarUrl}
                  alt="Avatar"
                />
              ) : avatarStatus == 'Missing' ? (
                <img
                  className="avatar image m-auto py-5 h-60"
                  src="img/default_avatar.png"
                  alt="Avatar"
                />
              ) : (
                <div className="flex avatar image m-auto py-5 h-60 justify-center">
                  <LoadingDots />
                </div>
              )}
            </div>
          </div>
          <div className="p-8 rounded-bl-md rounded-br-md">
            <div className="relative flex flex-wrap">
              <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                <h5 className="text-emerald-400 uppercase font-bold text-xs">
                  {statTitle ? statTitle : 'Newbie'}
                </h5>
                <p className="font-semibold text-xl text-white-700 truncate w-3/4">
                  {statName ? statName : 'Anonymous'}
                </p>
                <span className="font-semibold text-l text-white-700">
                  Level {statLevel}
                </span>
                <span className="font-semibold text-l text-blueGray-700">
                  &nbsp;/ {statMaxLevel}
                </span>
              </div>

              <div className="absolute right-0 w-auto pl-4 flex-initial">
                {statRank === 1 ? (
                  <div
                    className={
                      'text-yellow-700 p-3 bg-yellow-400 text-center inline-flex items-center justify-center w-4 h-4 border-4 border-yellow-600 shadow-lg rounded-full font-bold'
                    }
                  >
                    {statRank}
                  </div>
                ) : statRank === 2 ? (
                  <div
                    className={
                      'text-gray-600 p-3 bg-gray-300 text-center inline-flex items-center justify-center w-4 h-4 border-4 border-gray-500 shadow-lg rounded-full font-bold'
                    }
                  >
                    {statRank}
                  </div>
                ) : statRank === 3 ? (
                  <div
                    className={
                      'text-yellow-800 p-3 bg-yellow-500 text-center inline-flex items-center justify-center w-4 h-4 border-4 border-yellow-700 shadow-lg rounded-full font-bold'
                    }
                  >
                    {statRank}
                  </div>
                ) : (
                  ''
                  // <div
                  //   className={
                  //     'text-gray-400 border-gray-400 p-3 text-center inline-flex items-center justify-center w-8 h-8 border-2 shadow-lg rounded-full font-bold'
                  //   }
                  // >
                  //   {statRank}
                  // </div>
                )}
              </div>
            </div>
            <div className="font-semibold text-sm text-right -mt-3">
              {statEXP} / {statLevelEXP - statEXPProgress + statEXP} XP
            </div>
            <div className="flex flex-wrap">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <div className="flex items-center">
                  <span className="mr-2 text-emerald-500 ">
                    {statEXPPercent}%
                  </span>
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
            <div
              className="flex flex-row items-center gap-4"
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              ref={btnRef}
            >
              <div
                variant="slim"
                className="mt-4 w-1/2 text-center font-bold border py-2 rounded"
              >
                <i
                  className={
                    statGoldEarnedToday > 0
                      ? statGoldEarnedToday >= 1000
                        ? 'fas fa-angle-double-up text-emerald-500'
                        : 'fas fa-angle-up text-emerald-600'
                      : 'fas fa-grip-lines text-red-600'
                  }
                ></i>{' '}
                {statGoldEarnedToday ? +statGoldEarnedToday : 0} 💰
              </div>
              <div
                variant="slim"
                className="mt-4 w-1/2 text-center font-bold border py-2 rounded"
              >
                <i
                  className={
                    statEXPEarnedToday > 0
                      ? statEXPEarnedToday >= 1000
                        ? 'fas fa-angle-double-up text-emerald-500'
                        : 'fas fa-angle-up text-emerald-600'
                      : 'fas fa-grip-lines text-red-600'
                  }
                ></i>{' '}
                {statEXPEarnedToday ? +statEXPEarnedToday : 0} XP
              </div>
            </div>
            <div
              className={
                (popoverShow ? '' : 'hidden ') +
                'bg-primary-3 border-0 mr-3 block z-50 font-normal leading-normal text-sm max-w-xs text-left no-underline break-words rounded-lg'
              }
              ref={popoverRef}
            >
              <div>
                <div className="text-white p-3">⭐ Today's Earnings!</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="">
                <div className="">
                  <p className="text-white text-md font-semibold w-3/5">
                    Latest Win 👀
                  </p>
                  <p className="text-white text-sm truncate">{statWinName}</p>
                  <p className="text-xs mt-3 text-right">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-lightBlue-700 bg-lightBlue-200 last:mr-0 mr-1">
                      {statWinType}
                    </span>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-1">
                      +{statWinGold} 💰{' '}
                    </span>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
                      +{statWinEXP} XP
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
