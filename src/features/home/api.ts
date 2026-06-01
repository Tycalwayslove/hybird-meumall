import type { HomeConfig, HomeEnvironment, HomeModule } from "./types";

export const HOME_CONFIG_ENDPOINT = "/api/h5/home/config/active";
const DEFAULT_TIMEOUT_MS = 4000;
const DEFAULT_CONFIG_API_BASE_URL = "http://127.0.0.1:4100";

type FetchHomeConfigOptions = {
  environment?: HomeEnvironment;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export class HomeConfigError extends Error {
  constructor(
    message: string,
    public readonly code: "NETWORK_ERROR" | "TIMEOUT" | "HTTP_ERROR" | "PARSE_ERROR" | "INVALID_CONFIG",
    public readonly status?: number
  ) {
    super(message);
    this.name = "HomeConfigError";
  }
}

export async function fetchActiveHomeConfig({
  environment = "prod",
  fetcher = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
}: FetchHomeConfigOptions = {}): Promise<HomeConfig> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(buildHomeConfigUrl(environment), {
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new HomeConfigError("Active home config request failed", "HTTP_ERROR", response.status);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new HomeConfigError(getSafeErrorMessage(error), "PARSE_ERROR");
    }

    return parseHomeConfig(payload);
  } catch (error) {
    if (error instanceof HomeConfigError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new HomeConfigError("Active home config request timed out", "TIMEOUT");
    }

    throw new HomeConfigError(getSafeErrorMessage(error), "NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
  }
}

export function buildHomeConfigUrl(environment: HomeEnvironment = "prod"): string {
  const baseUrl = getConfigApiBaseUrl();
  const path = `${HOME_CONFIG_ENDPOINT}?environment=${encodeURIComponent(environment)}`;

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function parseHomeConfig(payload: unknown): HomeConfig {
  if (!isRecord(payload)) {
    throw new HomeConfigError("Home config payload must be an object", "INVALID_CONFIG");
  }

  if (payload.schemaVersion !== "1.0" || payload.pageId !== "home") {
    throw new HomeConfigError("Unsupported home config schema", "INVALID_CONFIG");
  }

  if (
    typeof payload.configVersion !== "string" ||
    typeof payload.generatedAt !== "string" ||
    !isRecord(payload.cache) ||
    typeof payload.cache.ttlSeconds !== "number" ||
    !Array.isArray(payload.modules)
  ) {
    throw new HomeConfigError("Home config is missing required fields", "INVALID_CONFIG");
  }

  return {
    schemaVersion: "1.0",
    pageId: "home",
    configVersion: payload.configVersion,
    generatedAt: payload.generatedAt,
    cache: {
      ttlSeconds: Math.max(0, payload.cache.ttlSeconds),
      staleWhileRevalidateSeconds:
        typeof payload.cache.staleWhileRevalidateSeconds === "number" ? Math.max(0, payload.cache.staleWhileRevalidateSeconds) : undefined
    },
    performance: isRecord(payload.performance)
      ? {
          requestTimeoutMs: asOptionalPositiveNumber(payload.performance.requestTimeoutMs),
          skeletonMinMs: asOptionalPositiveNumber(payload.performance.skeletonMinMs),
          preloadImageCount: asOptionalPositiveNumber(payload.performance.preloadImageCount),
          lcpCandidateModuleId:
            typeof payload.performance.lcpCandidateModuleId === "string" ? payload.performance.lcpCandidateModuleId : undefined,
          telemetrySampleRate: asOptionalTelemetryRate(payload.performance.telemetrySampleRate)
        }
      : undefined,
    modules: payload.modules.filter(isHomeModule)
  };
}

export function isCartTarget(target: string | undefined): boolean {
  if (!target) {
    return false;
  }

  return /(^|\/)cart(s)?(\/|$)/i.test(target);
}

function isHomeModule(module: unknown): module is HomeModule {
  return (
    isRecord(module) &&
    typeof module.id === "string" &&
    typeof module.type === "string" &&
    typeof module.enabled === "boolean" &&
    typeof module.sortOrder === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asOptionalPositiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function asOptionalTelemetryRate(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : undefined;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException ? error.name === "AbortError" : isRecord(error) && error.name === "AbortError";
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown home config error";
}

function getConfigApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_CONFIG_API_BASE_URL || DEFAULT_CONFIG_API_BASE_URL;
}
