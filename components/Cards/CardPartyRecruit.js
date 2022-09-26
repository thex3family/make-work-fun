import React from 'react';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { fetchPartyMembers } from '../Fetch/fetchMaster';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';
import AvatarMember from '../Avatars/AvatarMember';
import LoadingDots from '../ui/LoadingDots';

export default function CardPartyRecruit({ party, partyLimit }) {

  const [partyMembers, setPartyMembers] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getPartyMembers();
  }, [party]);

  async function getPartyMembers() {
    setPartyMembers(await fetchPartyMembers(party.id));
  }

  const style = {
    card: `animate-fade-in-up shadow-lg m-2 p-4 text-black rounded-lg flex flex-col gap-1 justify-center mb-3 bg-dailies-light border-dailies-dark border-4`,
    name: `font-bold text-xl truncate`,
    playerIcons: `w-8 h-8 m-1 border-2 rounded-full`,
    leader: `border-indigo-300 ml-0`,
    member: `border-yellow-100 -ml-3`,
    description: `text-left mb-2 truncate`,
    team: `flex justify-between`,
    joinUp: `bg-indigo-500 text-white p-1 shadow-sm`
  };
  return (
    <>
      <div className={style.card + ' cursor-pointer'}
        onClick={() => router.push('/parties/details?id=' + party.slug)}>
        <div className={style.name}>{party.name}</div>
        <div className={style.description}>
          {party.description}
        </div>
        <div className='mb-2'>
          {party.status == 1 ? (
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-red-600 bg-red-200">
              Recruiting
            </span>
          ) : party.status == 2 ? (
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200">
              In Progress
            </span>
          ) : party.status == 3 ? (
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-purple-600 bg-purple-200">
              In Review
            </span>
          ) : (
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
              Complete
            </span>
          )}
        </div>
        <div className="mt-auto">
          <div className="row-start-2 justify-center flex mb-3 ml-3">
            {partyMembers ? (
              <>
                {partyMembers.slice(0, 3).map((member) => (
                  <AvatarMember member={member} />
                ))}{' '}
                {(partyMembers.length - 3) > 1 ?
                  <div
                    className={`bg-cover bg-center object-cover rounded-full shadow-xl block w-8 h-8 overflow-hidden`}
                  >

                    <div className="w-8 h-8 p-0.5 justify-center align-middle flex items-center text-sm text-accents-4">
                      <span>+{partyMembers.length - 3}</span>
                    </div>

                  </div> : null
                }
              </>
            ) :
              <div className="h-8">
                <LoadingDots />
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
