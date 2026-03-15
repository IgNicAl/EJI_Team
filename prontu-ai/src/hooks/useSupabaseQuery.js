import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for fetching data from a Supabase service function.
 *
 * @param {Function} fetchFn - async function that returns data
 * @param {any[]} deps - dependency array to trigger refetch
 * @returns {{ data: any, loading: boolean, error: string | null, refetch: Function }}
 */
export default function useSupabaseQuery(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('[useSupabaseQuery]', err);
      setError(err?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
