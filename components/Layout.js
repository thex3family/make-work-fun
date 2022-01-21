import Head from 'next/head';
import { useRouter } from 'next/router';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { useEffect } from 'react';

import { useUser } from '@/utils/useUser';


export default function Layout({ children, meta: pageMeta }) {
  const router = useRouter();
  const meta = {
    title: 'Make Work Fun, Get Stuff Done',
    description:
      'The ultimate companion app for Notion to gamify your productivity and make work fun.',
    cardImage: '/og.png',
    ...pageMeta
  };

  const { user, userProfile, userOnboarding } = useUser();

  function detectMob() {
    return window.innerWidth <= 1024;
  }

  useEffect(() => {
    const mobileDevice = detectMob();
    setupIntercom(mobileDevice);
    console.log(userProfile?.full_name)
  }, [user]);

  
function setupIntercom(mobileDevice) {
  // hide it on embeds until I figure out a good way to pass user credentials to intercom
  if (process.env.NODE_ENV === 'production' && !router.asPath.includes('embed/')) {
    window.intercomSettings = {
      app_id: 'dcx9wsn6',
      hide_default_launcher: mobileDevice,
      email: user?.email,
      name: userProfile?.full_name,
      custom_launcher_selector:'.launch_intercom'
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

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@thex3family" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.cardImage} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      {!router.asPath.includes('embed/') && !router.asPath.includes('signin') && !router.asPath.includes('auth')   ? <Navbar /> : null}
      <main id="skip">{children}</main>
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
