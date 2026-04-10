import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Todo } from "../types/todo";

type TodoFormProps = {
  initialTodo?: Partial<Todo>;
  onSubmit: (todo: Omit<Todo, "id">) => void;
  onCancel: () => void;
};

export default function TodoForm({
  initialTodo = {},
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialTodo.title || "");
  const [completed, setCompleted] = useState<boolean>(
    initialTodo.completed || false
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, completed, userId: initialTodo.userId ?? 1 });
      }}
      className="space-y-4 p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-md"
    >
      {/* ... same as before */}
      <div>
        <label className="block font-semibold text-gray-300 mb-1">Title</label>
        <Input
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter todo title"
          value={title}
          onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
          required
          autoFocus
        />
      </div>

      <div>
        <label className="flex items-center space-x-3 text-gray-300">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) =>
              setCompleted((e.target as HTMLInputElement).checked)
            }
            className="form-checkbox h-5 w-5 text-blue-500 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
          />
          <span>Completed</span>
        </label>
      </div>

      <div className="flex space-x-3 justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-sm transition"
        >
          Save
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-5 py-2 rounded-md shadow-sm transition"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
