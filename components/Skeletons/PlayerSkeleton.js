import RecentWinsSkeleton from "./RecentWinsSkeleton";
import WeekWinsSkeleton from "./WeekWinsSkeleton";

export default function PlayerSkeleton(){

  return (
    <>

<section>
        <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up rounded sm:bg-black sm:bg-opacity-90 bg-none bg-opacity-100 opacity-95">
            <div className="pt-0 sm:pt-10 pb-5">
              <div className="mx-auto max-w-lg h-20 bg-gray-600 rounded animate-pulse mb-6" />
              <div className="mx-auto max-w-xs h-10 bg-gray-600 rounded animate-pulse" />
            </div>
            <div className="animate-fade-in-up max-w-6xl px-0 sm:px-4 md:px-10 mx-auto w-full -m-24">
              <div className="relative md:pt-32 pb-16 pt-24">
                <div className="px-4 md:px-10 mx-auto w-full">
                  <div>
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-5">
                      <div className="w-full mx-auto mt-2 md:mt-0 mb-6 md:mb-0 xs:w-1/4 sm:w-2/3 lg:w-1/2 h-full text-center relative">
                        <div className="w-full h-96 bg-gray-600 rounded animate-pulse mb-6" />
                        <div className="w-60 mx-auto h-10 bg-gray-600 rounded animate-pulse" />
                      </div>
                      <div className="flex-grow w-full sm:w-2/3 sm:ml-10 lg:ml-0 sm:items-right lg:w-1/2 h-full py-0 sm:py-5">
                        <div className="w-full h-56 bg-primary-2 rounded p-4">
                          <div className="w-28 h-4 rounded-sm bg-gray-600 animate-pulse mb-3" />
                          <div className="w-24 h-6 rounded-sm bg-gray-600 animate-pulse mb-3" />
                          <div className="flex flex-row gap-2 mb-4">
                            <div className="w-14 h-4 rounded-sm bg-gray-600 animate-pulse" />
                            <div className="w-6 h-4 rounded-sm bg-gray-600 animate-pulse" />
                            <div className="w-8 h-4 rounded-sm bg-gray-600 animate-pulse" />
                          </div>
                          <div className="flex flex-row gap-2 mb-5">
                            <div className="w-8 h-4 rounded-sm bg-gray-600 animate-pulse" />
                            <div className="w-full h-4 rounded-sm bg-gray-600 animate-pulse" />
                          </div>
                          <div className="w-full h-12 rounded-sm bg-gray-600 animate-pulse" />
                        </div>
                        <WeekWinsSkeleton/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <RecentWinsSkeleton/>
            </div>
          </div>
        </div>
      </section>
</>
  );
  }