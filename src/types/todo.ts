export interface Todo {
  id: number;
  title: string;
  completed?: boolean;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  order: number;
}
