import type { HomeConfig, HomeEnvironment } from "./types";

export type HomeConfigCacheEntry = {
  storedAt: number;
  config: HomeConfig;
};

type CacheFreshness = "fresh" | "stale" | "expired";

export type HomeConfigCacheResult = {
  entry: HomeConfigCacheEntry;
  freshness: CacheFreshness;
};

export function getHomeConfigCacheKey(environment: HomeEnvironment = "prod", schemaVersion = "1.0") {
  return `meumall:home-config:${environment}:${schemaVersion}`;
}

export function readHomeConfigCache({
  environment = "prod",
  now = Date.now(),
  storage = getLocalStorage()
}: {
  environment?: HomeEnvironment;
  now?: number;
  storage?: Storage | null;
} = {}): HomeConfigCacheResult | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(getHomeConfigCacheKey(environment));
  if (!raw) {
    return null;
  }

  try {
    const entry = JSON.parse(raw) as HomeConfigCacheEntry;
    if (!entry || typeof entry.storedAt !== "number" || !entry.config || entry.config.schemaVersion !== "1.0") {
      storage.removeItem(getHomeConfigCacheKey(environment));
      return null;
    }

    const freshness = getCacheFreshness(entry, now);
    if (freshness === "expired") {
      storage.removeItem(getHomeConfigCacheKey(environment));
      return null;
    }

    return {
      entry,
      freshness
    };
  } catch {
    storage.removeItem(getHomeConfigCacheKey(environment));
    return null;
  }
}

export function writeHomeConfigCache({
  config,
  environment = "prod",
  now = Date.now(),
  storage = getLocalStorage()
}: {
  config: HomeConfig;
  environment?: HomeEnvironment;
  now?: number;
  storage?: Storage | null;
}) {
  if (!storage) {
    return;
  }

  const entry: HomeConfigCacheEntry = {
    storedAt: now,
    config
  };

  storage.setItem(getHomeConfigCacheKey(environment, config.schemaVersion), JSON.stringify(entry));
}

function getCacheFreshness(entry: HomeConfigCacheEntry, now: number): CacheFreshness {
  const ttlMs = Math.max(0, entry.config.cache.ttlSeconds) * 1000;
  const staleMs = Math.max(0, entry.config.cache.staleWhileRevalidateSeconds ?? 0) * 1000;
  const age = Math.max(0, now - entry.storedAt);

  if (age <= ttlMs) {
    return "fresh";
  }

  if (age <= ttlMs + staleMs) {
    return "stale";
  }

  return "expired";
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
