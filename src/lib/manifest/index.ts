import { resolveH5Version, type ResolveH5VersionContext } from "@/config/manifest";
import { validateManifestFile, type ManifestFile, type RouteDeliveryConfig } from "@/config/remote-config";

export { createHttpManifestFetcher, getDefaultManifestUrl } from "./server-fetcher";
export type {
  CreateHttpManifestFetcherOptions,
  ManifestFetchImplementation,
  ManifestUrlEnvironment
} from "./server-fetcher";

export type ManifestFetcher = () => Promise<unknown> | unknown;

export type ManifestStorageAdapter = {
  getItem: (key: string) => Promise<string | null | undefined> | string | null | undefined;
  setItem: (key: string, value: string) => Promise<void> | void;
};

export type ManifestSource = "network" | "cache";

export type CreateManifestRuntimeOptions = {
  fetchManifest: ManifestFetcher;
  storage: ManifestStorageAdapter;
  cacheKey?: string;
  fallbackRoute?: string;
};

export type RemoteRouteLoadResult = {
  ok: true;
  kind: "remote";
  route: string;
  requestedRoute?: string;
  version: string;
  url: string;
  manifestSource: ManifestSource;
};

export type LocalRouteLoadResult = {
  ok: true;
  kind: "local";
  route: string;
  requestedRoute?: string;
  version: string;
  path: string;
  fallbackUrl?: string;
  manifestSource: ManifestSource;
};

export type NotFoundRouteLoadResult = {
  ok: false;
  kind: "not-found";
  route: string;
  manifestSource: ManifestSource;
};

export type ErrorRouteLoadResult = {
  ok: false;
  kind: "error";
  reason: "manifest-unavailable";
  issues: string[];
};

export type ManifestRouteLoadResult =
  | RemoteRouteLoadResult
  | LocalRouteLoadResult
  | NotFoundRouteLoadResult
  | ErrorRouteLoadResult;

export type ManifestRuntime = {
  loadRoute: (route: string, ctx: ResolveH5VersionContext) => Promise<ManifestRouteLoadResult>;
};

type LoadedManifest = {
  manifest: ManifestFile;
  source: ManifestSource;
};

const defaultCacheKey = "hybird-meumall:manifest:last-known-good";

export function createManifestRuntime(options: CreateManifestRuntimeOptions): ManifestRuntime {
  const cacheKey = options.cacheKey ?? defaultCacheKey;

  return {
    async loadRoute(route, ctx) {
      const loadedManifest = await loadUsableManifest(options, cacheKey);

      if (!loadedManifest) {
        return {
          ok: false,
          kind: "error",
          reason: "manifest-unavailable",
          issues: ["No valid network or cached manifest is available."]
        };
      }

      return buildRouteLoadResult({
        route,
        requestedRoute: route,
        ctx,
        loadedManifest,
        fallbackRoute: options.fallbackRoute
      });
    }
  };
}

async function loadUsableManifest(
  options: CreateManifestRuntimeOptions,
  cacheKey: string
): Promise<LoadedManifest | undefined> {
  try {
    const fetched = await options.fetchManifest();
    const validated = validateManifestFile(fetched);

    if (validated.ok) {
      await options.storage.setItem(cacheKey, JSON.stringify(validated.data));
      return {
        manifest: validated.data,
        source: "network"
      };
    }
  } catch {
    // Fetch failures intentionally fall through to last-known-good cache.
  }

  return loadCachedManifest(options.storage, cacheKey);
}

async function loadCachedManifest(
  storage: ManifestStorageAdapter,
  cacheKey: string
): Promise<LoadedManifest | undefined> {
  const cached = await storage.getItem(cacheKey);
  if (!cached) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(cached) as unknown;
    const validated = validateManifestFile(parsed);

    return validated.ok
      ? {
          manifest: validated.data,
          source: "cache"
        }
      : undefined;
  } catch {
    return undefined;
  }
}

function buildRouteLoadResult(params: {
  route: string;
  requestedRoute: string;
  ctx: ResolveH5VersionContext;
  loadedManifest: LoadedManifest;
  fallbackRoute?: string;
}): ManifestRouteLoadResult {
  const { manifest, source } = params.loadedManifest;
  const routeConfig = manifest.routes[params.route];

  if (!routeConfig) {
    if (params.fallbackRoute && params.fallbackRoute !== params.route && manifest.routes[params.fallbackRoute]) {
      return buildRouteLoadResult({
        ...params,
        route: params.fallbackRoute
      });
    }

    return {
      ok: false,
      kind: "not-found",
      route: params.requestedRoute,
      manifestSource: source
    };
  }

  const version = resolveH5Version(params.ctx, manifest);
  return routeConfig.delivery === "remote"
    ? buildRemoteRouteResult({
        route: params.route,
        requestedRoute: params.requestedRoute,
        version,
        manifest,
        routeConfig,
        source
      })
    : buildLocalRouteResult({
        route: params.route,
        requestedRoute: params.requestedRoute,
        version,
        routeConfig,
        source
      });
}

function buildRemoteRouteResult(params: {
  route: string;
  requestedRoute: string;
  version: string;
  manifest: ManifestFile;
  routeConfig: RouteDeliveryConfig;
  source: ManifestSource;
}): RemoteRouteLoadResult {
  return withRequestedRoute(
    {
      ok: true,
      kind: "remote",
      route: params.route,
      version: params.version,
      url: joinUrl(
        params.manifest.assets.serviceBaseUrl,
        params.manifest.assets.basePath,
        params.routeConfig.path
      ),
      manifestSource: params.source
    },
    params.requestedRoute
  );
}

function buildLocalRouteResult(params: {
  route: string;
  requestedRoute: string;
  version: string;
  routeConfig: RouteDeliveryConfig;
  source: ManifestSource;
}): LocalRouteLoadResult {
  return withRequestedRoute(
    {
      ok: true,
      kind: "local",
      route: params.route,
      version: params.version,
      path: params.routeConfig.path,
      fallbackUrl: params.routeConfig.fallbackUrl,
      manifestSource: params.source
    },
    params.requestedRoute
  );
}

function withRequestedRoute<T extends RemoteRouteLoadResult | LocalRouteLoadResult>(
  result: T,
  requestedRoute: string
): T {
  return result.route === requestedRoute
    ? result
    : {
        ...result,
        requestedRoute
      };
}

function joinUrl(...parts: string[]): string {
  const [firstPart, ...restParts] = parts;
  return [
    firstPart.replace(/\/+$/u, ""),
    ...restParts.map((part) => part.replace(/^\/+|\/+$/gu, "")).filter(Boolean)
  ].join("/");
}
