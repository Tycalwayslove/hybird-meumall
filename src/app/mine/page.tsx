import { headers } from "next/headers";
import { AppScreen, Button, StateView } from "@/design-system";
import { MineScreen } from "@/features/mine/components/MineScreen";
import { fetchMineSummaryData } from "@/features/mine/server/mine-summary-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MinePage() {
  const requestHeaders = await headers();
  const request = new Request("http://h5.local/api/bff/mine/summary", {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchMineSummaryData({
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext
  });

  if (!result.ok) {
    return (
      <AppScreen className="px-4 pt-[calc(env(safe-area-inset-top)+48px)]">
        <StateView
          action={<Button variant="secondary">重试</Button>}
          className="min-h-[320px]"
          description={result.error.message}
          title="我的页面加载失败"
        />
      </AppScreen>
    );
  }

  return <MineScreen data={result.data} />;
}
