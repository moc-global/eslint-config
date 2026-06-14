import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { classNames } from '@/lib/format';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', ...rest }: Readonly<ButtonProps>): ReactNode {
  return (
    <button {...rest} className={classNames('btn', `btn--${variant}`)} type="button">
      {children}
    </button>
  );
}
