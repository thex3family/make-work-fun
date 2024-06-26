import Head from 'next/head';
import { useRouter } from 'next/router';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { useEffect, useState } from 'react';

import { userContent } from '@/utils/useUser';
import ModalPomo from './Modals/ModalPomo';
import SideBar from '@/components/ui/SideBar/SideBar';
import ModalMusic from './Modals/ModalMusic';
import ModalPlayer from './Modals/ModalPlayer';
import ItemBanner from './ui/ItemBanner';
import { fetchActiveTimer } from './Fetch/fetchMaster';
import { supabase } from '@/utils/supabase-client';
import ModalUpdates from './Modals/ModalUpdates';
import UserWinManage from './WinManage/userWinManage';
import ItemManage from './ui/itemManage';
import WinManage from './WinManage/winManage';
import DemoWinManage from './WinManage/demoWinManage';


export default function Layout({ children, meta, manualPlayerID, manualPlayerStats, setRefreshChildStats }) {
  const router = useRouter();
  const { user, userProfile, userOnboarding } = userContent();
  const [mobileDevice, setMobileDevice] = useState(false);


  function detectMob() {
    return window.innerWidth <= 1024;
  }

  const [overrideMetaTitle, setOverrideMetaTitle] = useState(false);

  useEffect(() => {
    const mobileDevice = detectMob();
    setupIntercom(mobileDevice);
    setMobileDevice(mobileDevice);

  }, [user]);

  function setupIntercom(mobileDevice) {
    // hide it on embeds until I figure out a good way to pass user credentials to intercom
    if (process.env.NODE_ENV === 'production' && !router.asPath.includes('embed/')) {
      window.intercomSettings = {
        app_id: 'dcx9wsn6',
        hide_default_launcher: mobileDevice,
        email: user?.email,
        name: userProfile?.full_name,
        custom_launcher_selector: '.launch_intercom'
      };

      (function () {
        var w = window;
        var ic = w.Intercom;
        if (typeof ic === 'function') {
          ic('reattach_activator');
          ic('update', w.intercomSettings);
        } else {
          var d = document;
          var i = function () {
            i.c(arguments);
          };
          i.q = [];
          i.c = function (args) {
            i.q.push(args);
          };
          w.Intercom = i;
          var l = function () {
            var s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://widget.intercom.io/widget/dcx9wsn6';
            var x = d.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
          };
          if (w.attachEvent) {
            w.attachEvent('onload', l);
          } else {
            w.addEventListener('load', l, false);
          }
        }
      })();
      console.log('Intercom Started');
    }
  }

  const { win } = router.query;
  const { lvl } = router.query;
  const { display } = router.query;
  const { hideWinManage } = router.query;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          href="/favicon-16x16.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/favicon-32x32.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png"></link>
        <meta name="theme-color" content="#317EFB" />
        <title>{overrideMetaTitle ? overrideMetaTitle : meta.title}</title>
        <link href="/favicon.ico" rel="shortcut icon" />
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://makework.fun/${router.asPath}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.cardImage} />

      </Head>
      <nav className='sticky top-0 z-20'>
        {user ?
          <ItemManage player={user} setOverrideMetaTitle={setOverrideMetaTitle} />
          : manualPlayerID ? <ItemManage player={manualPlayerID} setOverrideMetaTitle={setOverrideMetaTitle} /> : null}
        {!router.asPath.includes('embed/') && !router.asPath.includes('signin') && !router.asPath.includes('auth') ? <Navbar /> : null}
      </nav>
      {user ?
        <UserWinManage user={user} setRefreshChildStats={setRefreshChildStats} win={win} lvl={lvl} />
        :
        // forget it for anonymous users for now. <WinManage />
        manualPlayerID ? <UserWinManage user={manualPlayerID} setRefreshChildStats={setRefreshChildStats} win={win} lvl={lvl} /> : null
      }
      { display ? (display == 'demo' && hideWinManage != 'true') ? <DemoWinManage win={true} lvl={true} /> : null : null}
      <main id="skip">
        {(user || router.asPath.includes('embed/')) && !router.asPath.includes('auth') && !router.asPath.includes('demo') && !router.asPath.includes('id') && !router.asPath.includes('task-list') ? <>
          <SideBar router={router} mobileDevice={mobileDevice} />
        </> : null}
        {user && userProfile ? <ModalUpdates user={user} userProfile={userProfile} /> : null}
        {children}
      </main>
      {userOnboarding ? (
        userOnboarding.onboarding_state.includes('4') &&
          !router.asPath.includes('embed/') && !router.asPath.includes('auth') ? (
          <BottomNavbar />
        ) : null
      ) : null}
      {!router.asPath.includes('embed/') && !router.asPath.includes('auth') ? <Footer /> : null}
    </>
  );
}
