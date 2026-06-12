import type { HomeConfig, HomeModule } from "./types";

export class HomeConfigError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_CONFIG",
    public readonly status?: number
  ) {
    super(message);
    this.name = "HomeConfigError";
  }
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
