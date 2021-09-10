import HabitSquare from '@/components/Habits/habit_square';
import { useEffect, useState } from 'react';

export default function RoutineSection({
  habit_group_name,
  associated_habits,
  fetchDailies,
  fetchDailiesCompletedToday
}) {
  const [showHide, setShowHide] = useState(true);
  const [habitCounter, setHabitCounter] = useState([]);
  // console.log(associated_habits)

  useEffect(() => {
    if (habitCounter.length !== 0) {
      determineShowHide();
    }
  }, [habitCounter]);

  function determineShowHide() {
    // console.log(habitCounter.length)
    if (associated_habits.length - habitCounter.length === 0) {
      setShowHide(false);
    } else {
      setShowHide(true);
    }
  }

  return (
    <div className="animate-fade-in-up" key={habit_group_name}>
      <div className="flex items-center">
        <div
          className="border-t-2 border-white flex-grow mb-6 sm:mb-3 mr-3"
          aria-hidden="true"
        ></div>

        <div
          className="text-xl sm:text-2xl md:text-3xl font-bold text-primary pb-5 cursor-pointer inline-block"
          onClick={() => {
            showHide ? setShowHide(false) : setShowHide(true);
          }}
        >
          {habit_group_name == 'Uncategorized'
            ? habit_group_name
            : habit_group_name + ' Routines'}{' '}
          <span
            className={
              'text-dailies p-3 text-sm align-middle mb-1 bg-dailies-light text-center inline-flex items-center justify-center w-4 h-4 border-2 sm:border-4 border-dailies-dark shadow-lg rounded-full font-bold'
            }
          >
            {associated_habits.length - habitCounter.length}
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
      <div
        className={
          (showHide ? '' : 'hidden ') +
          'flex flex-col sm:flex-row gap-3 sm:gap-5 overflow-x-auto flex-nowrap mb-10'
        }
      >
        {/* start */}
        {associated_habits.map((h) => (
          <HabitSquare
            key={h.id}
            habit_id={h.id}
            habit_title={h.habit}
            habit_type={h.habit_type}
            habit_detail={h.latest_details}
            habit_description={h.description}
            streak_duration={h.streak_duration}
            streak_start={h.streak_start}
            streak_end={h.streak_end}
            exp_reward={h.exp_reward}
            habit_icon={h.icon}
            fetchDailies={fetchDailies}
            fetchDailiesCompletedToday={fetchDailiesCompletedToday}
            habitCounter={habitCounter}
            setHabitCounter={setHabitCounter}
          />
        ))}
      </div>
    </div>
  );
}
