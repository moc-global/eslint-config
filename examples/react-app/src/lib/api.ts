import type { Task } from '@/types/task';

const SEED_TASKS: readonly Task[] = [
  { id: 't-1', status: 'todo', title: 'Design the board layout' },
  { id: 't-2', status: 'in_progress', title: 'Wire up the task store' },
  { id: 't-3', status: 'done', title: 'Adopt the shared lint config' },
];

/**
 * Simulates fetching the initial task list from a remote API.
 * @returns A promise resolving to a fresh copy of the seed tasks.
 */
export function fetchTasks(): Promise<Task[]> {
  return Promise.resolve(SEED_TASKS.map((task) => ({ ...task })));
}
