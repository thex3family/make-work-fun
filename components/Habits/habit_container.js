import { useDroppable } from "@dnd-kit/core";
import EditHabitRow from "./edit_habit_row";


export default function HabitContainer({id, player, items, setItems, habits, findContainer}){

    const { setNodeRef } = useDroppable({
        id
    });
    
    if(habits) return(
        <div ref={setNodeRef}>
        {habits.map((h) => (
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
        ))}
        </div>
    );

    return(null);
}