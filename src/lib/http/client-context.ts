export type ClientPlatform = "android" | "ios" | "web" | (string & {});

export type ClientRequestContext = {
  appBuild?: string;
  appName?: string;
  appVersion?: string;
  deviceModel?: string;
  h5Route?: string;
  h5Version?: string;
  osVersion?: string;
  pageSessionId?: string;
  platform?: ClientPlatform;
  userAgent?: string;
  webviewVersion?: string;
};

type ClientContextHeaderOptions = {
  includeUserAgent?: boolean;
};

const contextHeaderMap = {
  appBuild: "x-app-build",
  appName: "x-app-name",
  appVersion: "x-app-version",
  deviceModel: "x-device-model",
  h5Route: "x-h5-route",
  h5Version: "x-h5-version",
  osVersion: "x-os-version",
  pageSessionId: "x-page-session-id",
  platform: "x-platform",
  webviewVersion: "x-webview-version"
} as const satisfies Record<Exclude<keyof ClientRequestContext, "userAgent">, string>;

export function buildClientContextHeaders(context: ClientRequestContext | undefined, options: ClientContextHeaderOptions = {}) {
  const headers: Record<string, string> = {};
  if (!context) {
    return headers;
  }

  for (const [key, headerName] of Object.entries(contextHeaderMap) as Array<[keyof typeof contextHeaderMap, string]>) {
    const value = normalizeHeaderValue(context[key]);
    if (value) {
      headers[headerName] = value;
    }
  }

  const userAgent = normalizeHeaderValue(context.userAgent);
  if (options.includeUserAgent && userAgent) {
    headers["user-agent"] = userAgent;
  }

  return headers;
}

export function readClientRequestContextFromHeaders(headers: HeadersInit): ClientRequestContext {
  const source = new Headers(headers);

  return {
    appBuild: readOptionalHeader(source, "x-app-build"),
    appName: readOptionalHeader(source, "x-app-name"),
    appVersion: readOptionalHeader(source, "x-app-version"),
    deviceModel: readOptionalHeader(source, "x-device-model"),
    h5Route: readOptionalHeader(source, "x-h5-route"),
    h5Version: readOptionalHeader(source, "x-h5-version"),
    osVersion: readOptionalHeader(source, "x-os-version"),
    pageSessionId: readOptionalHeader(source, "x-page-session-id"),
    platform: readOptionalHeader(source, "x-platform"),
    userAgent: readOptionalHeader(source, "user-agent"),
    webviewVersion: readOptionalHeader(source, "x-webview-version")
  };
}

function readOptionalHeader(headers: Headers, name: string) {
  return normalizeHeaderValue(headers.get(name)) || undefined;
}

function normalizeHeaderValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}
