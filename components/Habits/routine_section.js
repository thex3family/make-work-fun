import HabitSquare from '@/components/Habits/habit_square';
import { useState } from 'react';

export default function RoutineSection({
  habit_group_name,
  associated_habits,
  fetchDailies,
  fetchDailiesCompletedToday
}) {

  const [showHide, setShowHide] = useState(false);

  return (
    <div className="animate-fade-in-up" key={habit_group_name}>
      <h1 className="text-2xl md:text-3xl font-extrabold text-dailies pb-5">
        {habit_group_name} Routines
      </h1>
      <div className="flex flex-row gap-5 overflow-x-auto flex-nowrap mb-10">
        {/* start */}
        {associated_habits.map((h) => (
          <HabitSquare
            habit_id={h.id}
            habit_title={h.habit}
            habit_description={h.description}
            streak_duration={h.streak_duration}
            streak_start={h.streak_start}
            streak_end={h.streak_end}
            exp_reward={h.exp_reward}
            habit_icon={h.icon}
            fetchDailies={fetchDailies}
            fetchDailiesCompletedToday={fetchDailiesCompletedToday}
          />
        ))}
      </div>
    </div>
  );
}
