import type { ManifestFetcher } from "./index";

export type ManifestFetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export type ManifestUrlEnvironment = {
  readonly [key: string]: string | undefined;
  NEXT_PUBLIC_H5_MANIFEST_URL?: string;
  H5_MANIFEST_URL?: string;
};

export type CreateHttpManifestFetcherOptions = {
  url?: string;
  fetchImpl?: ManifestFetchImplementation;
};

export function createHttpManifestFetcher(options: CreateHttpManifestFetcherOptions = {}): ManifestFetcher {
  const url = options.url ?? getDefaultManifestUrl();
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!url) {
    throw new Error("Missing active manifest URL. Set NEXT_PUBLIC_H5_MANIFEST_URL or H5_MANIFEST_URL.");
  }
  if (!fetchImpl) {
    throw new Error("Missing fetch implementation for active manifest request.");
  }

  return async () => {
    const response = await fetchImpl(url, {
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch active manifest: ${response.status} ${response.statusText} from ${url}`
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to parse active manifest JSON from ${url}`, {
        cause: error
      });
    }
  };
}

export function getDefaultManifestUrl(env: ManifestUrlEnvironment = getRuntimeManifestEnv()): string | undefined {
  return env.NEXT_PUBLIC_H5_MANIFEST_URL || env.H5_MANIFEST_URL;
}

function getRuntimeManifestEnv(): ManifestUrlEnvironment {
  return typeof process === "undefined" ? {} : process.env;
}
