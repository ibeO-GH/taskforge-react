import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "../types/todo";

type Props = {
  todo: Todo;
  children: (props: { attributes: any; listeners: any }) => React.ReactNode;
};

export default function SortableItem({ todo, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </li>
  );
}
