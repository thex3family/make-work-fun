import React from 'react';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { fetchPartyMembers } from '../Fetch/fetchMaster';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';
import AvatarMember from '../Avatars/AvatarMember';

export default function CardPartyRecruit({party, partyLimit}) {
  
  const [partyMembers, setPartyMembers] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getPartyMembers();
  }, []);

  async function getPartyMembers(){
    setPartyMembers(await fetchPartyMembers(party.id));
  }

  const style = {
    card: `bg-yellow-50 shadow-lg w-full sm:w-72 m-2 p-4 text-dailies rounded-lg flex flex-col gap-1 justify-center mb-3`,
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
                      <AvatarMember member = {member}/>
                    ))
                  : null}
              </div>
            <Button
              variant="prominent"
              className="w-24 animate-fade-in-up text-center font-bold mx-auto"
              // onClick={()=>joinParty()}
              onClick={()=>router.push('/parties/details?id='+party.slug)}
            >
              View
            </Button>
            </div>
      </div>
    </>
  );
}
