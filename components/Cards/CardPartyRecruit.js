import React from 'react';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { fetchPartyMembers } from '../Fetch/fetchMaster';

export default function CardPartyRecruit({party, partyLimit}) {
  
  const [partyMembers, setPartyMembers] = useState(null);

  useEffect(() => {
    getPartyMembers();
  }, []);

  async function getPartyMembers(){
    setPartyMembers(await fetchPartyMembers(party.id));
  }

  const style = {
    card: `bg-yellow-50 shadow-lg w-56 sm:w-72 m-2 p-4 text-dailies rounded-lg flex flex-col gap-1 justify-center`,
    name: `w-50 font-bold text-xl`,
    playerIcons: `w-8 h-8 m-1 border-2 rounded-full`,
    leader: `border-indigo-300 ml-0`,
    member: `border-yellow-100 -ml-3`,
    description: `text-left mb-2`,
    team: `flex justify-between`,
    joinUp: `bg-indigo-500 text-white p-1 shadow-sm`
  };
  const playersExample = Array(4).fill(`http://localhost:3000/logo.svg`);
  return (
    <>
      <div className={style.card}>
        <div className={style.name}>{party.name}</div>
        <div className={style.description}>
        {party.description}
        </div>
        <div className="mt-auto">
          {/* <div className="flex justify-center mb-2">
            {members.map((member, i) => (
              <img
                src={member.avatar_url}
                className={`${style.playerIcons} ${
                  i > 0 ? style.member : style.leader
                }`}
              ></img>
            ))}
          </div> */}
          <div className="row-start-2 justify-center hidden sm:flex mb-3">
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
            <Button
              variant="prominent"
              disabled={partyLimit}
              className="w-24 animate-fade-in-up text-center font-bold mx-auto"
            >
              Apply
            </Button>
            </div>
      </div>
    </>
  );
}
