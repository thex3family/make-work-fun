import Head from 'next/head';
import { useRouter } from 'next/router';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function Layout({ children, meta: pageMeta }) {
  const router = useRouter();
  const meta = {
    title: 'Co-x3 Family Connection',
    description: 'Multiplayer for Personal Development.',
    cardImage: '/og.png',
    ...pageMeta
  };

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <link href="/favicon.ico" rel="shortcut icon" />
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://subscription-starter.vercel.app${router.asPath}`}
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
      <Navbar />
      <main id="skip">{children}</main>
      <Footer />
    </>
  );
}
