import Link from 'next/link';
import s from './Navbar.module.css';

import { useUser } from '@/utils/useUser';

const Navbar = () => {
  const { user, signOut } = useUser();

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex justify-between align-center flex-row py-4 md:py-6 relative">
          <div className="flex flex-1 items-center">
            <Link href="/">
              <a className={s.logo} aria-label="Logo">
                <img className="h-10" src="img/co-x3logo_white_full.png" alt="Co-x3" />
              </a>
            </Link>
            <nav className="space-x-2 ml-6 hidden sm:block">
              <Link href="/player">
                <a className={s.link}>Player 🐣</a>
              </Link>
              {/* <Link href="/player">
                <a className={s.link}>Leaderboard 🏆</a>
              </Link> */}
              <Link href="/account">
                <a className={s.link}>Account 📋</a>
              </Link>
            </nav>
          </div>

          <div className="flex justify-end space-x-8">
            {user ? (
              <Link href="#">
                <a className={s.link} onClick={() => signOut()}>
                  Sign out
                </a>
              </Link>
            ) : (
              <Link href="/signin">
                <a className={s.link}>Sign in</a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
