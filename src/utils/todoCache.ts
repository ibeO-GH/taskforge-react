import localforage from "localforage";
import type { Todo } from "../types/todo";

const TODOS_KEY = "todos";

export const saveTodosToCache = async (todos: Todo[]): Promise<void> => {
  await localforage.setItem(TODOS_KEY, todos);
};

export const loadTodosFromCache = async (): Promise<Todo[] | null> => {
  const cached = await localforage.getItem<Todo[]>(TODOS_KEY);
  return cached || null;
};
