import React, { useState, useEffect, useCallback } from 'react';

/**
 * A simple implementation of a useQuery hook to manage async data fetching,
 * inspired by react-query, for the purpose of this prototype.
 * @param queryFn The asynchronous function that fetches data.
 * @returns An object containing the fetched data, loading state, and error state.
 */
export function useQuery<T>(
  queryFn: () => Promise<T>,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Using useCallback to memoize the function. In a real app, this would
  // likely depend on a queryKey to trigger refetches.
  const memoizedQueryFn = useCallback(queryFn, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await memoizedQueryFn();
        if (!isCancelled) {
          setData(result);
        }
      } catch (e) {
        if (!isCancelled) {
          setError(e as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [memoizedQueryFn]);

  return { data, isLoading, error };
}
