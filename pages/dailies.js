import Link from 'next/link';
import Button from '@/components/ui/Button';
import React from 'react';
import { supabase } from '../utils/supabase-client';
import { useState, useEffect } from 'react';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import { data } from 'autoprefixer';
import moment from 'moment';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';

function wasHabitCompletedToday(streak_end) {
  return streak_end
    ? new Date(streak_end).getDay() == new Date().getDay()
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
  exp_reward,
  habit_handler,
) {
  return (
    <div
      key={habit_id}
      onClick={() => habit_handler(habit_id)}
      className={`my-4 mb-12 p-8 w-1/3 ${
        wasHabitCompletedToday(streak_end) ? `bg-emerald-500 border-emerald-700` : `bg-dailies-light border-dailies-dark`
      } rounded z-10 square cursor-pointer shadow-lg border-4`}
    >
      <img className="mb-6 m-auto w-1/2" src="img/example_habit.png" />
      <h2 className="text-xl font-bold mb-3 text-center text-black">
        {habit_title}
      </h2>
      <p className="text-md mb-5 text-center text-black">
        {habit_progress_statement(streak_duration)}
      </p>
      <div className="mt-6">
              <div className="">
                <div className="">
                  <p className="text-xs mt-3 text-center">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
                      +{exp_reward} XP
                    </span>
                  </p>
                </div>
              </div>
            </div>
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
      <h1 className="text-3xl font-extrabold text-dailies pb-5">
        {habit_group_name} Routines
      </h1>
      <div className="flex flex-row gap-5 overflow-x-auto flex-nowrap">
        {/* start */}
        {associated_habits.map((h) =>
          habitSquare(
            h.id,
            h.habit,
            h.description,
            h.streak_duration,
            h.streak_start,
            h.streak_end,
            h.exp_reward,
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
  const [dailiesCount, setDailiesCount] = useState(0);
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
      fetchDailiesCompletedToday();
      console.log(habits);
    }
  }

  function getDateStr(date_obj) {
    return (
      date_obj.getFullYear() +
      '/' +
      (date_obj.getMonth() + 1) +
      '/' +
      date_obj.getDate()
    );
  }

  
  async function fetchDailiesCompletedToday() {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('player', user.id)
        .gte('closing_date', moment().startOf('day').utc().format());

        console.log(data.length);
        setDailiesCount(data.length);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  async function toggleHabitStatus(habit_id) {
    try {
      const user = supabase.auth.user();

      // See if the habit has been completed today
      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('player', user.id)
        .eq('habit', habit_id)
        .gte('closing_date', moment().startOf('day').utc().format());

      if (error && status !== 406) {
        throw error;
      }

      //console.log('toggleHabitStatus - data - ', data);

      const fetchData = data;

      if (fetchData.length == 0) {
        // if not completed, post to database (i.e. fetchData is an empty array)

        let testDateStr = new Date();
        console.log("testDateStr: " + testDateStr);
        /*
          Notes from us trying to resolve that timezone issue (supabase is still not saving the timezone)

          testDate.toLocaleDateString() + " " + testDate.toLocaleTimeString(); // doesn't give the timezone
          testDate.toString() // getting gmt 0700 not recognized
        */

        const { data, error } = await supabase
          .from('completed_habits')
          .insert([
            {
              player: user.id,
              closing_date: testDateStr,
              exp_reward: 25,
              habit: habit_id
            }
          ]);

        if (error && status !== 406) {
          throw error;
        }
      } else if (fetchData.length >= 1) {
        // if completed, remove (i.e. fetchData is an array with one element)

        console.log('fetchData - second condition');

        const { data, error } = await supabase
          .from('completed_habits')
          .delete()
          .match({ id: fetchData[0].id });

        if (error && status !== 406) {
          throw error;
        }
      }

      setLoading(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
      fetchDailiesCompletedToday();
    }
  }

  function handleHabitCompletionStatusChange(habit_id) {
    //console.log('handleHabitCompletionStatusChange');

    toggleHabitStatus(habit_id).then(() => {
      fetchDailies();
    });
  }

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

  return (
    <section className="justify-center bg-dailies-pattern bg-fixed">
    <BottomNavbar/>
      <div className=" max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="bg-dailies-default rounded p-10 opacity-95">
          <div className="pb-5">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
              Dailies
            </h1>
            <div className="text-center mb-5">
              <div className="font-semibold text-dailies text-xl mb-3">
                Complete 4 comissions daily to receive bonus rewards!{' '}
              </div>
              <div className="w-24 h-24 border-4 border-dailies-dark shadow-lg text-center inline-flex items-center justify-center mx-auto text-black my-2 font-semibold uppercase rounded-full text-4xl">
                {dailiesCount}/4
              </div>
              <div className="text-3xl">{Array.from({ length: dailiesCount }, (_, i) => <span key={i}>⭐</span>)}</div>
              
              <div className="mt-4">
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-1">
                      +50 💰{' '}
                    </span>
                    </div>
            </div>
          </div>
           {/* <button onClick={() => console.log(habits)}>
          Push me to check if data is pulled properly
        </button>  */}
          <div>
            {habits != null
              ? habits.length != 0
                ? generate_habit_group_sections(
                    habit_map,
                    handleHabitCompletionStatusChange,
                  )
                : 'You have no active habits'
              : null}
          </div>
          
          <div className="text-center my-5">
            <Link href="/dailies/edit">
              <button
                className="px-5 border-2 border-dailies-dark text-center text-dailies font-bold py-2 rounded"
              >
                Edit Dailies
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
