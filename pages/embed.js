import { useState, useEffect, createRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import React from 'react';

import { supabase } from '@/utils/supabase-client';
import { createPopper } from '@popperjs/core';

import { useUser } from '@/utils/useUser';

import DataTable, { createTheme } from 'react-data-table-component';
import {
  fetchPlayers,
  fetchFriendships,
  fetchFriendshipLink
} from '@/components/Fetch/fetchMaster';

function Feature({ name, status }) {
  return (
    <div
      className={`inline-flex items-center justify-center px-2 py-2 leading-none border-2 rounded ${
        status
          ? 'text-emerald-700 bg-emerald-100 border-emerald-500'
          : 'text-red-700 bg-red-100 border-red-500'
      }`}
    >
      <i
        className={`mr-2 ${
          status ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
        }`}
      />
      {name}
    </div>
  );
}

export default function embed() {
  const [dark, setDark] = useState(false);
  const [friends, setFriends] = useState(false);
  const [embed_link, setEmbedLink] = useState(null);
  const [copyText, setCopyText] = useState('Copy');
  const [embedComponent, setEmbedComponent] = useState(1);
  const { user } = useUser();

  async function handleEmbedLink(dark) {
    console.log(friendshipLink);
    var t = window.location.href;
    if (embedComponent == 1) {
      var embed_link_temp = `${t.substr(
        0,
        t.lastIndexOf('/')
      )}/embed/player-details?player=${user.id}`;
    } else {
      if (friends && friendshipLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/player-card?id=${friendshipLink.id}`;
      } else {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/player-card?player=${user.id}`;
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

  async function changeEmbed(embed_id) {
    closeDropdownPopover();
    setEmbedComponent(embed_id);
  }

  // friendship table
  const [players, setPlayers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [friendshipLink, setFriendshipLink] = useState(null);
  const [saving, setSaving] = useState(null);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    if (user) handleEmbedLink(dark);
  }, [user, dark, embedComponent, friends, friendshipLink]);

  useEffect(() => {
    fetchPlayers(setPlayers);
    fetchFriendships(setFriendships);
    fetchFriendshipLink(setFriendshipLink);
  }, []);

  useEffect(() => {
    if (friendshipLink) updateFriendshipLink(friendships, friendshipLink.id);
    setSaving(false);
  }, [friendships]);

  useEffect(() => {
    setGenerating(false);
  }, [friendshipLink]);

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
      alert(error.message);
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
      alert(error.message);
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
      alert(error.message);
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
      alert(error.message);
    } finally {
      reloadIframe();
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
      alert(error.message);
    } finally {
      setFriendshipLink(null);
      reloadIframe();
    }
  }

  async function reloadIframe() {
    var iframe = document.getElementById('player-card');
    if (iframe) {
      iframe.src = iframe.src;
    }
  }

  return (
    <>
      <section className="animate-slow-fade-in bg-fixed bg-cover bg-center">
        <div className="max-w-6xl mx-auto pt-8 md:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="mb-6">
              <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                Generate Embeddable Components
              </h1>
              <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
                Adjust your settings and generate a sharable link you can embed
                in Notion and your website!
              </p>
            </div>
            <div className="relative w-auto pl-4 flex-initial">
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
                {embedComponent == 1 ? 'Player Details' : 'Player Card'}
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
                  onClick={() => changeEmbed(1)}
                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                >
                  Player Details
                </a>
                <a
                  onClick={() => changeEmbed(2)}
                  className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                >
                  Player Card
                </a>
              </div>
            </div>
            {embedComponent == 1 ? (
              <div className="my-6">
                <div className="flex flex-row mb-6 text-xl font-semibold gap-3">
                  <button
                    onClick={() => setDark(dark ? false : true)}
                    className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${
                      dark
                        ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                        : 'text-red-700 bg-red-100 border-2 border-red-500'
                    }`}
                  >
                    <i
                      className={`mr-2 ${
                        dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                      }`}
                    />
                    Dark Mode
                  </button>
                </div>
                <div className="text-lg mb-2 font-semibold">
                  Modifiable Soon...
                </div>
                <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                  <Feature name="Avatar" status={true} />
                  <Feature name="Areas" status={true} />
                  <Feature name="Player Card" status={true} />
                  <Feature name="Week's Wins" status={true} />
                  <Feature name="Win Notification" status={true} />
                  <Feature name="Level Up Notification" status={true} />
                </div>
                <div className="grid grid-cols-3 mb-8 items-center gap-3">
                  <div className="col-span-2">
                    <Input
                      className="text-xl font-semibold rounded"
                      value={embed_link}
                    />
                  </div>
                  <Button
                    className=""
                    variant="slim"
                    onClick={() => copyEmbedLink()}
                  >
                    {copyText}
                  </Button>
                </div>
                <div className="mb-1 font-semibold text-accents-2">Preview</div>
                <iframe
                  id="player-details"
                  className="w-full"
                  height="650"
                  src={embed_link}
                />
              </div>
            ) : (
              <div className="my-6">
                <div className="flex flex-row mb-6 text-xl font-semibold gap-3">
                  <button
                    onClick={() => setDark(dark ? false : true)}
                    className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${
                      dark
                        ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                        : 'text-red-700 bg-red-100 border-2 border-red-500'
                    }`}
                  >
                    <i
                      className={`mr-2 ${
                        dark ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
                      }`}
                    />
                    Dark Mode
                  </button>
                  <button
                    onClick={() => setFriends(friends ? false : true)}
                    className={`font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${
                      friends
                        ? 'text-emerald-700 bg-emerald-100 border-2 border-emerald-500'
                        : 'text-red-700 bg-red-100 border-2 border-red-500'
                    }`}
                  >
                    <i
                      className={`mr-2 ${
                        friends ? 'mt-0.5 fas fa-check' : 'mt-0.5 fas fa-times'
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
                <div className="text-lg mb-2 font-semibold">
                  Modifiable Soon...
                </div>
                <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                  <Feature name="Player Card" status={true} />
                  <Feature name="Today's Earnings" status={true} />
                  <Feature name="Latest Win" status={true} />
                  <Feature name="Recent Win Announcement" status={true} />
                  <Feature name="Show Guild Members" status={false} />
                </div>
                {friends && !friendshipLink ? (
                  <div className="mb-6 items-center w-full">
                    <Button
                      className="w-full"
                      variant="slim"
                      onClick={() => generateFriendshipLink(friendships)}
                      disabled={generating || !friendships}
                    >
                      {generating ? 'Generating...' : 'Generate Embed Link'}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <div className="grid grid-cols-3 items-center gap-3">
                        <div className="col-span-2">
                          <Input
                            className="text-xl font-semibold rounded"
                            value={embed_link}
                          />
                        </div>
                        <Button
                          className=""
                          variant="slim"
                          onClick={() => copyEmbedLink()}
                        >
                          {copyText}
                        </Button>
                      </div>
                      {friends && friendshipLink ? (
                        <button
                          onClick={() => deleteFriendshipLink(friendships)}
                          className="text-red-500 mt-2 mr-5 font-semibold"
                          disabled={generating}
                        >
                          {generating ? 'Deleting...' : 'Delete Generated Link'}
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
                {friends && !friendshipLink ? null : (
                  <div className="overflow-x-auto">
                    <div className="mb-1 font-semibold text-accents-2">
                      Preview
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
            )}
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
