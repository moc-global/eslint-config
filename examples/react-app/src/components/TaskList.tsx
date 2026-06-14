import type { ReactNode } from 'react';

import type { Task, TaskStatus } from '@/types/task';

import { TaskItem } from './TaskItem';

interface TaskListProps {
  onAdvance: (id: string, status: TaskStatus) => void;
  tasks: Task[];
}

export function TaskList({ onAdvance, tasks }: Readonly<TaskListProps>): ReactNode {
  if (tasks.length === 0) {
    return <p className="task-list__empty">No tasks yet — add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} onAdvance={onAdvance} task={task} />
      ))}
    </ul>
  );
}
