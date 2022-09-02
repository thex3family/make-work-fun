import { supabase } from '@/utils/supabase-client';
import React, { useState, useEffect } from 'react';


import {
    DndContext,
    closestCenter,
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

import EditHabitRow from '@/components/Habits/edit_habit_row';

export default function EditDailies({ player, changeMode }) {
    const [habits, setHabits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
                .order('sort', { ascending: true })
                .order('name', { ascending: true });

            const groupByRoutine = groupBy(data, (h) => h.group.name);
            console.log(groupByRoutine);

            setHabits(data);

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
                name: h.name,
                player: h.player,
                is_active: h.is_active,
                description: h.description,
                icon: h.icon,
                group: h.group.id,
                type: h.type.id,
                exp_reward: h.exp_reward,
                area: h.area
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
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <>
            <div className="animate-fade-in-up">

                {/* start */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex items-center">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary pb-5 inline-block">
                            Routine 1
                        </div>
                        <div
                            className="border-t-2 border-white flex-grow mb-6 sm:mb-3 ml-3"
                            aria-hidden="true"
                        ></div>
                    </div>
                    <div
                        className={'flex flex-col gap-3 overflow-x-auto flex-nowrap mb-10'}
                    >

                        {habits ?
                            <SortableContext
                                items={habits}
                                strategy={verticalListSortingStrategy}
                            >
                                {habits.map((h) => (
                                    < EditHabitRow
                                        key={h.id}
                                        habit_id={h.id}
                                        habit_title={h.name}
                                        habit_type={h.type.name}
                                        habit_group={h.group.name}
                                        habit_sort={h.sort}
                                        habit_area={h.area}
                                        habit_description={h.description}
                                        exp_reward={h.exp_reward}
                                        habit_icon={h.icon}
                                        player={player}
                                    />
                                ))}
                            </SortableContext> : null}
                    </div>
                </DndContext>
            </div>
            <div className="text-center my-5">
                <button className="px-5 border-2 border-dailies-dark text-center text-dailies bg-dailies-light font-bold py-2 rounded hover:bg-dailies-dark hover:border-white hover:text-white"
                    onClick={() => saveHabits()}>
                    Save
                </button>
            </div>
        </>
    );
    function handleDragEnd(event) {
        const { active, over } = event;

        // if (active.id !== over.id) {
        //   setHabits((habits) => {
        //     const oldIndex = habits.indexOf(active.id);
        //     const newIndex = habits.indexOf(over.id);

        //     return arrayMove(habits, oldIndex, newIndex);
        //   });
        // }

        if (active.id !== over.id) {
            setHabits((habits) => {
                const oldIndex = habits.findIndex(f => f.id === active.id);
                const newIndex = habits.findIndex(f => f.id === over.id);
                return arrayMove(habits, oldIndex, newIndex);
            });
        }
    }

}