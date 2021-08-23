import { useState, useEffect, createRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import { supabase } from '@/utils/supabase-client';
import { createPopper } from '@popperjs/core';

import { useUser } from '@/utils/useUser';

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
  const [embed_link, setEmbedLink] = useState(null);
  const [copyText, setCopyText] = useState('Copy');
  const [embedComponent, setEmbedComponent] = useState(1);
  const { user } = useUser();

  useEffect(() => {
    if(user) handleEmbedLink(dark);
  }, [user, dark, embedComponent]);

  async function handleEmbedLink(dark) {
    var t = window.location.href;
    if (embedComponent == 1) {
      var embed_link_temp = `${t.substr(
        0,
        t.lastIndexOf('/')
      )}/embed/player-details?player=${user.id}`;
    } else {
      var embed_link_temp = `${t.substr(
        0,
        t.lastIndexOf('/')
      )}/embed/player-card?player=${user.id}`;
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

  return (
    <>
      <section className="animate-slow-fade-in bg-fixed bg-cover ">
        <div className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
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
                </div>
                <div className="text-lg mb-2 font-semibold">
                  Modifiable Soon...
                </div>
                <div className="flex flex-row flex-wrap mb-6 text-xl font-semibold gap-2">
                  <Feature name="Avatar + Background" status={true} />
                  <Feature name="Today's Earnings" status={true} />
                  <Feature name="Latest Win" status={true} />
                  <Feature name="Friends" status={false} />
                  <Feature name="Guild Members" status={false} />
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
                  id="player-card"
                  className="w-full lg:w-96"
                  height="610"
                  src={embed_link}
                />
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
        destination: '/signin',
        permanent: false
      }
    };
  }

  return {
    props: { user }
  };
}
