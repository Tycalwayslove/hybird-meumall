import { submitContactMessage } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { messageContent?: string; orderNumber?: string; userMobile?: string } | null;
  const orderNumber = payload?.orderNumber?.trim();
  const messageContent = payload?.messageContent?.trim();
  const userMobile = payload?.userMobile?.trim();
  if (!orderNumber || !messageContent || !userMobile) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "订单号、联系方式或留言内容缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await submitContactMessage({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    messageContent,
    orderNumber,
    route: "/api/bff/orders/contact-message",
    userMobile
  });

  return toBffResponse(result);
}
