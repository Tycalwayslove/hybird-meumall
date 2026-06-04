export type CookieAuth = {
  pythonToken: string | null;
  pythonTokenCookieName: string;
  mallToken: string | null;
  mallTokenCookieName: string;
  statusHeight: number | null;
  statusHeightCookieName: string;
};

export type CookieAuthOptions = {
  mallTokenCookieName?: string;
  pythonTokenCookieName?: string;
  statusHeightCookieName?: string;
};

const defaultPythonTokenCookieName = "pythonToken";
const defaultMallTokenCookieName = "mallToken";
const defaultStatusHeightCookieName = "statusHeight";
const defaultPageConfigCookieName = "meu_page_config";

export function readCookieAuthFromHeader(cookieHeader: string | null | undefined, options: CookieAuthOptions = {}): CookieAuth {
  const pythonTokenCookieName = options.pythonTokenCookieName ?? defaultPythonTokenCookieName;
  const mallTokenCookieName = options.mallTokenCookieName ?? defaultMallTokenCookieName;
  const statusHeightCookieName = options.statusHeightCookieName ?? defaultStatusHeightCookieName;
  const cookies = parseCookieHeader(cookieHeader);

  return {
    pythonToken: cookies.get(pythonTokenCookieName) ?? null,
    pythonTokenCookieName,
    mallToken: cookies.get(mallTokenCookieName) ?? null,
    mallTokenCookieName,
    statusHeight: parseStatusHeight(cookies.get(statusHeightCookieName)),
    statusHeightCookieName
  };
}

export function readCookieAuthFromRequest(request: Request, options: CookieAuthOptions = {}): CookieAuth {
  return readCookieAuthFromHeader(request.headers.get("cookie"), options);
}

export function readPageConfigFromHeader(cookieHeader: string | null | undefined, cookieName = defaultPageConfigCookieName): Record<string, unknown> | null {
  const value = parseCookieHeader(cookieHeader).get(cookieName);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function getBackendAuthToken(auth: CookieAuth, backend: "java" | "python") {
  return backend === "python" ? auth.pythonToken : auth.mallToken;
}

export function parseCookieHeader(cookieHeader: string | null | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) {
    return cookies;
  }

  for (const segment of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = segment.trim().split("=");
    if (!rawName || rawValueParts.length === 0) {
      continue;
    }

    const rawValue = rawValueParts.join("=");
    cookies.set(rawName, safeDecode(rawValue));
  }

  return cookies;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseStatusHeight(value: string | undefined) {
  if (!value) {
    return null;
  }

  const height = Number(value);
  return Number.isFinite(height) && height >= 0 ? height : null;
}
