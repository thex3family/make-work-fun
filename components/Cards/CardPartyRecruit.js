import React from 'react';
import Button from '@/components/ui/Button';

export default function CardPartyRecruit({party}) {
  const style = {
    card: `bg-yellow-50 shadow-lg w-56 sm:w-72 m-2 p-4 text-dailies rounded-lg flex flex-col gap-1 justify-center`,
    name: `w-50 font-bold text-lg`,
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
          <div className="flex justify-center mb-2">
            {playersExample.map((player, i) => (
              <img
                src={player}
                className={`${style.playerIcons} ${
                  i > 0 ? style.member : style.leader
                }`}
              ></img>
            ))}
          </div>
            <Button
              variant="prominent"
              disabled={false}
              className="w-24 animate-fade-in-up text-center font-bold mx-auto"
            >
              Apply
            </Button>
            </div>
      </div>
    </>
  );
}
