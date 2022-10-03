import { useDroppable } from "@dnd-kit/core";
import EditHabitRow from "./edit_habit_row";


export default function HabitContainer({ id, player, items, setItems, habits, findContainer }) {

    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <div ref={setNodeRef}>
            {habits?.length > 0 ? habits.map((h) => (
                < EditHabitRow
                    key={h.id}
                    habit_id={h.id}
                    habit_title={h.name}
                    habit_type={h.type.name}
                    habit_group={findContainer(h.id)}
                    habit_sort={h.sort}
                    habit_area={h.area}
                    habit_description={h.description}
                    exp_reward={h.exp_reward}
                    habit_icon={h.icon}
                    habit_active={h.is_active}
                    player={player}
                    items={items}
                    setItems={setItems}
                />
            )) :
                <div className={`animate-fade-in-up w-full my-4 mb-0 relative bg-cover bg-center object-cover rounded square shadow-lg border-4 border-dailies-dark flex flex-col justify-center p-4`}>
                    <div className='text-white text-lg font-semibold'>No Quests For This Group. Add A New Quest Or Drag An Existing One Into This Section To Get Started!</div>
                </div>}
        </div>
    );
}