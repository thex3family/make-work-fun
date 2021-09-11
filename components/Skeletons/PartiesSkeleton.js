export default function PartiesSkeleton() {
  return (
    <>
      <section>
        <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="animate-fade-in-up rounded sm:bg-black sm:bg-opacity-90 bg-none bg-opacity-100 opacity-95">
            <div className="pt-10 pb-5">
              <div className="mx-auto max-w-xs sm:max-w-sm h-10 sm:h-20 bg-gray-600 rounded animate-pulse mb-6" />
              <div className="mx-auto max-w-lg h-8 sm:h-10 bg-gray-600 rounded animate-pulse" />
              <div className="mx-auto max-w-sm h-14 sm:h-16 mt-6 bg-primary-2 rounded-xl mb-6 grid grid-cols-2 px-2 gap-2" >
              <div className="w-full bg-gray-600 rounded-xl animate-pulse my-2" />
              </div>
            </div>
            <div className="animate-fade-in-up mx-0">
              <div className="flex items-center w-full">
                <div
                  className="border-t-2 border-gray-600 flex-grow mb-6 sm:mb-3 mr-3"
                  aria-hidden="true"
                ></div>

                <div className="mx-auto max-w-lg w-60 h-10 bg-gray-600 rounded animate-pulse mb-6" />
                <div
                  className="border-t-2 border-gray-600 flex-grow mb-6 sm:mb-3 ml-3"
                  aria-hidden="true"
                ></div>
              </div>
              <div className="flex flex-col gap-4 mb-10 justify-center">
                <div className="w-full h-52 bg-gray-600 rounded-lg animate-pulse mb-3" />
                <div className="w-full h-52 bg-gray-600 rounded-lg animate-pulse mb-3" />
                <div className="w-full h-52 bg-gray-600 rounded-lg animate-pulse mb-3" />
                {/* start */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
