import HabitGroups from '../Habits/habit_groups';
import HabitSquare from '../Habits/habit_square';

export default function DailiesEntry() {
  const demoHabits = [
    {
      "id": 86,
      "habit": "Morning Mood",
      "description": null,
      "streak_duration": null,
      "streak_start": null,
      "streak_end": null,
      "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
      "is_active": true,
      "habit_group": "Morning",
      "group_sort": 2,
      "exp_reward": 25,
      "icon": "FaStreetView",
      "habit_type": "Feeling",
      "sort": 0,
      "latest_details": "happy"
    },
    {
      "id": 12,
      "habit": "Make My Bed",
      "description": null,
      "streak_duration": 1,
      "streak_start": "2022-01-10T19:06:22.328+00:00",
      "streak_end": "2022-01-10T19:06:22.328+00:00",
      "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
      "is_active": true,
      "habit_group": "Morning",
      "group_sort": 2,
      "exp_reward": 25,
      "icon": "FaBed",
      "habit_type": "Checkbox",
      "sort": 3,
      "latest_details": null
    },
    {
      "id": 37,
      "habit": "Plan My Day",
      "description": null,
      "streak_duration": null,
      "streak_start": null,
      "streak_end": null,
      "player": "17ae471a-3096-4c57-af41-1cf67e52dd67",
      "is_active": true,
      "habit_group": "Morning",
      "group_sort": 2,
      "exp_reward": 25,
      "icon": "FaBrain",
      "habit_type": "Checkbox",
      "sort": 5,
      "latest_details": null
    }
  ];

  return (
    // <div
    //   className={
    //     'flex flex-col sm:flex-row gap-3 sm:gap-5 overflow-x-auto flex-nowrap mb-10 justify-center'
    //   }
    // >
      <HabitGroups
        habits={demoHabits}
        display={'demo'}
      />
    // </div>
  );
}
