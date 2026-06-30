import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { EmptyState, StandardNavPage } from "@/design-system";
import { SellerActivityProductFormScreen } from "@/features/seller-activity/components/SellerActivityScreens";
import { fetchSellerActivityDetailData } from "@/features/seller-activity/server/seller-activity-service";
import type { SellerActivityProduct } from "@/features/seller-activity/types";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SellerActivityProductFormPageProps = {
  params: Promise<{
    activityId: string;
    prodId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellerActivityProductFormPage({ params, searchParams }: SellerActivityProductFormPageProps) {
  const { activityId, prodId } = await params;
  if (!/^\d+$/.test(activityId) || !/^\d+$/.test(prodId)) {
    notFound();
  }

  const requestHeaders = await headers();
  const request = new Request(`http://h5.local/api/bff/seller-activities/${activityId}/products/${prodId}`, {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchSellerActivityDetailData({
    activityId: Number(activityId),
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext,
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    prodId: Number(prodId)
  });

  if (!result.ok) {
    return (
      <StandardNavPage title="商品设置" backHref={`/seller/activities/${activityId}`}>
        <EmptyState text={result.error.message || "商品设置加载失败"} />
      </StandardNavPage>
    );
  }

  const query = await searchParams;
  return (
    <SellerActivityProductFormScreen
      activityId={activityId}
      fallbackProduct={createFallbackProductFromQuery(query)}
      initialProduct={result.data.view.product}
      prodId={prodId}
    />
  );
}

function createFallbackProductFromQuery(query: Record<string, string | string[] | undefined> | undefined): Partial<SellerActivityProduct> {
  const title = normalizeParam(query?.title);
  const imageUrl = normalizeParam(query?.image);
  const price = optionalNumber(normalizeParam(query?.price));
  const commission = optionalNumber(normalizeParam(query?.commission));
  return {
    ...(commission === undefined ? {} : { commissionText: `佣金: ¥${formatAmount(commission)}` }),
    ...(imageUrl ? { imageUrl } : {}),
    ...(price === undefined ? {} : { price }),
    ...(title ? { title } : {})
  };
}

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function optionalNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
