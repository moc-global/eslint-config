import type { ReactNode } from 'react';

import type { Task, TaskStatus } from '@/types/task';

import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

interface TaskItemProps {
  onAdvance: (id: string, status: TaskStatus) => void;
  task: Task;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  done: 'done',
  in_progress: 'done',
  todo: 'in_progress',
};

export function TaskItem({ onAdvance, task }: Readonly<TaskItemProps>): ReactNode {
  const isDone = task.status === 'done';

  return (
    <li className="task-item">
      <StatusBadge status={task.status} />
      <span className="task-item__title">{task.title}</span>
      <Button
        disabled={isDone}
        onClick={() => {
          onAdvance(task.id, NEXT_STATUS[task.status]);
        }}
        variant="secondary"
      >
        Advance
      </Button>
    </li>
  );
}
