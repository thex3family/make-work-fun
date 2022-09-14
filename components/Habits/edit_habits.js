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
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import EditHabitRow, { SimpleOverlay } from '@/components/Habits/edit_habit_row';
import { IconPickerItem } from 'react-fa-icon-picker';
import HabitContainer from './habit_container';
import AddMenu from './add_menu';

export default function EditDailies({ player, changeMode }) {
    const [items, setItems] = useState(null);
    const [saveToDatabase, setSaveToDatabase] = useState(false);
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
                .select('id, name, player, is_active, description, icon, sort, group (id, name, sort), type (id, name), exp_reward, area')
                .eq('player', player)
                .order('sort', { foreignTable: 'group', ascending: true })
                .order('sort', { ascending: true })
                .order('name', { ascending: true });

            const groupByRoutine = groupBy(data, (h) => h.group.id);

            // add if statement if doesn't exist
            const habit_group = { data } = await supabase
                .from('habit_group')
                .select('*')
                .or('player.eq.' + player + ', player.is.null')
                .order('sort', { ascending: true });

            const renamedGroupByRoutine = {}

            habit_group.map((g) => {
                groupByRoutine[g.id] ?
                    (renamedGroupByRoutine[g.name + ' - ' + g.id] = groupByRoutine[g.id])
                    : renamedGroupByRoutine[g.name + ' - ' + g.id] = [];
            })

            console.log(renamedGroupByRoutine);
            setItems(renamedGroupByRoutine);

            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false);
        }
    }

    async function saveHabitContainer(habits, containerID) {
        setSaving(true);

        await Promise.all(
            habits.map(async (h, index) => {
                // We are just updating the sort and group for everything in this array.
                
                try {
                    const { data, error } = await supabase.from('habits')
                        .update({
                            sort: index,
                            group: containerID
                        })
                        .match({ id: h.id })
    
                    if (error && status !== 406) {
                        throw error;
                    }
    
                } catch (error) {
                    alert(error.message)
                } finally {
                }
            })
        );
        setSaving(false);
    }

    useEffect(() => {
        fetchHabits();
        fetchHabitTypes();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    const [habitTypes, setHabitTypes] = useState(null);
    async function fetchHabitTypes() {
        try {
            const { data, error } = await supabase
                .from('habit_type')
                .select('*')
                .order('id', { ascending: true });

            setHabitTypes(data);

            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            // alert(error.message)
        } finally {
        }
    }

    async function insertNewHabit(type_name, type_id, group_name, group_id) {
        const newHabit = {
            description: null,
            exp_reward: 25,
            group: group_id,
            icon: 'FaCheck',
            is_active: true,
            name: 'New ' + type_name + ' Habit',
            player: player,
            type: type_id,
            area: 'Daily Quest'
        };

        try {
            const { data, error } = await supabase.from('habits').insert(newHabit);

            if (error && status !== 406) {
                throw error;
            }


            // need to get back the information that was inserted, and then add to array
            console.log('sb insert data', data[0]);

            const newArray = [...items[group_name], data[0]];

            setItems((items) => ({
                ...items,
                [group_name]: newArray
            }));


        } catch (error) {
            alert(error.message);
        } finally {
        }

    }


    useEffect(() => {
        console.log('Items Changed', items)
        if (saveToDatabase) {
            // Update database if save to database
            console.log('Save To Database');
            saveHabitContainer(items[saveToDatabase], saveToDatabase.replace(/[^0-9]/g, ''));
            setSaveToDatabase(false);
        }
    }, [items]);

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
                            <SortableContext
                                id={g[0]}
                                items={g[1]}
                                strategy={verticalListSortingStrategy}
                            >
                                <div
                                    className="flex items-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary inline-block">
                                        {g[0].split(' -')[0]}
                                    </div>
                                    <div
                                        className="border-t-2 border-white flex-grow ml-3"
                                        aria-hidden="true"
                                    ></div>
                                    <AddMenu habitTypes={habitTypes} insertNewHabit={insertNewHabit} group_name={g[0]} group_id={g[0].replace(/[^0-9]/g, '')} />
                                </div>
                                <div
                                    className='flex flex-col gap-3 flex-nowrap mb-10'
                                >
                                    <HabitContainer
                                        id={g[0]}
                                        habits={g[1]}
                                        player={player}
                                        items={items}
                                        setItems={setItems}
                                        findContainer={findContainer}
                                    ></HabitContainer>
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
                                </div>
                            </SortableContext>
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
            // console.log(id);
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
        // Triggered whenever the row is dragged over another row.
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

                // console.log("overIndex>>>", overIndex);
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

        console.log('Saving habit id ' + active.id + ' to ' + overContainer)
        setSaveToDatabase(overContainer);
    }

    function handleDragEnd(event) {
        console.log('Drag Finished');
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

            console.log('Saving habit id ' + active.id + ' to ' + overContainer)
            setSaveToDatabase(overContainer);
        }

        setActiveId(null);
    }
}