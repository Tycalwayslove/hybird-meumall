import type { ClientRequestContext } from "./client-context";

export type RequestDiagnosticStatus = "error" | "success";

export type RequestDiagnosticRecord = {
  code?: string;
  method: string;
  path: string;
  requestId: string;
  route: string;
  status: RequestDiagnosticStatus;
  timestamp: number;
};

export type DiagnosticSnapshot = {
  appBuild?: string;
  appName?: string;
  appVersion?: string;
  currentUrl?: string;
  deviceModel?: string;
  h5Version?: string;
  lastErrorRequestId?: string;
  lastRequestIds: string[];
  osVersion?: string;
  pageSessionId?: string;
  platform?: string;
  recentRequests: RequestDiagnosticRecord[];
  route?: string;
  userAgent?: string;
  webviewVersion?: string;
};

const maxRecentRequests = 10;
let recentRequests: RequestDiagnosticRecord[] = [];
let browserPageSessionId: string | undefined;

export function createPageSessionId(idFactory: () => string = createId) {
  return `page-${idFactory()}`;
}

export function getBrowserPageSessionId() {
  if (!browserPageSessionId) {
    browserPageSessionId = createPageSessionId();
  }
  return browserPageSessionId;
}

export function getBrowserClientContext(overrides: ClientRequestContext = {}): ClientRequestContext {
  const route = typeof window === "undefined" ? undefined : window.location.pathname;
  const userAgent = readBrowserUserAgent();

  return {
    ...(route === undefined ? {} : { h5Route: route }),
    pageSessionId: getBrowserPageSessionId(),
    ...(userAgent === undefined ? {} : { userAgent }),
    ...overrides
  };
}

export function recordRequestDiagnostic(record: RequestDiagnosticRecord) {
  recentRequests = [record, ...recentRequests].slice(0, maxRecentRequests);
}

export function getRecentRequestRecords(limit = maxRecentRequests) {
  return recentRequests.slice(0, Math.max(0, limit));
}

export function clearRequestDiagnostics() {
  recentRequests = [];
  browserPageSessionId = undefined;
}

export function createDiagnosticSnapshot(context: ClientRequestContext = {}): DiagnosticSnapshot {
  const recent = getRecentRequestRecords();
  const lastError = recent.find((record) => record.status === "error");
  const currentUrl = typeof window === "undefined" ? undefined : window.location.href;
  const route = typeof window === "undefined" ? context.h5Route : window.location.pathname;
  const userAgent = context.userAgent ?? readBrowserUserAgent();

  return {
    ...(context.appBuild === undefined ? {} : { appBuild: context.appBuild }),
    ...(context.appName === undefined ? {} : { appName: context.appName }),
    ...(context.appVersion === undefined ? {} : { appVersion: context.appVersion }),
    ...(currentUrl === undefined ? {} : { currentUrl }),
    ...(context.deviceModel === undefined ? {} : { deviceModel: context.deviceModel }),
    ...(context.h5Version === undefined ? {} : { h5Version: context.h5Version }),
    ...(lastError === undefined ? {} : { lastErrorRequestId: lastError.requestId }),
    lastRequestIds: recent.map((record) => record.requestId),
    ...(context.osVersion === undefined ? {} : { osVersion: context.osVersion }),
    ...(context.pageSessionId === undefined ? {} : { pageSessionId: context.pageSessionId }),
    ...(context.platform === undefined ? {} : { platform: context.platform }),
    recentRequests: recent,
    ...(route === undefined ? {} : { route }),
    ...(userAgent === undefined ? {} : { userAgent }),
    ...(context.webviewVersion === undefined ? {} : { webviewVersion: context.webviewVersion })
  };
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readBrowserUserAgent() {
  if (typeof window !== "undefined" && typeof window.navigator?.userAgent === "string") {
    return window.navigator.userAgent;
  }
  return typeof navigator === "undefined" ? undefined : navigator.userAgent;
}
