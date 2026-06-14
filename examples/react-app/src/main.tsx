import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Root container "#root" was not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
