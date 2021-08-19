import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import { supabase } from '@/utils/supabase-client';

export default function embed({ user }) {
  const [dark, setDark] = useState(false);
  const [embed_link, setEmbedLink] = useState(null);
  const [copyText, setCopyText] = useState('Copy');

  useEffect(() => {
    handleEmbedLink(dark);
  }, [dark]);

  async function handleEmbedLink(dark) {
    var t = window.location.href;
    var embed_link_temp = `${t.substr(
      0,
      t.lastIndexOf('/')
    )}/embed/player-details?player=${user.id}`;
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
                Adjust your settings and generate a sharable link you can embed in Notion and your website!
              </p>
            </div>
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
                <div className="inline-flex items-center justify-center px-2 py-2 leading-none text-emerald-700 bg-emerald-100 border-2 border-emerald-500 rounded">
                  <i className="mr-2 mt-0.5  fas fa-check" />
                  Avatar
                </div>
                <div className="inline-flex items-center justify-center px-2 py-2 leading-none text-emerald-700 bg-emerald-100 border-2 border-emerald-500 rounded">
                  <i className="mr-2 mt-0.5  fas fa-check" />
                  Areas
                </div>
                <div className="inline-flex items-center justify-center px-2 py-2 leading-none text-emerald-700 bg-emerald-100 border-2 border-emerald-500 rounded">
                  <i className="mr-2 mt-0.5 fas fa-check" />
                  Player Card
                </div>
                <div className="inline-flex items-center justify-center px-2 py-2 leading-none text-emerald-700 bg-emerald-100 border-2 border-emerald-500 rounded">
                  <i className="mr-2 mt-0.5 fas fa-check" />
                  Week's Wins
                </div>
                <div className="inline-flex items-center justify-center px-2 py-2 leading-none text-emerald-700 bg-emerald-100 border-2 border-emerald-500 rounded">
                  <i className="mr-2 mt-0.5 fas fa-check" />
                  Win Notification
                </div>
                <div className="inline-flex items-center justify-center px-2 py-2 leading-none text-emerald-700 bg-emerald-100 border-2 border-emerald-500 rounded">
                  <i className="mr-2 mt-0.5 fas fa-check" />
                  Level Up Notification
                </div>
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
              <iframe className="resize w-full h-96" src={embed_link} />
            </div>
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
