import RoutineSection from '@/components/Habits/routine_section'

export default function HabitGroups({ habits, fetchDailies, fetchDailiesCompletedToday, player, setHabits, setLevelUp, setDailiesCount, display }) {

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
      // console.log('Habits: ', habits);
    }
  } else {
    console.log('Habits are being fetched');
    // console.log('Habits: ', habits);
  }

  var currentHabitKey = null;
  var generated_habit_group_sections = [];

  var habit_iterator = habit_map.keys();

  currentHabitKey = habit_iterator.next().value;

  do {
    generated_habit_group_sections.push(
      < RoutineSection
        habit_group_name = {currentHabitKey}
        associated_habits = {habit_map.get(currentHabitKey)}
        fetchDailies = {fetchDailies}
        fetchDailiesCompletedToday = {fetchDailiesCompletedToday}
        player = {player}
        setHabits = {setHabits} 
        setLevelUp = {setLevelUp} 
        setDailiesCount = {setDailiesCount}
        display = {display}
      />
    );

    currentHabitKey = habit_iterator.next().value;
  } while (currentHabitKey != null);

  return generated_habit_group_sections;
}
