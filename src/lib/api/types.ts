import type { NativeBridge } from "@/lib/bridge";

export type ApiPlatform = "ios" | "android" | "web";

export type RequestMeta = {
  requestId: string;
  route: string;
  h5Version: string;
  appVersion?: string;
  platform?: ApiPlatform;
  channel?: string;
};

export type ApiErrorCode =
  | "TOKEN_MISSING"
  | "AUTH_FAILED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "HTTP_ERROR"
  | "PARSE_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  httpStatus?: number;
  requestId?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
};

export type ApiResult<T> = { ok: true; data: T; meta: RequestMeta } | { ok: false; error: ApiError };

export type ApiAuthMode = boolean;

export type ApiTokenProvider = () => Promise<string | null>;

export type ApiFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type ApiClientConfig = {
  baseUrl: string;
  bridge?: NativeBridge;
  defaultHeaders?: HeadersInit;
  fetcher?: ApiFetch;
  h5Version?: string;
  appVersion?: string;
  platform?: ApiPlatform;
  channel?: string;
  route?: string;
  requestIdFactory?: () => string;
  timeoutMs?: number;
  tokenProvider?: ApiTokenProvider;
};

export type ApiRequestOptions = {
  auth?: ApiAuthMode;
  body?: unknown;
  headers?: HeadersInit;
  method?: string;
  route?: string;
  timeoutMs?: number;
};

export type ApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<ApiResult<T>>;
};
