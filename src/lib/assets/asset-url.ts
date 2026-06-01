export type AssetUrlOptions = {
  assetBaseUrl?: string;
  basePath?: string;
};

export function assetUrl(path: string, options: AssetUrlOptions = {}): string {
  if (isAbsoluteAssetUrl(path)) {
    return path;
  }

  const normalizedPath = normalizeAssetPath(path);
  const assetBaseUrl = trimTrailingSlash(options.assetBaseUrl ?? readEnv("NEXT_PUBLIC_H5_ASSET_BASE_URL"));
  if (assetBaseUrl) {
    return `${assetBaseUrl}${normalizedPath}`;
  }

  const basePath = normalizeBasePath(
    options.basePath ?? readEnv("NEXT_PUBLIC_H5_BASE_PATH") ?? readEnv("H5_BASE_PATH")
  );

  return `${basePath}${normalizedPath}`;
}

function isAbsoluteAssetUrl(path: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(path);
}

function normalizeAssetPath(path: string): string {
  const raw = String(path || "").trim();
  const normalized = raw.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
  return `/${normalized}`;
}

function normalizeBasePath(path: string | undefined): string {
  const raw = String(path || "").trim();
  if (!raw || raw === "/") {
    return "";
  }
  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
}

function trimTrailingSlash(value: string | undefined): string {
  return String(value || "").trim().replace(/\/+$/, "");
}

function readEnv(key: string): string | undefined {
  return process.env[key];
}
