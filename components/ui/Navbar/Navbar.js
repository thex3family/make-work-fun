import { Fragment, useEffect, useRef, useState } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';


const main_navigation = [
  { name: 'Leaderboard 🏆', href: '/leaderboard' },
  { name: 'Map 🌍', href: '/map' },
  { name: 'Updates ✨', href: '/new',}
];

const play_menu = [
  { name: 'Player 🐣', href: '/player' },
  { name: 'Parties 🐉', href: '/parties' },
  { name: 'Dailies ⭐', href: '/dailies' },
  { name: 'Account 📋', href: '/account' },
  { name: 'Embed 🔗', href: '/embed' },
];

import Link from 'next/link';
import s from './Navbar.module.css';

import { userContent } from '@/utils/useUser';

function MyLink(props) {
  let { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  )
}

const Navbar = () => {
  const { user, signOut } = userContent();
  const router = useRouter();

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
                        <span className="sr-only">Home</span>
                        <img
                          className="h-8 w-auto sm:h-10"
                          src="../co-x3logo_white_full.svg"
                        />
                        <span className="text-white ml-3 py-2 font-medium uppercase bg-gradient-to-r from-emerald-500 to-blue-500 rounded px-2">
                          Beta
                        </span>
                      </a>
                      <div className="-mr-2 flex items-center md:hidden">
                        <a className="mr-1.5 text-lg fas fa-question-circle launch_intercom" />
                        <Popover.Button className="bg-primary-2 rounded-md p-2 inline-flex items-center justify-center text-white hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
                          <span className="sr-only">Open main menu</span>
                          <MenuIcon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                    </div>
                  </div>

                  {/* manage the main menu  */}

                  <div className="hidden md:block items-center md:ml-10 md:pr-4 md:space-x-8">
                    {user ?
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className={`ring-0 bg-gray-700 ${s.link}`}>
                            Play
                            <i
                              className="fas fa-chevron-down w-5 h-5 ml-2 -mr-1"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-gray-700 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1.5 py-1.5 flex-col flex gap-1.5">

                              {play_menu.map((item) => (
                                <Menu.Item>
                                  {({ active }) => (
                                    <MyLink href={item.href}><button
                                      className={`${active || router.pathname.includes(item.href) ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' : 'text-gray-200'
                                        }group flex rounded-md items-center w-full px-3 py-2 font-medium`}
                                    >

                                      {item.name}
                                    </button>
                                    </MyLink>
                                  )}
                                </Menu.Item>

                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                      : null}

                    {main_navigation.map((item) => (
                      <Link href={item.href}>
                        <a
                          key={item.name}
                          className={`hideLinkBorder ${s.link} relative ${router.pathname == item.href ? s.activeLink : null
                            }`}
                        >
                          {item.name}
                          {item.badge ?
                          <span class="absolute -top-2 -right-1.5">
                            <div class="inline-flex items-center h-4 w-4 border-2 border-white rounded-full text-xs font-semibold leading-4 bg-red-500 text-white">
                              {/* {item.badge} Leave blank for now */}
                            </div>
                          </span> : null}
                        </a>
                      </Link>

                    ))}

                    {user ? (
                      <Link href="/">
                        <a
                          className="px-4 py-2 text-center font-medium text-primary rounded border border-emerald-500 hover:text-accents-9 hover:border-blue-500"
                          onClick={() => signOut()}
                        >
                          Log Out
                        </a>
                      </Link>
                    ) : (
                      <Link href="/signin">
                        <a className="px-4 py-2 text-center font-medium text-primary rounded border border-emerald-500 hover:text-accents-9 hover:border-blue-500">
                          Play Now
                        </a>
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
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
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
                      <Popover.Button className="w-full">
                        {user ? <div className='bg-dark rounded-md py-1 bg-opacity-30'>{play_menu.map((item) => (
                          <Link href={item.href}>
                            <a
                              key={item.name}
                              className={`${s.mobile_play} ${router.pathname == item.href
                                ? s.activeMobileLink
                                : null
                                }`}
                            >
                              {item.name}
                            </a>
                          </Link>
                        ))}</div> : null}
                        {main_navigation.map((item) => (
                          <Link href={item.href}>
                            <a
                              key={item.name}
                              className={`${s.mobile} ${router.pathname == item.href
                                ? s.activeMobileLink
                                : null
                                }`}
                            >
                              {item.name}
                            </a>
                          </Link>
                        ))}
                      </Popover.Button>
                    </div>
                    <Popover.Button className="w-full">
                      {user ? (
                        <Link href="/">
                          <a
                            className="block w-full px-5 py-3 text-center font-medium text-primary bg-gradient-to-r from-emerald-500 to-blue-500 hover:text-accents-9"
                            onClick={() => signOut()}
                          >
                            Log Out
                          </a>
                        </Link>
                      ) : (
                        <Link href="/signin">
                          <a className="block w-full px-5 py-3 text-center font-medium text-primary bg-gradient-to-r from-emerald-500 to-blue-500 hover:text-accents-9">
                            Play Now
                          </a>
                        </Link>
                      )}
                    </Popover.Button>
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
