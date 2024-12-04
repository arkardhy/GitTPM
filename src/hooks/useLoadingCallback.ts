import { useCallback, useState } from 'react';

export function useLoadingCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  onError?: (error: Error) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await callback(...args);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callback, onError]
  );

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}