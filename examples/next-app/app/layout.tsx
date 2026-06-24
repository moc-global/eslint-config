import type { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';

// App Router metadata + viewport exports live alongside the default component.
// The Next stack allows these export names so Fast Refresh linting does not
// flag them.
export const metadata: Metadata = {
  title: 'MOC Next Example',
  description: 'Example Next.js app linted by eslint-config-mocg',
};

export const viewport: Viewport = {
  themeColor: '#e4002b',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>): ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
