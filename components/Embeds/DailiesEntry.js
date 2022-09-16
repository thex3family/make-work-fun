import HabitGroups from '../Habits/habit_groups';
import HabitSquare from '../Habits/habit_square';

export default function DailiesEntry() {
  const demoHabits = [
    {
      "id": 1,
      "habit": "Drink Water",
      "description": null,
      "streak_duration": null,
      "streak_start": null,
      "streak_end": null,
      "player": "32bf9641-f33f-43bb-8006-a264d07261ec",
      "is_active": true,
      "habit_group": "Recurring",
      "group_sort": 1,
      "exp_reward": 25,
      "icon": "FaFillDrip",
      "habit_type": "Counter",
      "habit_type_desc": "How many times?",
      "sort": 1,
      "latest_details": null
    },
    {
      "id": 2,
      "habit": "Morning Mood",
      "description": null,
      "streak_duration": null,
      "streak_start": null,
      "streak_end": null,
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
      "id": 3,
      "habit": "Track Sleep",
      "streak_duration": null,
      "streak_start": null,
      "streak_end": null,
      "player": "32bf9641-f33f-43bb-8006-a264d07261ec",
      "is_active": true,
      "habit_group": "Morning",
      "group_sort": 2,
      "exp_reward": 25,
      "icon": "FaMoon",
      "habit_type": "Duration",
      "habit_type_desc": "How long was it?",
      "sort": 1,
      "latest_details": "525"
    },
    {
      "id": 4,
      "habit": "Make My Bed",
      "description": null,
      "streak_duration": 1,
      "streak_start": "2022-01-10T19:06:22.328+00:00",
      "streak_end": "2022-01-10T19:06:22.328+00:00",
      "is_active": true,
      "habit_group": "Morning",
      "group_sort": 2,
      "exp_reward": 25,
      "icon": "FaBed",
      "habit_type": "Checkbox",
      "sort": 3,
      "latest_details": null
    },
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
