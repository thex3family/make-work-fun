import Head from 'next/head';
import { useRouter } from 'next/router';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { useEffect, useState } from 'react';

import { useUser } from '@/utils/useUser';
import ModalPomo from './Modals/ModalPomo';
import SideBar from '@/components/ui/SideBar/SideBar';
import ModalMusic from './Modals/ModalMusic';
import ModalPlayer from './Modals/ModalPlayer';
import { fetchLatestWin, fetchPlayerStats } from './Fetch/fetchMaster';
import { triggerCardWin, triggerWinModal } from './Modals/ModalHandler';
import ModalLevelUp from './Modals/ModalLevelUp';
import WinModal from './Modals/ModalWin';
import CardWin from './Cards/CardWin';


export default function Layout({ children, meta }) {
  const router = useRouter();
  const { user, userProfile, userOnboarding } = useUser();
  const [timer, setTimer] = useState(false);
  const [music, setMusic] = useState(false);
  const [player, setPlayer] = useState(false);
  const [mobileDevice, setMobileDevice] = useState(false);

  function detectMob() {
    return window.innerWidth <= 1024;
  }

  // this runs way too many times on first load
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

  // Handle Win Modal

  const [levelUp, setLevelUp] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [activeModalStats, setActiveModalStats] = useState(null);
  const [activeWinStats, setActiveWinStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [showCardWin, setShowCardWin] = useState(false);

  // this also runs more times than it should
  useEffect(() => {
    fetchLatestWin(
      setActiveModalStats,
      refreshStats,
      setLevelUp,
      triggerWinModal,
      setShowWinModal,
      null,
      triggerCardWin,
      setShowCardWin,
      setActiveWinStats
    );
  }, []);

  async function refreshStats() {
    setPlayerStats(await fetchPlayerStats());
  }

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
        <title>{meta.title}</title>
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
      {!router.asPath.includes('embed/') && !router.asPath.includes('signin') && !router.asPath.includes('auth') ? <Navbar /> : null}
      <main id="skip">
        {user && !router.asPath.includes('embed/') ? <>
          <SideBar mobileDevice={mobileDevice} setTimer={setTimer} timer={timer} setMusic={setMusic} music={music} setPlayer={setPlayer} player={player} />
          
          {/* Eventually can refactor all this into sidebar */}
          <ModalPomo visibility={timer} setVisibility={setTimer} mobileDevice={mobileDevice} userID={user?.id} />
          <ModalMusic visibility={music} setVisibility={setMusic} mobileDevice={mobileDevice} />
          <ModalPlayer visibility={player} setVisibility={setPlayer} mobileDevice={mobileDevice} user={user} />

          {/* Level Up Modal */}
          {levelUp ? (
            <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
          ) : null}

          {/* // Win Modal */}
          {showWinModal ? (
            <>
              <WinModal
                page={'leaderboard'}
                activeModalStats={activeModalStats}
                setShowWinModal={setShowWinModal}
                playerStats={playerStats}
                refreshStats={refreshStats}
              />
            </>
          ) : null}
        </> : null}

        {/* Card Win */}
        {showCardWin ? (
          <CardWin
            setShowCardWin={setShowCardWin}
            win={activeWinStats}
            player_name={showCardWin.full_name}
            avatarUrl={showCardWin.avatar_url}
          />
        ) : null}

        {children}
        
      </main>
      {userOnboarding ? (
        userOnboarding.onboarding_state.includes('4') &&
          !router.asPath.includes('embed/') ? (
          <BottomNavbar />
        ) : null
      ) : null}
      {!router.asPath.includes('embed/') ? <Footer /> : null}
    </>
  );
}
