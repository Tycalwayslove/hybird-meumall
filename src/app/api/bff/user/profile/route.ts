import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const context = createBffRequestContext(request);

  const result = await context.backendClient.request({
    backend: "java",
    path: "/api/user/profile",
    authRequired: true,
    authToken: context.getAuthToken("java"),
    clientContext: context.clientContext,
    route: "/mine"
  });

  return toBffResponse(result);
}
