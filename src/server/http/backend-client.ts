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
  backendPath: string;
  backendStatus?: number;
  deviceModel?: string;
  durationMs: number;
  errorCode?: ApiError["code"];
  method: string;
  osVersion?: string;
  pageSessionId?: string;
  platform?: string;
  requestId: string;
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
  requestIdFactory?: () => string;
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
      if (options.authToken) {
        headers.Authorization = `Bearer ${options.authToken}`;
      }

      const init: RequestInit = {
        headers,
        method: options.method ?? (options.body === undefined ? "GET" : "POST")
      };

      if (options.body !== undefined) {
        headers["content-type"] ??= "application/json";
        init.body = JSON.stringify(options.body);
      }

      try {
        const response = await fetchWithTimeout(fetcher, buildUrl(backend.baseUrl, options.path), init, options.timeoutMs ?? timeoutMs);
        const responseBody = await parseResponseBody(response);

        if (!response.ok) {
          const error = createApiError(response.status === 401 || response.status === 403 ? "AUTH_FAILED" : "HTTP_ERROR", {
            httpStatus: response.status,
            requestId,
            details: responseBody === undefined ? undefined : { response: responseBody }
          });
          logBackendCall(config.logger, {
            backendStatus: response.status,
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

        logBackendCall(config.logger, {
          backendStatus: response.status,
          options,
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
    backendStatus?: number;
    errorCode?: ApiError["code"];
    options: BackendRequestOptions;
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
    backendPath: input.options.path,
    ...(input.backendStatus === undefined ? {} : { backendStatus: input.backendStatus }),
    ...(context?.deviceModel === undefined ? {} : { deviceModel: context.deviceModel }),
    durationMs: Math.max(0, Date.now() - input.startedAt),
    ...(input.errorCode === undefined ? {} : { errorCode: input.errorCode }),
    method: input.options.method ?? (input.options.body === undefined ? "GET" : "POST"),
    ...(context?.osVersion === undefined ? {} : { osVersion: context.osVersion }),
    ...(context?.pageSessionId === undefined ? {} : { pageSessionId: context.pageSessionId }),
    ...(context?.platform === undefined ? {} : { platform: context.platform }),
    requestId: input.requestId,
    route: input.options.route ?? "unknown",
    timeoutMs: input.timeoutMs,
    ...(context?.webviewVersion === undefined ? {} : { webviewVersion: context.webviewVersion })
  });
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
