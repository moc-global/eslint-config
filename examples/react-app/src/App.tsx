import type { ReactNode } from 'react';

import { AddTaskForm } from './components/AddTaskForm';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { useTasks } from './hooks/useTasks';

export function App(): ReactNode {
  const { addTask, setStatus, tasks } = useTasks();

  return (
    <main className="app">
      <Header taskCount={tasks.length} />
      <AddTaskForm onAdd={addTask} />
      <TaskList onAdvance={setStatus} tasks={tasks} />
    </main>
  );
}
