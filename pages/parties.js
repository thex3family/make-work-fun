import React from 'react';
import { useState, useEffect } from 'react';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';

export default function parties() {
  return (
    <section className="animate-slow-fade-in justify-center bg-dailies-pattern bg-fixed bg-cover">
      <BottomNavbar />
      <div className=" max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="animate-fade-in-up bg-dailies-default rounded p-10 opacity-90">
          <div className="pb-5">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
              Parties
            </h1>
          </div>
          <div className="text-center">
            <section>
              <h2 className="text-xl align-middle justify-center inline-flex font-bold text-dailies">Your Active Party</h2>
              <div className="max-w-lg bg-white shadow-md rounded-lg overflow-hidden mx-auto mt-2">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-gray-700 font-semibold text-2xl tracking-wide mb-2">
                      Code Masters
                    </h2>
                    <p className="text-black">
                      Let's work on our coding projects!
                    </p>
                    <p className="text-black">
                      memberAvatar1 memberAvatar2 memberAvatar3
                    </p>
                    <div className="w-full">
                      <div className="shadow w-full bg-grey-light mt-2">
                        <div className="bg-green text-xs leading-none py-1 text-center text-white w-3/4 h-4"></div>
                      </div>
                    </div>
                    <p className="text-black">Metrics</p>
                  </div>
                  <div className="mt-1">
                    <a
                      href="#"
                      className="block tracking-widest uppercase text-center shadow bg-indigo-600 hover:bg-indigo-700 focus:shadow-outline focus:outline-none text-white text-xs py-3 px-10 rounded"
                    >
                      View Party
                    </a>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-xl align-middle justify-center inline-flex font-bold text-dailies mt-4">Parties Recruiting</h2>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
