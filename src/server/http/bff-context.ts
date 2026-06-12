import type { ApiFetch } from "@/lib/api/types";
import type { BackendEnv } from "./backend-registry";
import { getBackendAuthToken, readCookieAuthFromRequest, type LocalDevTokenEnv } from "@/server/auth/cookie-auth";
import { readClientRequestContextFromHeaders } from "@/lib/http/client-context";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendCallLogger } from "./backend-client";
import { createBackendClient } from "./backend-client";
import { createBackendRegistry } from "./backend-registry";

export type BffRequestContextOptions = {
  authEnv?: LocalDevTokenEnv;
  fetcher?: ApiFetch;
  h5Version?: string;
  logger?: BackendCallLogger;
  logResponseBody?: boolean;
  registryEnv?: BackendEnv;
  requestIdFactory?: () => string;
  responseBodyLogLimit?: number;
};

export function createBffRequestContext(request: Request, options: BffRequestContextOptions = {}) {
  const auth = readCookieAuthFromRequest(request, { env: options.authEnv });
  const clientContext = readClientRequestContextFromHeaders(request.headers);
  const logger = options.logger ?? createConsoleBackendCallLogger();

  return {
    auth,
    backendClient: createBackendClient({
      fetcher: options.fetcher,
      h5Version: options.h5Version ?? process.env.H5_VERSION,
      logger,
      logResponseBody: options.logResponseBody ?? shouldLogBackendResponseBody(process.env.H5_BFF_LOG_BACKEND_RESPONSE),
      registry: createBackendRegistry(options.registryEnv),
      requestIdFactory: options.requestIdFactory,
      responseBodyLogLimit: options.responseBodyLogLimit ?? parseResponseBodyLogLimit(process.env.H5_BFF_BACKEND_RESPONSE_LOG_LIMIT)
    }),
    clientContext,
    getAuthToken: (backend: "java" | "python") => getBackendAuthToken(auth, backend)
  };
}

function shouldLogBackendResponseBody(value: string | undefined) {
  return value === "1" || value?.toLowerCase() === "true";
}

function parseResponseBodyLogLimit(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function createConsoleBackendCallLogger(): BackendCallLogger {
  return (entry) => {
    console.info("[h5-bff-backend-call]", JSON.stringify(entry, null, 2));
  };
}

export function withClientContext<T extends { clientContext?: ClientRequestContext }>(
  options: Omit<T, "clientContext">,
  clientContext: ClientRequestContext
): T {
  return {
    ...options,
    clientContext
  } as T;
}
