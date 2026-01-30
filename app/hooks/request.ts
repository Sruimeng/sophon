import { useCallback, useState } from 'react';
import { useDebounce } from './debounce';

/**
 * Hook for loading state management during async requests
 */
export const useLoadingRequest = <T extends (...p: Parameters<T>) => Promise<unknown>>(
  fn: T,
  deps: React.DependencyList = [],
) => {
  const [isLoading, setIsLoading] = useState(false);

  const request = useDebounce(async (...args: Parameters<T>) => {
    setIsLoading(true);
    try {
      await fn(...args);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  return { request, isLoading };
};

/**
 * Simple loading hook without debounce
 */
export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      return await fn();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, withLoading };
};
