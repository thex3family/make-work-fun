import TitleButton from '@/components/Titles/TitleButton';

export default function TitleModal({
  setShowTitleModal,
  titles,
  playerStats,
  pushTitle,
  refreshStats
}) {
  return (
    <div className="h-screen flex justify-center">
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-40 outline-none focus:outline-none">
        <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                😲 Pick Your Favourite Title!
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
            <div className="grid grid-cols-2 my-3 mx-2 text-blueGray-500">
              <div className="mx-2 my-2">
                <div className="text-md text-center mb-1">
                  Currently Unlocked
                </div>
                {titles.map((title) =>
                  playerStats.current_level - title.level_requirement > 0 &&
                  playerStats.current_level - title.level_requirement < 5 ? (
                    <TitleButton
                      pushTitle={pushTitle}
                      title_id={title.id}
                      refreshStats={refreshStats}
                      variant={`${
                        playerStats.title == title.name ? 'prominent' : 'slim'
                      }`}
                      disabled={false}
                      title_name={title.name}
                    />
                  ) : null
                )}
              </div>
              {titles.map((title) =>
                playerStats.current_level - title.level_requirement < 0 &&
                playerStats.current_level - title.level_requirement > -5 ? (
                  <div className="mx-2 my-2">
                    <div className="text-md text-center mb-1">
                      Unlocked At Level <b>{title.level_requirement}</b>
                    </div>
                    <TitleButton
                      pushTitle={pushTitle}
                      title_id={title.id}
                      refreshStats={refreshStats}
                      variant="slim"
                      disabled={true}
                      title_name={title.name}
                    />
                  </div>
                ) : null
              )}
            </div>
            <div className="flex items-center my-2 mx-4">
              <div
                className="border-t border-accents-2 flex-grow mr-3"
                aria-hidden="true"
              ></div>
              <div className="text-center text-black text-xl font-bold">
                Exclusive Titles
              </div>
              <div
                className="border-t border-accents-2 flex-grow ml-3"
                aria-hidden="true"
              ></div>
            </div>

            <div className="grid grid-cols-2 my-3 mx-2 text-blueGray-500">
              {titles.map((title) =>
                title.special ? (
                  <div className="mx-2 my-2">
                    <TitleButton
                      pushTitle={pushTitle}
                      title_id={title.id}
                      refreshStats={refreshStats}
                      variant={`${
                        playerStats.title == title.name ? 'prominent' : 'slim'
                      }`}
                      disabled={
                        !playerStats.role.includes(
                          title.name.slice(0, title.name.length - 3)
                        )
                      }
                      title_name={title.name}
                      description={title.description}
                    />
                  </div>
                ) : null
              )}
            </div>

            {/*footer*/}
            <div className="flex items-center justify-center p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => setShowTitleModal(false)}
              >
                Close
              </button>
              {/* <button
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  Save
                </button> */}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-30 bg-black"></div>
    </div>
  );
}
