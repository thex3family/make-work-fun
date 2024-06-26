import React from 'react';
import { useState, useEffect } from 'react';
import CardPartyRecruit from '@/components/Cards/CardPartyRecruit';
import Link from 'next/link';
import Button from '../ui/Button';

export default function RecruitingBoard({
  partyLimit,
  recruitingParties,
  activePartiesID
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
    rowTitle: `text-left font-bold ml-4 pt-2`,
    row: `flex p-2`,
    left: `font-bold bg-yellow-700`,
    right: `font-bold bg-yellow-700`,
    scroll: `font-bold p-1`,
    partyList: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 party-list-box w-full px-2.5`
  };
  const tabs = [`⏱ Time Challenge`, `🐉 Slay Your Dragons`];
  const sections = [`Season Pass Completion`];
  const [selectedTab, selectTab] = useState(0);
  // const exampleParty = {
  //     name:`Four Musketeers`,
  //     description:`Super cool description for our party!`,
  //     members: [],
  // }
  // const exampleFetch = Array(9).fill(exampleParty);
  // console.log(exampleFetch);
  //TODO: filter/search
  //TODO: arrow buttons functionality
  const scroll = (dir, i) => {
    const out = [...document.querySelectorAll(`.party-list-box`)];
    const scroll = out[i].scrollWidth / recruitingParties.length;
    if (dir === `left`) {
      if (out[i].scrollLeft !== 0) {
        out[i].scrollLeft -= scroll * 3;
      } else {
        out[i].scrollLeft += out[i].scrollWidth;
      }
    } else if (dir === `right`) {
      const origonalPos = out[i].scrollLeft;
      out[i].scrollLeft += scroll * 3;
      if (out[i].scrollLeft === origonalPos) {
        out[i].scrollLeft = 0;
      }
    }
    console.log(dir, out, scroll);
  };

  const recruitingParties_1 = recruitingParties.filter(
    (d) => d.challenge === 1 && !activePartiesID.includes(d.id)
  );

  const recruitingParties_2 = recruitingParties.filter(
    (d) => d.challenge === 2 && !activePartiesID.includes(d.id)
  );

  const showParties = () => {
    let parties;
    if (selectedTab === 0) {
      parties = recruitingParties_1;
    }
    if (selectedTab === 1) {
      parties = recruitingParties_2;
    }
    if (parties.length > 0) {
      return parties.map((party, i) => (
        <CardPartyRecruit key={i} party={party} partyLimit={partyLimit} />
      ));
    }
  };

  return (
    <>
      <div className={style.main}>
        <div className={style.tabs}>
          {tabs.map((tab, i) => (
            <button
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
            {sections.map((section, i) => (
              <>
                <section className={style.rowTitle}>
                  {/* {tabs[selectedTab] + ' ' + section} */}
                </section>
                <div className={style.row}>
                  {(i == 0
                    ? recruitingParties_1.length
                    : i == 1
                      ? recruitingParties_2.length
                      : null
                  ).length > 3 ? (
                    <button
                      onClick={() => scroll(`left`, i)}
                      className={style.scroll}
                    >
                      <i className="far fa-caret-square-left" />
                    </button>
                  ) : null}
                  <div className={style.partyList}>
                    {/* {recruitingParties.map((e) => (
                      <CardPartyRecruit className={style.card} {...e} />
                    ))} */}

                    {/* {recruitingParties.map((party, i) =>
                      party.challenge == selectedTab + 1 &&
                      !activePartiesID.includes(party.id) ? (
                        <CardPartyRecruit
                          key={i}
                          party={party}
                          partyLimit={partyLimit}
                        />
                      ) : null
                    )} */}
                    {showParties()}
                  </div>
                  {(i == 0
                    ? recruitingParties_1.length
                    : i == 1
                      ? recruitingParties_2.length
                      : null
                  ).length > 3 ? (
                    <button
                      onClick={() => scroll(`right`, i)}
                      className={style.scroll}
                    >
                      <i className="far fa-caret-square-right" />
                    </button>
                  ) : null}
                </div>
              </>
            ))}<a href="https://our.x3.family/c/make-work-fun" target="_blank">

              <Button
                className="px-5 font-bold py-2 rounded mb-6"
                variant="dailies"
              >
                Request A Party!
              </Button>
            </a>
          </div>
          {/* <div className={style.rowTitle}>Row Title</div>
                <div className={style.row}>
                    <button className={style.scroll}>{`<`}</button>
                    <div className={style.partyList}>
                        <div className="flex">
                        {exampleFetch.map(e => <CardPartyRecruit className={style.card} {...e}/>)}
                        </div>
                    </div>
                    <button className={style.scroll}>{`>`}</button>
                </div>
                <div className={style.rowTitle}>Row Title</div>
                <div className={style.row}>
                    <button className={style.scroll}>{`<`}</button>
                    <div className={style.partyList}>
                        <div className="flex">    
                        {exampleFetch.map(e => <CardPartyRecruit {...e}/>)}
                        </div>
                    </div>
                    <button className={style.scroll}>{`>`}</button>
                </div> */}
        </div>

      </div>
    </>
  );
}
