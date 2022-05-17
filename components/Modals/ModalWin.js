import { generateGIF } from '@/components/Widgets/generateGIF';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import Link from 'next/link';
import { shareWithGuilded } from '@/utils/sendGuildedWebhook';
import useSound from 'use-sound';

export default function WinModal({
  page,
  activeModalStats,
  setShowWinModal,
  playerStats,
  refreshStats,
  display
}) {
  const [activeGIF, setActiveGIF] = useState(null);
  const [sharedWithFamily, setSharedWithFamily] = useState(false);
  const [deleteOption, setDeleteOption] = useState(null);

  useEffect(() => {
    initializeModal();
  }, []);

  async function initializeModal() {
    await handleGIF();
  }

  async function handleGIF() {
    // check if there is a GIF in the database
    if (activeModalStats.gif_url) {
      setActiveGIF(activeModalStats.gif_url);
      // hide the box
      setBoxClass('hide-box');
    } else {
      // generate a random GIF
      const url = await generateGIF();
      setActiveGIF(url);

      // update the database with the new GIF

      // only if not demo
      if (display !== 'demo') {
        const { data, error } = await supabase
          .from('success_plan')
          .update({ gif_url: url })
          .eq('id', activeModalStats.id);

        // updates the rest of the stats asynchronously
        if (page === 'player') {
          refreshStats();
        }
      }
    }
  }

  const [boxClass, setBoxClass] = useState('');

  const [boxOpenSFX] = useSound('/sounds/1-up.wav');

  function openBox() {
    boxClass != 'hide-box' ? setBoxClass('open-box') : '';
    boxOpenSFX();
  }

  function closeModal() {
    setShowWinModal(false);
    setBoxClass('');
  }

  async function deleteWin(){
    if (display != 'demo'){
      try {
        const { data, error } = await supabase
          .from('success_plan')
          .delete()
          .match({'id': activeModalStats.id});
  
        if (error && status !== 406) {
          throw error;
        }
      } catch (error) {
        // alert(error.message);
      console.log(error.message);
      } finally {
        // refresh the win table if in the player page, and the dailies page too... basically refresh anything that is loading leaderboard?
        refreshStats();
        closeModal();
      }
    }
    closeModal();
  }

  return (
    <>
      <div className="animate-fade-in flex justify-center">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-40 outline-none focus:outline-none">
          <div
            className="opacity-50 fixed inset-0 z-30 bg-black"
            onClick={() => closeModal()}
          ></div>
          <div className="relative my-6 mx-auto max-w-xl lg:max-w-4xl xl:max-w-5xl max-h-screen border-0 rounded-lg shadow-lg flex flex-col w-full bg-white outline-none focus:outline-none align-middle z-40">
            {/*content*/}
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500 w-full">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                🎉 You've completed a{' '}
                <span className="font-semibold inline-block py-1 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
                  {activeModalStats.type}!
                </span>
              </h3>
              <button
                className="fas fa-times p-1 ml-auto bg-transparent border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => closeModal()}
              >
              </button>
            </div>
            {/*body*/}
            <div className="p-6 lg:grid lg:grid-cols-2 lg:gap-10 text-blueGray-500 text-center w-full items-center">
              <div className="flex flex-col">
                <div className="my-4">
                  <p className="text-xl sm:text-2xl leading-none text-primary-2 font-bold mb-3">
                    {activeModalStats.name}
                  </p>
                  {activeModalStats.upstream ? (
                    <span className="text-sm bg-gray-100 border-dotted border-2 px-2 py-0.5">
                      {activeModalStats.upstream}
                    </span>
                  ) : null}
                  {activeModalStats.database_nickname ? (
                    <div className="text-xs mt-2">
                      -- {activeModalStats.database_nickname} --
                    </div>
                  ) : null}

                  <p className="my-2 font-light text-sm">
                    {activeModalStats.closing_date}
                  </p>
                </div>
                <table className="w-full text-xl mb-6 border text-primary-2">
                  <tbody>
                    <tr>
                      <td className="p-4 border">
                        +{activeModalStats.gold_reward} 💰
                      </td>
                      <td className="p-4 border">
                        +{activeModalStats.exp_reward} EXP
                      </td>
                    </tr>
                  </tbody>
                </table>
                {page !== 'validator' ? (
                  sharedWithFamily ? (
                    <div className="inline-block mx-auto">
                    <a
                      href="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/43bb8933-cd8a-4ec2-90c8-607338b60c38/chat"
                      target="_blank"
                    >
                      <button
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 border-2 bg-clip-text text-transparent active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                      >
                        Shared! View In Guilded
                      </button>
                    </a>
                    </div>
                  ) : display !== 'demo' ? (
                    <div className="inline-block mx-auto">
                    <button
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() =>
                        shareWithGuilded(
                          playerStats,
                          activeModalStats,
                          activeGIF,
                          setSharedWithFamily
                        )
                      }
                    >
                      Share With Family
                    </button>
                    
                    </div>
                  ) : null
                ) : null}
              </div>
              <div>
                <div className="w-full">
                  <div className="box">
                    <a onClick={openBox} className="box-container">
                      <div className={`${boxClass} box-body animate-wiggle`}>
                        <div className={`${boxClass} box-lid`}>
                          <div className={`${boxClass} box-bowtie`}></div>
                        </div>
                      </div>

                      <img
                        src={activeGIF}
                        className={`${boxClass} absolute box-image object-cover`}
                      />
                    </a>
                  </div>
                </div>
                <p className="mt-2">It's time to celebrate! 😄</p>
              </div>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              {!deleteOption ?
                <button
                  className="text-red-500 background-transparent font-bold uppercase mx-6 my-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setDeleteOption(true)}
                >
                  Delete
                </button>
                :
                <span className='text-gray-800 font-bold uppercase background-transparent mx-6 my-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'>
                  Are You Sure?{' '}
                  <button
                    className="mx-2 text-red-500 font-bold uppercase hover:text-emerald-500"
                    type="button"
                    onClick={() => deleteWin()}
                  >
                    Yes
                  </button>
                  /
                  <button
                    className="ml-2 text-red-500 font-bold uppercase hover:text-emerald-500"
                    type="button"
                    onClick={() => setDeleteOption(false)}
                  >
                    No
                  </button>
                </span>
              }

            </div>
            {page !== 'player' && display !== 'demo' ? (
              <div className="flex items-center p-3 border-t border-solid border-blueGray-200 rounded-b bg-primary-3">
                <Link href="/player">
                  <button
                    className="text-emerald-500 background-transparent mx-auto font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none ease-linear transition-all duration-150"
                    type="button"
                  >
                    View Character Stats
                  </button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
