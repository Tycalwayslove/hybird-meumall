export const searchHistoryStorageKey = "meumall.search.history";
const maxHistoryKeywords = 10;

export function readSearchHistoryKeywords(storage: Storage | null | undefined = getBrowserStorage()): string[] {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(searchHistoryStorageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeKeywords(parsed).slice(0, maxHistoryKeywords);
  } catch {
    return [];
  }
}

export function addSearchHistoryKeyword(storage: Storage | null | undefined, keyword: string) {
  const normalized = normalizeKeyword(keyword);
  if (!storage || !normalized) {
    return [];
  }

  const nextKeywords = [normalized, ...readSearchHistoryKeywords(storage).filter((item) => item !== normalized)].slice(0, maxHistoryKeywords);
  writeSearchHistoryKeywords(storage, nextKeywords);
  return nextKeywords;
}

export function clearSearchHistoryKeywords(storage: Storage | null | undefined = getBrowserStorage()) {
  if (!storage) {
    return;
  }
  storage.removeItem(searchHistoryStorageKey);
}

export function removeSearchHistoryKeyword(storage: Storage | null | undefined = getBrowserStorage(), keyword: string) {
  const normalized = normalizeKeyword(keyword);
  if (!storage || !normalized) {
    return [];
  }

  const nextKeywords = readSearchHistoryKeywords(storage).filter((item) => item !== normalized);
  if (nextKeywords.length === 0) {
    storage.removeItem(searchHistoryStorageKey);
    return [];
  }

  writeSearchHistoryKeywords(storage, nextKeywords);
  return nextKeywords;
}

function writeSearchHistoryKeywords(storage: Storage, keywords: string[]) {
  storage.setItem(searchHistoryStorageKey, JSON.stringify(normalizeKeywords(keywords).slice(0, maxHistoryKeywords)));
}

function normalizeKeywords(values: unknown[]) {
  const nextKeywords: string[] = [];
  values.forEach((value) => {
    const keyword = normalizeKeyword(value);
    if (keyword && !nextKeywords.includes(keyword)) {
      nextKeywords.push(keyword);
    }
  });
  return nextKeywords;
}

function normalizeKeyword(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}
