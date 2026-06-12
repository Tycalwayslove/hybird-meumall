import { parseCookieHeader } from "@/server/auth/cookie-auth";

export type DebugLoginAccess = { action: "allow" } | { action: "redirect" } | { action: "not_found" };

export type DebugLoginAccessInput = {
  cookieHeader: string | null | undefined;
  headers: Headers;
};

const nativeSignalHeaders = ["x-app-name", "x-app-version", "x-app-build", "x-device-model", "x-os-version", "x-webview-version"];

export function resolveDebugLoginAccess({ cookieHeader, headers }: DebugLoginAccessInput): DebugLoginAccess {
  const cookies = parseCookieHeader(cookieHeader);
  const hasMallToken = Boolean(cookies.get("mallToken")?.trim());
  const hasPythonToken = Boolean(cookies.get("pythonToken")?.trim());

  if (hasMallToken && hasPythonToken) {
    return { action: "redirect" };
  }

  if (hasNativeRuntimeSignal(cookies, headers)) {
    return { action: "not_found" };
  }

  return { action: "allow" };
}

function hasNativeRuntimeSignal(cookies: Map<string, string>, headers: Headers) {
  if (cookies.has("statusHeight") || cookies.has("meu_page_config")) {
    return true;
  }

  const platform = headers.get("x-platform")?.trim().toLowerCase();
  if (platform === "ios" || platform === "android") {
    return true;
  }

  return nativeSignalHeaders.some((name) => Boolean(headers.get(name)?.trim()));
}

export function normalizeDebugRedirect(value: string | string[] | undefined, fallback = "/") {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/debug-login")) {
    return fallback;
  }

  return raw;
}
