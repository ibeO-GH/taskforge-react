import Dexie, { Table } from "dexie";
import { Todo } from "../types/todo";

export class TodoDexieDB extends Dexie {
  todos!: Table<Todo, number>;

  constructor() {
    super("TodoDatabase");
    this.version(2).stores({
      todos: "++id,title,completed,status,priority,dueDate,createdAt",
    });
  }
}

export const db = new TodoDexieDB();
