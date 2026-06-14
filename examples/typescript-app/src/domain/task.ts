import { generateId } from '@utils/id';

import type { Priority } from './priority';

/** The lifecycle states a task moves through. */
export type TaskStatus = 'done' | 'in_progress' | 'todo';

/** A unit of work tracked by the application. */
export interface Task {
  readonly assigneeId: string | undefined;
  readonly createdAt: Date;
  readonly id: string;
  readonly priority: Priority;
  readonly status: TaskStatus;
  readonly title: string;
}

/** The fields a caller supplies to create a {@link Task}. */
export interface NewTask {
  assigneeId?: string;
  priority: Priority;
  title: string;
}

/**
 * Builds a fully-formed {@link Task} in its initial, not-yet-started state.
 * @param input - The title, priority, and optional assignee.
 * @param now - The creation timestamp, injected for testability.
 * @returns A new task with a generated identifier.
 */
export function createTask(input: NewTask, now: Date): Task {
  return {
    assigneeId: input.assigneeId,
    createdAt: now,
    id: generateId(),
    priority: input.priority,
    status: 'todo',
    title: input.title.trim(),
  };
}

/**
 * Returns a copy of the task with a new lifecycle status.
 * @param task - The task to transition.
 * @param status - The status to move the task into.
 * @returns A new task value with the updated status.
 */
export function withStatus(task: Task, status: TaskStatus): Task {
  return { ...task, status };
}
