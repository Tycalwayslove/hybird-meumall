import { nativeBridge } from "@/lib/bridge";
import { createApiError } from "./errors";
import type {
  ApiClient,
  ApiClientConfig,
  ApiFetch,
  ApiRequestOptions,
  ApiResult,
  RequestMeta
} from "./types";

const defaultTimeoutMs = 10000;

export function createApiClient(config: ApiClientConfig): ApiClient {
  const fetcher = config.fetcher ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = config.timeoutMs ?? defaultTimeoutMs;
  const tokenProvider = config.tokenProvider ?? createBridgeTokenProvider(config.bridge ?? nativeBridge);

  return {
    async request<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
      const meta = createRequestMeta(config, options);
      const requestTimeoutMs = options.timeoutMs ?? timeoutMs;

      const headers = normalizeHeaders(config.defaultHeaders);
      Object.assign(headers, normalizeHeaders(options.headers));
      headers["x-request-id"] = meta.requestId;
      headers["x-h5-version"] = meta.h5Version;
      headers["x-route"] = meta.route;

      if (options.auth) {
        const token = await tokenProvider();
        if (!token) {
          return {
            ok: false,
            error: createApiError("TOKEN_MISSING", {
              requestId: meta.requestId
            })
          };
        }
        headers.authorization = `Bearer ${token}`;
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
        const response = await fetchWithTimeout(fetcher, buildUrl(config.baseUrl, path), init, requestTimeoutMs);
        const responseBody = await parseResponseBody(response);

        if (!response.ok) {
          const code = response.status === 401 || response.status === 403 ? "AUTH_FAILED" : "HTTP_ERROR";
          return {
            ok: false,
            error: createApiError(code, {
              httpStatus: response.status,
              requestId: meta.requestId,
              details: responseBody === undefined ? undefined : { response: responseBody }
            })
          };
        }

        return {
          ok: true,
          data: responseBody as T,
          meta
        };
      } catch (error) {
        if (error instanceof ApiTimeoutError) {
          return {
            ok: false,
            error: createApiError("TIMEOUT", {
              requestId: meta.requestId,
              details: { timeoutMs: requestTimeoutMs }
            })
          };
        }

        return {
          ok: false,
          error: createApiError("NETWORK_ERROR", {
            requestId: meta.requestId,
            details: { message: error instanceof Error ? error.message : String(error) }
          })
        };
      }
    }
  };
}

function createRequestMeta(config: ApiClientConfig, options: ApiRequestOptions): RequestMeta {
  return {
    requestId: config.requestIdFactory?.() ?? createRequestId(),
    route: options.route ?? config.route ?? "unknown",
    h5Version: config.h5Version ?? "unknown",
    ...(config.appVersion === undefined ? {} : { appVersion: config.appVersion }),
    ...(config.platform === undefined ? {} : { platform: config.platform }),
    ...(config.channel === undefined ? {} : { channel: config.channel })
  };
}

function createBridgeTokenProvider(bridge = nativeBridge) {
  return async () => {
    if (!bridge.canCall("user.getToken")) {
      return null;
    }

    const result = await bridge.call("user.getToken");
    if (!result.ok) {
      return null;
    }

    return result.data.token;
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

class ApiTimeoutError extends Error {
  constructor() {
    super("API request timed out.");
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
          throw new ApiTimeoutError();
        }
        throw error;
      }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener(
          "abort",
          () => {
            reject(new ApiTimeoutError());
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
