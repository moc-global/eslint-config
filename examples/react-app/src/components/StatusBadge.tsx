import type { ReactNode } from 'react';

import { classNames, formatStatus } from '@/lib/format';
import type { TaskStatus } from '@/types/task';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: Readonly<StatusBadgeProps>): ReactNode {
  return <span className={classNames('badge', `badge--${status}`)}>{formatStatus(status)}</span>;
}
