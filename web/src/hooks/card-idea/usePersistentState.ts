import { useState, useEffect } from "react";

// Fungsi helper untuk memastikan kita hanya berjalan di browser
const isBrowser = typeof window !== "undefined";

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) {
      return initialValue;
    }
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (isBrowser) {
      try {
        sessionStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting sessionStorage key “${key}”:`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
}
