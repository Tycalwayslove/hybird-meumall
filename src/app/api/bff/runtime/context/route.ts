import { buildNativeRuntimeContextFromRequest } from "@/server/runtime/native-context";

export async function GET(request: Request) {
  const context = buildNativeRuntimeContextFromRequest(request);

  return Response.json({
    success: true,
    data: context,
    requestId: request.headers.get("x-request-id") ?? "runtime-context"
  });
}
