/** The lifecycle states a task can be in. */
export type TaskStatus = 'done' | 'in_progress' | 'todo';

/** A task rendered on the board. */
export interface Task {
  id: string;
  status: TaskStatus;
  title: string;
}
