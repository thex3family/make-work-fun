import { useState } from 'react';
import Button from '../ui/Button/Button';

export default function TaskGroups({ tasks, name }) {
    const [showHide, setShowHide] = useState(true);
    console.log(tasks)

    return (
        <div className=''>
            <div className="flex items-center">
                <div
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-primary pb-5 cursor-pointer inline-block"
                    onClick={() => {
                        showHide ? setShowHide(false) : setShowHide(true);
                    }}
                >
                    {name}{' '}
                    <span
                        className={`text-dailies p-3 text-sm align-middle mb-1 text-center inline-flex items-center justify-center w-4 h-4 border-2 sm:border-4 shadow-lg rounded-full font-bold border-dailies-dark bg-dailies-light`}
                    >
                        {tasks.length}
                    </span>{' '}
                    <i
                        className={
                            (showHide ? 'fas fa-chevron-up' : 'fas fa-chevron-down ') + ''
                        }
                    />
                </div>
                <div
                    className="border-t-2 border-white flex-grow mb-6 sm:mb-3 ml-3"
                    aria-hidden="true"
                ></div>
            </div>
            <div className={(showHide ? '' : 'hidden ') + 'flex flex-col gap-3 mb-10'}>
                {tasks.length > 0 ?
                    tasks.map((task) => (

                        <a className={`w-full hideLinkBorder shadow-lg rounded cursor-pointer bg-primary-3 bg-cover bg-center object-cover transition duration-500 ease-out transform opacity-40 hover:scale-105 hover:opacity-100 ${task.properties.Status?.select?.name == "In Progress" ? 'scale-105 opacity-100' : ''}`} href={task.url} target="_blank"
                            style={{
                                backgroundImage: `url(${task.properties.Priority?.select?.name.includes("Ice Cream")
                                    ? '/challenge/ice_cream.png'
                                    : task.properties.Priority?.select?.name.includes("Eat The Frog")
                                        ? '/challenge/eat_the_frog.png'
                                        : task.properties.Priority?.select?.name.includes("Priority")
                                            ? '/challenge/priority.png'
                                            : '/challenge/bonus.png'
                                    })`
                            }}>
                            <div className={`bg-dark bg-opacity-70 p-4 flex flex-col sm:flex-row justify-between align-middle items-center ${task.properties.Status?.select?.name == "In Progress" ? 'ring-yellow-400 ring-2 rounded' : ''} `}>
                                <div className='w-full sm:w-3/5 text-center sm:text-left'>
                                    <p className="font-semibold truncate mb-1">{task.properties.Name.title[0].plain_text}</p>
                                    <p className="font-normal">{task.properties["Upstream (Sum)"]?.formula.string}</p>
                                    <p className="font-normal">{task.properties.Details?.formula.string}</p>
                                    {/* <p className="font-normal">{task.properties.Priority?.select?.name}</p> */}
                                </div>
                                <div className='w-3/4 sm:w-0.5 m-4 bg-white opacity-60 h-0.5 sm:h-20 rounded'></div>
                                <div className='text-center'>
                                    <p className="font-normal">{task.properties.Punctuality?.formula.string}</p>
                                    <p className="text-xs mt-3 mx-auto font-semibold py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                                        {task.properties.Reward?.formula.string}
                                    </p>
                                </div>
                            </div>
                        </a>
                    )) :
                    (name == 'Impact Tasks' ? 
                    <a href="/missions" target="_blank">
                        <Button
                            className="mr-auto"
                            variant="prominent"
                        >
                            Pick Up A Mission
                        </Button>
                    </a>
                    : 
                    <a href="/account?tab=connect" target="_blank">
                        <Button
                            className="mr-auto"
                            variant="prominent"
                        >
                            Connect A Notion Database
                        </Button>
                    </a>)
                }
            </div>
        </div>
    );
}