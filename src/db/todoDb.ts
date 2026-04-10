import Dexie, { Table } from "dexie";
import { Todo } from "../types/todo";

export class TodoDexieDB extends Dexie {
  todos!: Table<Todo, number>;

  constructor() {
    super("TodoDatabase");
    this.version(1).stores({
      todos: "++id,title,completed",
    });
  }
}

export const db = new TodoDexieDB();
