import { useEffect, useState } from 'react';

/**
 * Persists a piece of state to `localStorage` under the given key.
 * @param key - The storage key.
 * @param initialValue - The value used when nothing is stored yet.
 * @returns A `useState`-like tuple of the current value and a setter.
 */
export function useLocalStorage<TValue>(key: string, initialValue: TValue): readonly [TValue, (next: TValue) => void] {
  const [value, setValue] = useState<TValue>(() => {
    const stored = globalThis.localStorage.getItem(key);

    return stored === null ? initialValue : (JSON.parse(stored) as TValue);
  });

  useEffect(() => {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
