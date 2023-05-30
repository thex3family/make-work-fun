import { useState } from 'react';
import Button from '../ui/Button/Button';
import { Tooltip } from '@mantine/core';

export default function TaskGroups({ tasks, name }) {
    const [showHide, setShowHide] = useState(true);
    const [taskList, setTaskList] = useState(tasks);

    function handIn(page_id, closing_date, api_secret_key) {
        // Get today's date in the appropriate format for Notion
        const today = new Date().toISOString().split('T')[0];
        const dateToSet = closing_date ? closing_date.date.start : today;

        // Update the task list before making the fetch request
        setTaskList((prevTaskList) =>
            prevTaskList.filter((task) => task.id !== page_id)
        );

        fetch(`/api/notion-update/${page_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_secret_key}`
            },
            body: JSON.stringify({
                properties: {
                    'Status': {
                        select: {
                            name: 'Complete',
                        },
                    },
                    'Closing Date': {
                        date: {
                            start: dateToSet,
                        },
                    },
                    // other properties...
                },
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Fetch request is complete
                // console.log(data);
            })
            .catch((error) => console.error(error));
    }

    function setStatus(page_id, status, api_secret_key) {
        // Update the task list before making the fetch request
        setTaskList((prevTaskList) =>
            prevTaskList.map((task) => {
                if (task.id === page_id) {
                    return {
                        ...task,
                        properties: {
                            ...task.properties,
                            Status: {
                                select: {
                                    name: status,
                                },
                            },
                        },
                    };
                }
                return task;
            })
        );

        fetch(`/api/notion-update/${page_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_secret_key}`
            },
            body: JSON.stringify({
                properties: {
                    'Status': {
                        select: {
                            name: status,
                        },
                    },
                },
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Fetch request is complete
                console.log(data);
            })
            .catch((error) => console.error(error));
    }

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
                        {taskList.length}
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
            <div className={(showHide ? '' : 'hidden ') + 'flex flex-col gap-5 mb-10'}>
                {taskList.length > 0 ?
                    taskList.map((task) => (
                        <>
                            <div className='flex gap-2 items-center w-full'>
                                <div className='flex flex-col gap-1'>
                                    {/* <div className='flex flex-col text-center bg-white bg-opacity-10 opacity-20 transition duration-500 ease-out transform hover:opacity-100 p-3 rounded mx-auto cursor-pointer'><i className='fas fa-calendar'/></div> */}
                                    <Tooltip
                                        label="Backlog"
                                        withArrow
                                        position="top-start"
                                        arrowSize={3}
                                    >
                                        <div className={`flex flex-col text-center bg-white bg-opacity-10 opacity-20 transition duration-500 ease-out transform hover:opacity-100 p-3 rounded mx-auto cursor-pointer ${task.properties.Status?.select?.name == 'Backlog' ? 'opacity-100' : ''}`} onClick={() => setStatus(task.id, 'Backlog', task.api_secret_key)}><i className='fas fa-arrow-left' /></div>
                                    </Tooltip>
                                    <Tooltip
                                        label="In Progress"
                                        withArrow
                                        position="top-start"
                                        arrowSize={3}
                                    >
                                    <div className={`flex flex-col text-center bg-white bg-opacity-10 opacity-20 transition duration-500 ease-out transform hover:opacity-100 p-3 rounded mx-auto cursor-pointer ${task.properties.Status?.select?.name == 'In Progress' ? 'opacity-100' : ''}`} onClick={() => setStatus(task.id, 'In Progress', task.api_secret_key)}><i className='fas fa-arrow-down' /></div>
                                    </Tooltip>
                                    <Tooltip
                                        label="Complete"
                                        withArrow
                                        position="top-start"
                                        arrowSize={3}
                                    >
                                    <div className='flex flex-col text-center bg-white bg-opacity-10 opacity-20 transition duration-500 ease-out transform hover:opacity-100 p-3 rounded mx-auto cursor-pointer' onClick={() => handIn(task.id, task.properties["Closing Date"], task.api_secret_key)}><i className='fas fa-check' /></div>
                                    </Tooltip>
                                </div>
                                <a className={`overflow-hidden w-full hideLinkBorder shadow-lg rounded cursor-pointer bg-primary-3 bg-cover bg-center object-cover transition duration-500 ease-out transform opacity-40 hover:scale-105 hover:opacity-100 ${task.properties.Status?.select?.name == "In Progress" ? 'opacity-100 ring-yellow-400 ring-2 rounded' : ''} `} href={task.url} target="_blank"
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
                                    <div className={`bg-dark bg-opacity-70 p-4 flex flex-col sm:flex-row justify-between align-middle items-center `}>
                                        <div className='w-full sm:w-3/5 text-center sm:text-left flex flex-col'>
                                            <p className="font-semibold mb-1 truncate">{task.properties.Name.title[0].plain_text}</p>
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
                            </div>
                        </>
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