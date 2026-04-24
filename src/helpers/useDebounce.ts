import {useState, useEffect} from "react";

/**
 * Custom hook that debounces a value.
 * @param value - The value to debounce.
 * @param delay - The delay in milliseconds for debouncing.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    // Set up a timer that will update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    // Cleanup function: clear the timeout if the value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default useDebounce;