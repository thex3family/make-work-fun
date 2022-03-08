import NavLink from 'next/link';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';


const Sidebar = ({ mobileDevice, setTimer, timer, setMusic, music, setPlayer, player }) => {
  const { user } = useUser();
  const router = useRouter();

    return (
      <section
        id="bottom-navigation"
        className={`transition ease-in-out duration-150 block fixed inset-y-0 my-auto left-0 h-56 w-auto z-50 bg-dark ${mobileDevice ? 'opacity-60' : 'opacity-40'}  hover:opacity-100 shadow rounded`}
      >
        <div id="tabs" className="flex flex-col items-center justify-between px-2 pt-1">
          {/* <NavLink href="/">
            <a className={`w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 pt-4 sm:pb-3 sm:pt-4 transform ${router.pathname == "/" ? "text-primary scale-105" : "text-white text-opacity-30"}`}>
              <i className="fas fa-trophy text-3xl inline-block mb-1" />
              <span className="tab tab-home block text-sm font-medium">
                Leaderboard
              </span>
            </a>
          </NavLink> */}
          <p className='font-semibold text-white text-opacity-70'>Tools</p>

          <a onClick={() => setTimer(!timer)} className={`cursor-pointer w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 pt-4 transform ${timer ? "bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500" : "hover:text-white"}`}>
            <i className="fas fa-clock text-xl inline-block mb-1" />
            <span className="tab tab-explore block text-sm font-medium">
              Timer
            </span>
          </a>
          <a onClick={() => setMusic(!music)} className={`cursor-pointer w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 transform ${music ? "bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500" : "hover:text-white"}`}>
            <i className="fas fa-music text-xl inline-block mb-1" />
            <span className="tab tab-explore block text-sm font-medium">
              Music
            </span>
          </a>
          <a onClick={() => setPlayer(!player)} className={`cursor-pointer w-full transition duration-500 ease-in-out justify-center inline-block text-center pb-4 transform ${player ? "bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500" : "hover:text-white"}`}>
            <i className="fas fa-user-circle text-xl inline-block mb-1" />
            <span className="tab tab-explore block text-sm font-medium">
              Player
            </span>
          </a>
        </div>
      </section>
    );
  }

export default Sidebar;
