// Simple in-memory TTL cache for Node runtime (Next.js route handlers).
// Per-instance only. Resets on redeploy/cold start.

type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<any>>();

const now = () => Date.now();

function pruneExpired() {
  const t = now();
  for (const [k, e] of store) {
    if (e.expiresAt <= t) store.delete(k);
  }
}

// Optional: keep size under control
const MAX_ENTRIES = 500;
function pruneIfNeeded() {
  pruneExpired();
  if (store.size <= MAX_ENTRIES) return;
  // Evict oldest ~10% by expiry
  const sorted = [...store.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  const toRemove = Math.ceil(sorted.length * 0.1);
  for (let i = 0; i < toRemove; i++) store.delete(sorted[i][0]);
}

export function cacheGet<T = any>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (e.expiresAt <= now()) {
    store.delete(key);
    return null;
  }
  return e.value as T;
}

export function cacheSet<T = any>(key: string, value: T, ttlSec: number): void {
  pruneIfNeeded();
  store.set(key, { value, expiresAt: now() + ttlSec * 1000 });
}

// (Optional) helpers for debugging
export const cacheSize = () => store.size;
export const cacheClear = () => store.clear();
