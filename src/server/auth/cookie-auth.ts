export type CookieAuth = {
  token: string | null;
  tokenCookieName: string;
};

export type CookieAuthOptions = {
  tokenCookieName?: string;
};

const defaultTokenCookieName = "meu_access_token";
const defaultPageConfigCookieName = "meu_page_config";

export function readCookieAuthFromHeader(cookieHeader: string | null | undefined, options: CookieAuthOptions = {}): CookieAuth {
  const tokenCookieName = options.tokenCookieName ?? defaultTokenCookieName;
  const cookies = parseCookieHeader(cookieHeader);

  return {
    token: cookies.get(tokenCookieName) ?? null,
    tokenCookieName
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
