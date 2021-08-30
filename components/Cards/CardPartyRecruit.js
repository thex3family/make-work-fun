import React from 'react';
import Button from '@/components/ui/Button';

export default function CardPartyRecruit({party}) {
  const style = {
    card: `bg-yellow-50 shadow-lg w-56 m-2 p-2 text-dailies rounded-lg`,
    name: `w-50 font-bold`,
    playerIcons: `w-8 h-8 m-1 border-2 rounded-full`,
    leader: `border-indigo-300 ml-0`,
    member: `border-yellow-100 -ml-3`,
    description: `text-left`,
    team: `flex justify-between`,
    joinUp: `bg-indigo-500 text-white p-1 shadow-sm`
  };
  const exampleDescription = `Really long descriptions can go here. Maybe something like 140 characters. That should force leaders to be consise when describing parties. `;
  const playersExample = Array(4).fill(`http://localhost:3000/logo.svg`);
  // console.log(props);
  return (
    <>
      <div className={style.card}>
        <div className={style.name}>{party.name}</div>
        <div className={style.description}>
        {party.description}
        </div>
        <div className={style.team}>
          <div className="flex">
            {playersExample.map((player, i) => (
              <img
                src={player}
                className={`${style.playerIcons} ${
                  i > 0 ? style.member : style.leader
                }`}
              ></img>
            ))}
          </div>
          <div>
            <Button
              variant="prominent"
              disabled={false}
              className="w-24 animate-fade-in-up text-center font-bold"
            >
              Join!
            </Button>
            {/* <button className={style.joinUp}>
                        Join up!
                    </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
