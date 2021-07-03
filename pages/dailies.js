import Link from 'next/link';
//import Button from '@/components/ui/Button';
import React from 'react';
import { supabase } from '../utils/supabase-client';
import { useState, useEffect } from 'react';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';

function wasHabitCompletedToday(streak_end) {
  return streak_end
    ? new Date(streak_end).getUTCDate() == new Date().getUTCDate()
    : false;
}

function habit_progress_statement(streak_duration) {
  return (streak_duration != 0) & (streak_duration != null)
    ? "🔥 You're on a " +
        (streak_duration > 9 ? '9+ ' : streak_duration + ' Day ') +
        'Streak!'
    : '✊ You got this!';
}

function habitSquare(
  habit_id,
  habit_title,
  habit_description,
  streak_duration,
  streak_start,
  streak_end,
  habit_handler
) {
  return (
    <div
      key={habit_id}
      onClick={() => habit_handler(habit_id)}
      className={`my-4 mb-12 p-8 ${
        wasHabitCompletedToday(streak_end) ? `bg-green` : `bg-primary-2`
      } rounded z-10 square`}
    >
      <img className="mb-6 m-auto w-1/2" src="img/example_habit.png" />
      <h2 className="text-xl font-bold mb-3 text-center text-white">
        {habit_title}
      </h2>
      <p className="text-md mb-5 text-center">
        {habit_progress_statement(streak_duration)}
      </p>
    </div>
  );
}

function habit_group_routine_section(
  habit_group_name,
  associated_habits,
  habit_handler
) {
  return (
    <div key={habit_group_name}>
      <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
        {habit_group_name} Routines
      </h1>
      <div className="flex flex-row gap-5 overflow-x-scroll flex-nowrap">
        {/* start */}
        {associated_habits.map((h) =>
          habitSquare(
            h.id,
            h.habit,
            h.description,
            h.streak_duration,
            h.streak_start,
            h.streak_end,
            habit_handler
          )
        )}
      </div>
    </div>
  );
}

function generate_habit_group_sections(habit_map, habit_handler) {
  var currentHabitKey = null;
  var generated_habit_group_sections = [];

  var habit_iterator = habit_map.keys();

  currentHabitKey = habit_iterator.next().value;

  do {
    generated_habit_group_sections.push(
      habit_group_routine_section(
        currentHabitKey,
        habit_map.get(currentHabitKey),
        habit_handler
      )
    );

    currentHabitKey = habit_iterator.next().value;
  } while (currentHabitKey != null);

  return generated_habit_group_sections;
}

function generate_habit_map(habits) {
  var habit_map = new Map();

  for (var i = 0; i < habits.length; i++) {
    if (habit_map.get(habits[i].habit_group) == null) {
      habit_map.set(habits[i].habit_group, [habits[i]]);
    } else {
      var currentHabits = habit_map.get(habits[i].habit_group);

      habit_map.set(habits[i].habit_group, [...currentHabits, habits[i]]);
    }
  }

  return habit_map;
}

export default function dallies() {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    userLoaded,
    user,
    session,
    userDetails,
    userOnboarding,
    subscription
  } = useUser();

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        router.replace('/account');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    fetchDailies();
  }

  async function fetchDailies() {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('dailies')
        .select('*')
        .eq('player', user.id)
        .eq('is_active', true);

      setHabits(data);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
      console.log(habits);
    }
  }

  //console.log("dallies");

  var habit_groups = [];
  var habit_map = null;

  if (habits != null) {
    if (habits.length != 0) {
      //console.log('Habits have been fetched');
      //console.log('Habits: ', habits);

      for (var i = 0; i < habits.length; i++) {
        if (!(habits[i].habit_group in habit_groups)) {
          habit_groups.push(habits[i].habit_group);
        }
      }

      //console.log('Habit Groups from the retrieved habits: ', habit_groups);

      habit_map = generate_habit_map(habits);

      //console.log('Habit Map: ', habit_map);

    } else if (habits.length == 0) {
      console.log("User doesn't have any active habits");
      console.log('Habits: ', habits);
    }
  } else {
    console.log('Habits are being fetched');
    console.log('Habits: ', habits);
  }

  function handleHabitCompletionStatusChange(habit_id) {
    console.log('handleHabitCompletionStatusChange');

    /*
    var updatedHabitList = mock_active_habit_state;
    updatedHabitList[habit_id].is_completed = !updatedHabitList[habit_id]
      .is_completed;

    updateMockHabits([...updatedHabitList]);
    */
  }

  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Dailies
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore.
          </p>
        </div>
        <button onClick={() => console.log(habits)}>
          Push me to check if data is pulled properly
        </button>
        <div>
          {habits != null
            ? habits.length != 0
              ? generate_habit_group_sections(
                  habit_map,
                  habit_groups,
                  handleHabitCompletionStatusChange
                )
              : 'You have no active habits'
            : null}
        </div>
        <div className="pt-10">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Get Work Done
          </h1>
          <p className="text-xl text-accents-6 sm:text-2xl max-w-2xl">
            Get productive with us.
          </p>
        </div>
      </div>
    </section>
  );
}
