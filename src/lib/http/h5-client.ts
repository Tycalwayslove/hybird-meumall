import type { ClientRequestContext } from "./client-context";
import { buildClientContextHeaders } from "./client-context";
import { getBrowserClientContext, recordRequestDiagnostic } from "./request-diagnostics";

export type H5BffResult<T> =
  | {
      success: true;
      data: T;
      requestId: string;
    }
  | {
      success: false;
      code: string;
      message: string;
      requestId?: string;
      recoverable: boolean;
    };

export type H5ClientConfig = {
  basePath?: string;
  clientContext?: ClientRequestContext;
  fetcher?: (input: string, init?: RequestInit) => Promise<Response>;
  pathname?: string;
  requestIdFactory?: () => string;
};

export type H5RequestOptions = {
  body?: unknown;
  clientContext?: ClientRequestContext;
  headers?: HeadersInit;
  method?: string;
};

export function createH5Client(config: H5ClientConfig = {}) {
  const fetcher = config.fetcher ?? globalThis.fetch.bind(globalThis);

  return {
    async request<T>(path: string, options: H5RequestOptions = {}): Promise<H5BffResult<T>> {
      const requestId = config.requestIdFactory?.() ?? createRequestId();
      const headers = normalizeHeaders(options.headers);
      const clientContext = mergeClientContext(getDefaultClientContext(), config.clientContext, options.clientContext);
      const method = options.method ?? (options.body === undefined ? "GET" : "POST");
      Object.assign(headers, buildClientContextHeaders(clientContext));
      headers["x-request-id"] = requestId;

      const init: RequestInit = {
        credentials: "include",
        headers,
        method
      };

      if (options.body !== undefined) {
        headers["content-type"] ??= "application/json";
        init.body = JSON.stringify(options.body);
      }

      try {
        const response = await fetcher(
          buildH5ApiPath(path, {
            basePath: config.basePath,
            pathname: config.pathname
          }),
          init
        );
        const payload = (await response.json()) as H5BffResult<T>;

        if (!response.ok && payload.success) {
          const result = {
            success: false,
            code: "HTTP_ERROR",
            message: "BFF request failed.",
            requestId,
            recoverable: true
          } as const;
          recordH5Request(path, method, clientContext, result.requestId, "error", result.code);
          return result;
        }

        recordH5Request(
          path,
          method,
          clientContext,
          payload.requestId ?? requestId,
          payload.success ? "success" : "error",
          payload.success ? undefined : payload.code
        );
        return payload;
      } catch (error) {
        recordH5Request(path, method, clientContext, requestId, "error", "NETWORK_ERROR");
        throw error;
      }
    }
  };
}

export function buildH5ApiPath(path: string, options: { basePath?: string; pathname?: string } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = normalizeBasePath(options.basePath ?? process.env.NEXT_PUBLIC_H5_BASE_PATH ?? inferBasePath(options.pathname));
  return `${basePath}${normalizedPath}`;
}

function inferBasePath(pathname?: string) {
  const currentPath = pathname ?? (typeof window === "undefined" ? "" : window.location.pathname);
  const segments = currentPath.split("/").filter(Boolean);
  if (segments[0] === "h5-v" && segments[1]) {
    return `/h5-v/${segments[1]}`;
  }
  if (segments[0] === "hybird") {
    return "/hybird";
  }
  return "";
}

function normalizeBasePath(basePath: string) {
  if (!basePath || basePath === "/") {
    return "";
  }
  return `/${basePath.replace(/^\/+|\/+$/g, "")}`;
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

function getDefaultClientContext(): ClientRequestContext {
  return typeof window === "undefined" ? {} : getBrowserClientContext();
}

function mergeClientContext(...contexts: Array<ClientRequestContext | undefined>): ClientRequestContext {
  return Object.assign({}, ...contexts.filter(Boolean));
}

function recordH5Request(
  path: string,
  method: string,
  clientContext: ClientRequestContext,
  requestId: string,
  status: "error" | "success",
  code?: string
) {
  recordRequestDiagnostic({
    ...(code === undefined ? {} : { code }),
    method,
    path,
    requestId,
    route: clientContext.h5Route ?? "unknown",
    status,
    timestamp: Date.now()
  });
}

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
