import { useEffect } from 'react';
import '@/assets/main.css';
import '@/assets/chrome-bug.css';

import { useState } from 'react';
import { useRouter } from 'next/router';

import Layout from '@/components/Layout';
import { UserContextProvider } from '@/utils/useUser';

import '@fortawesome/fontawesome-free/css/all.min.css';

import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import { supabase } from 'utils/supabase-client.js';

// function setupIntercom(mobileDevice) {
//   if (process.env.NODE_ENV === 'production') {
//     window.intercomSettings = {
//       app_id: "dcx9wsn6",
//       hide_default_launcher: mobileDevice,
//       email: "bob@example.com",
//     };

//     (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/dcx9wsn6';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
//     console.log('Intercom Started');
//   }

// }

// function detectMob() {
//   return ( window.innerWidth <= 1024 );
// }

export default function MyApp({ Component, pageProps }) {
  const metaBase = {
    title: 'Make Work Fun, Get Stuff Done',
    titleBase: 'Make Work Fun',
    description:
      'Gamify your productivity tools and unlock multiplayer for personal development.',
    cardImage: '/og.png',
  };

  const [meta, setMeta] = useState(metaBase);
  const [refreshChildStats, setRefreshChildStats] = useState(false);
  const [manualPlayerID, setManualPlayerID] = useState(null);
  const [manualPlayerStats, setManualPlayerStats] = useState(null);

  // const router = useRouter();

  // useEffect(() => {
  //   const mobileDevice = detectMob();
  //   setupIntercom(mobileDevice)
  //   document.body.classList?.remove('loading');
  // }, []);

  useEffect(() => {
    document.body.classList?.remove('loading');
  }, []);

  return (
    <>
      <div className="bg-primary">

        <UserProvider supabaseClient={supabase}>
          <UserContextProvider>
            <Layout meta={meta} manualPlayerID={manualPlayerID} manualPlayerStats={manualPlayerStats} setRefreshChildStats={setRefreshChildStats} >
              <Component {...pageProps} metaBase={metaBase} setMeta={setMeta} refreshChildStats={refreshChildStats} setRefreshChildStats={setRefreshChildStats} setManualPlayerID={setManualPlayerID} setManualPlayerStats={setManualPlayerStats} />
            </Layout>
          </UserContextProvider>
        </UserProvider>
      </div>
    </>
  );
}
