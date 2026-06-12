import { parseCookieHeader, readCookieAuthFromHeader, readPageConfigFromHeader } from "@/server/auth/cookie-auth";

export type NativeRuntimeContext = {
  auth: {
    pythonToken: RuntimeTokenContext;
    mallToken: RuntimeTokenContext;
  };
  statusBar: {
    statusHeight: number | null;
    statusHeightCookieName: string;
  };
  pageConfig: Record<string, unknown> | null;
  cookies: Array<{
    name: string;
    sensitive: boolean;
    present: boolean;
    preview: string | null;
  }>;
  sourceParams: Record<string, string>;
  environment: {
    appEnv: string;
    h5Version: string;
    localTokenFallback: {
      enabled: boolean;
      javaTokenPresent: boolean;
      pythonTokenPresent: boolean;
    };
  };
};

type RuntimeTokenContext = {
  cookieName: string;
  present: boolean;
  preview: string | null;
  length: number;
};

export type NativeRuntimeContextInput = {
  cookieHeader?: string | null;
  env?: Readonly<Record<string, string | undefined>>;
  sourceSearch?: string | null;
};

const sensitiveCookiePattern = /(token|secret|password|credential|authorization|auth)/i;

export function buildNativeRuntimeContext({ cookieHeader, env = process.env, sourceSearch }: NativeRuntimeContextInput): NativeRuntimeContext {
  const auth = readCookieAuthFromHeader(cookieHeader);
  const cookies = parseCookieHeader(cookieHeader);

  return {
    auth: {
      pythonToken: buildRuntimeTokenContext(auth.pythonTokenCookieName, auth.pythonToken),
      mallToken: buildRuntimeTokenContext(auth.mallTokenCookieName, auth.mallToken)
    },
    statusBar: {
      statusHeight: auth.statusHeight,
      statusHeightCookieName: auth.statusHeightCookieName
    },
    pageConfig: readPageConfigFromHeader(cookieHeader),
    cookies: Array.from(cookies.entries()).map(([name, value]) => {
      const sensitive = isSensitiveCookie(name);
      return {
        name,
        sensitive,
        present: true,
        preview: value
      };
    }),
    sourceParams: parseSearchParams(sourceSearch),
    environment: {
      appEnv: env.APP_ENV ?? "unknown",
      h5Version: env.H5_VERSION ?? env.H5_RELEASE_LABEL ?? "unknown",
      localTokenFallback: {
        enabled: env.APP_ENV === "local",
        javaTokenPresent: Boolean(env.H5_LOCAL_JAVA_TOKEN?.trim()),
        pythonTokenPresent: Boolean(env.H5_LOCAL_PYTHON_TOKEN?.trim())
      }
    }
  };
}

function buildRuntimeTokenContext(cookieName: string, value: string | null): RuntimeTokenContext {
  return {
    cookieName,
    present: Boolean(value),
    preview: value,
    length: value?.length ?? 0
  };
}

export function buildNativeRuntimeContextFromRequest(request: Request, env: Readonly<Record<string, string | undefined>> = process.env) {
  const url = new URL(request.url);
  return buildNativeRuntimeContext({
    cookieHeader: request.headers.get("cookie"),
    env,
    sourceSearch: url.searchParams.get("sourceSearch") ?? ""
  });
}

function isSensitiveCookie(name: string) {
  return sensitiveCookiePattern.test(name);
}

function parseSearchParams(sourceSearch: string | null | undefined): Record<string, string> {
  if (!sourceSearch) {
    return {};
  }

  const normalized = sourceSearch.startsWith("?") ? sourceSearch.slice(1) : sourceSearch;
  const result: Record<string, string> = {};
  new URLSearchParams(normalized).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
