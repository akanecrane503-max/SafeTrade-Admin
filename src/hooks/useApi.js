import { useState, useEffect, useCallback, useRef } from 'react';

// Generic fetch/loading/error hook. Pass an async function (usually a
// services/*.js call) and it manages the request lifecycle for you.
//
// Usage:
//   const { data, loading, error, refetch } = useApi(() => getDashboardStats());
export function useApi(apiFn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const apiFnRef = useRef(apiFn);
  apiFnRef.current = apiFn;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFnRef.current(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err?.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: execute, setData };
}
