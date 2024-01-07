export interface Task {
  id: string;
  title: string;
  status: string;
}

export type TaskStatus = "open" | "in-progress" | "done";
