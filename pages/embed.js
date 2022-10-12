import { useState, useEffect, createRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import React from 'react';

import { supabase } from '@/utils/supabase-client';
import { createPopper } from '@popperjs/core';

import { userContent } from '@/utils/useUser';
import { useRouter } from 'next/router';

import DataTable, { createTheme } from 'react-data-table-component';
import {
  fetchPlayers,
  fetchFriendships,
  fetchFriendshipLink,
  fetchAuthenticationLink
} from '@/components/Fetch/fetchMaster';

function Feature({ name, status }) {
  return (
    <div
      className={`cursor-not-allowed inline-flex items-center justify-center px-2 py-2 leading-none border-2 rounded ${status
        ? 'text-gray-700 bg-gray-100 border-gray-500'
        : 'text-gray-700 bg-gray-100 border-gray-500'
        }`}
    >
      <i
        className={`mr-2 ${status ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
          }`}
      />
      {name}
    </div>
  );
}

export default function embed({ metaBase, setMeta }) {
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [friends, setFriends] = useState(false);
  const [embed_link, setEmbedLink] = useState(null);
  const [copyText, setCopyText] = useState('Copy');
  const [embedComponent, setEmbedComponent] = useState(1);
  const { user } = userContent();
  const router = useRouter();
  const [win, setWin] = useState(true);
  const [lvl, setLvl] = useState(true);
  const [activeTab, setActiveTab] = useState('private');

  const { component } = router.query;

  // sets the meta tags

  useEffect(() => {
    const meta = {
      title: 'Embed - ' + metaBase.titleBase,
      description: 'Generate embeddable components to interact with your avatar in your Notion pages and website!'
    }
    setMeta(meta)
  }, []);

  useEffect(() => {
    if (component == 'player-details') {
      setEmbedComponent(1);
    }
    if (component == 'player-card') {
      setEmbedComponent(2);
    }
    if (component == 'dailies') {
      setEmbedComponent(3);
    }
    if (component == 'recent-wins') {
      setEmbedComponent(4);
    }
  }, []);


  async function handleEmbedLink() {
    var t = window.location.href;
    if (embedComponent == 1 && activeTab == 'private') {
      if (detailsAuthLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/player-details?auth=${detailsAuthLink}`;
        if (win) {
          embed_link_temp = embed_link_temp + '&win=true';
        }
        if (lvl) {
          embed_link_temp = embed_link_temp + '&lvl=true';
        }
      } else {
        var embed_link_temp = '/embed/player-details?display=demo';
      }
    }
    if (embedComponent == 1 && activeTab == 'public') {
      if (detailsPublicAuthLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/player-details-public?auth=${detailsPublicAuthLink}`;
      } else {
        var embed_link_temp = '/embed/player-details-public?display=demo&hideWinManage=true';
      }
    }
    if (embedComponent == 2) {
      if (!friends) {
        if (cardAuthLink) {
          var embed_link_temp = `${t.substr(
            0,
            t.lastIndexOf('/')
          )}/embed/player-card?auth=${cardAuthLink}`;
        } else {
          var embed_link_temp = '/embed/player-card?display=demo';
        }
      } else {
        if (friendshipLink) {
          var embed_link_temp = `${t.substr(
            0,
            t.lastIndexOf('/')
          )}/embed/player-card?id=${friendshipLink.id}`;
        }
      }
    }
    if (embedComponent == 3) {
      if (dailiesAuthLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/dailies?auth=${dailiesAuthLink}`;

        if (win) {
          embed_link_temp = embed_link_temp + '&win=true';
        }
        if (lvl) {
          embed_link_temp = embed_link_temp + '&lvl=true';
        }
      } else {
        var embed_link_temp = '/embed/dailies?display=demo';
      }
    }

    if (embedComponent == 4 && activeTab == 'private') {
      if (winsAuthLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/recent-wins?auth=${winsAuthLink}`;

        if (win) {
          embed_link_temp = embed_link_temp + '&win=true';
        }
        if (lvl) {
          embed_link_temp = embed_link_temp + '&lvl=true';
        }
      } else {
        var embed_link_temp = '/embed/recent-wins?display=demo';
      }
    }
    
    if (embedComponent == 4 && activeTab == 'public') {
      if (winsPublicAuthLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/recent-wins-public?auth=${winsPublicAuthLink}`;
      } else {
        var embed_link_temp = '/embed/recent-wins-public?display=demo&hideWinManage=true';
      }
    }

    if (dark) {
      embed_link_temp = embed_link_temp + '&style=dark';
    }

    setEmbedLink(embed_link_temp);
  }

  async function copyEmbedLink() {
    navigator.clipboard.writeText(embed_link);
    setCopyText('Copied!');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    setCopyText('Copy');
  }

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

  async function changeEmbed(embed_id, embed_url) {
    closeDropdownPopover();
    setEmbedComponent(embed_id);
    router.push(`embed/?component=${embed_url}`, undefined, { shallow: true })
  }

  // friendship table
  const [players, setPlayers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [friendshipLink, setFriendshipLink] = useState(null);
  const [saving, setSaving] = useState(null);
  const [generating, setGenerating] = useState(null);

  // AuthLinks
  const [dailiesAuthLink, setDailiesAuthLink] = useState(null);
  const [detailsAuthLink, setDetailsAuthLink] = useState(null);
  const [detailsPublicAuthLink, setDetailsPublicAuthLink] = useState(null);
  const [cardAuthLink, setCardAuthLink] = useState(null);
  const [winsAuthLink, setWinsAuthLink] = useState(null);
  const [winsPublicAuthLink, setWinsPublicAuthLink] = useState(null);

  useEffect(() => {
    if (user) handleEmbedLink(dark);
  }, [user, dark, embedComponent, activeTab, friends, friendshipLink, win, lvl, dailiesAuthLink, detailsAuthLink, detailsPublicAuthLink, cardAuthLink, winsAuthLink, winsPublicAuthLink]);

  useEffect(() => {
    fetchPlayers(setPlayers);
    fetchFriendships(setFriendships);
    fetchFriendshipLink(setFriendshipLink);
    fetchAuthenticationLink('dailies', setDailiesAuthLink, setLoading);
    fetchAuthenticationLink('player-details', setDetailsAuthLink, setLoading);
    fetchAuthenticationLink('player-details-public', setDetailsPublicAuthLink, setLoading);
    fetchAuthenticationLink('player-card', setCardAuthLink, setLoading);
    fetchAuthenticationLink('recent-wins', setWinsAuthLink, setLoading);
    fetchAuthenticationLink('recent-wins-public', setWinsPublicAuthLink, setLoading);
  }, []);

  useEffect(() => {
    if (friendshipLink) updateFriendshipLink(friendships, friendshipLink.id);
    setSaving(false);
  }, [friendships]);

  useEffect(() => {
    setGenerating(false);
  }, [friendshipLink, dailiesAuthLink, detailsAuthLink, detailsPublicAuthLink, cardAuthLink, winsAuthLink, winsPublicAuthLink]);

  const columns = [
    {
      name: 'Player Name',
      selector: 'full_name',
      cell: (row) => <NameCustom {...row} />,
      grow: 2
    },
    {
      name: 'Friend Status',
      cell: (row) => <FriendCustom {...row} />,
      sortable: true,
      compact: true
    }
  ];

  const NameCustom = (row) => (
    <div data-tag="allowRowEvents" className="">
      <p
        data-tag="allowRowEvents"
        className="font-semibold text-sm mb-1 truncate"
      >
        {row.full_name}
      </p>
      {/* <p
        data-tag="allowRowEvents"
        className="text-sm px-2 inline-flex font-semibold rounded bg-emerald-100 text-emerald-800"
      >
        {row.player}
      </p> */}
    </div>
  );

  const FriendCustom = (row) => (
    <div data-tag="allowRowEvents">
      {friendships.includes(row.player) ? (
        <Button
          variant="prominent"
          data-tag="allowRowEvents"
          className="font-semibold text-sm"
          onClick={() => removeFriend(row.player)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Remove'}
        </Button>
      ) : (
        <Button
          variant="incognito"
          data-tag="allowRowEvents"
          className="font-semibold text-sm"
          onClick={() => addFriend(row.player)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Add Friend'}
        </Button>
      )}
    </div>
  );

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
        minHeight: '60px', // override the row height
        paddingLeft: '8px',
        paddingRight: '8px'
      }
    }
  };

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

  const [filterText, setFilterText] = useState('');
  // const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const filteredItems = players.filter(
    (player) =>
      player.full_name &&
      player.full_name.toLowerCase().includes(filterText.toLowerCase())
  );

  async function addFriend(friend_id) {
    setSaving(true);
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase.from('friendships').insert([
        {
          user: user.id,
          friend: friend_id
        }
      ]);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      fetchPlayers(setPlayers);
      fetchFriendships(setFriendships);
    }
  }

  async function removeFriend(friend_id) {
    setSaving(true);
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('friendships')
        .delete()
        .eq('user', user.id)
        .eq('friend', friend_id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      fetchPlayers(setPlayers);
      fetchFriendships(setFriendships);
    }
  }

  async function generateFriendshipLink(friendships) {
    setGenerating(true);
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase.from('friendship_links').insert([
        {
          user: user.id,
          friends: friendships
        }
      ]);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      fetchFriendshipLink(setFriendshipLink);
    }
  }

  async function updateFriendshipLink(friendships, friendshipLink_id) {
    try {
      let { error } = await supabase
        .from('friendship_links')
        .update({
          friends: friendships
        })
        .eq('id', friendshipLink_id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      reloadIframe('player-card');
    }
  }

  async function deleteFriendshipLink(friendships) {
    setGenerating(true);
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('friendship_links')
        .delete()
        .eq('user', user.id)
        .eq('friends', friendships);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      setFriendshipLink(null);
      reloadIframe('player-card');
    }
  }

  // generate secret link

  async function generateSecretLink(utility) {
    setGenerating(true);
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase.from('authentication_links').insert([
        {
          user: user.id,
          utility: utility
        }
      ]);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      fetchAuthenticationLink(utility, utility == 'dailies' ? setDailiesAuthLink : utility == 'player-details' ? setDetailsAuthLink : utility == 'player-details-public' ? setDetailsPublicAuthLink : utility == 'player-card' ? setCardAuthLink : utility == 'recent-wins' ? setWinsAuthLink : utility == 'recent-wins-public' ? setWinsPublicAuthLink : null, setLoading);
    }
  }

  async function deleteSecretLink(utility) {
    setGenerating(true);
    try {
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('authentication_links')
        .delete()
        .eq('user', user.id)
        .eq('utility', utility);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      if (utility == 'dailies') {
        setDailiesAuthLink(null)
      }
      if (utility == 'player-details') {
        setDetailsAuthLink(null)
      }
      if (utility == 'player-details-public') {
        setDetailsPublicAuthLink(null)
      }
      if (utility == 'player-card') {
        setCardAuthLink(null)
      }
      if (utility == 'recent-wins') {
        setWinsAuthLink(null)
      }
      if (utility == 'recent-wins-public') {
        setWinsPublicAuthLink(null)
      }
      reloadIframe(utility);
    }
  }

  async function reloadIframe(utility) {
    var iframe = document.getElementById(utility);
    if (iframe) {
      iframe.src = iframe.src;
    }
  }

  return (
    <>
      <section className="animate-slow-fade-in bg-fixed bg-cover bg-center">
        <div className="max-w-6xl mx-auto pt-8 md:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                Generate Embeddable Components
              </h1>
              <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto mb-2">
                to interact with your avatar in your Notion pages and website!
              </p>
              <a href="https://academy.co-x3.com/en/articles/5882142-how-can-i-embed-the-make-work-fun-app-into-notion-or-my-websites" target="_blank" className="text-lg text-emerald-600 font-semibold hideLinkBorder">
                Learn More
              </a>
            </div>
            <div className="relative w-auto pl-4 flex-initial mb-4">
              <button
                className="text-lg font-semibold button primary block cursor-pointer py-2 rounded outline-none border border-accents-4 mt-6 w-1/2 md:w-full lg:w-1/4 mx-auto focus:outline-none"
                type="button"
                ref={btnDropdownRef}
                onClick={() => {
                  dropdownPopoverShow
                    ? closeDropdownPopover()
                    : openDropdownPopover();
                }}
              >
                {embedComponent == 1 ? 'Player Details' : embedComponent == 2 ? 'Player Card' : embedComponent == 3 ? 'Dailies' : 'Recent Wins'}
                <i
                  className={
                    (dropdownPopoverShow
                      ? 'fas fa-chevron-up '
                      : 'fas fa-chevron-down ') + 'ml-2'
                  }
                />
              </button>
              <div
                ref={popoverDropdownRef}
                className={
                  (dropdownPopoverShow ? 'block ' : 'hidden ') +
                  'bg-blueGray-900 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 w-36 '
                }
              >
                <a
                  onClick={() => changeEmbed(1, 'player-details')}
                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                >
                  Player Details
                </a>
                <a
                  onClick={() => changeEmbed(2, 'player-card')}
                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                >
                  Player Card
                </a>
                <a
                  onClick={() => changeEmbed(3, 'dailies')}
                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                >
                  Dailies
                </a>
                <a
                  onClick={() => changeEmbed(4, 'recent-wins')}
                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                >
                  Recent Wins
                </a>
              </div>
            </div>
            {embedComponent == 1 ? (
              <div className="my-6">
                <div className="text-center bg-black bg-opacity-90 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-14">
                  <div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 w-full rounded-0 sm:rounded-xl sm:max-w-md h-14 align-middle shadow-xl grid grid-cols-2 place-items-center text-lg fontmedium px-2 gap-2">
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 'private'
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => setActiveTab('private')}
                    >
                      Private 🔒
                    </div>
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 'public'
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => setActiveTab('public')}
                    >
                      Public 🌍
                    </div>
                  </div>
                </div>
                {activeTab == 'private' ?
                  <>
                    <div className='px-4 pt-4 mb-4 rounded border-2 border-gray-500'>
                      <div className="text-lg mb-4 font-semibold text-accents-4">
                        Customization Options
                      </div>
                      <div className="flex flex-row flex-wrap mb-4 text-xl font-semibold gap-2">
                        <button
                          onClick={() => setDark(dark ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${dark
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Dark Mode
                        </button>
                        <button
                          onClick={() => setWin(win ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${win
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${win ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Win Notification
                        </button>
                        <button
                          onClick={() => setLvl(lvl ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${lvl
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${lvl ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Level Up Notification
                        </button>
                      </div>
                      <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                        <Feature name="Avatar" status={true} />
                        <Feature name="Areas Of Competence" status={true} />
                        <Feature name="Player Stats" status={true} />
                        <Feature name="Manage Titles" status={true} />
                        <Feature name="Energy Tracker" status={true} />
                        <Feature name="Week's Wins" status={true} />
                        <Feature name="Item Shop" status={true} />
                        <Feature name="Item Notification" status={true} />
                      </div>
                    </div>

                    {!detailsAuthLink ?
                      <div className="mb-6 items-center w-full">
                        <Button
                          className="w-full"
                          variant="slim"
                          onClick={() => generateSecretLink('player-details')}
                          disabled={generating || loading}
                        >
                          {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                        </Button>
                      </div> :
                      <div className="mb-6">
                        <div className="grid grid-cols-8 items-center gap-3">
                          <div className="col-span-4">
                            <Input
                              className="text-xl font-semibold rounded"
                              value={embed_link}
                            />
                          </div>
                          <Button
                            className="col-span-3"
                            variant="slim"
                            onClick={() => copyEmbedLink()}
                            disabled={generating}
                          >
                            {copyText}
                          </Button>
                          <Button
                            className="col-span-1"
                            variant="delete"
                            onClick={() => deleteSecretLink('player-details')}
                            disabled={generating}
                          >
                            <i className='fas fa-trash-alt text-white' />
                          </Button>
                        </div>
                        {/* {detailsAuthLink ? (
                      <>
                        <div className='flex-row flex gap-1'><div className='text-accents-4 mt-2 font-semibold'>With power comes great responsibility! To invalidate this link,</div>
                          <button
                            onClick={() => deleteSecretLink('player-details')}
                            className="text-red-500 mt-2 font-semibold"
                            disabled={generating}
                          >
                            {generating ? 'deleting...' : 'click here.'}
                          </button></div></>
                    ) : null} */}
                      </div>}
                  </>
                  :
                  null
                }
                {activeTab == 'public' ?
                  <>
                    <div className='px-4 pt-4 mb-4 rounded border-2 border-gray-500'>
                      <div className="text-lg mb-4 font-semibold text-accents-4">
                        Customization Options
                      </div>
                      <div className="flex flex-row flex-wrap mb-4 text-xl font-semibold gap-2">
                        <button
                          onClick={() => setDark(dark ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${dark
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Dark Mode
                        </button>
                      </div>
                      <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                        <Feature name="Avatar" status={true} />
                        <Feature name="Areas Of Competence" status={true} />
                        <Feature name="Player Stats" status={true} />
                        <Feature name="Week's Wins" status={true} />
                      </div>
                    </div>

                    {!detailsPublicAuthLink ?
                      <div className="mb-6 items-center w-full">
                        <Button
                          className="w-full"
                          variant="slim"
                          onClick={() => generateSecretLink('player-details-public')}
                          disabled={generating || loading}
                        >
                          {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                        </Button>
                      </div> :
                      <div className="mb-6">
                        <div className="grid grid-cols-8 items-center gap-3">
                          <div className="col-span-4">
                            <Input
                              className="text-xl font-semibold rounded"
                              value={embed_link}
                            />
                          </div>
                          <Button
                            className="col-span-3"
                            variant="slim"
                            onClick={() => copyEmbedLink()}
                            disabled={generating}
                          >
                            {copyText}
                          </Button>
                          <Button
                            className="col-span-1"
                            variant="delete"
                            onClick={() => deleteSecretLink('player-details-public')}
                            disabled={generating}
                          >
                            <i className='fas fa-trash-alt text-white' />
                          </Button>
                        </div>
                        {/* {detailsAuthLink ? (
                     <>
                       <div className='flex-row flex gap-1'><div className='text-accents-4 mt-2 font-semibold'>With power comes great responsibility! To invalidate this link,</div>
                         <button
                           onClick={() => deleteSecretLink('player-details')}
                           className="text-red-500 mt-2 font-semibold"
                           disabled={generating}
                         >
                           {generating ? 'deleting...' : 'click here.'}
                         </button></div></>
                   ) : null} */}
                      </div>}
                  </>
                  :
                  null}
                <div className="flex items-center mt-6 mb-3">
                  <div
                    className="border-t border-accents-2 flex-grow mr-3"
                    aria-hidden="true"
                  ></div>
                  <div className="text-accents-4">Preview</div>
                  <div
                    className="border-t border-accents-2 flex-grow ml-3"
                    aria-hidden="true"
                  ></div>
                </div>
                <iframe
                  id="player-details"
                  className="w-full"
                  height="650"
                  src={embed_link}
                />
              </div>
            ) : null}
            {embedComponent == 2 ?
              (
                <div className="my-6">
                  <div className='px-4 pt-4 mb-4 rounded border-2 border-gray-500'>
                    <div className="text-lg mb-4 font-semibold text-accents-4">
                      Customization Options
                    </div>
                    <div className="flex flex-row flex-wrap mb-4 text-xl font-semibold gap-2">
                      <button
                        onClick={() => setDark(dark ? false : true)}
                        className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${dark
                          ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                          : 'text-red-700 bg-red-100 border-2 border-red-500'
                          }`}
                      >
                        <i
                          className={`mr-2 ${dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                            }`}
                        />
                        Dark Mode
                      </button>
                      <button
                        onClick={() => setFriends(friends ? false : true)}
                        className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${friends
                          ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                          : 'text-red-700 bg-red-100 border-2 border-red-500'
                          }`}
                      >
                        <i
                          className={`mr-2 ${friends ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                            }`}
                        />
                        Show Friends
                      </button>
                    </div>

                    {friends ? (
                      <>
                        <div className="mb-6 items-center w-full">
                          <Input
                            className="text-xl font-semibold rounded"
                            id="search"
                            type="text"
                            placeholder="Add someone from the family as a friend!"
                            value={filterText || ''}
                            onChange={setFilterText}
                          />
                        </div>
                        <div className="flex flex-wrap mt-4 mb-8">
                          <div className="w-full">
                            {/* <CardTable color="dark" data={wins} /> */}
                            <DataTable
                              className=""
                              title="Friendships"
                              noHeader
                              columns={columns}
                              data={filteredItems}
                              // subHeader
                              // subHeaderComponent={subHeaderComponentMemo}
                              // highlightOnHover={true}
                              // pointerOnHover={true}
                              fixedHeader={true}
                              customStyles={customStyles}
                              pagination={true}
                              paginationPerPage={3}
                              paginationRowsPerPageOptions={[3, 5, 10]}
                              theme="game"
                            />
                            {/* <TailwindTable wins={wins} /> */}
                          </div>
                        </div>
                      </>
                    ) : null}
                    <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                      <Feature name="Player Card" status={true} />
                      <Feature name="Today's Earnings" status={true} />
                      <Feature name="Latest Win" status={true} />
                      <Feature name="Recent Win Announcement" status={true} />
                    </div>

                  </div>
                  {friends ?
                    (!friendshipLink ? (
                      // if friends but no link
                      <div className="items-center w-full">
                        <Button
                          className="w-full"
                          variant="slim"
                          onClick={() => generateFriendshipLink(friendships)}
                          disabled={generating || !friendships}
                        >
                          {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                        </Button>
                      </div>
                    ) :
                      // if friends and have friendship link
                      <div className="">
                        <div className="grid grid-cols-8 items-center gap-3">
                          <div className="col-span-4">
                            <Input
                              className="text-xl font-semibold rounded"
                              value={embed_link}
                            />
                          </div>
                          <Button
                            className="col-span-3"
                            variant="slim"
                            onClick={() => copyEmbedLink()}
                            disabled={generating}
                          >
                            {copyText}
                          </Button>
                          <Button
                            className="col-span-1"
                            variant="delete"
                            onClick={() => deleteFriendshipLink(friendships)}
                            disabled={generating}
                          >
                            <i className='fas fa-trash-alt text-white' />
                          </Button>
                        </div>
                        {/* 
                        <button
                          onClick={() => deleteFriendshipLink(friendships)}
                          className="text-red-500 mt-2 mr-5 font-semibold"
                          disabled={generating}
                        >
                          {generating ? 'Deleting...' : 'Delete Generated Link'}
                        </button> */}
                      </div>
                    ) : (
                      // if not friends
                      !cardAuthLink ?
                        <div className="items-center w-full">
                          <Button
                            className="w-full"
                            variant="slim"
                            onClick={() => generateSecretLink('player-card')}
                            disabled={generating || loading}
                          >
                            {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                          </Button>
                        </div>
                        :
                        <div className="">
                          <div className="grid grid-cols-8 items-center gap-3">
                            <div className="col-span-4">
                              <Input
                                className="text-xl font-semibold rounded"
                                value={embed_link}
                              />
                            </div>
                            <Button
                              className="col-span-3"
                              variant="slim"
                              onClick={() => copyEmbedLink()}
                              disabled={generating}
                            >
                              {copyText}
                            </Button>
                            <Button
                              className="col-span-1"
                              variant="delete"
                              onClick={() => deleteSecretLink('player-card')}
                              disabled={generating}
                            >
                              <i className='fas fa-trash-alt text-white' />
                            </Button>
                          </div>
                          {/* {cardAuthLink ? (
                          <button
                            onClick={() => deleteSecretLink('player-card')}
                            className="text-red-500 mt-2 mr-5 font-semibold"
                            disabled={generating}
                          >
                            {generating ? 'Deleting...' : 'Delete Generated Link'}
                          </button>
                        ) : null} */}
                        </div>
                    )}
                  {friends && !friendshipLink ? null : (
                    <div className="overflow-x-auto">
                      <div className="flex items-center mt-6 mb-3">
                        <div
                          className="border-t border-accents-2 flex-grow mr-3"
                          aria-hidden="true"
                        ></div>
                        <div className="text-accents-4">Preview</div>
                        <div
                          className="border-t border-accents-2 flex-grow ml-3"
                          aria-hidden="true"
                        ></div>
                      </div>
                      <iframe
                        id="player-card"
                        className={`resize ${friends ? null : 'lg:w-96'}`}
                        width={'1280'}
                        scrolling={'yes'}
                        height={`${friends ? '650' : '610'}`}
                        src={embed_link}
                      />
                    </div>
                  )}
                </div>
              ) : null}

            {embedComponent == 3 ?
              // dailies component
              <div className="my-6">
                <div className='px-4 pt-4 mb-4 rounded border-2 border-gray-500'>
                  <div className="text-lg mb-4 font-semibold text-accents-4">
                    Customization Options
                  </div>
                  <div className="flex flex-row flex-wrap mb-4 text-xl font-semibold gap-2">
                    <button
                      onClick={() => setDark(dark ? false : true)}
                      className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${dark
                        ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                        : 'text-red-700 bg-red-100 border-2 border-red-500'
                        }`}
                    >
                      <i
                        className={`mr-2 ${dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                          }`}
                      />
                      Dark Mode
                    </button>
                    <button
                      onClick={() => setWin(win ? false : true)}
                      className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${win
                        ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                        : 'text-red-700 bg-red-100 border-2 border-red-500'
                        }`}
                    >
                      <i
                        className={`mr-2 ${win ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                          }`}
                      />
                      Win Notification
                    </button>
                    <button
                      onClick={() => setLvl(lvl ? false : true)}
                      className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${lvl
                        ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                        : 'text-red-700 bg-red-100 border-2 border-red-500'
                        }`}
                    >
                      <i
                        className={`mr-2 ${lvl ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                          }`}
                      />
                      Level Up Notification
                    </button>
                  </div>
                  <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                    <Feature name="Manage Dailies" status={true} />
                    <Feature name="Track Dailies" status={true} />
                  </div>
                </div>

                {!dailiesAuthLink ?
                  <div className="mb-6 items-center w-full">
                    <Button
                      className="w-full"
                      variant="slim"
                      onClick={() => generateSecretLink('dailies')}
                      disabled={generating || loading}
                    >
                      {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                    </Button>
                  </div> :
                  <div className="mb-8">
                    <div className="grid grid-cols-8 items-center gap-3">
                      <div className="col-span-4">
                        <Input
                          className="text-xl font-semibold rounded"
                          value={embed_link}
                        />
                      </div>
                      <Button
                        className="col-span-3"
                        variant="slim"
                        onClick={() => copyEmbedLink()}
                        disabled={generating}
                      >
                        {copyText}
                      </Button>
                      <Button
                        className="col-span-1"
                        variant="delete"
                        onClick={() => deleteSecretLink('dailies')}
                        disabled={generating}
                      >
                        <i className='fas fa-trash-alt text-white' />
                      </Button>

                    </div>
                    {/* 
                      {dailiesAuthLink ? (
                        <button
                          onClick={() => deleteSecretLink('dailies')}
                          className="text-red-500 mt-2 mr-5 font-semibold"
                          disabled={generating}
                        >
                          {generating ? 'Deleting...' : 'Delete Generated Link'}
                        </button>
                      ) : null} 
                    */}
                  </div>
                }

                <div className="flex items-center mt-6 mb-3">
                  <div
                    className="border-t border-accents-2 flex-grow mr-3"
                    aria-hidden="true"
                  ></div>
                  <div className="text-accents-4">Preview</div>
                  <div
                    className="border-t border-accents-2 flex-grow ml-3"
                    aria-hidden="true"
                  ></div>
                </div>
                <iframe
                  id="dailies"
                  className="w-full resize"
                  height="650"
                  src={embed_link}
                />
              </div>
              : null
            }

            {embedComponent == 4 ?
              // recent wins component
              <div className="my-6">
                <div className="text-center bg-black bg-opacity-90 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-14">
                  <div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 w-full rounded-0 sm:rounded-xl sm:max-w-md h-14 align-middle shadow-xl grid grid-cols-2 place-items-center text-lg fontmedium px-2 gap-2">
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 'private'
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => setActiveTab('private')}
                    >
                      Private 🔒
                    </div>
                    <div
                      className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 'public'
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'text-blueGray-500'
                        }`}
                      onClick={() => setActiveTab('public')}
                    >
                      Public 🌍
                    </div>
                  </div>
                </div>
                {activeTab == 'private' ?
                  <>
                    <div className='px-4 pt-4 mb-4 rounded border-2 border-gray-500'>
                      <div className="text-lg mb-4 font-semibold text-accents-4">
                        Customization Options
                      </div>
                      <div className="flex flex-row flex-wrap mb-4 text-xl font-semibold gap-2">
                        <button
                          onClick={() => setDark(dark ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${dark
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Dark Mode
                        </button>
                        <button
                          onClick={() => setWin(win ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${win
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${win ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Win Notification
                        </button>
                        <button
                          onClick={() => setLvl(lvl ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${lvl
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${lvl ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Level Up Notification
                        </button>
                      </div>
                      <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                        <Feature name="Recent Wins" status={true} />
                        <Feature name="Share With Family" status={true} />
                        <Feature name="Delete Win" status={true} />
                      </div>
                    </div>

                    {!winsAuthLink ?
                      <div className="mb-6 items-center w-full">
                        <Button
                          className="w-full"
                          variant="slim"
                          onClick={() => generateSecretLink('recent-wins')}
                          disabled={generating || loading}
                        >
                          {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                        </Button>
                      </div> :
                      <div className="mb-8">
                        <div className="grid grid-cols-8 items-center gap-3">
                          <div className="col-span-4">
                            <Input
                              className="text-xl font-semibold rounded"
                              value={embed_link}
                            />
                          </div>
                          <Button
                            className="col-span-3"
                            variant="slim"
                            onClick={() => copyEmbedLink()}
                            disabled={generating}
                          >
                            {copyText}
                          </Button>
                          <Button
                            className="col-span-1"
                            variant="delete"
                            onClick={() => deleteSecretLink('recent-wins')}
                            disabled={generating}
                          >
                            <i className='fas fa-trash-alt text-white' />
                          </Button>

                        </div>
                        {/* 
                        {dailiesAuthLink ? (
                          <button
                            onClick={() => deleteSecretLink('dailies')}
                            className="text-red-500 mt-2 mr-5 font-semibold"
                            disabled={generating}
                          >
                            {generating ? 'Deleting...' : 'Delete Generated Link'}
                          </button>
                        ) : null} 
                      */}
                      </div>
                    }</>
                  :
                  null
                }
                {activeTab == 'public' ?
                  <>
                    <div className='px-4 pt-4 mb-4 rounded border-2 border-gray-500'>
                      <div className="text-lg mb-4 font-semibold text-accents-4">
                        Customization Options
                      </div>
                      <div className="flex flex-row flex-wrap mb-4 text-xl font-semibold gap-2">
                        <button
                          onClick={() => setDark(dark ? false : true)}
                          className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${dark
                            ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                            : 'text-red-700 bg-red-100 border-2 border-red-500'
                            }`}
                        >
                          <i
                            className={`mr-2 ${dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                              }`}
                          />
                          Dark Mode
                        </button>
                      </div>
                      <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                        <Feature name="Recent Wins" status={true} />
                      </div>
                    </div>

                    {!winsPublicAuthLink ?
                      <div className="mb-6 items-center w-full">
                        <Button
                          className="w-full"
                          variant="slim"
                          onClick={() => generateSecretLink('recent-wins-public')}
                          disabled={generating || loading}
                        >
                          {generating ? 'Generating...' : 'Generate Secret Embed Link'}
                        </Button>
                      </div> :
                      <div className="mb-8">
                        <div className="grid grid-cols-8 items-center gap-3">
                          <div className="col-span-4">
                            <Input
                              className="text-xl font-semibold rounded"
                              value={embed_link}
                            />
                          </div>
                          <Button
                            className="col-span-3"
                            variant="slim"
                            onClick={() => copyEmbedLink()}
                            disabled={generating}
                          >
                            {copyText}
                          </Button>
                          <Button
                            className="col-span-1"
                            variant="delete"
                            onClick={() => deleteSecretLink('recent-wins-public')}
                            disabled={generating}
                          >
                            <i className='fas fa-trash-alt text-white' />
                          </Button>

                        </div>
                        {/* 
                        {dailiesAuthLink ? (
                          <button
                            onClick={() => deleteSecretLink('dailies')}
                            className="text-red-500 mt-2 mr-5 font-semibold"
                            disabled={generating}
                          >
                            {generating ? 'Deleting...' : 'Delete Generated Link'}
                          </button>
                        ) : null} 
                      */}
                      </div>
                    }</>
                  :
                  null
                }

                <div className="flex items-center mt-6 mb-3">
                  <div
                    className="border-t border-accents-2 flex-grow mr-3"
                    aria-hidden="true"
                  ></div>
                  <div className="text-accents-4">Preview</div>
                  <div
                    className="border-t border-accents-2 flex-grow ml-3"
                    aria-hidden="true"
                  ></div>
                </div>
                <iframe
                  id="recent-wins"
                  className="w-full resize"
                  height="600"
                  src={embed_link}
                />
              </div>
              : null
            }

          </div>
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps({ req }) {
  // Get the user's session based on the request
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return {
      redirect: {
        destination: '/signin?redirect=embed',
        permanent: false
      }
    };
  }

  return {
    props: { user }
  };
}
