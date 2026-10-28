import { useEffect, useState } from 'react';
import { load, save } from '../lib/storage';

export function usePersistentState<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const initial = typeof fallback === 'function' ? (fallback as () => T)() : fallback;
    return load(key, initial);
  });

  useEffect(() => {
    save(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
