import Link from "next/link";
//import Button from '@/components/ui/Button';

function habit_progress_statement(on_streak, streak_duration) {
  return on_streak ? "🔥 You're on a " + ( streak_duration > 9 ? "9+ " : streak_duration + " Day " ) +  "Streak!" : "✊ You got this!";
}

function habitSquare(habit_title, on_streak, streak_duration) {
  return (
    <div className="my-4 mb-12 p-8 bg-primary-2 rounded z-10 square">
      <img className="mb-6 m-auto w-1/2" src="img/example_habit.png" />
      <h2 className="text-xl font-bold mb-3 text-center text-white">
        { habit_title }
      </h2>
      <p className="text-md mb-5 text-center">
        { habit_progress_statement(on_streak, streak_duration) }
      </p>
    </div>
  );
}

function time_period_routine_section(time_period_name, associated_habits) {
  return (
    <div>
      <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
        { time_period_name } Routines
      </h1>
      <div className="flex flex-row gap-5 overflow-x-scroll flex-nowrap">
        {/* start */}
        { associated_habits.map(h => habitSquare(h.title, h.on_streak, h.streak_duration)) }
      </div>
    </div>
  );
}

function generate_habit_map(habits) {
  var habit_map = new Map();
  
  for (var i = 0; i < habits.length; i++) {
    if (habit_map.get(habits[i].habits_time_period) == null) {

      habit_map.set(habits[i].habits_time_period, [ habits[i] ]);

    } else {

      var currentHabits = habit_map.get(habits[i].habits_time_period);
      
      habit_map.set(habits[i].habits_time_period, [ ...currentHabits, habits[i]]);
    }
  }

  return habit_map;
}

function generate_time_period_sections(habit_map, time_periods) {
  var currentHabitKey = null;
  var generated_time_period_sections = [];
  
  var habit_iterator = habit_map.keys();

  currentHabitKey = habit_iterator.next().value;

  do {
    generated_time_period_sections.push(time_period_routine_section(time_periods[currentHabitKey], habit_map.get(currentHabitKey)));

    currentHabitKey = habit_iterator.next().value;
  }
  while (currentHabitKey != null)

  return generated_time_period_sections;
}

export default function dallies() {

  const mock_time_periods = [ "Morning", "Afternoon", "Evening" ];

  const mock_active_habits = [ // streak stuff is temporary - Don't know what's the plan with that
    { title: "Habit 1", habits_time_period: 0, on_streak: true, streak_duration: 7 }, 
    { title: "Habit 2", habits_time_period: 0, on_streak: false, streak_duration: 0 }, 
    { title: "Habit 3", habits_time_period: 0, on_streak: true, streak_duration: 9 }, 
    { title: "Habit 4", habits_time_period: 0, on_streak: true, streak_duration: 10 },
    { title: "Habit 5", habits_time_period: 0, on_streak: true, streak_duration: 10 },
    { title: "Habit 6", habits_time_period: 0, on_streak: true, streak_duration: 10 },
    { title: "Habit 7", habits_time_period: 0, on_streak: true, streak_duration: 10 },
    { title: "Habit 1", habits_time_period: 1, on_streak: true, streak_duration: 10 },
    { title: "Habit 1", habits_time_period: 2, on_streak: true, streak_duration: 10 }
  ];

  const habit_map = generate_habit_map(mock_active_habits);

  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Dailies
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
          </p>
        </div>
        <div>
        { generate_time_period_sections(habit_map, mock_time_periods) }
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