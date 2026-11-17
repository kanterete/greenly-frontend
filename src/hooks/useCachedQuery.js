import { useCallback, useEffect, useRef, useState } from "react";
import { getQueryCache, setQueryCache } from "../utils/queryCache";

const DEFAULT_STALE_TIME_MS = 60 * 1000;

export function useCachedQuery(
  key,
  fetcher,
  { staleTimeMs = DEFAULT_STALE_TIME_MS } = {}
) {
  const cached = getQueryCache(key);
  const [data, setData] = useState(cached ? cached.data : null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchLatest = useCallback(
    async ({ force = false, silent = false } = {}) => {
      const entry = getQueryCache(key);
      const isFresh =
        entry && Date.now() - entry.updatedAt < staleTimeMs;

      if (!force && isFresh) {
        setData(entry.data);
        setLoading(false);
        setError("");
        return entry.data;
      }

      if (!silent && !entry) {
        setLoading(true);
      }
      setError("");

      try {
        const result = await fetcherRef.current();
        setQueryCache(key, result);
        setData(result);
        return result;
      } catch (err) {
        if (!entry) {
          setError(err.message);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [key, staleTimeMs]
  );

  useEffect(() => {
    const entry = getQueryCache(key);
    if (entry) {
      setData(entry.data);
      setLoading(false);
      if (Date.now() - entry.updatedAt >= staleTimeMs) {
        fetchLatest({ force: true, silent: true }).catch(() => {});
      }
    } else {
      fetchLatest({ force: true, silent: false }).catch(() => {});
    }
  }, [key, staleTimeMs, fetchLatest]);

  const refresh = useCallback(
    () => fetchLatest({ force: true, silent: false }),
    [fetchLatest]
  );

  const updateData = useCallback(
    (updater) => {
      setData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        setQueryCache(key, next);
        return next;
      });
    },
    [key]
  );

  return { data, setData: updateData, loading, error, setError, refresh };
}
