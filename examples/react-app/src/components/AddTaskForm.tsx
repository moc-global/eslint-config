import { type ReactNode, type SyntheticEvent, useState } from 'react';

import { Button } from './Button';

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: Readonly<AddTaskFormProps>): ReactNode {
  const [title, setTitle] = useState('');

  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      return;
    }

    onAdd(trimmed);
    setTitle('');
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        className="add-task__input"
        aria-label="Task title"
        onChange={(event) => {
          setTitle(event.target.value);
        }}
        placeholder="Add a task…"
        value={title}
      />
      <Button type="submit">Add</Button>
    </form>
  );
}
