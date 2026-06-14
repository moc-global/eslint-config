import { useState } from 'react';

// A minimal React component used only to exercise the React stack's rule
// loading (e.g. react/display-name's version lookup) without crashing ESLint.
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => {
        setCount(count + 1);
      }}
      type="button"
    >
      Count: {count}
    </button>
  );
}
