import HabitSquare from '../Habits/habit_square';

export default function DailiesEntry() {
  const associated_habits_1 = [
    {
      id: 86,
      habit: 'Morning Mood',
      description: null,
      streak_duration: null,
      streak_start: null,
      streak_end: null,
      player: '17ae471a-3096-4c57-af41-1cf67e52dd67',
      is_active: true,
      habit_group: 'Morning',
      group_sort: 2,
      exp_reward: 25,
      icon: 'FaStreetView',
      habit_type: 'Feeling',
      sort: 0,
      latest_details: 'happy'
    },
    {
      id: 112,
      habit: 'Drink Water!',
      description: null,
      streak_duration: null,
      streak_start: null,
      streak_end: null,
      group_sort: 1,
      exp_reward: 25,
      icon: 'FaFillDrip',
      habit_type: 'Counter',
      sort: 1,
      latest_details: '1'
    },
    {
      id: 12,
      habit: 'Make My Bed',
      description: null,
      streak_duration: null,
      streak_start: null,
      streak_end: null,
      player: '17ae471a-3096-4c57-af41-1cf67e52dd67',
      is_active: true,
      habit_group: 'Morning',
      group_sort: 2,
      exp_reward: 25,
      icon: 'FaBed',
      habit_type: 'Checkbox',
      sort: 3,
      latest_details: null
    }
  ];
  return (
    <div
      className={
        'flex flex-col sm:flex-row gap-3 sm:gap-5 overflow-x-auto flex-nowrap mb-10 justify-center'
      }
    >
      {/* start */}
      {associated_habits_1.map((h) => (
        <HabitSquare
          key={h.id}
          habit_id={h.id}
          habit_title={h.habit}
          habit_type={h.habit_type}
          habit_detail={h.latest_details}
          streak_duration={h.streak_duration}
          streak_start={h.streak_start}
          streak_end={h.streak_end}
          exp_reward={h.exp_reward}
          habit_icon={h.icon}
          displayMode={'demo'}
        />
      ))}
    </div>
  );
}
