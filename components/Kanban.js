import React from "react";
const imgs = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=144&h=144&q=80",
    "https://images.unsplash.com/photo-1526510747491-58f928ec870f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=144&h=144&q=80",
    "https://images.unsplash.com/photo-1506697084665-7f7d652308af?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=144&h=144&q=80",
];
const style = {
    container: `w-full h-screen p-2 flex-1 bg-gray-800`,
    kanban: `w-full h-full inline-flex overflow-hidden space-x-2`,
    column: `w-80 h-full flex-col`,
    deck: `h-full overflow-auto`,
    card: `bg-gray-500 rounded-lg p-2 m-2 shadow-xl`,
    members : `mt-1 flex items-center`,
    image: (s) => `w-6 h-6 rounded-full object-cover border-2 border-gray-500 ${s}`
};
const description = `Long sentence too serve as the description goes here`
const info = [
    [[`Fnatic`, description, imgs], 
    [`Cloud9`, description, [imgs[2],imgs[0],imgs[1]]], 
    [`Team Liquid`, description, [imgs[1],imgs[2],imgs[0]]]],
    [[`Counter Logic Gaming`, description, [imgs[0],imgs[0],imgs[0]]],
    [`Team Dignitas`, description, [imgs[1],imgs[1],imgs[1]]],
    [`Taipei Assassins`, description, [imgs[2],imgs[2],imgs[2]]],],];
const objectify = array => {
    return array.map(item => {
        return {
            title: item[0],
            description: item[1],
            members: item[2],
        };
    });
};
const data = {
    "Time Challenge" : objectify(info[0]),
    "Dragon's Lair" : objectify(info[1]),
};
const clickHandler = (e) => {
    const isButton = (el) => (el.type === "submit");
    const parent = e.target.parentElement;
    let target = isButton(parent) ? parent :
    isButton(parent.parentElement) ? parent.parentElement: e.target;
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
        <button className={`w-full`} onClick={clickHandler}>
            <h3>
                {props.title || `Title`}
            </h3>
            <p className="text-left">
                {props.description || `Description`}
            </p>
            <Members memberList={props.members}></Members>
        </button>
    </li>
const Column = props => 
    <div className={style.column}>
        <div><h3 className="ml-3">{props.title}</h3></div>
        <div className="h-full">
            <ul className={style.deck}>
                {Object.entries(props.entries).map(([_,entry],i,array)=>
                <Entry title={entry.title} description={entry.description} members={entry.members}></Entry>)}
                <div className="h-6"></div>
            </ul>
        </div>
    </div>
const Kanban = props => {
    return (
    <div name="kanban_container" className={style.container}>
        <div className={style.kanban}>
            {Object.entries(data).map(([key,value]) => 
            <Column title={key} entries={value}></Column>)}
        </div>
        {props.children}
    </div>);
}

export default Kanban;