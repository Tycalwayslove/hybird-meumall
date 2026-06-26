export type OrderFlowLogParam = {
  bizData?: string;
  bizType?: number;
  pageId?: number;
  prevPageId?: number;
  step: number;
  systemType: number;
  uuid: string;
  uuidSession: string;
  visitType: number;
};

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

type FlowDeps = {
  now?: () => number;
  storage?: StorageLike;
  userAgent?: string;
  uuidFactory?: () => string;
};

type FlowState = {
  latestFlowLog?: Partial<OrderFlowLogParam>;
  sessionTimeStamp: number;
  step: number;
  systemType: number;
  uuid: string;
  uuidSession: string;
};

const sessionTimeoutMs = 30 * 60 * 1000;
const keys = {
  flow: "bbcFlowAnalysisLogDto",
  sessionTime: "bbcSessionTimeStamp",
  step: "bbcStep",
  systemType: "bbcSystemType",
  uuid: "bbcUuid",
  uuidSession: "bbcUuidSession"
};

export function recordProductDetailFlow({ productId }: { productId: string }, deps: FlowDeps = {}) {
  if (!/^\d+$/.test(productId)) {
    return undefined;
  }

  const state = readFlowState(deps);
  const step = state.step + 1;
  const flowLog: OrderFlowLogParam = {
    bizData: productId,
    bizType: 0,
    pageId: 3,
    step,
    systemType: state.systemType,
    uuid: state.uuid,
    uuidSession: state.uuidSession,
    visitType: 1
  };

  writeFlowState({ ...state, latestFlowLog: flowLog, sessionTimeStamp: getNow(deps), step }, deps);
  return flowLog;
}

export function recordOrderConfirmFlow(deps: FlowDeps = {}) {
  const state = readFlowState(deps);
  const prevPageId = normalizeNumber(state.latestFlowLog?.pageId);
  const flowLog: Partial<OrderFlowLogParam> = {
    ...(prevPageId ? { prevPageId } : {}),
    step: state.step,
    systemType: state.systemType,
    uuid: state.uuid,
    uuidSession: state.uuidSession,
    visitType: 1
  };

  writeFlowState({ ...state, latestFlowLog: flowLog, sessionTimeStamp: getNow(deps) }, deps);
  return flowLog;
}

export function createOrderSubmitFlowLogParam(deps: FlowDeps = {}): OrderFlowLogParam {
  const state = readFlowState(deps);
  const step = state.step + 1;
  const latest = state.latestFlowLog ?? {};
  const flowLog: OrderFlowLogParam = {
    ...latest,
    step,
    systemType: normalizeNumber(latest.systemType) || state.systemType,
    uuid: normalizeText(latest.uuid) || state.uuid,
    uuidSession: normalizeText(latest.uuidSession) || state.uuidSession,
    visitType: 1
  };

  writeFlowState({ ...state, latestFlowLog: flowLog, sessionTimeStamp: getNow(deps), step }, deps);
  return flowLog;
}

function readFlowState(deps: FlowDeps): FlowState {
  const storage = getStorage(deps);
  const now = getNow(deps);
  const userAgent = getUserAgent(deps);
  const uuidFactory = deps.uuidFactory ?? createUuid;
  const storedSessionTime = normalizeNumber(storage?.getItem(keys.sessionTime));
  const isExpired = storedSessionTime > 0 && now - storedSessionTime > sessionTimeoutMs;
  const uuid = normalizeText(storage?.getItem(keys.uuid)) || uuidFactory();
  const uuidSession = isExpired ? uuidFactory() : normalizeText(storage?.getItem(keys.uuidSession)) || uuidFactory();
  const step = isExpired ? 0 : normalizeNumber(storage?.getItem(keys.step));
  const systemType = normalizeNumber(storage?.getItem(keys.systemType)) || resolveSystemType(userAgent);
  const latestFlowLog = isExpired ? undefined : parseFlowLog(storage?.getItem(keys.flow));

  return {
    latestFlowLog,
    sessionTimeStamp: now,
    step,
    systemType,
    uuid,
    uuidSession
  };
}

function writeFlowState(state: FlowState, deps: FlowDeps) {
  const storage = getStorage(deps);
  if (!storage) {
    return;
  }

  storage.setItem(keys.uuid, state.uuid);
  storage.setItem(keys.uuidSession, state.uuidSession);
  storage.setItem(keys.step, String(state.step));
  storage.setItem(keys.sessionTime, String(state.sessionTimeStamp));
  storage.setItem(keys.systemType, String(state.systemType));
  if (state.latestFlowLog) {
    storage.setItem(keys.flow, JSON.stringify(removeUndefined(state.latestFlowLog)));
  } else {
    storage.removeItem(keys.flow);
  }
}

function getStorage(deps: FlowDeps): StorageLike | undefined {
  if (deps.storage) {
    return deps.storage;
  }
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}

function getNow(deps: FlowDeps) {
  return deps.now?.() ?? Date.now();
}

function getUserAgent(deps: FlowDeps) {
  if (deps.userAgent !== undefined) {
    return deps.userAgent;
  }
  if (typeof navigator === "undefined") {
    return "";
  }
  return navigator.userAgent;
}

function parseFlowLog(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value) as Partial<OrderFlowLogParam>;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function resolveSystemType(userAgent: string) {
  if (/android/i.test(userAgent)) {
    return 4;
  }
  if (/(iphone|ipad|ipod)/i.test(userAgent)) {
    return 5;
  }
  return 2;
}

function createUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    const normalized = char === "x" ? value : (value & 0x3) | 0x8;
    return normalized.toString(16);
  });
}

function normalizeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function removeUndefined(value: Partial<OrderFlowLogParam>) {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));
}
