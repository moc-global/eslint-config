import { useCallback, useEffect, useState } from 'react';

import { fetchTasks } from '@/lib/api';
import type { Task, TaskStatus } from '@/types/task';

/** The tasks state and mutators returned by {@link useTasks}. */
export interface UseTasksResult {
  addTask: (title: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  tasks: Task[];
}

/**
 * Loads the task list once and exposes operations to mutate it locally.
 * @returns The current tasks together with mutators.
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    void fetchTasks()
      .then(setTasks)
      .catch(() => {
        setTasks([]);
      });
  }, []);

  const addTask = useCallback((title: string) => {
    setTasks((current) => [...current, { id: `t-${String(current.length + 1)}`, status: 'todo', title }]);
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  }, []);

  return { addTask, setStatus, tasks };
}
