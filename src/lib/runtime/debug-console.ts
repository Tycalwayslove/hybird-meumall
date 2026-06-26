export type DebugConsoleLog = {
  createdAt: string;
  label: string;
  payload: unknown;
};

type DebugLogStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type DebugLogOptions = {
  appEnv?: string;
  storage?: DebugLogStorage;
};

type ReplayDebugLogOptions = DebugLogOptions & {
  log?: (label: string, payload: unknown) => void;
};

const debugLogStorageKey = "__meumall_debug_console_logs__";
const maxDebugLogCount = 30;

export function shouldEnableDebugConsole(appEnv: string | undefined) {
  return appEnv === "local" || appEnv === "test";
}

export function erudaEntryButtonPlacement() {
  return {
    bottom: "auto",
    left: "auto",
    right: "max(12px, env(safe-area-inset-right))",
    top: "50%",
    transform: "translateY(-50%)"
  };
}

export function recordDebugConsoleLog(label: string, payload: unknown, options: DebugLogOptions = {}) {
  if (typeof console !== "undefined" && typeof console.info === "function") {
    console.info(label, payload);
  }

  if (!shouldEnableDebugConsole(resolveAppEnv(options.appEnv))) {
    return;
  }

  const storage = options.storage ?? getSessionStorage();
  if (!storage) {
    return;
  }

  const logs = readStoredDebugConsoleLogs(storage);
  logs.push({
    createdAt: new Date().toISOString(),
    label,
    payload: toJsonCompatible(payload)
  });

  storage.setItem(debugLogStorageKey, JSON.stringify(logs.slice(-maxDebugLogCount)));
}

export function readDebugConsoleLogs(options: DebugLogOptions = {}): DebugConsoleLog[] {
  if (!shouldEnableDebugConsole(resolveAppEnv(options.appEnv))) {
    return [];
  }

  const storage = options.storage ?? getSessionStorage();
  return storage ? readStoredDebugConsoleLogs(storage) : [];
}

export function replayDebugConsoleLogs(options: ReplayDebugLogOptions = {}) {
  const logs = readDebugConsoleLogs(options);
  if (logs.length === 0) {
    return;
  }

  const log = options.log ?? defaultReplayLog;
  logs.forEach((entry, index) => {
    log("[MeuMall][debug-console:previous]", {
      createdAt: entry.createdAt,
      index: index + 1,
      label: entry.label,
      payload: entry.payload,
      total: logs.length
    });
  });
}

function readStoredDebugConsoleLogs(storage: DebugLogStorage): DebugConsoleLog[] {
  try {
    const rawLogs = storage.getItem(debugLogStorageKey);
    if (!rawLogs) {
      return [];
    }

    const parsedLogs = JSON.parse(rawLogs);
    return Array.isArray(parsedLogs) ? parsedLogs.filter(isDebugConsoleLog) : [];
  } catch {
    return [];
  }
}

function isDebugConsoleLog(value: unknown): value is DebugConsoleLog {
  if (!value || typeof value !== "object") {
    return false;
  }

  const log = value as Partial<DebugConsoleLog>;
  return typeof log.createdAt === "string" && typeof log.label === "string";
}

function toJsonCompatible(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return "[unserializable payload]";
  }
}

function resolveAppEnv(appEnv: string | undefined) {
  return appEnv ?? process.env.NEXT_PUBLIC_APP_ENV;
}

function getSessionStorage(): DebugLogStorage | undefined {
  try {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

function defaultReplayLog(label: string, payload: unknown) {
  if (typeof console !== "undefined" && typeof console.info === "function") {
    console.info(label, payload);
  }
}
