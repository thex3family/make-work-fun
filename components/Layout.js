import Head from 'next/head';
import { useRouter } from 'next/router';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';

import { useUser } from '@/utils/useUser';

export default function Layout({ children, meta: pageMeta }) {
  const router = useRouter();
  const meta = {
    title: 'Co-x3 Family Connection',
    description: 'Multiplayer for Personal Development.',
    cardImage: '/og.png',
    ...pageMeta
  };

  
  const {
    user,
    userOnboarding,
  } = useUser();

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <link href="/favicon.ico" rel="shortcut icon" />
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://app.co-x3.com${router.asPath}`}
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
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      {!router.asPath.includes('embed/') ? <Navbar /> : null}
      <main id="skip">{children}</main>
      {userOnboarding ? userOnboarding.onboarding_state.includes('4') && !router.asPath.includes('embed/') ? <BottomNavbar /> : null : null}
      {!router.asPath.includes('embed/') ? <Footer /> : null}
    </>
  );
}
