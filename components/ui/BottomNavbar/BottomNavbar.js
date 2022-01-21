import NavLink from 'next/link';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';


const BottomNavbar = () => {
  const { user } = useUser();
  const router = useRouter();

  if (user) {
    return (
      <section
        id="bottom-navigation"
        className="mx-auto max-w-screen-sm block fixed inset-x-0 bottom-0 z-10 bg-gradient-to-r from-emerald-500 to-blue-500 shadow sm:rounded-t-lg"
      >
        <div id="tabs" className="flex justify-between">
          {/* <NavLink href="/">
            <a className={`w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 pt-4 sm:pb-3 sm:pt-4 transform ${router.pathname == "/" ? "text-primary scale-105" : "text-white text-opacity-30"}`}>
              <i className="fas fa-trophy text-3xl inline-block mb-1" />
              <span className="tab tab-home block text-sm font-medium">
                Leaderboard
              </span>
            </a>
          </NavLink> */}
          <NavLink href="/parties">
            <a className={`w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 pt-4 sm:pb-3 sm:pt-4 transform hover:text-white ${router.pathname == "/parties" ? "text-primary scale-105" : "text-white text-opacity-30"}`}>
              <i className="fas fa-dragon text-3xl inline-block mb-1" />
              <span className="tab tab-home block text-sm font-medium">
                Parties
              </span>
            </a>
          </NavLink>
          <NavLink href="/player">
            <a className={`w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 pt-4 sm:pb-3 sm:pt-4 transform hover:text-white ${router.pathname == "/player" ? "text-primary scale-105" : "text-white text-opacity-30"}`}>
              <i className="fas fa-user-circle text-3xl inline-block mb-1" />
              <span className="tab tab-kategori block text-sm font-medium">
                Player
              </span>
            </a>
          </NavLink>
          <NavLink href="/dailies">
            <a className={`w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 pt-4 sm:pb-3 sm:pt-4 transform hover:text-white ${router.pathname == "/dailies" ? "text-primary scale-105" : "text-white text-opacity-30"}`}>
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
