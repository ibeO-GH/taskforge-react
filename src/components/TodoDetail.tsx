import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import type { Todo } from "../types/todo";

const fetchTodo = async (id: string): Promise<Todo> => {
  const res = await fetch("https://taskforge-api-z21d.onrender.com/tasks");
  const data = await res.json();

  const task = data.find((t: any) => String(t._id) === id);

  if (!task) throw new Error("Todo not found");

  return {
    id: task._id,
    title: task.title,
    completed: false,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt,
    order: task.order || 0,
  };
};

export default function TodoDetail() {
  const { id } = useParams({ from: "/todos/$id" }) as { id: string };

  const { data, isLoading, isError } = useQuery<Todo>({
    queryKey: ["todo", id],
    queryFn: () => fetchTodo(id),
  });

  if (isLoading) {
    return (
      <p className="text-gray-400 text-center mt-12 animate-pulse">
        Loading todo...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-red-500 text-center mt-12 font-semibold">
        🚫 Error loading todo details. Please try again.
      </p>
    );
  }

  const status = data.status ?? (data.completed ? "done" : "todo");

  return (
    <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto shadow-xl transition-all space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-100">📝 Todo Details</h2>
        <p className="text-sm text-gray-400">ID: {data.id}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Title</h3>
          <p className="text-lg text-blue-200 font-medium bg-gray-800 px-3 py-2 rounded-md border border-gray-600">
            {data.title}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Status</h3>
          <p
            className={`inline-block px-4 py-2 text-sm font-semibold rounded-full border ${
              status === "done"
                ? "bg-green-800 text-green-300 border-green-500"
                : status === "in-progress"
                  ? "bg-yellow-800 text-yellow-300 border-yellow-500"
                  : "bg-blue-800 text-blue-300 border-blue-500"
            }`}
          >
            {status}
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Link to="/">
          <Button
            size="sm"
            className="gap-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            ← Back to List
          </Button>
        </Link>
      </div>
    </div>
  );
}
