import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { fetchPartyMembers } from '../Fetch/fetchMaster';

export default function CardParty({ party }) {
  var start_date = new Date(party.party_start_date);
  var due_date = new Date(party.party_due_date);
  var now = new Date();

  // To calculate the date difference of two dates
  var start_to_end_days =
    (due_date.getTime() - start_date.getTime()) / (1000 * 3600 * 24);
  var start_to_now_days =
    (now.getTime() - start_date.getTime()) / (1000 * 3600 * 24);

  // divide this number by the number of days and convert the result into a percentage
  var deadline_completion_percentage =
    (start_to_now_days / start_to_end_days) * 100;


  const health = party.health * 10;

  const [partyMembers, setPartyMembers] = useState(null);

  useEffect(() => {
    getPartyMembers();
  }, []);

  async function getPartyMembers() {
    setPartyMembers(await fetchPartyMembers(party.party_id));
  }
  console.log(party);

  return (
    <Link href={`/parties/details/?id=${party.party_slug}`}>
      <div
        className="bg-white shadow-md rounded-lg overflow-hidden mx-auto mt-2 text-left cursor-pointer bg-cover bg-center object-cover"
        style={{
          backgroundImage: `url(${
            party.party_challenge == 1
              ? '/challenge/rush.jpg'
              : '/challenge/skyrim.jpg'
          })`
        }}
      >
        <div className="bg-dark bg-opacity-90">
          <div className="py-2 px-6 pt-4">
            <div className="grid grid-cols-4 mb-4">
              <div className="row-start-1 col-span-3 mb-1">
                {party.party_challenge == 1 ? (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-pink-600 bg-pink-200 last:mr-0 mr-1 mb-1">
                    ⏱ Time Challenge
                  </span>
                ) : party.party_challenge == 2 ? (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-indigo-600 bg-indigo-200 last:mr-0 mr-1 mb-1">
                    🐉 Slay Your Dragon
                  </span>
                ) : (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1 mb-1">
                    Raid Boss
                  </span>
                )}
                {party.party_status == 1 ? (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-1 mb-1">
                    Recruiting
                  </span>
                ) : party.party_status == 2 ? (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-1 mb-1">
                    In Progress
                  </span>
                ) : party.party_status == 3 ? (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1 mb-1">
                    Complete
                  </span>
                ) : (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-red-600 bg-red-200 last:mr-0 mr-1 mb-1">
                    Failed
                  </span>
                )}
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

              <h2 className="row-start-2 col-span-4 sm:col-span-3 text-primary font-semibold text-2xl tracking-wide truncate">
                {party.party_name}
              </h2>
              <div className="row-start-2 justify-self-end hidden sm:flex mt-1">
                {partyMembers
                  ? partyMembers.map((member) => (
                      <div
                        className={`bg-cover bg-center object-cover rounded-full shadow-xl block w-8 h-8 -ml-3 overflow-hidden ${
                          member.role == 'Party Leader'
                            ? 'border-2 border-yellow-300'
                            : 'border-2 border-gray-700'
                        }`}
                        style={{
                          backgroundImage: `url(${member.background_url})`
                        }}
                      >
                        <div className="bg-black bg-opacity-30 rounded-full w-8 h-8 p-0.5 flex items-center">
                          <img
                            className="avatar image mx-auto object-cover"
                            src={`${
                              member.avatar_url
                                ? member.avatar_url
                                : 'img/default_avatar.png'
                            }`}
                            alt="Avatar"
                          />
                        </div>
                      </div>
                    ))
                  : null}
              </div>

              <p className="row-start-3 col-span-4 sm:col-span-3 text-primary truncate">
                {party.party_description}
              </p>
            </div>
            <div className="w-full mb-4">
              <div className="shadow w-full bg-gray-200 mt-2 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-xs leading-none py-1 text-center text-white w-3/4 h-4 rounded-full "
                  style={{
                    width: party.party_start_date
                      ? deadline_completion_percentage
                      : 0 + '%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
