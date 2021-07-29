import { supabase } from '@/utils/supabase-client';
import { useState, useEffect } from 'react';
import { IconPickerItem } from 'react-fa-icon-picker';

import moment from 'moment';

function wasHabitCompletedToday(streak_end) {
  return streak_end
    ? new Date(streak_end).getDay() == new Date().getDay()
    : false;
}

function habit_progress_statement(streak_duration) {
  return (streak_duration != 0) & (streak_duration != null)
    ? '' +
        (streak_duration > 9 ? '9+ ' : streak_duration + ' day ') +
        'streak! 🔥'
    : 'You got this! ✊';
}

function habitSquare(
  habit_id,
  habit_title,
  habit_description,
  streak_duration,
  streak_start,
  streak_end,
  exp_reward,
  habit_icon,
  handleHabitCompletionStatusChange,
  saving
) {
  return (
    <div
      key={habit_id}
      onClick={saving ? null : () => handleHabitCompletionStatusChange(habit_id)}
      className={`my-4 mb-8 p-6 w-64 ${
        wasHabitCompletedToday(streak_end)
          ? `bg-emerald-500 border-emerald-700`
          : `bg-dailies-light border-dailies-dark`
      } rounded z-10 square cursor-pointer shadow-lg border-4`}
    >
        {saving ? (
          <span className="fixed inline-flex left-0 bottom-0 ml-2 mb-24 sm:ml-4 sm:mb-4 text-md font-semibold py-3 px-4 uppercase rounded text-emerald-600 bg-emerald-200 z-50">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving...
          </span>
        ) : (
          <div></div>
        )}
      {/* {saving ? <div className="relative"><div className="absolute right-0 top-0 text-xs font-semibold py-1 px-2 uppercase rounded text-gray-600 bg-gray-200">
                  Saving...
                </div></div> : <div></div>} */}
      <div className="flex justify-center mb-6 m-auto w-full">
        <IconPickerItem
          className=""
          icon={habit_icon}
          size={100}
          color="#000"
        />
      </div>
      {/* <img className="mb-6 m-auto w-1/2" src="img/example_habit.png" /> */}
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
  handleHabitCompletionStatusChange,
  saving
) {
  return (
    <div className="animate-fade-in-up" key={habit_group_name}>
      <h1 className="text-2xl md:text-3xl font-extrabold text-dailies pb-5">
        {habit_group_name} Routines
      </h1>
      <div className="flex flex-row gap-5 overflow-x-auto flex-nowrap mb-10">
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
            h.icon,
            handleHabitCompletionStatusChange,
            saving
          )
        )}
      </div>
    </div>
  );
}

async function toggleHabitStatus(habit_id, setSaving, fetchDailiesCompletedToday) {
  setSaving(true);
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
      console.log('testDateStr: ' + testDateStr);
      /*
          Notes from us trying to resolve that timezone issue (supabase is still not saving the timezone)

          testDate.toLocaleDateString() + " " + testDate.toLocaleTimeString(); // doesn't give the timezone
          testDate.toString() // getting gmt 0700 not recognized
        */

      const { data, error } = await supabase.from('completed_habits').insert([
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

    // setLoading(true);
  } catch (e) {
    alert(e.message);
  } finally {
    fetchDailiesCompletedToday();
    setSaving(false);
    // setLoading(false);
  }
}

export default function HabitGroups({ habits, fetchDailies, fetchDailiesCompletedToday }) {
  const [saving, setSaving] = useState(false);

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

  function handleHabitCompletionStatusChange(habit_id) {
    //console.log('handleHabitCompletionStatusChange');

    toggleHabitStatus(habit_id, setSaving, fetchDailiesCompletedToday).then(() => {
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

  var currentHabitKey = null;
  var generated_habit_group_sections = [];

  var habit_iterator = habit_map.keys();

  currentHabitKey = habit_iterator.next().value;

  do {
    generated_habit_group_sections.push(
      habit_group_routine_section(
        currentHabitKey,
        habit_map.get(currentHabitKey),
        handleHabitCompletionStatusChange,
        saving
      )
    );

    currentHabitKey = habit_iterator.next().value;
  } while (currentHabitKey != null);

  return generated_habit_group_sections;
}
