import { readCookieAuthFromRequest } from "@/server/auth/cookie-auth";
import { createBackendClient } from "@/server/http/backend-client";
import { createBackendRegistry } from "@/server/http/backend-registry";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const auth = readCookieAuthFromRequest(request);
  const backendClient = createBackendClient({
    registry: createBackendRegistry(),
    h5Version: process.env.H5_VERSION
  });

  const result = await backendClient.request({
    backend: "java",
    path: "/api/user/profile",
    authRequired: true,
    authToken: auth.token,
    route: "/mine"
  });

  return toBffResponse(result);
}
