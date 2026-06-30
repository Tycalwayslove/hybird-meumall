import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { EmptyState, StandardNavPage } from "@/design-system";
import { SellerActivityProductsScreen } from "@/features/seller-activity/components/SellerActivityScreens";
import { fetchSellerActivityProductsData } from "@/features/seller-activity/server/seller-activity-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SellerActivityConfigPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function SellerActivityConfigPage({ params }: SellerActivityConfigPageProps) {
  const { activityId } = await params;
  if (!/^\d+$/.test(activityId)) {
    notFound();
  }

  const requestHeaders = await headers();
  const request = new Request(`http://h5.local/api/bff/seller-activities/${activityId}/products`, {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchSellerActivityProductsData({
    activityId: Number(activityId),
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext,
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    size: 10,
    status: 1
  });

  if (!result.ok) {
    return (
      <StandardNavPage title="活动配置" backHref="/seller/activities">
        <EmptyState text={result.error.message || "活动商品加载失败"} />
      </StandardNavPage>
    );
  }

  return <SellerActivityProductsScreen activityId={activityId} initialPage={result.data.page} initialProducts={result.data.view.products} />;
}
