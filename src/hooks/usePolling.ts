import { useEffect, useRef } from 'react';

/**
 * A custom hook to simulate real-time updates by polling an async function.
 * @param callback The async function to execute.
 * @param interval The polling interval in milliseconds.
 */
export function usePolling(callback: () => Promise<void>, interval: number = 5000) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Execute immediately on mount
    savedCallback.current();

    // Then set up the interval
    const id = setInterval(() => {
      savedCallback.current();
    }, interval);

    return () => clearInterval(id);
  }, [interval]);
}
