import { useState, useEffect } from 'react';
import moment from 'moment';
import Countdown from '@/components/Widgets/DailiesCountdown/countdown';

import HabitGroups from '@/components/Habits/habit_groups';

import Button from '@/components/ui/Button';

import { supabase } from '@/utils/supabase-client';

import {
    fetchDailies,
    fetchDailiesCompletedToday,
    dailyBonusButtons,
    claimDailyBonus
} from '@/components/Fetch/fetchMaster';

export default function PlayDailies({ player, setLevelUp, changeMode }) {
    const [downstreamHabitRefresh, setDownstreamHabitRefresh] = useState(false);

    const [habits, setHabits] = useState(null);
    const [bonusLoading, setBonusLoading] = useState(false);
    const [dailiesCount, setDailiesCount] = useState(0);
    const [dailyBonus, setDailyBonus] = useState(null);

    useEffect(() => {
        loadPlayer();
        console.log('Checking for habit changes')
        const habitSubscription = supabase
            .from(`completed_habits:player=eq.${player}`)
            .on('INSERT', payload => {
                console.log('Habit Completed', payload)
                refreshDailies();
            })
            .on('UPDATE', payload => {
                console.log('Habit Updated', payload)
                refreshDailies();
            })
            .on('DELETE', payload => {
                console.log('Habit Deleted', payload)
                refreshDailies();
            })
            .subscribe()

        async function removeSubscription() {
            await supabase.removeSubscription(habitSubscription);
        }

        console.log('habitSubscription', habitSubscription);

        return () => {
            console.log('Removing habitSubscription');
            removeSubscription();
        }

    }, []);


    async function loadPlayer() {
        console.log('Loading Player');
        refreshDailies();
        // fetchHabitChanges(player, refreshDailies);
        refreshStats();
    }

    async function refreshDailies() {
        console.log('Refreshing Dailies');
        fetchDailies(player, setHabits, setLevelUp, setDailiesCount);
        setDownstreamHabitRefresh(true);
    }

    async function refreshStats() {
        console.log('Refreshing Stats');
        dailyBonusButtons(player, setDailyBonus);
    }

    if (!habits) {
        return (
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
        );
    }

    return (
        <>
            {habits?.length != 0 ?
                <div className="text-center w-full sm:w-3/4 lg:w-1/2 m-auto mb-10 p-10 bg-dailies-default rounded">

                    {/* <div className="w-24 h-24 border-4 border-dailies-dark bg-dailies-light shadow-lg text-center inline-flex items-center justify-center mx-auto text-black my-2 font-semibold uppercase rounded-full text-4xl">
                        {dailiesCount}/{Math.floor(habits.length * 0.8)}
                    </div> */}

                    <div>
                        <div className="font-semibold text-sm text-right text-dailies">
                            {dailiesCount}/{Math.floor(habits.length * 0.8)} Habits
                        </div>
                        <div className="flex flex-wrap w-full">
                            <div className="relative w-full m-auto flex-grow flex-1">
                                <div className="flex items-center">
                                    <span className="mr-2 text-dailies font-semibold text-lg">
                                        {Math.floor((dailiesCount / Math.floor(habits.length * 0.8)) * 100)}%
                                    </span>
                                    <div className="relative w-full">
                                        <div className="overflow-hidden h-3 text-xs flex rounded-lg bg-dailies-light">
                                            <div
                                                style={{ width: `${(dailiesCount / Math.floor(habits.length * 0.8)) * 100}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-dailies-dark"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {dailiesCount >= Math.floor(habits.length * 0.8) ? (dailyBonus ?
                            (
                                <div>
                                    <Button
                                        variant="prominent"
                                        className="animate-fade-in-up mt-5 text-center font-bold"
                                        disabled={bonusLoading}
                                        onClick={() => claimDailyBonus(player, setDailyBonus, setBonusLoading)}
                                    >
                                        Claim Rewards
                                    </Button>

                                    <div className="mt-3 animate-fade-in-up">
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-2">
                                            +50 💰{' '}
                                        </span>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
                                            +100 XP
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Button
                                        variant="prominent"
                                        disabled={true}
                                        className="animate-fade-in-up mt-5 text-center font-bold"
                                    >
                                        Rewards Claimed!
                                    </Button>
                                    <div className="mt-3 animate-fade-in-up">
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-2">
                                            +50 💰{' '}
                                        </span>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-gray-600 bg-gray-200 last:mr-0 mr-1">
                                            +100 XP
                                        </span>
                                    </div>
                                </div>
                            )) : <Countdown date={moment().endOf('day').utc().format()} />}
                    </div>
                </div>
                : null}
            <div className="text-center">
                {habits != null ? (
                    habits.length != 0 ? (
                        <>
                            <HabitGroups
                                habits={habits}
                                fetchDailies={fetchDailies}
                                fetchDailiesCompletedToday={fetchDailiesCompletedToday}
                                player={player}
                                setHabits={setHabits}
                                setLevelUp={setLevelUp}
                                setDailiesCount={setDailiesCount}
                                downstreamHabitRefresh={downstreamHabitRefresh}
                                setDownstreamHabitRefresh={setDownstreamHabitRefresh}
                            />
                        </>

                    ) : (
                        <span className="text-center text-accents-6 font-semibold text-md">
                            You have no active habits... <a onClick={()=>changeMode(2)} className="text-emerald-500 font-semibold cursor-pointer">let's change that!</a>
                        </span>
                    )
                ) : null}
            </div>
        </>
    );
}