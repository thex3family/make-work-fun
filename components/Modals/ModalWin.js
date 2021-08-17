import { generateGIF } from '@/components/Widgets/generateGIF';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import Link from 'next/link';
import { shareWithGuilded } from '@/utils/sendGuildedWebhook';

export default function WinModal({
  page,
  activeModalStats,
  setShowWinModal,
  playerStats,
  refreshStats
}) {
  const [activeGIF, setActiveGIF] = useState(null);

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

  const [boxClass, setBoxClass] = useState('');

  function openBox() {
    boxClass != 'hide-box' ? setBoxClass('open-box') : '';
  }

  function closeModal() {
    setShowWinModal(false);
    setBoxClass('');
  }

  return (
    <>
      <div className="h-screen flex justify-center">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-40 outline-none focus:outline-none">
          <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  🎉 You've completed a{' '}
                  <span className="font-semibold inline-block py-1 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
                    {activeModalStats.type}!
                  </span>
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={() => closeModal()}
                >
                  <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              {/*body*/}
              <div className="relative p-6 flex-auto text-blueGray-500 text-center">
                <div className="my-4">
                  <p className="text-xl sm:text-2xl leading-none text-primary-2 font-bold mb-3">
                    {activeModalStats.name}
                  </p>
                  {activeModalStats.upstream ? (
                    <span className="text-sm bg-gray-100 border-dotted border-2 px-2 py-0.5">
                      {activeModalStats.upstream}
                    </span>
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
                        className={`${boxClass} absolute box-image`}
                      />
                    </a>
                  </div>
                </div>

                {/* <Gif
                      className="w-3/4 mx-auto justify-center"
                      gif={activeGIF}
                      hideAttribution={true}
                      noLink={true}
                      width={300}
                    /> */}
                <p className="mt-2">It's time to celebrate! 😄</p>
              </div>
              {/*footer*/}
              <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                <button
                  className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => closeModal()}
                >
                  Close
                </button>
                <a
                  href="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/43bb8933-cd8a-4ec2-90c8-607338b60c38/chat"
                  target="_blank"
                >
                  {page !== 'validator' ? (
                    <button
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() =>
                        shareWithGuilded(
                          playerStats,
                          activeModalStats,
                          activeGIF
                        )
                      }
                    >
                      Share With Family
                    </button>
                  ) : null}
                </a>
              </div>
              {page !== 'player' ? (
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
        <div className="opacity-25 fixed inset-0 z-30 bg-black"></div>
      </div>
    </>
  );
}
