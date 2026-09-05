import { useState, useEffect, useCallback } from 'react';
import { mockApi, AppState } from '../services/mockApi';

export function useMockApi<K extends keyof AppState>(key: K) {
  const [data, setData] = useState<AppState[K] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await mockApi.getCollection(key);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateData = async (newData: AppState[K]) => {
    try {
      setLoading(true);
      const result = await mockApi.setCollection(key, newData);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, updateData, refresh: fetchData };
}
