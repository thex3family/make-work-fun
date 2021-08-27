import RecentWinsSkeleton from './RecentWinsSkeleton';
import WeekWinsSkeleton from './WeekWinsSkeleton';

export default function DailiesSkeleton() {
  return (
    <>
      <section>
        <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up rounded sm:bg-black sm:bg-opacity-90 bg-none bg-opacity-100 opacity-95">
            <div className="pt-10 pb-5">
              <div className="mx-auto max-w-lg w-96 h-12 sm:h-20 bg-gray-600 rounded animate-pulse mb-6" />
              <div className="text-center mb-5">
                <div className="w-24 h-24 border-4 border-primary-2 bg-gray-600 shadow-lg text-center inline-flex items-center justify-center mx-auto text-black my-2 font-semibold uppercase rounded-full text-4xl"></div>
                <div>
                  <div className="text-3xl animate-pulse">
                    <i className="text-gray-800 far fa-star" />
                    <i className="text-gray-800 far fa-star" />
                    <i className="text-gray-800 far fa-star" />
                    <i className="text-gray-800 far fa-star" />
                  </div>
                </div>
                <div className="mx-auto max-w-xs w-72 h-14 sm:h-16 mt-6 bg-gray-600 rounded animate-pulse mb-6" />
              </div>
            </div>
            <div className="animate-fade-in-up mx-8 sm:mx-0">
              <div className="flex items-center w-full">
                <div
                  className="border-t-2 border-gray-600 flex-grow mb-6 sm:mb-3 mr-3"
                  aria-hidden="true"
                ></div>

                <div className="mx-auto max-w-lg w-40 h-10 bg-gray-600 rounded animate-pulse mb-6" />
                <div
                  className="border-t-2 border-gray-600 flex-grow mb-6 sm:mb-3 ml-3"
                  aria-hidden="true"
                ></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 overflow-x-auto flex-nowrap mb-10 justify-center">
                <div className="w-full sm:w-56 h-36 sm:h-64 bg-gray-600 rounded animate-pulse mb-6" />
                <div className="w-full sm:w-56 h-36 sm:h-64 bg-gray-600 rounded animate-pulse mb-6" />
                <div className="w-full sm:w-56 h-36 sm:h-64 bg-gray-600 rounded animate-pulse mb-6" />
                {/* start */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
