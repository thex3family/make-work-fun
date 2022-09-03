import { supabase } from '@/utils/supabase-client';
import React, { useState, useEffect } from 'react';


import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import EditHabitRow, { SimpleOverlay } from '@/components/Habits/edit_habit_row';
import { IconPickerItem } from 'react-fa-icon-picker';

export default function EditDailies({ player, changeMode }) {
    const [habits, setHabits] = useState(null);
    const [items, setItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [activeId, setActiveId] = useState();

    function groupBy(xs, f) {
        return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    }

    async function fetchHabits() {
        console.log('Fetching All Habits')
        try {
            const { data, error } = await supabase
                .from('habits')
                .select('id, name, player, is_active, description, icon, sort, group (id, name), type (id, name), exp_reward, area')
                .eq('player', player)
                .order('group', { ascending: true })
                .order('sort', { ascending: true })
                .order('name', { ascending: true });

            const groupByRoutine = groupBy(data, (h) => h.group.name);

            // add if statement if doesn't exist
            // groupByRoutine['Empty Category'] = []

            console.log(groupByRoutine);
            setItems(groupByRoutine);
            // setHabits(data);

            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false);
        }
    }

    async function saveHabits() {
        setSaving(true);

        // make the sort # the index

        const sortedHabits = habits.map((h, index) => {
            return {
                sort: index,
                id: h.id,
                group: h.group.id,
                // Don't need any of the below because that is handled by the individual component.
                // name: h.name,
                // player: h.player,
                // is_active: h.is_active,
                // description: h.description,
                // icon: h.icon,
                // type: h.type.id,
                // exp_reward: h.exp_reward,
                // area: h.area
            }
        });


        console.log('Upserting All Habits')
        try {
            const { data, error } = await supabase
                .from('habits')
                .upsert(sortedHabits)
            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            alert(error.message)
        } finally {
        }

        setSaving(false);
    }

    useEffect(() => {
        fetchHabits();
        // fetchGroups();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const habitTypes =
        [
            {
                "id": 1,
                "name": "Checkbox"
            },
            {
                "id": 2,
                "name": "Counter"
            },
            {
                "id": 3,
                "name": "Duration"
            },
            {
                "id": 4,
                "name": "Location"
            },
            {
                "id": 5,
                "name": "Feeling"
            },
            {
                "id": 6,
                "name": "Note"
            },
            {
                "id": 7,
                "name": "Picture"
            }
        ]

    async function insertNewHabit() {
        const newRow = [{
            description: null,
            exp_reward: 25,
            group: 1,
            icon: 'FaCheck',
            is_active: true,
            name: 'New Habit',
            player: player,
            sort: 1,
            type: 1,
            area: 'Daily Quest'
        }];

        console.log(newRow);

        const newArray = items.Recurring.push(newRow);
        console.log(newArray);
    }


    return (
        <>
            <div className="animate-fade-in-up">

                {/* start */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    {items ? Object.entries(items).map((g) =>
                    (
                        <>
                            <div
                                className="flex items-center">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary pb-5 inline-block">
                                    {g[0]}
                                </div>
                                <div
                                    className="border-t-2 border-white flex-grow mb-6 sm:mb-3 ml-3"
                                    aria-hidden="true"
                                ></div>
                            </div>
                            <div
                                className={'flex flex-col gap-3 flex-nowrap mb-10'}
                            >
                                <SortableContext
                                    id={g[0]}
                                    items={g[1]}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {g[1] ? g[1].map((h) => (
                                        < EditHabitRow
                                            key={h.id}
                                            habit_id={h.id}
                                            habit_title={h.name}
                                            habit_type={h.type.name}
                                            habit_group={findContainer(h.id)}
                                            habit_sort={h.sort}
                                            habit_area={h.area}
                                            habit_description={h.description}
                                            exp_reward={h.exp_reward}
                                            habit_icon={h.icon}
                                            habit_active={h.is_active}
                                            player={player}
                                            items={items}
                                            setItems={setItems}
                                        />
                                    )) : null}
                                    {/* <div className={`animate-fade-in-up w-full my-4 mb-0 relative bg-cover bg-center object-cover rounded z-10 square shadow-lg border-4 border-dotted border-dailies-dark flex flex-col justify-center p-4`}>
                                        <div className='text-white text-lg font-semibold mb-4'>Add A New Daily Quest!</div>
                                        <div className='mb-4 flex flex-row gap-2'>
                                            <div className='text-black text-sm font-semibold m-auto bg-dailies-light h-24 w-24 rounded flex-col flex justify-center'
                                                onClick={() => insertNewHabit()}>
                                                <div className="flex justify-center">
                                                    <IconPickerItem
                                                        className=""
                                                        icon={'FaCheck'}
                                                        size={35}
                                                        color="#000"
                                                    />
                                                </div>
                                                <div>
                                                    Checkbox
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                </SortableContext>
                            </div>
                        </>)) :
                        <div className="animate-fade-in-up mx-0">
                            <div className="flex items-center w-full">

                                <div className="mx-auto max-w-lg w-60 h-10 bg-gray-600 rounded animate-pulse mb-6" />
                                <div
                                    className="border-t-2 border-gray-600 flex-grow mb-6 sm:mb-3 ml-3"
                                    aria-hidden="true"
                                ></div>
                            </div>
                            <div className="flex flex-col gap-3 sm:gap-5 overflow-x-auto flex-nowrap mb-10 justify-center">
                                <div className="w-full h-28 sm:h-36 bg-gray-600 rounded animate-pulse mb-6" />
                                <div className="w-full h-28 sm:h-36 bg-gray-600 rounded animate-pulse mb-6" />
                                <div className="w-full h-28 sm:h-36 bg-gray-600 rounded animate-pulse mb-6" />
                                {/* start */}
                            </div>
                        </div>
                    }
                    <DragOverlay>
                        <SimpleOverlay id={activeId} />
                    </DragOverlay>
                </DndContext>
            </div>
        </>
    );
    function findContainer(id) {
        if (id in items) {
            console.log(id);
            return id;
        }

        return Object.keys(items).find((key) => {
            return items[key].some((x) => x.id === id);
        });
    }

    function handleDragStart(event) {
        const { active } = event;
        setActiveId(active.id);
    }

    function handleDragOver(event) {
        const { active, over } = event;


        // Find the containers
        const activeContainer = findContainer(active.id);

        const overContainer = findContainer(over.id);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];

            // Find the indexes for the items
            const activeIndex = activeItems.findIndex((x) => x.id === active.id);
            const overIndex = overItems.findIndex((x) => x.id === over.id);

            let newIndex;

            if (over.id in prev) {
                // We're at the root droppable of a container

                newIndex = overItems.length + 1;
            } else {
                const isBelowLastItem =
                    over &&
                    overIndex === overItems.length - 1;

                const modifier = isBelowLastItem ? 1 : 0;

                console.log("overIndex>>>", overIndex);
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id)
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    items[activeContainer][activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                ]
            };
        });
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        //  const { id } = active;
        const { id: overId } = over;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }

        const activeIndex = items[activeContainer].findIndex((x) => x.id === active.id);
        const overIndex = items[overContainer].findIndex((x) => x.id === over.id);

        if (activeIndex !== overIndex) {
            setItems((items) => ({
                ...items,
                [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
            }));
        }

        setActiveId(null);
    }
}