import { headers } from "next/headers";

import { EmptyState, StandardNavPage } from "@/design-system";
import { SellerActivitiesScreen } from "@/features/seller-activity/components/SellerActivityScreens";
import { fetchSellerActivitiesData } from "@/features/seller-activity/server/seller-activity-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SellerActivitiesPage() {
  const requestHeaders = await headers();
  const request = new Request("http://h5.local/api/bff/seller-activities", {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchSellerActivitiesData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext,
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL
  });

  if (!result.ok) {
    return (
      <StandardNavPage title="营销活动" backHref="/mine">
        <EmptyState text={result.error.message || "营销活动加载失败"} />
      </StandardNavPage>
    );
  }

  return <SellerActivitiesScreen activities={result.data.view.activities} />;
}
