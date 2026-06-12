import { createApiError } from "@/lib/api/errors";
import type { ApiError, ApiFetch } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import { buildClientContextHeaders } from "@/lib/http/client-context";
import type { BackendName, BackendRegistry } from "./backend-registry";
import { resolveBackend } from "./backend-registry";

type BackendRequestMeta = {
  requestId: string;
  route: string;
  h5Version: string;
  appEnv: string;
  backend: BackendName;
};

export type BackendApiResult<T> = { ok: true; data: T; meta: BackendRequestMeta } | { ok: false; error: ApiError };

export type BackendCallLogEntry = {
  appBuild?: string;
  appName?: string;
  appVersion?: string;
  backend: BackendName;
  backendBusinessCode?: string;
  backendBusinessMessage?: string;
  backendBusinessSuccess?: boolean;
  backendPath: string;
  backendStatus?: number;
  deviceModel?: string;
  durationMs: number;
  errorCode?: ApiError["code"];
  method: string;
  osVersion?: string;
  pageSessionId?: string;
  platform?: string;
  requestBody?: unknown;
  requestHeaders?: Record<string, string>;
  requestId: string;
  requestQuery?: Record<string, string | string[]>;
  requestUrl?: string;
  responseBody?: unknown;
  responseBodySize?: number;
  responseBodyTruncated?: boolean;
  route: string;
  timeoutMs: number;
  webviewVersion?: string;
};

export type BackendCallLogger = (entry: BackendCallLogEntry) => void;

export type BackendClientConfig = {
  registry: BackendRegistry;
  defaultHeaders?: HeadersInit;
  fetcher?: ApiFetch;
  h5Version?: string;
  logger?: BackendCallLogger;
  logResponseBody?: boolean;
  requestIdFactory?: () => string;
  responseBodyLogLimit?: number;
  timeoutMs?: number;
};

export type BackendRequestOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backend: BackendName;
  body?: unknown;
  clientContext?: ClientRequestContext;
  headers?: HeadersInit;
  method?: string;
  path: string;
  route?: string;
  timeoutMs?: number;
};

const defaultTimeoutMs = 10000;
const defaultResponseBodyLogLimit = 30000;
const javaAppSource = "1";

export function createBackendClient(config: BackendClientConfig) {
  const fetcher = config.fetcher ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = config.timeoutMs ?? defaultTimeoutMs;

  return {
    async request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>> {
      const backend = resolveBackend(config.registry, options.backend);
      const requestId = config.requestIdFactory?.() ?? createRequestId();
      const startedAt = Date.now();

      if (options.authRequired && !options.authToken) {
        const error = createApiError("TOKEN_MISSING", { requestId });
        logBackendCall(config.logger, {
          errorCode: error.code,
          options,
          requestId,
          startedAt,
          timeoutMs: options.timeoutMs ?? timeoutMs
        });

        return {
          ok: false,
          error
        };
      }

      const headers = normalizeHeaders(config.defaultHeaders);
      Object.assign(headers, buildClientContextHeaders(options.clientContext, { includeUserAgent: true }));
      Object.assign(headers, normalizeHeaders(options.headers));
      headers["x-request-id"] = requestId;
      headers["x-h5-version"] = config.h5Version ?? process.env.H5_VERSION ?? "unknown";
      headers["x-app-env"] = backend.appEnv;
      headers["x-route"] = options.route ?? "unknown";
      if (backend.name === "java") {
        headers.source = javaAppSource;
      }
      if (options.authToken) {
        headers.Authorization = buildAuthorizationHeader(backend.name, options.authToken);
      }

      const init: RequestInit = {
        headers,
        method: options.method ?? (options.body === undefined ? "GET" : "POST")
      };

      if (options.body !== undefined) {
        headers["content-type"] ??= "application/json";
        init.body = JSON.stringify(options.body);
      }
      const requestUrl = buildUrl(backend.baseUrl, options.path);
      const requestSnapshot = buildBackendRequestSnapshot({
        body: options.body,
        headers,
        path: options.path,
        url: requestUrl
      });

      try {
        const response = await fetchWithTimeout(fetcher, requestUrl, init, options.timeoutMs ?? timeoutMs);
        const responseBody = await parseResponseBody(response);
        const responseSnapshot = buildBackendResponseSnapshot(responseBody, {
          enabled: config.logResponseBody === true,
          maxLength: config.responseBodyLogLimit ?? defaultResponseBodyLogLimit
        });

        if (!response.ok) {
          const error = createApiError(response.status === 401 || response.status === 403 ? "AUTH_FAILED" : "HTTP_ERROR", {
            httpStatus: response.status,
            requestId,
            details: responseBody === undefined ? undefined : { response: responseBody }
          });
          logBackendCall(config.logger, {
            backendBusinessStatus: readBackendBusinessStatus(responseBody),
            backendStatus: response.status,
            errorCode: error.code,
            options,
            requestSnapshot,
            responseSnapshot,
            requestId,
            startedAt,
            timeoutMs: options.timeoutMs ?? timeoutMs
          });

          return {
            ok: false,
            error
          };
        }

        logBackendCall(config.logger, {
          backendBusinessStatus: readBackendBusinessStatus(responseBody),
          backendStatus: response.status,
          options,
          requestSnapshot,
          responseSnapshot,
          requestId,
          startedAt,
          timeoutMs: options.timeoutMs ?? timeoutMs
        });

        return {
          ok: true,
          data: responseBody as T,
          meta: {
            requestId,
            route: options.route ?? "unknown",
            h5Version: headers["x-h5-version"],
            appEnv: backend.appEnv,
            backend: backend.name
          }
        };
      } catch (error) {
        if (error instanceof BackendTimeoutError) {
          const apiError = createApiError("TIMEOUT", {
            requestId,
            details: { timeoutMs: options.timeoutMs ?? timeoutMs }
          });
          logBackendCall(config.logger, {
            errorCode: apiError.code,
            options,
            requestSnapshot,
            requestId,
            startedAt,
            timeoutMs: options.timeoutMs ?? timeoutMs
          });

          return {
            ok: false,
            error: apiError
          };
        }

        const apiError = createApiError("NETWORK_ERROR", {
          requestId,
          details: { message: error instanceof Error ? error.message : String(error) }
        });
        logBackendCall(config.logger, {
          errorCode: apiError.code,
          options,
          requestSnapshot,
          requestId,
          startedAt,
          timeoutMs: options.timeoutMs ?? timeoutMs
        });

        return {
          ok: false,
          error: apiError
        };
      }
    }
  };
}

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function buildAuthorizationHeader(backend: BackendName, token: string) {
  return backend === "java" ? token : `Bearer ${token}`;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {};
  if (!headers) {
    return normalized;
  }

  new Headers(headers).forEach((value, key) => {
    normalized[key] = value;
  });

  return normalized;
}

function logBackendCall(
  logger: BackendCallLogger | undefined,
  input: {
    backendBusinessStatus?: BackendBusinessStatus;
    backendStatus?: number;
    errorCode?: ApiError["code"];
    options: BackendRequestOptions;
    requestSnapshot?: BackendRequestSnapshot;
    responseSnapshot?: BackendResponseSnapshot;
    requestId: string;
    startedAt: number;
    timeoutMs: number;
  }
) {
  if (!logger) {
    return;
  }

  const context = input.options.clientContext;
  logger({
    ...(context?.appBuild === undefined ? {} : { appBuild: context.appBuild }),
    ...(context?.appName === undefined ? {} : { appName: context.appName }),
    ...(context?.appVersion === undefined ? {} : { appVersion: context.appVersion }),
    backend: input.options.backend,
    ...(input.backendBusinessStatus?.code === undefined ? {} : { backendBusinessCode: input.backendBusinessStatus.code }),
    ...(input.backendBusinessStatus?.message === undefined ? {} : { backendBusinessMessage: input.backendBusinessStatus.message }),
    ...(input.backendBusinessStatus?.success === undefined ? {} : { backendBusinessSuccess: input.backendBusinessStatus.success }),
    backendPath: input.options.path,
    ...(input.backendStatus === undefined ? {} : { backendStatus: input.backendStatus }),
    ...(context?.deviceModel === undefined ? {} : { deviceModel: context.deviceModel }),
    durationMs: Math.max(0, Date.now() - input.startedAt),
    ...(input.errorCode === undefined ? {} : { errorCode: input.errorCode }),
    method: input.options.method ?? (input.options.body === undefined ? "GET" : "POST"),
    ...(context?.osVersion === undefined ? {} : { osVersion: context.osVersion }),
    ...(context?.pageSessionId === undefined ? {} : { pageSessionId: context.pageSessionId }),
    ...(context?.platform === undefined ? {} : { platform: context.platform }),
    ...(input.requestSnapshot?.body === undefined ? {} : { requestBody: input.requestSnapshot.body }),
    ...(input.requestSnapshot?.headers === undefined ? {} : { requestHeaders: input.requestSnapshot.headers }),
    requestId: input.requestId,
    ...(input.requestSnapshot?.query === undefined ? {} : { requestQuery: input.requestSnapshot.query }),
    ...(input.requestSnapshot?.url === undefined ? {} : { requestUrl: input.requestSnapshot.url }),
    ...(input.responseSnapshot?.body === undefined ? {} : { responseBody: input.responseSnapshot.body }),
    ...(input.responseSnapshot?.size === undefined ? {} : { responseBodySize: input.responseSnapshot.size }),
    ...(input.responseSnapshot?.truncated === undefined ? {} : { responseBodyTruncated: input.responseSnapshot.truncated }),
    route: input.options.route ?? "unknown",
    timeoutMs: input.timeoutMs,
    ...(context?.webviewVersion === undefined ? {} : { webviewVersion: context.webviewVersion })
  });
}

type BackendRequestSnapshot = {
  body?: unknown;
  headers: Record<string, string>;
  query?: Record<string, string | string[]>;
  url: string;
};

type BackendResponseSnapshot = {
  body: unknown;
  size: number;
  truncated: boolean;
};

function buildBackendRequestSnapshot({
  body,
  headers,
  path,
  url
}: {
  body: unknown;
  headers: Record<string, string>;
  path: string;
  url: string;
}): BackendRequestSnapshot {
  return {
    ...(body === undefined ? {} : { body: sanitizeLogValue(body) }),
    headers: redactHeadersForLog(headers),
    ...readQueryForLog(path),
    url
  };
}

function buildBackendResponseSnapshot(
  responseBody: unknown,
  {
    enabled,
    maxLength
  }: {
    enabled: boolean;
    maxLength: number;
  }
): BackendResponseSnapshot | undefined {
  if (!enabled) {
    return undefined;
  }

  const sanitizedBody = sanitizeLogValue(responseBody);
  const serializedBody = safeStringify(sanitizedBody);
  if (serializedBody.length <= maxLength) {
    return {
      body: sanitizedBody,
      size: serializedBody.length,
      truncated: false
    };
  }

  return {
    body: `${serializedBody.slice(0, maxLength)}...`,
    size: serializedBody.length,
    truncated: true
  };
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function readQueryForLog(path: string): { query?: Record<string, string | string[]> } {
  const query: Record<string, string | string[]> = {};
  const parsed = new URL(path, "https://h5.local");

  parsed.searchParams.forEach((value, key) => {
    const currentValue = query[key];
    if (currentValue === undefined) {
      query[key] = value;
      return;
    }
    query[key] = Array.isArray(currentValue) ? [...currentValue, value] : [currentValue, value];
  });

  return Object.keys(query).length === 0 ? {} : { query };
}

function redactHeadersForLog(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, redactHeaderValue(key, value)])
  );
}

function redactHeaderValue(key: string, value: string) {
  const normalizedKey = key.toLowerCase();
  if (normalizedKey === "authorization") {
    return redactAuthorizationHeader(value);
  }
  if (normalizedKey === "cookie" || normalizedKey === "set-cookie" || normalizedKey.includes("token") || normalizedKey.includes("secret")) {
    return maskSecret(value);
  }
  return value;
}

function redactAuthorizationHeader(value: string) {
  const bearerMatch = /^Bearer\s+(.+)$/i.exec(value);
  if (bearerMatch) {
    return `Bearer ${maskSecret(bearerMatch[1] ?? "")}`;
  }
  return maskSecret(value);
}

function maskSecret(value: string) {
  if (value.length <= 8) {
    return `*** (length=${value.length})`;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)} (length=${value.length})`;
}

function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (depth > 4) {
    return "[max-depth]";
  }
  if (typeof value === "string") {
    return value.length > 500 ? `${value.slice(0, 500)}...` : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, depth + 1));
  }
  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      isSensitiveLogKey(key) && typeof item === "string" ? maskSecret(item) : sanitizeLogValue(item, depth + 1)
    ])
  );
}

function isSensitiveLogKey(key: string) {
  const normalizedKey = key.toLowerCase();
  return (
    normalizedKey.includes("authorization") ||
    normalizedKey.includes("cookie") ||
    normalizedKey.includes("mobile") ||
    normalizedKey.includes("phone") ||
    normalizedKey.includes("password") ||
    normalizedKey.includes("address") ||
    normalizedKey.includes("secret") ||
    normalizedKey.includes("token")
  );
}

type BackendBusinessStatus = {
  code?: string;
  message?: string;
  success?: boolean;
};

function readBackendBusinessStatus(responseBody: unknown): BackendBusinessStatus | undefined {
  if (!isRecord(responseBody)) {
    return undefined;
  }

  const status: BackendBusinessStatus = {};
  if (typeof responseBody.code === "string") {
    status.code = responseBody.code;
  }
  if (typeof responseBody.msg === "string") {
    status.message = responseBody.msg;
  } else if (typeof responseBody.message === "string") {
    status.message = responseBody.message;
  }
  if (typeof responseBody.success === "boolean") {
    status.success = responseBody.success;
  }

  return Object.keys(status).length > 0 ? status : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

class BackendTimeoutError extends Error {
  constructor() {
    super("Backend request timed out.");
  }
}

async function fetchWithTimeout(fetcher: ApiFetch, url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await Promise.race([
      fetcher(url, { ...init, signal: controller.signal }).catch((error: unknown) => {
        if (timedOut) {
          throw new BackendTimeoutError();
        }
        throw error;
      }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener(
          "abort",
          () => {
            reject(new BackendTimeoutError());
          },
          { once: true }
        );
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
