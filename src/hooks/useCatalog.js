import { useEffect, useState } from "react";
import { api } from "../api/client";

const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const memoryCache = new Map();

function readCache(key) {
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (memEntry.expiresAt > Date.now()) {
      return memEntry.value;
    }
    memoryCache.delete(key);
  }

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.expiresAt > Date.now()) {
      memoryCache.set(key, parsed);
      return parsed.value;
    }
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors (e.g., private browsing quota)
  }
  return null;
}

function writeCache(key, value) {
  const entry = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota errors
  }
}

export function useCatalog(
  query,
  page,
  watering = "",
  order = "asc",
  { enabled = true } = {}
) {
  const normalizedQuery = query.trim().toLowerCase();
  const [state, setState] = useState({
    plants: [],
    lastPage: 1,
    loading: enabled && normalizedQuery.length !== 1,
    error: "",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState({ plants: [], lastPage: 1, loading: false, error: "" });
      return;
    }

    if (normalizedQuery.length === 1) {
      setState({ plants: [], lastPage: 1, loading: false, error: "" });
      return;
    }

    const cacheKey = `greenly:catalog:list:${normalizedQuery}:${page}:${watering}:${order}`;
    if (attempt === 0) {
      const cached = readCache(cacheKey);
      if (cached) {
        setState({ ...cached, loading: false, error: "" });
        return;
      }
    }

    const controller = new AbortController();
    setState({ plants: [], lastPage: 1, loading: true, error: "" });

    const delayMs = normalizedQuery.length >= 2 ? 550 : 0;
    const timer = setTimeout(() => {
      api
        .getCatalog(normalizedQuery, page, controller.signal, watering, order)
        .then((data) => {
          if (!controller.signal.aborted) {
            writeCache(cacheKey, data);
            setState({ ...data, loading: false, error: "" });
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            setState({ plants: [], lastPage: 1, loading: false, error: err.message });
          }
        });
    }, delayMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery, page, watering, order, enabled, attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}

export function useCatalogPlant(id) {
  const [state, setState] = useState({ plant: null, loading: !!id, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) {
      setState({ plant: null, loading: false, error: "" });
      return;
    }

    const cacheKey = `greenly:catalog:plant:${id}`;
    if (attempt === 0) {
      const cached = readCache(cacheKey);
      if (cached) {
        setState({ plant: cached, loading: false, error: "" });
        return;
      }
    }

    const controller = new AbortController();
    setState({ plant: null, loading: true, error: "" });

    api
      .getCatalogPlant(id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          writeCache(cacheKey, data.plant);
          setState({ plant: data.plant, loading: false, error: "" });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setState({ plant: null, loading: false, error: err.message });
        }
      });

    return () => controller.abort();
  }, [id, attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
