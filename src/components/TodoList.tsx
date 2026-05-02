import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import TodoForm from "./TodoForm";
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
import type { Todo } from "../types/todo";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export default function TodoList(): React.JSX.Element {
  const queryClient = useQueryClient();

  // ✅ Explicit types for state variables
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "todo" | "in-progress" | "done"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deleteConfirmTodoId, setDeleteConfirmTodoId] = useState<number | null>(
    null,
  );

  // ✅ Query for todos
  const {
    data: todos = [],
    isLoading,
    isError,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();

      // map backend format to your todo type
      return data.map((task: any) => ({
        id: task._id,
        title: task.title,
        completed: false,
        status: task.status || "todo",
        priority: task.priority || "medium",
        createdAt: task.createdAt,
        order: task.order || 0,
      }));
    },
  });

  // ✅ Create Todo
  const createTodo = useMutation({
    mutationFn: async (newTodo: Partial<Omit<Todo, "id">>) => {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newTodo.title,
          status: newTodo.status,
          priority: newTodo.priority,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      const task = await res.json();
      return {
        id: task._id,
        title: task.title,
        completed: false,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        order: task.order,
      };
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
      const res = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
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
      const res = await fetch(`http://localhost:5000/tasks/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          status: data.status,
          priority: data.priority,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      return await res.json();
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

    const status = todo.status ?? (todo.completed ? "done" : "todo");

    const matchesStatus =
      statusFilter === "all" ? true : status === statusFilter;

    const priority = todo.priority ?? "low";

    const matchesPriority =
      priorityFilter === "all" ? true : priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTasks = filteredTodos.length;

  const doneTasks = filteredTodos.filter((todo) => {
    const status = todo.status ?? (todo.completed ? "done" : "todo");
    return status === "done";
  }).length;

  const inProgressTasks = filteredTodos.filter((todo) => {
    const status = todo.status ?? (todo.completed ? "done" : "todo");
    return status === "in-progress";
  }).length;

  const highPriorityTasks = filteredTodos.filter((todo) => {
    const priority = todo.priority ?? "low";
    return priority === "high";
  }).length;

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest",
  );

  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === "newest") {
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    }

    if (sortBy === "oldest") {
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
    }

    if (sortBy === "priority") {
      const orderMap = { high: 3, medium: 2, low: 1 };
      return (
        (orderMap[b.priority ?? "low"] || 0) -
        (orderMap[a.priority ?? "low"] || 0)
      );
    }
    return 0;
  });
  const paginatedTodos = sortedTodos.slice(
    (currentPage - 1) * todosPerPage,
    currentPage * todosPerPage,
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = paginatedTodos.findIndex((t) => t.id === active.id);
    const newIndex = paginatedTodos.findIndex((t) => t.id === over.id);

    const newPageOrder = arrayMove(paginatedTodos, oldIndex, newIndex);

    const updatedTodos = [...sortedTodos];

    newPageOrder.forEach((todo, index) => {
      const globalIndex = sortedTodos.findIndex((t) => t.id === todo.id);
      updatedTodos[globalIndex] = {
        ...todo,
        order: (currentPage - 1) * todosPerPage + index,
      };
    });

    try {
      await fetch("http://localhost:5000/tasks/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          updatedTodos.map((todo) => ({
            id: todo.id,
            order: todo.order,
          })),
        ),
      });

      queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-xl font-bold text-white">{totalTasks}</p>
        </div>
        <div className="bg-green-900/40 p-4 rounded-lg text-center border border-green-700">
          <p className="text-sm text-green-300">Done</p>
          <p className="text-xl font-bold text-green-400">{doneTasks}</p>
        </div>
        <div className="bg-yellow-900/40 p-4 rounded-lg text-center border border-yellow-700">
          <p className="text-sm text-yellow-300">In Progress</p>
          <p className="text-xl font-bold text-yellow-400">{inProgressTasks}</p>
        </div>
        <div className="bg-red-900/40 p-4 rounded-lg text-center border border-red-700">
          <p className="text-sm text-red-300">High Priority</p>
          <p className="text-xl font-bold text-red-400">{highPriorityTasks}</p>
        </div>
      </div>
      {/* Search & Filter */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
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
            onValueChange={(val: "all" | "todo" | "in-progress" | "done") => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white text-gray-800">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(val: "all" | "low" | "medium" | "high") => {
              setPriorityFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white text-gray-800">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(val: "newest" | "oldest" | "priority") => {
              setSortBy(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white text-gray-800">
              <SelectValue placeholder="sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end mb-3">
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
      <DndContext collisionDetection={closestCenter}>
        <SortableContext
          items={paginatedTodos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-4">
            {paginatedTodos.map((todo) => (
              <SortableItem key={todo.id} todo={todo}>
                {({ attributes }) => (
                  <div
                    className="bg-[#1f2937] hover:bg-[#374151] border border-gray-600 rounded-xl p-5 shadow-md"
                    {...attributes}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center">
                      <div className="flex flex-col sm:flex-row gap-2 sm:flex-1 min-w-0">
                        <Link
                          to="/todos/$id"
                          params={{ id: String(todo.id) }}
                          className="text-lg font-semibold text-blue-200 hover:text-blue-300 truncate max-w-full sm:max-w-[70%] sm:flex-1"
                        >
                          {todo.title}
                        </Link>

                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-900 text-blue-300 border border-blue-700">
                            {todo.status ?? (todo.completed ? "done" : "todo")}
                          </span>

                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${
                              (todo.priority ?? "low") === "high"
                                ? "bg-red-900 text-red-300 border-red-700"
                                : (todo.priority ?? "low") === "medium"
                                  ? "bg-yellow-900 text-yellow-300 border-yellow-700"
                                  : "bg-green-900 text-green-300 border-green-700"
                            }`}
                          >
                            {todo.priority ?? "low"}
                          </span>
                        </div>
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
                              deleteConfirmTodoId === todo.id ? null : todo.id,
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
                  </div>
                )}
              </SortableItem>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

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
              page === totalPages,
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
