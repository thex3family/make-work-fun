import { useState, useEffect, useRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function Feature({ name, status }) {
  return (
    <div
      className={`flex-shrink-0 inline-flex items-center justify-center px-2 py-2 leading-none border-2 rounded ${
        status
          ? 'text-blueGray-700 bg-blueGray-100 border-blueGray-500'
          : 'text-blueGray-700 bg-blueGray-100 border-blueGray-500'
      }`}
    >
      <i
        className={`mr-2 ${
          status ? 'mt-0.5 fas fa-lock' : 'mt-0.5 fas fa-lock'
        }`}
      />
      {name}
    </div>
  );
}

export default function PlayerCard({ embedTab }) {
  const [dark, setDark] = useState(true);
  const [friends, setFriends] = useState(false);
  const [embed_link, setEmbedLink] = useState(null);
  const [copyText, setCopyText] = useState('Copy');
  const [embedComponent, setEmbedComponent] = useState(2);
  const [friendshipLink, setFriendshipLink] = useState(
    '88368a02-1924-4d6c-a484-ef0e7a0926d7'
  );

  async function handleEmbedLink(dark) {
    var t = window.location.href;
    if (embedComponent == 1) {
      var embed_link_temp = `${t.substr(
        0,
        t.lastIndexOf('/')
      )}/embed/player-details?display=demo`;
    } else {
      if (friends && friendshipLink) {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/player-card?id=${friendshipLink}`;
      } else {
        var embed_link_temp = `${t.substr(
          0,
          t.lastIndexOf('/')
        )}/embed/player-card?display=demo&hideWinManage=true`;
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

  useEffect(() => {
    handleEmbedLink(dark);
  }, [dark, embedComponent, friends]);

  return (
    <>
      <div className="my-6">
        {embedTab == 0 ? (
          <div>
            <div className="flex flex-row mb-7 text-xl font-semibold gap-3 pb-4 animate-fade-in">
              <button
                onClick={() => setDark(dark ? false : true)}
                className={`flex-shrink-0 font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${
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
                className={`flex-shrink-0 font-semibold inline-flex items-center justify-center px-2 py-2 leading-none rounded ${
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
              {/* <Feature name="Player Card" status={true} />
              <Feature name="Today's Earnings" status={true} />
              <Feature name="Latest Win" status={true} />
              <Feature name="Recent Win Announcement" status={true} />
              <Feature name="Show Guild Members" status={false} /> */}
            </div>
            
          </div>
        ) : (
          <div className="grid grid-cols-3 mb-14 items-center gap-3 animate-fade-in">
            <div className="col-span-2">
              <Input
                className="text-xl font-semibold rounded"
                value={embed_link}
              />
            </div>
            <Button className="" variant="slim" onClick={() => copyEmbedLink()}>
              {copyText}
            </Button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="mb-1 font-semibold text-accents-2">Preview</div>
        <iframe
          id="player-card"
          className={`resize w-full`}
          scrolling={'yes'}
          height={`${friends ? '650' : '610'}`}
          src={embed_link}
        />
      </div>
    </>
  );
}
