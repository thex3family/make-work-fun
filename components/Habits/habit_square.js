import { IconPickerItem } from 'react-fa-icon-picker';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase-client';

export default function HabitSquare({
  habit_id,
  habit_title,
  habit_description,
  streak_duration,
  streak_start,
  streak_end,
  exp_reward,
  habit_icon,
  fetchDailies,
  fetchDailiesCompletedToday,
  habitCounter,
  setHabitCounter
}) {
  const [saving, setSaving] = useState(false);
  const [habitCompletedToday, setHabitCompletedToday] = useState(false);

  useEffect(() => {
    if (streak_end) wasHabitCompletedToday(streak_end);
  }, [streak_end]);

  function wasHabitCompletedToday(streak_end) {
    const habitCompletedToday =
      new Date(streak_end).getDay() == new Date().getDay();
    if (habitCompletedToday) {
      setHabitCompletedToday(habitCompletedToday);
      setHabitCounter((v) => [...v, 'Complete']);
    }
  }

  function habit_progress_statement(streak_duration) {
    return (streak_duration != 0) & (streak_duration != null)
      ? '' +
          (streak_duration > 9 ? '9+ ' : streak_duration + ' day ') +
          'streak! 🔥'
      : 'You got this! ✊';
  }

  async function toggleHabitStatus(habit_id) {
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
        // console.log('testDateStr: ' + testDateStr);
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

        // console.log('fetchData - second condition');

        const { data, error } = await supabase
          .from('completed_habits')
          .delete()
          .match({ id: fetchData[0].id });

        setHabitCompletedToday(false);
        setHabitCounter((v) => v.splice(0, v.length - 1));

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

  function handleHabitCompletionStatusChange(habit_id) {
    //console.log('handleHabitCompletionStatusChange');
    toggleHabitStatus(habit_id).then(() => {
      fetchDailies('click');
    });
  }

  return (
    <div
      key={habit_id}
      onClick={
        saving ? null : () => handleHabitCompletionStatusChange(habit_id)
      }
      className={`my-4 mb-0 sm:mb-8 p-4 sm:p-6 w-full sm:w-64 relative ${
        habitCompletedToday
          ? `bg-emerald-500 border-emerald-700`
          : `bg-dailies-light border-dailies-dark`
      } rounded z-10 square cursor-pointer shadow-lg border-4`}
    >
      {saving ? (
        <div className="inline-flex absolute top-0 right-0 mt-2 mr-2 text-xs font-semibold py-2 px-3 uppercase rounded text-white bg-gradient-to-r from-emerald-500 to-blue-500 border-emerald-500 z-50">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
        </div>
      ) : (
        <div></div>
      )}
      {/* {saving ? <div className="relative"><div className="absolute right-0 top-0 text-xs font-semibold py-1 px-2 uppercase rounded text-gray-600 bg-gray-200">
                    Saving...
                  </div></div> : <div></div>} */}
      <div className="flex flex-row sm:flex-none sm:flex-col">
        <div className="flex justify-start sm:justify-center sm:mb-6 m-auto w-1/4 sm:w-full mr-3 sm:mr-0">
          <IconPickerItem
            className=""
            icon={habit_icon}
            size={45}
            color="#000"
          />
        </div>
        {/* <img className="mb-6 m-auto w-1/2" src="img/example_habit.png" /> */}
        <div className="flex-col text-left sm:text-center w-3/4 sm:w-full">
          <h2 className="text-lg sm:text-xl font-bold sm:mb-3 text-black">
            {habit_title}
          </h2>
          <p className="text-md sm:mb-2 text-black">
            {habit_progress_statement(streak_duration)}
          </p>
          <div className="">
            <div className="">
              <p className="text-xs mt-3">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
                  +{exp_reward} XP
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
