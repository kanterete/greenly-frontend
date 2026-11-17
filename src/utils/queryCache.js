const cache = new Map();

export function getQueryCache(key) {
  return cache.get(key) || null;
}

export function setQueryCache(key, data) {
  cache.set(key, { data, updatedAt: Date.now() });
}

export function invalidateQueryCache(...keys) {
  for (const key of keys) {
    cache.delete(key);
  }
}

export function clearQueryCache() {
  cache.clear();
}
