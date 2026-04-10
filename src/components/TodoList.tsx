import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import TodoForm from "./TodoForm";
import { db } from "../db/todoDb";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import type { Todo } from "../types/todo"; // ✅ Import your Todo type

export default function TodoList(): React.JSX.Element {
  const queryClient = useQueryClient();

  // ✅ Explicit types for state variables
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deleteConfirmTodoId, setDeleteConfirmTodoId] = useState<number | null>(
    null
  );

  // ✅ Query for todos
  const {
    data: todos = [],
    isLoading,
    isError,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const count = await db.todos.count();

      if (count === 0) {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos?_limit=30"
        );
        const todosFromApi: Todo[] = await response.json();

        const todosToAdd = todosFromApi.map(({ id, title, completed }) => ({
          id,
          title,
          completed,
        }));

        await db.todos.bulkAdd(todosToAdd);
      }

      const allTodos = await db.todos.toArray();
      return allTodos.sort((a, b) => b.id - a.id);
    },
  });

  // ✅ Create Todo
  const createTodo = useMutation({
    mutationFn: async (newTodo: Omit<Todo, "id">) => {
      const id = Date.now();
      const todo: Todo = { ...newTodo, id };
      await db.todos.put(todo);
      return todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setCurrentPage(1);
      setShowCreate(false);
    },
  });

  // ✅ Delete Todo
  const deleteTodo = useMutation({
    mutationFn: async (id: number) => {
      await db.todos.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setDeleteConfirmTodoId(null);
    },
  });

  // ✅ Update Todo
  const updateTodo = useMutation({
    mutationFn: async (data: Todo) => {
      await db.todos.update(data.id, data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setEditingTodo(null);
    },
  });

  // ✅ Filtering and Pagination
  const todosPerPage = 10;

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
        ? todo.completed
        : !todo.completed;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * todosPerPage,
    currentPage * todosPerPage
  );

  // ✅ Loading / Error states
  if (isLoading)
    return <p className="text-gray-300 text-center mt-12">Loading todos...</p>;

  if (isError)
    return (
      <p className="text-red-500 text-center mt-12">
        Error loading todos. Please try again.
      </p>
    );

  // ✅ Main Component UI
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto bg-gray-700 min-h-screen rounded-lg shadow-lg border border-gray-600">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 bg-white text-gray-800"
          />

          <Select
            value={statusFilter}
            onValueChange={(val: "all" | "completed" | "incomplete") => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white text-gray-800">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setShowCreate((prev) => !prev);
            setEditingTodo(null);
            setDeleteConfirmTodoId(null);
          }}
          className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
        >
          {showCreate ? (
            "Cancel Add"
          ) : (
            <>
              <FaPlus /> Add Todo
            </>
          )}
        </Button>
      </div>

      {/* Add Form */}
      {showCreate && (
        <div className="border border-gray-600 p-4 rounded bg-gray-800 shadow-inner mb-6">
          <TodoForm
            onSubmit={(todo) => createTodo.mutate(todo)}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Todo Items */}
      <ul className="space-y-4">
        {paginatedTodos.map((todo) => (
          <li
            key={todo.id}
            className="bg-[#1f2937] hover:bg-[#374151] border border-gray-600 rounded-xl p-5 shadow-md transition-transform transform hover:scale-[1.01]"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:flex-1 min-w-0">
                <Link
                  to="/todos/$id"
                  params={{ id: String(todo.id) }}
                  className="text-lg font-semibold text-blue-200 hover:text-blue-300 truncate max-w-full sm:max-w-[70%] sm:flex-1"
                >
                  {todo.title}
                </Link>

                <span
                  className={`text-sm px-3 py-1 rounded-full border font-medium inline-flex min-w-fit w-auto self-start ${
                    todo.completed
                      ? "text-green-400 border-green-400"
                      : "text-red-400 border-red-400"
                  }`}
                >
                  {todo.completed ? "✅ Completed" : "❌ Incomplete"}
                </span>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <Button
                  onClick={() => {
                    setEditingTodo(todo);
                    setShowCreate(false);
                    setDeleteConfirmTodoId(null);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm cursor-pointer"
                >
                  <FaEdit />
                </Button>

                <Button
                  onClick={() =>
                    setDeleteConfirmTodoId(
                      deleteConfirmTodoId === todo.id ? null : todo.id
                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm cursor-pointer"
                >
                  <FaTrash />
                </Button>
              </div>
            </div>

            {/* Inline Edit Form */}
            {editingTodo?.id === todo.id && (
              <div className="mt-4 border border-gray-600 p-4 rounded bg-gray-800">
                <TodoForm
                  initialTodo={editingTodo}
                  onSubmit={(todo) =>
                    updateTodo.mutate({ ...editingTodo, ...todo })
                  }
                  onCancel={() => setEditingTodo(null)}
                />
              </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmTodoId === todo.id && (
              <div className="mt-4 border border-red-500 bg-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-red-400 font-semibold">
                  Are you sure you want to delete this todo?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setDeleteConfirmTodoId(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => deleteTodo.mutate(todo.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex flex-wrap justify-center gap-2 mt-8 text-sm sm:text-base w-full">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-700 rounded-md disabled:opacity-50 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              totalPages <= 5 ||
              Math.abs(page - currentPage) <= 2 ||
              page === 1 ||
              page === totalPages
          )
          .map((page, idx, arr) => {
            const isEllipsis = idx > 0 && page > arr[idx - 1] + 1;
            return (
              <span key={page} className="flex items-center">
                {isEllipsis ? (
                  <span className="px-2 text-gray-400 select-none">...</span>
                ) : (
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-md transition whitespace-nowrap ${
                      page === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </span>
            );
          })}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-700 rounded-md disabled:opacity-50 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
