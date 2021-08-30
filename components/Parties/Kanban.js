import React from "react";
import { useReducer } from 'react';
import { supabase } from '@/utils/supabase-client';
import Button from "@/components/ui/Button"


const style = {
    container: `w-full h-screen p-2 flex-1 bg-dailies-default`,
    kanban: `w-full h-full grid-cols-2 inline-flex overflow-hidden space-x-2`,
    column: `w-full h-full flex-col text-dailies`,
    deck: `h-full overflow-auto`,
    card: `bg-white rounded-lg p-2 m-2 shadow-xl text-black`,
    members : `mt-1 flex items-center w-10`,
    image: (s) => `w-6 h-6 rounded-full object-cover border-2 border-white ${s}`
};

const clickHandler = (e) => {
    const isButton = (el) => (el.type === "submit");
    const parent = e.target.parentElement;
    let target = isButton(parent) ? parent :
    isButton(parent.parentElement) ? parent.parentElement: e.target;
    console.log(`clicked`);
};

const Members = props =>           
    <div className={style.members}>
    {props.memberList.map((img,i)=> <img
            className={i=0 ?
                style.image :
                style.image`-ml-1`}
            src={img}></img>)                
    }
    </div>
const Entry = props => 
    <li className={style.card}>
        <h3>
            {props.title}
        </h3>
        <p className="text-left">
            {props.description || `Description`}
        </p>
        <div className={`flex justify-between mt-2`}>
            <Members 
            className={`ml-5`} 
            memberList={props.members}></Members>
            <Button
                variant="prominent"
                disabled={false}
                className="animate-fade-in-up text-center font-bold"
                onClick={clickHandler}>
                Join Up!
            </Button>
        </div>
    </li>
const Column = props => {
    //console.log('Column - props:', props);
    return (
    <div className={style.column}>
        <div><h3 className="text-center font-bold">
            {props.title}
        </h3></div>
        <div className="h-full">
            <ul className={style.deck}>
                {Object.entries(props.entries).map(([_,entry],i,array)=>
                <Entry title={entry.name} description={entry.description} members={entry.member_avatar_urls}></Entry>)}
                <div className="h-6"></div>
            </ul>
        </div>
    </div>
    )}
const Kanban = props => {
    //console.log('props:', props);

    // (1) get the recruiting parties from the props
    const { recruitingParties } = props;

     // (2) organize them by their challenge type
    var challenge_parties_map = new Map();

    for (var i = 0; i < recruitingParties.length; i++) {
        if (challenge_parties_map.get(recruitingParties[i].challenge_name) == null) {
            challenge_parties_map.set(recruitingParties[i].challenge_name, [ recruitingParties[i] ]);
        } else {
            var currentParties = challenge_parties_map.get(recruitingParties[i].challenge_name);

            console.log('currentParties:', currentParties);

            challenge_parties_map.set(recruitingParties[i].challenge_name, [ ...currentParties, recruitingParties[i] ]);
        }
    }

    //console.log('challenge_parties_map:', challenge_parties_map);

    // (3) Go through the map to create the columns

    var columns = [];

    var challenge_parties_iter = challenge_parties_map.keys();

    var currentChallengeKey = challenge_parties_iter.next().value;

    do {
        columns.push(<Column title={currentChallengeKey} entries={challenge_parties_map.get(currentChallengeKey)}></Column>);
        currentChallengeKey = challenge_parties_iter.next().value;
    } while (currentChallengeKey != null);

    return (
    <div name="kanban_container" className={style.container}>
        <div className={style.kanban}>
            { columns }
        </div>
        {props.children}
    </div>);
}

export default Kanban;
