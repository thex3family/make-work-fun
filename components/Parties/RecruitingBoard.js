import React from 'react';
import { useState, useEffect } from 'react';
import CardPartyRecruit from '@/components/Cards/CardPartyRecruit';

export default function RecruitingBoard(props) {
    const style = {
        bg:`bg-dailies-default`,
        main:`w-full mt-4`,
        tab:`border-4 
            border-yellow-900 
            border-opacity-60 
            text-dailies
            font-bold 
            rounded-lg 
            p-1 m-1`,
        tabSelected:`
            shadow-lg 
            border-gray-100 
            bg-opacity-60
            bg-yellow-900 
            font-bold
            text-gray-100 
            rounded-lg 
            p-2 m-1`,
        tabs:`w-full text-left p-1`,
        board:`w-full bg-yellow-900 bg-opacity-60 rounded-lg shadow-lg`,
        rowTitle:`text-left font-bold ml-4 pt-2`,
        row:`flex p-2`,
        left:`font-bold bg-yellow-700`,
        right:`font-bold bg-yellow-700`,
        scroll:`font-bold p-1`,
        partyList:`overflow-x-scroll flex party-list-box`, 
    }
    const tabs = [`Time Challenge`, `Dragon's Lair`, `Raid Groups`];
    const sections = [`Season Pass Completion`,`Guild Quests`];
    const [selectedTab, selectTab] = useState(0);
    const exampleParty = {
        name:`Four Musketeers`,
        description:`Super cool description for our party!`,
        members: [],
    }
    const exampleFetch = Array(9).fill(exampleParty);
    console.log(exampleFetch);
    //TODO: filter/search
    //TODO: arrow buttons functionality
    const scroll = (dir, i) => {
        const out = [...document.querySelectorAll(`.party-list-box`)];
        const scroll = out[i].scrollWidth / exampleFetch.length;
        if(dir === `left`){
            if(out[i].scrollLeft !== 0){
                out[i].scrollLeft -= scroll * 3;
            } else {
                out[i].scrollLeft += out[i].scrollWidth;
            }
        } else if(dir === `right`){
            const origonalPos = out[i].scrollLeft;
            out[i].scrollLeft += scroll * 3;
            if(out[i].scrollLeft === origonalPos ) {
                out[i].scrollLeft = 0; 
            }
        }
        console.log(dir, out, scroll);
    }
    return(
        <>
        <div className={style.main}>
            <div className={style.tabs}>
                {tabs.map((tab,i) => 
                    <button 
                    className={i===selectedTab?style.tabSelected:style.tab}
                    onClick={()=>{selectTab(i)}}
                    >
                    {tab}
                    </button>
                    )}
            </div>
            <div className={style.board}>
                {sections.map((section, i) => 
                <>
                    <section className={style.rowTitle}>
                        {tabs[selectedTab] + " " + section}
                    </section>
                    <div className={style.row}>
                    <button onClick={() => scroll(`left`, i)} className={style.scroll}>{`<`}</button>
                    <div className={style.partyList}>
                        <div className="flex">
                            {exampleFetch.map(e => <CardPartyRecruit className={style.card} {...e}/>)}
                        </div>
                    </div>
                    <button onClick={() => scroll(`right`, i)} className={style.scroll}>{`>`}</button>
                    </div>
                </>
                )}
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
    )
}