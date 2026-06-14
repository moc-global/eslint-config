import type { Task } from '@domain/task';

/** Persistence boundary for {@link Task} entities. */
export interface TaskRepository {
  findById: (id: string) => Task | undefined;
  listByAssignee: (assigneeId: string) => Task[];
  save: (task: Task) => void;
}

/**
 * Creates an in-memory {@link TaskRepository} backed by a map.
 * @returns A repository whose data lives for the process lifetime.
 */
export function createTaskRepository(): TaskRepository {
  const tasks = new Map<string, Task>();

  return {
    findById: (id) => tasks.get(id),
    listByAssignee: (assigneeId) => [...tasks.values()].filter((task) => task.assigneeId === assigneeId),
    save: (task) => {
      tasks.set(task.id, task);
    },
  };
}
