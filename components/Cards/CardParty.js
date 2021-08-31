import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { fetchPartyMembers } from '../Fetch/fetchMaster';

export default function CardParty({ party }) {
  var start_date = new Date(party.start_date);
  var due_date = new Date(party.due_date);

  // get the number of days between the start date and due date
  var num_of_days = due_date.getDate() - start_date.getDate();

  // get the number of days from the start date and today
  var num_of_days_passed = new Date().getDate() - start_date.getDate();

  // divide this number by the number of days and convert the result into a percentage
  var deadline_completion_percentage = (num_of_days_passed / num_of_days) * 100;

  const health = 75;

  const [partyMembers, setPartyMembers] = useState(null);

  useEffect(() => {
    getPartyMembers();
  }, []);

  async function getPartyMembers() {
    setPartyMembers(await fetchPartyMembers(party.id));
  }
  console.log(party);

  return (
    <Link href={`/parties/details/?id=${party.slug}`}>
      <div
        className="bg-white shadow-md rounded-lg overflow-hidden mx-auto mt-2 text-left cursor-pointer bg-cover bg-center object-cover"
        style={{
          backgroundImage: `url(${
            party.challenge == 1
              ? '/challenge/rush.jpg'
              : '/challenge/skyrim.jpg'
          })`
        }}
      >
        <div className="bg-dark bg-opacity-90">
          <div className="py-2 px-6 pt-4">
            <div className="grid grid-cols-4 mb-4">
              <div className="row-start-1 col-span-3 mb-2">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-pink-600 bg-pink-200 uppercase last:mr-0 mr-1">
                  Time Challenge
                </span>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 uppercase last:mr-0 mr-1">
                  In Progress
                </span>
              </div>
              <div className="row-start-1 flex flex-wrap pt-2 col-span-1">
                <div className="relative w-full max-w-full flex-grow flex-1">
                  <div className="flex items-center">
                    <i
                      className={`mr-2 fas fa-heart ${
                        health >= 75
                          ? 'text-emerald-500'
                          : health >= 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    />
                    <div className="relative w-full">
                      <div
                        className={`overflow-hidden h-2 text-xs flex rounded ${
                          health >= 75
                            ? 'bg-emerald-200'
                            : health >= 50
                            ? 'bg-yellow-200'
                            : 'bg-red-200'
                        }`}
                      >
                        <div
                          style={{ width: `${health}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            health >= 75
                              ? 'bg-emerald-500'
                              : health >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="row-start-2 col-span-3 text-primary font-semibold text-2xl tracking-wide">
                {party.name}
              </h2>
              <div className="row-start-2 justify-self-end flex mt-1">
                {partyMembers
                  ? partyMembers.map((members) => (
                      <div
                        className="bg-cover bg-center object-cover rounded-full shadow-xl block border-2 border-gray-800 w-8 h-8 -ml-3 overflow-hidden"
                        style={{
                          backgroundImage: `url(${members.background_url})`
                        }}
                      >
                        <div className="bg-black bg-opacity-30 rounded-full w-8 h-8 p-0.5 flex items-center">
                          <img
                            className="avatar image mx-auto object-cover"
                            src={`${
                              members.avatar_url
                                ? members.avatar_url
                                : 'img/default_avatar.png'
                            }`}
                            alt="Avatar"
                          />
                        </div>
                      </div>
                    ))
                  : null}
              </div>

              <p className="row-start-3 col-span-3 text-primary">
                {party.description}
              </p>
            </div>
            <div className="w-full mb-4">
              <div className="shadow w-full bg-gray-200 mt-2 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-xs leading-none py-1 text-center text-white w-3/4 h-4 rounded-full "
                  style={{ width: deadline_completion_percentage + '%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
