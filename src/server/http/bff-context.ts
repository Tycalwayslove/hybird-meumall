import type { ApiFetch } from "@/lib/api/types";
import type { BackendEnv } from "./backend-registry";
import { getBackendAuthToken, readCookieAuthFromRequest } from "@/server/auth/cookie-auth";
import { readClientRequestContextFromHeaders } from "@/lib/http/client-context";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendCallLogger } from "./backend-client";
import { createBackendClient } from "./backend-client";
import { createBackendRegistry } from "./backend-registry";

export type BffRequestContextOptions = {
  fetcher?: ApiFetch;
  h5Version?: string;
  logger?: BackendCallLogger;
  registryEnv?: BackendEnv;
  requestIdFactory?: () => string;
};

export function createBffRequestContext(request: Request, options: BffRequestContextOptions = {}) {
  const auth = readCookieAuthFromRequest(request);
  const clientContext = readClientRequestContextFromHeaders(request.headers);
  const logger = options.logger ?? createConsoleBackendCallLogger();

  return {
    auth,
    backendClient: createBackendClient({
      fetcher: options.fetcher,
      h5Version: options.h5Version ?? process.env.H5_VERSION,
      logger,
      registry: createBackendRegistry(options.registryEnv),
      requestIdFactory: options.requestIdFactory
    }),
    clientContext,
    getAuthToken: (backend: "java" | "python") => getBackendAuthToken(auth, backend)
  };
}

export function createConsoleBackendCallLogger(): BackendCallLogger {
  return (entry) => {
    console.info("[h5-bff-backend-call]", entry);
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
