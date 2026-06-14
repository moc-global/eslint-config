import type { ReactNode } from 'react';

interface HeaderProps {
  taskCount: number;
}

export function Header({ taskCount }: Readonly<HeaderProps>): ReactNode {
  return (
    <header className="header">
      <h1>Task Board</h1>
      <span className="header__count">{taskCount} tasks</span>
    </header>
  );
}
