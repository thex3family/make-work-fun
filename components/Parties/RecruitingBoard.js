import React from 'react';
import { useState } from 'react';
import CardPartyRecruit from '@/components/Cards/CardPartyRecruit';
import Button from '../ui/Button';

export default function RecruitingBoard({
  partyLimit,
  recruitingParties = [],
  activePartiesID = []
}) {
  const style = {
    bg: `bg-dailies-default`,
    main: `w-full mt-4`,
    tab: `border-0 
          bg-white 
          bg-opacity-20 
          text-gray-100
          font-bold 
          rounded-lg 
          p-1 m-1 px-3
          py-2`,
    tabSelected: `
          shadow-lg 
          border-gray-100 
          bg-opacity-60
          bg-gradient-to-r from-emerald-500 to-blue-500
          font-bold
          text-gray-100 
          rounded-lg 
          p-1 m-1 px-3
          py-2`,
    tabs: `w-full text-left p-1 overflow-x-auto flex-row flex justify-center`,
    board: `w-full rounded-lg shadow-lg bg-cover bg-center object-cover`,
    row: `flex p-2`,
    partyList: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 party-list-box w-full px-2.5`,
    empty: `w-full text-center py-10 px-4 font-semibold text-gray-100`
  };
  const tabs = [`⏱ Time Challenge`, `🐉 Slay Your Dragons`];
  const [selectedTab, selectTab] = useState(0);
  //TODO: filter/search

  const recruitingParties_1 = recruitingParties.filter(
    (d) => d.challenge === 1 && !activePartiesID.includes(d.id)
  );

  const recruitingParties_2 = recruitingParties.filter(
    (d) => d.challenge === 2 && !activePartiesID.includes(d.id)
  );

  const selectedParties =
    selectedTab === 1 ? recruitingParties_2 : recruitingParties_1;

  return (
    <>
      <div className={style.main}>
        <div className={style.tabs}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={i === selectedTab ? style.tabSelected : style.tab}
              onClick={() => {
                selectTab(i);
              }}
            >
              {tab}{' '}
              <div
                className={
                  'text-white ml-1 text-center inline-flex items-center justify-center relative leading-tight font-bold text-sm ' +
                  (i === selectedTab
                    ? 'border-white'
                    : 'text-dailies border-dailies-dark')
                }
              >
                {i == 0
                  ? recruitingParties_1.length
                  : i == 1
                    ? recruitingParties_2.length
                    : null}
              </div>
            </button>
          ))}
        </div>
        <div
          className={style.board}
          style={{
            backgroundImage: `url(${selectedTab == 0 ? '/challenge/rush.jpg' : '/challenge/skyrim.jpg'
              })`
          }}
        >
          <div className="bg-dark bg-opacity-70 rounded-lg">
            <div className={style.row}>
              {selectedParties.length > 0 ? (
                <div className={style.partyList}>
                  {selectedParties.map((party) => (
                    <CardPartyRecruit
                      key={party.id}
                      party={party}
                      partyLimit={partyLimit}
                    />
                  ))}
                </div>
              ) : (
                <div className={style.empty}>
                  No parties are recruiting for this challenge right now.
                </div>
              )}
            </div>
            <a href="https://our.x3.family/c/make-work-fun" target="_blank">

              <Button
                className="px-5 font-bold py-2 rounded mb-6"
                variant="dailies"
              >
                Request A Party!
              </Button>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
