import NavLink from 'next/link';
import { useUser } from '@/utils/useUser';

const BottomNavbar = () => {
  const { user } = useUser();

  if (user) {
    return (
      <section
        id="bottom-navigation"
        className="mx-auto max-w-screen-sm block fixed inset-x-0 bottom-0 z-10 bg-gradient-to-r from-emerald-500 to-blue-500 shadow sm:rounded-t-lg"
      >
        <div id="tabs" className="flex justify-between py-2">
          <NavLink href="/">
            <a className="w-full transition duration-500 ease-in-out justify-center inline-block text-center pt-2 pb-1 transform hover:scale-110 text-primary hover:text-primary">
              <i className="fas fa-trophy text-3xl inline-block mb-1" />
              <span className="tab tab-home block text-sm font-medium">
                Leaderboard
              </span>
            </a>
          </NavLink>
          <NavLink href="/player">
            <a className="w-full transition duration-500 ease-in-out justify-center inline-block text-center pt-2 pb-1 transform hover:scale-110 text-primary hover:text-primary" >
              <i className="fas fa-user-circle text-3xl inline-block mb-1" />
              <span className="tab tab-kategori block text-sm font-medium">
                Player
              </span>
            </a>
          </NavLink>
          <NavLink href="/dailies">
            <a className="w-full transition duration-500 ease-in-out justify-center inline-block text-center pt-2 pb-1 transform hover:scale-110 text-primary hover:text-primary">
              <i className="fas fa-star text-3xl inline-block mb-1" />
              <span className="tab tab-explore block text-sm font-medium">
                Dailies
              </span>
            </a>
          </NavLink>
        </div>
      </section>
    );
  }
  return <div></div>;
};

export default BottomNavbar;
