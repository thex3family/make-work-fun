import { downloadImage } from '@/utils/downloadImage';
import { useState, useEffect } from 'react';
import { fetchSpecificWins, fetchWinsPastDate } from '../Fetch/fetchMaster';
import LoadingDots from '../ui/LoadingDots';

export default function CardPartyPlayer({
  player,
  cumulativeWins,
  setCumulativeWins,
  cumulativeEXP,
  setCumulativeEXP,
  party,
  specificPartyPlayer
}) {
  const [openTab, setOpenTab] = useState(1);
  const [avatarURL, setAvatarURL] = useState(null);
  const [wins, setWins] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(
    '/background/cityscape.jpg'
  );

  const [dragonBGUrl, setDragonBGUrl] = useState('');
  const [totalGold_Reward, setTotalGold_Reward] = useState(null);
  const [totalEXP_Reward, setTotalEXP_Reward] = useState(null);

  const health = player.health * 10;

  useEffect(() => {
    loadAvatarURL();
    if (party.status != 1) loadWins();
    if (player.background_url) setBackgroundUrl(player.background_url);
    if (player.dragon_bg_url) {
      setDragonBGUrl(player.dragon_bg_url);
    } else {
      if (party.challenge == 1) {
        setDragonBGUrl('/challenge/rush.jpg');
      } else if (party.challenge == 2) {
        setDragonBGUrl('/challenge/skyrim.jpg');
      }
    }
  }, []);

  async function loadAvatarURL() {
    if (player.avatar_url) {
      setAvatarURL(player.avatar_url);
    } else {
      setAvatarURL('Missing');
    }
  }

  async function loadWins() {
    if (party.challenge == 1)
      setWins(await fetchWinsPastDate(player.player, party.start_date));
    if (party.challenge == 2)
      setWins(await fetchSpecificWins(player.notion_page_id, party.start_date));
  }

  useEffect(() => {
    if (wins)
      setTotalGold_Reward(wins.reduce((a, v) => (a = a + v.gold_reward), 0));
    if (wins)
      setTotalEXP_Reward(wins.reduce((a, v) => (a = a + v.exp_reward), 0));
  }, [wins]);

  useEffect(() => {
    if (totalGold_Reward)
      setCumulativeWins((cumulativeWins) => [...cumulativeWins, wins.length]);
    if (totalEXP_Reward)
      setCumulativeEXP((cumulativeEXP) => [...cumulativeEXP, totalEXP_Reward]);
  }, [totalEXP_Reward]);

  return (
    <>
      <div className="w-full xs:w-1/2 sm:w-1/2 md:1/3 lg:w-1/3 xl:w-1/4 mb-5 flex-none">
        <div className="bg-primary-2 rounded-md mx-auto overflow-hidden flex flex-row shadow-xl">
          <div
            className="rounded-tl-md rounded-bl-md w-1/3 bg-cover bg-center flex-shrink-0 "
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          >
            <div className="bg-black bg-opacity-70 h-full flex">
              {avatarURL == 'Missing' ? (
                <img
                  className="avatar image mx-auto px-2 object-contain"
                  src="../img/default_avatar.png"
                  alt="Avatar"
                />
              ) : avatarURL ? (
                <img
                  className="avatar image mx-auto px-2 object-contain"
                  src={avatarURL}
                  alt="Avatar"
                />
              ) : (
                <div className="flex justify-center avatar image mx-auto px-2 object-contain">
                  <LoadingDots />
                </div>
              )}
            </div>
          </div>
          <div className="p-8 w-full">
            <div className="relative flex flex-wrap">
              <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                <h5 className="text-emerald-400 uppercase font-bold text-xs">
                  {player.role ? player.role : 'Adventurer'}
                </h5>
                <p className="font-semibold text-xl text-white-700 truncate w-32">
                  {player.full_name}
                </p>
              </div>

              {/* <div className="absolute right-0 w-auto pl-4 flex-initial">
                <div
                  className={
                    'text-yellow-700 p-2 text-xs bg-yellow-400 text-center inline-flex items-center justify-center w-4 h-4 border-4 border-yellow-600 shadow-lg rounded-full font-bold'
                  }
                >
                  1
                </div>
              </div> */}
            </div>
            <div className="flex flex-wrap pt-2">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <div className="flex items-center">
                  <i
                    className={`mr-2 fas fa-heart ${
                      health >= 75
                        ? 'text-emerald-500'
                        : health >= 50
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  />
                  <div className="relative w-full">
                    <div
                      className={`overflow-hidden h-2 text-xs flex rounded ${
                        health >= 75
                          ? 'bg-emerald-200'
                          : health >= 50
                          ? 'bg-yellow-200'
                          : 'bg-red-200'
                      }`}
                    >
                      <div
                        style={{ width: `${health}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          health >= 75
                            ? 'bg-emerald-500'
                            : health >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary-2 rounded-md mx-auto overflow-hidden shadow-xl mt-5">
          <div
            className="bg-cover bg-center"
            style={{ backgroundImage: `url(${dragonBGUrl})` }}
          >
            <div className="bg-black bg-opacity-80 h-full flex">
              <div className="px-8 py-5 w-full">
                <div className="relative flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-emerald-400 uppercase font-bold text-xs mb-1">
                      Status:
                      <span
                        className={`text-xs ml-1 font-semibold inline-block py-0.5 px-1.5 uppercase rounded ${
                          player.status == 'Fighting'
                            ? 'text-indigo-600 bg-indigo-200'
                            : player.status == 'Need Healing'
                            ? 'text-red-600 bg-red-200'
                            : 'text-emerald-600 bg-emerald-200'
                        }`}
                      >
                        {player.status}
                      </span>
                    </h5>
                    {party.challenge == 1 ? null : party.challenge == 2 ? (
                      <>
                        <p className="font-semibold text-xl text-white-700 truncate block">
                          {player.notion_page_name ? (
                            player.notion_page_name
                          ) : (
                            <span className="text-red-500 ">
                              <i className="mr-2 fas fa-times" />
                              Not Shared Yet!
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-semibold text-accents-3">
                          {player.notion_page_id ? (
                            <a
                              href={`https://notion.so/${player.notion_page_id.replaceAll(
                                '-',
                                ''
                              )}`}
                              target="_blank"
                            >
                              Page ID: {player.notion_page_id}
                            </a>
                          ) : (
                            'Page ID: N/A'
                          )}
                        </p>{' '}
                      </>
                    ) : null}
                    <div className="flex flex-row items-center gap-4">
                      <div
                        variant="slim"
                        className="mt-4 w-1/2 text-center font-bold border py-1.5 rounded"
                      >
                        {wins ? wins.length : 0} ⚔
                      </div>
                      <div
                        variant="slim"
                        className="mt-4 w-1/2 text-center font-bold border py-1.5 rounded"
                      >
                        {totalGold_Reward ? totalGold_Reward : 0} 💰
                      </div>
                      <div
                        variant="slim"
                        className="mt-4 w-1/2 text-center font-bold border py-1.5 rounded"
                      >
                        {totalEXP_Reward ? totalEXP_Reward : 0} XP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {party.status > 1 && specificPartyPlayer ? (
          <>
            <ul
              className="max-w-screen-lg mx-auto flex mb-0 mt-6 list-none flex-row"
              role="tablist"
            >
              <li className="flex-auto text-center mr-1 w-1/2">
                <a
                  className={
                    'text-xs font-bold uppercase px-5 py-2 shadow-lg rounded block leading-normal ' +
                    (openTab === 1
                      ? 'bg-emerald-500 border-emerald-700'
                      : 'text-blueGray-600 bg-white ')
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenTab(1);
                  }}
                  data-toggle="tab"
                  href="#link1"
                  role="tablist"
                >
                  Completed
                  <div
                    className={
                      'text-white ml-1 text-center inline-flex items-center justify-center relative leading-tight font-bold text-xs ' +
                      (openTab === 1
                        ? 'border-white'
                        : 'text-blueGray-600 border-blueGray-600')
                    }
                  >
                    {wins ? wins.length : null}
                  </div>
                </a>
              </li>
              <li className="ml-2 flex-auto text-center w-1/2">
                <a
                  className={
                    'text-xs font-bold uppercase px-5 py-2 shadow-lg rounded block leading-normal ' +
                    (openTab === 2
                      ? 'bg-yellow-500 border-yellow-700'
                      : 'text-blueGray-600 bg-white')
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenTab(2);
                  }}
                  data-toggle="tab"
                  href="#link2"
                  role="tablist"
                >
                  Incomplete
                  <div
                    className={
                      'text-white ml-1 text-center inline-flex items-center justify-center relative leading-tight font-bold text-xs ' +
                      (openTab === 2
                        ? 'border-white'
                        : 'text-blueGray-600 border-blueGray-600')
                    }
                  ></div>
                </a>
              </li>
            </ul>
            <div
              className={openTab === 1 ? 'flex flex-col gap-2 pt-2' : 'hidden'}
              id="link1"
            >
              {wins
                ? wins.slice(0,5).map((win, i) => (
                    <div className="relative text-sm font-semibold px-3 py-2 shadow-lg rounded border-2 bg-emerald-100 text-emerald-700 border-emerald-500">
                      <p className="truncate w-full">{win.name}</p>
                      <div className="flex flex-row mt-1">
                        <span className="text-xs font-semibold py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200">
                          +{win.gold_reward} 💰{' '}
                        </span>
                        <span className="text-xs font-semibold ml-2 py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                          +{win.exp_reward} XP{' '}
                        </span>
                      </div>
                    </div>
                  ))
                : null}
            </div>
            <div
              className={openTab === 2 ? 'flex flex-col gap-2 pt-2' : 'hidden'}
              id="link2"
            >
              {/* <div className="text-sm font-semibold px-3 py-2 shadow-lg rounded border-2 bg-yellow-100 text-yellow-700 border-yellow-500">
            <p className="truncate w-full">
              Figure out how to handle scope creep for seasons, ideally they can
              be automated
            </p>
            <div className="flex flex-row mt-1">
              <span className="text-xs font-semibold py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200">
                +150 💰{' '}
              </span>
              <span className="text-xs font-semibold ml-2 py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                +50 XP{' '}
              </span>
            </div>
          </div> */}
              <div className="text-sm font-semibold px-3 py-2 shadow-lg rounded border-2 bg-yellow-100 text-yellow-700 border-yellow-500">
                <p className="truncate w-full text-center">
                  Feature Coming Soon!
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
