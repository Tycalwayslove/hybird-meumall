import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { EmptyState, StandardNavPage } from "@/design-system";
import { SellerActivityProductSelectScreen } from "@/features/seller-activity/components/SellerActivityScreens";
import { fetchSellerAvailableProductsData } from "@/features/seller-activity/server/seller-activity-service";
import { DEFAULT_PROMOTION_PRODUCT_ORDER_BY } from "@/features/promotion/promotion-product-query";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SellerActivityProductSelectPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function SellerActivityProductSelectPage({ params }: SellerActivityProductSelectPageProps) {
  const { activityId } = await params;
  if (!/^\d+$/.test(activityId)) {
    notFound();
  }

  const requestHeaders = await headers();
  const request = new Request(`http://h5.local/api/bff/seller-activities/${activityId}/available-products`, {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchSellerAvailableProductsData({
    activityId: Number(activityId),
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext,
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    orderBy: DEFAULT_PROMOTION_PRODUCT_ORDER_BY,
    size: 10
  });

  if (!result.ok) {
    return (
      <StandardNavPage title="选择商品" backHref={`/seller/activities/${activityId}`}>
        <EmptyState text={result.error.message || "可选商品加载失败"} />
      </StandardNavPage>
    );
  }

  return <SellerActivityProductSelectScreen activityId={activityId} initialPage={result.data.page} initialProducts={result.data.view.products} />;
}
