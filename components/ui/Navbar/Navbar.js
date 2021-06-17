import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'

const navigation = [
  { name: 'Player 🐣', href: '/player' },
  { name: 'Account 📋', href: '/account' },
  { name: 'Updates ✨', href: '/new' },
]

import Link from 'next/link';
import s from './Navbar.module.css';

import { useUser } from '@/utils/useUser';

const Navbar = () => {
  const { user, signOut } = useUser();

  return (
    // <nav className={s.root}>
    //   <a href="#skip" className="sr-only focus:not-sr-only">
    //     Skip to content
    //   </a>
    //   <div className="mx-auto max-w-6xl px-6">
    //     <div className="flex justify-between align-center flex-row py-4 md:py-6 relative">
    //       <div className="flex flex-1 items-center">
    //         <Link href="/">
    //           <a className={s.logo} aria-label="Logo">
    //             <img className="h-10" src="img/co-x3logo_white_full.png" alt="Co-x3" />
    //           </a>
    //         </Link>
    //         <nav className="space-x-2 ml-6 hidden sm:block">
    //           <Link href="/player">
    //             <a className={s.link}>Player 🐣</a>
    //           </Link>
    //           {/* <Link href="/player">
    //             <a className={s.link}>Leaderboard 🏆</a>
    //           </Link> */}
    //           <Link href="/account">
    //             <a className={s.link}>Account 📋</a>
    //           </Link>
    //           <Link href="/new">
    //             <a className={s.link}>Updates ✨</a>
    //           </Link>
    //         </nav>
    //       </div>

    //       <div className="flex justify-end space-x-8">
    //         {user ? (
    //           <Link href="#">
    //             <a className={s.link} onClick={() => signOut()}>
    //               Sign out
    //             </a>
    //           </Link>
    //         ) : (
    //           <Link href="/signin">
    //             <a className={s.link}>Sign in</a>
    //           </Link>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </nav>
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
         Skip to content
      </a>
    <div className="mx-auto max-w-6xl px-6">
    <Popover>
    {({ open }) => (
      <>
        <div className="relative py-6 px-4 sm:px-6 lg:px-8">
          <nav
            className="relative flex items-center justify-between sm:h-10"
            aria-label="Global"
          >
            <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
              <div className="flex items-center justify-between w-full md:w-auto">
                <a href="/" className={s.logo}>
                  <span className="sr-only">Workflow</span>
                  <img
                    className="h-8 w-auto sm:h-10"
                    src="co-x3logo_white_full.svg"
                  />
                </a>
                <div className="-mr-2 flex items-center md:hidden">
                  <Popover.Button className="bg-primary-2 rounded-md p-2 inline-flex items-center justify-center text-white hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
                    <span className="sr-only">Open main menu</span>
                    <MenuIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
            </div>
            <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className={s.link}>
                  {item.name}
                </a>
              ))}
                        
            {user ? (
              <Link href="#">
                <a className="px-4 py-2 text-center font-medium text-primary rounded bg-gradient-to-r from-emerald-500 to-blue-500 hover:text-accents-9" onClick={() => signOut()}>
                  Sign out
                </a>
              </Link>
            ) : (
              <Link href="/signin">
                <a className="px-4 py-2 text-center font-medium text-primary rounded bg-gradient-to-r from-emerald-500 to-blue-500 hover:text-accents-9">Sign in</a>
              </Link>
            )}
         
            </div>
          </nav>
        </div>

        <Transition
          show={open}
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            static
            className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
          >
            <div className="rounded-lg shadow-md bg-primary-2 bg-opacity-90 ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="px-5 pt-4 flex items-center justify-between">
                <div>
                <a href="/" className={s.logo}>
                  <img
                    className="h-8 w-auto"
                    src="co-x3logo_white_full.svg"
                    alt=""
                  />
                  </a>
                </div>
                <div className="-mr-2">
                  <Popover.Button className="bg-transparent rounded-md p-2 inline-flex items-center justify-center text-primary hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
                    <span className="sr-only">Close main menu</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-accents-9 hover:bg-emerald-600"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              {user ? (
              <Link href="#">
                <a className="block w-full px-5 py-3 text-center font-medium text-primary bg-gradient-to-r from-emerald-500 to-blue-500 hover:text-accents-9" onClick={() => signOut()}>
                  Sign out
                </a>
              </Link>
            ) : (
              <Link href="/signin">
                <a className="block w-full px-5 py-3 text-center font-medium text-primary bg-gradient-to-r from-emerald-500 to-blue-500 hover:text-accents-9">Sign in</a>
              </Link>
            )}
            </div>
          </Popover.Panel>
        </Transition>
      </>
    )}
  </Popover>
  </div>
  </nav>
  );
};

export default Navbar;
