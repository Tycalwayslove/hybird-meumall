import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";

import type {
  SellerActivityMutationView,
  SellerActivityPage,
  SellerActivityProduct,
  SellerActivitySku,
  SellerActivityStatus,
  SellerActivitySummary,
  SellerAvailableProduct
} from "../types";

type SellerActivityBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export type JavaEnvelope<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type SellerActivityConfigDto = {
  activityCode?: unknown;
  activityDesc?: unknown;
  activityImg?: unknown;
  activityName?: unknown;
  id?: unknown;
  orderCount?: unknown;
  runningProductCount?: unknown;
  seq?: unknown;
  status?: unknown;
};

export type SellerActivitySkuDto = {
  activityPrice?: unknown;
  commission?: unknown;
  costPrice?: unknown;
  id?: unknown;
  price?: unknown;
  skuId?: unknown;
  skuName?: unknown;
};

export type SellerActivityDto = {
  activityCode?: unknown;
  activityEndTime?: unknown;
  activityId?: unknown;
  activityImg?: unknown;
  activityName?: unknown;
  activityStartTime?: unknown;
  brief?: unknown;
  id?: unknown;
  limitNum?: unknown;
  oriPrice?: unknown;
  pic?: unknown;
  price?: unknown;
  prodId?: unknown;
  prodName?: unknown;
  skuList?: SellerActivitySkuDto[];
  soldNum?: unknown;
  status?: unknown;
};

export type JavaPage<T> = {
  current?: unknown;
  pages?: unknown;
  records?: T[];
  size?: unknown;
  total?: unknown;
};

export type DistributionProductDto = {
  commissionAmount?: unknown;
  originalPrice?: unknown;
  pic?: unknown;
  price?: unknown;
  prodId?: unknown;
  prodName?: unknown;
  soldNum?: unknown;
};

export type SellerActivitiesBffData = {
  modules: {
    activities: SellerActivityConfigDto[];
  };
  view: {
    activities: SellerActivitySummary[];
  };
};

export type SellerActivityProductsBffData = {
  modules: {
    productPage: JavaPage<SellerActivityDto>;
    products: SellerActivityDto[];
  };
  page: SellerActivityPage;
  view: {
    products: SellerActivityProduct[];
  };
};

export type SellerActivityDetailBffData = {
  modules: {
    detail: SellerActivityDto | null;
  };
  view: {
    product: SellerActivityProduct | null;
  };
};

export type SellerAvailableProductsBffData = {
  modules: {
    productPage: JavaPage<DistributionProductDto>;
    products: DistributionProductDto[];
  };
  page: SellerActivityPage;
  view: {
    products: SellerAvailableProduct[];
  };
};

export type SellerActivityMutationBffData = {
  modules: {
    raw: unknown;
  };
  view: SellerActivityMutationView;
};

export type SellerActivitySaveInput = {
  activityEndTime?: string;
  activityId: number;
  activityStartTime?: string;
  id?: number;
  limitNum: number;
  prodId: number;
  skuList: Array<{
    activityPrice: number;
    skuId: number;
  }>;
};

export type SellerActivityBatchStatusInput = {
  ids: number[];
  status: -1 | 0 | 1;
};

export async function fetchSellerActivitiesData({
  authToken,
  backendClient,
  clientContext,
  javaOssAssetBaseUrl,
  route = "/api/bff/seller-activities"
}: {
  authToken: string | null;
  backendClient: SellerActivityBackendClient;
  clientContext?: ClientRequestContext;
  javaOssAssetBaseUrl?: string;
  route?: string;
}): Promise<BackendApiResult<SellerActivitiesBffData>> {
  const response = await backendClient.request<JavaEnvelope<SellerActivityConfigDto[]>>({
    authRequired: true,
    authToken,
    backend: "java",
    clientContext,
    path: "/p/sellerActivity/availableList",
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "营销活动加载失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const activities = Array.isArray(envelope.data) ? envelope.data : [];

  return {
    ok: true,
    data: {
      modules: {
        activities
      },
      view: {
        activities: activities.map((activity) => mapSellerActivitySummary(activity, javaOssAssetBaseUrl)).filter(isSellerActivitySummary)
      }
    },
    meta: response.meta
  };
}

export async function fetchSellerActivityProductsData({
  activityId,
  authToken,
  backendClient,
  clientContext,
  current = 1,
  javaOssAssetBaseUrl,
  route = "/api/bff/seller-activities/[activityId]/products",
  size = 10,
  status
}: {
  activityId: number;
  authToken: string | null;
  backendClient: SellerActivityBackendClient;
  clientContext?: ClientRequestContext;
  current?: number;
  javaOssAssetBaseUrl?: string;
  route?: string;
  size?: number;
  status: SellerActivityStatus;
}): Promise<BackendApiResult<SellerActivityProductsBffData>> {
  const pageParams = normalizePageParams({ current, size });
  const query = new URLSearchParams({
    activityId: String(activityId),
    current: String(pageParams.current),
    size: String(pageParams.size),
    status: String(status)
  });
  const response = await backendClient.request<JavaEnvelope<JavaPage<SellerActivityDto>>>({
    authRequired: true,
    authToken,
    backend: "java",
    clientContext,
    path: `/p/sellerActivity/page?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "活动商品加载失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const productPage = normalizeJavaPage(envelope.data, pageParams);
  const products = productPage.records.map((product) => mapSellerActivityProduct(product, javaOssAssetBaseUrl)).filter(isSellerActivityProduct);

  return {
    ok: true,
    data: {
      modules: {
        productPage,
        products: productPage.records
      },
      page: mapPage(productPage),
      view: {
        products
      }
    },
    meta: response.meta
  };
}

export async function fetchSellerActivityDetailData({
  activityId,
  authToken,
  backendClient,
  clientContext,
  javaOssAssetBaseUrl,
  prodId,
  route = "/api/bff/seller-activities/[activityId]/products/[prodId]"
}: {
  activityId: number;
  authToken: string | null;
  backendClient: SellerActivityBackendClient;
  clientContext?: ClientRequestContext;
  javaOssAssetBaseUrl?: string;
  prodId: number;
  route?: string;
}): Promise<BackendApiResult<SellerActivityDetailBffData>> {
  const query = new URLSearchParams({
    activityId: String(activityId),
    prodId: String(prodId)
  });
  const response = await backendClient.request<JavaEnvelope<SellerActivityDto | null>>({
    authRequired: true,
    authToken,
    backend: "java",
    clientContext,
    path: `/p/sellerActivity/detail?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "活动商品详情加载失败。", { allowNullData: true });
  if (!envelope.ok) {
    return envelope;
  }
  const product = envelope.data ? mapSellerActivityProduct(envelope.data, javaOssAssetBaseUrl) : null;

  return {
    ok: true,
    data: {
      modules: {
        detail: envelope.data
      },
      view: {
        product: product && isSellerActivityProduct(product) ? product : null
      }
    },
    meta: response.meta
  };
}

export async function fetchSellerAvailableProductsData({
  activityId,
  authToken,
  backendClient,
  categoryId,
  clientContext,
  current = 1,
  javaOssAssetBaseUrl,
  keyword,
  orderBy,
  route = "/api/bff/seller-activities/[activityId]/available-products",
  size = 10
}: {
  activityId: number;
  authToken: string | null;
  backendClient: SellerActivityBackendClient;
  categoryId?: number;
  clientContext?: ClientRequestContext;
  current?: number;
  javaOssAssetBaseUrl?: string;
  keyword?: string;
  orderBy?: string;
  route?: string;
  size?: number;
}): Promise<BackendApiResult<SellerAvailableProductsBffData>> {
  const pageParams = normalizePageParams({ current, size });
  const query = new URLSearchParams({
    current: String(pageParams.current),
    incentiveId: String(activityId),
    size: String(pageParams.size)
  });
  appendOptionalParam(query, "keyword", keyword);
  appendOptionalParam(query, "categoryId", categoryId);
  appendOptionalParam(query, "orderBy", orderBy);

  const response = await backendClient.request<JavaEnvelope<JavaPage<DistributionProductDto>>>({
    authRequired: true,
    authToken,
    backend: "java",
    clientContext,
    path: `/p/distribution/prod/productPage?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "可选商品加载失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const productPage = normalizeJavaPage(envelope.data, pageParams);

  return {
    ok: true,
    data: {
      modules: {
        productPage,
        products: productPage.records
      },
      page: mapPage(productPage),
      view: {
        products: productPage.records.map((product) => mapSellerAvailableProduct(product, activityId, javaOssAssetBaseUrl)).filter(isSellerAvailableProduct)
      }
    },
    meta: response.meta
  };
}

export async function saveSellerActivity({
  authToken,
  backendClient,
  body,
  clientContext,
  route = "/api/bff/seller-activities/save-or-update"
}: {
  authToken: string | null;
  backendClient: SellerActivityBackendClient;
  body: SellerActivitySaveInput;
  clientContext?: ClientRequestContext;
  route?: string;
}): Promise<BackendApiResult<SellerActivityMutationBffData>> {
  const response = await backendClient.request<JavaEnvelope<unknown>>({
    authRequired: true,
    authToken,
    backend: "java",
    body,
    clientContext,
    method: "POST",
    path: "/p/sellerActivity/saveOrUpdate",
    route
  });

  return mapMutationResponse(response, "保存成功", "活动商品保存失败。");
}

export async function batchUpdateSellerActivityStatus({
  authToken,
  backendClient,
  body,
  clientContext,
  route = "/api/bff/seller-activities/batch-status"
}: {
  authToken: string | null;
  backendClient: SellerActivityBackendClient;
  body: SellerActivityBatchStatusInput;
  clientContext?: ClientRequestContext;
  route?: string;
}): Promise<BackendApiResult<SellerActivityMutationBffData>> {
  const response = await backendClient.request<JavaEnvelope<unknown>>({
    authRequired: true,
    authToken,
    backend: "java",
    body,
    clientContext,
    method: "POST",
    path: "/p/sellerActivity/batchStatus",
    route
  });

  return mapMutationResponse(response, "操作成功", "批量操作失败。");
}

export function unwrapJavaEnvelope<T>(
  response: JavaEnvelope<T>,
  requestId: string,
  fallbackMessage: string,
  options: { allowNullData?: boolean } = {}
): BackendApiResult<T> {
  if (response.success === false) {
    return {
      ok: false,
      error: createJavaApiError(response, requestId, fallbackMessage)
    };
  }

  if ((response.data === undefined || response.data === null) && !options.allowNullData) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        details: { code: response.code },
        message: response.msg ?? fallbackMessage,
        requestId
      })
    };
  }

  return {
    ok: true,
    data: response.data as T,
    meta: {
      appEnv: "unknown",
      backend: "java",
      h5Version: "unknown",
      requestId,
      route: "seller-activity"
    }
  };
}

function mapMutationResponse(
  response: BackendApiResult<JavaEnvelope<unknown>>,
  successMessage: string,
  failureMessage: string
): BackendApiResult<SellerActivityMutationBffData> {
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, failureMessage, { allowNullData: true });
  if (!envelope.ok) {
    return envelope;
  }

  return {
    ok: true,
    data: {
      modules: {
        raw: envelope.data
      },
      view: {
        message: response.data.msg ?? successMessage,
        ok: true
      }
    },
    meta: response.meta
  };
}

function createJavaApiError<T>(response: JavaEnvelope<T>, requestId: string, fallbackMessage: string): ApiError {
  const javaCodeMeta = getJavaResponseCodeMeta(response.code);
  return createApiError(mapJavaBusinessCodeToApiErrorCode(response.code), {
    details: {
      code: response.code,
      ...(javaCodeMeta === undefined ? {} : { codeName: javaCodeMeta.name })
    },
    message: response.msg ?? javaCodeMeta?.message ?? fallbackMessage,
    requestId
  });
}

function mapSellerActivitySummary(activity: SellerActivityConfigDto, assetBaseUrl?: string): SellerActivitySummary | null {
  const id = normalizeId(activity.id);
  const title = normalizeString(activity.activityName);
  if (!id || !title) {
    return null;
  }

  return {
    code: normalizeString(activity.activityCode),
    description: normalizeString(activity.activityDesc),
    href: `/seller/activities/${id}`,
    id,
    imageUrl: resolveJavaImageUrl(normalizeString(activity.activityImg), assetBaseUrl),
    orderCount: normalizeNonNegativeInteger(activity.orderCount, 0),
    runningProductCount: normalizeNonNegativeInteger(activity.runningProductCount, 0),
    status: normalizeOptionalInteger(activity.status),
    title
  };
}

function mapSellerActivityProduct(product: SellerActivityDto, assetBaseUrl?: string): SellerActivityProduct | null {
  const activityId = normalizeId(product.activityId);
  const prodId = normalizeId(product.prodId);
  const title = normalizeString(product.prodName) ?? normalizeString(product.activityName);
  if (!activityId || !prodId || !title) {
    return null;
  }

  return {
    activityEndTime: normalizeString(product.activityEndTime),
    activityId,
    activityStartTime: normalizeString(product.activityStartTime),
    brief: normalizeString(product.brief),
    commissionText: createCommissionText(product.skuList),
    id: normalizeId(product.id),
    imageUrl: resolveJavaImageUrl(normalizeString(product.pic) ?? normalizeString(product.activityImg), assetBaseUrl),
    limitNum: normalizeNonNegativeInteger(product.limitNum, 1),
    originalPrice: normalizeNumber(product.oriPrice, 0),
    price: normalizeNumber(product.price, 0),
    prodId,
    skuList: mapSellerActivitySkus(product.skuList),
    soldNum: normalizeNonNegativeInteger(product.soldNum, 0),
    status: normalizeOptionalInteger(product.status),
    title
  };
}

function mapSellerActivitySkus(skus: SellerActivitySkuDto[] | undefined): SellerActivitySku[] {
  return (Array.isArray(skus) ? skus : [])
    .map((sku) => {
      const skuId = normalizeId(sku.skuId);
      if (!skuId) {
        return null;
      }
      return {
        ...optionalNumberField("activityPrice", normalizeOptionalNumber(sku.activityPrice)),
        ...optionalNumberField("commission", normalizeOptionalNumber(sku.commission)),
        ...optionalNumberField("costPrice", normalizeOptionalNumber(sku.costPrice)),
        ...optionalStringField("id", normalizeId(sku.id)),
        ...optionalNumberField("price", normalizeOptionalNumber(sku.price)),
        skuId,
        skuName: normalizeString(sku.skuName) ?? "默认规格"
      };
    })
    .filter(isSellerActivitySku);
}

function mapSellerAvailableProduct(product: DistributionProductDto, activityId: number, assetBaseUrl?: string): SellerAvailableProduct | null {
  const prodId = normalizeId(product.prodId);
  const title = normalizeString(product.prodName);
  if (!prodId || !title) {
    return null;
  }

  return {
    commissionAmount: normalizeNumber(product.commissionAmount, 0),
    href: `/seller/activities/${activityId}/products/${prodId}`,
    imageUrl: resolveJavaImageUrl(normalizeString(product.pic), assetBaseUrl),
    originalPrice: normalizeNumber(product.originalPrice, 0),
    price: normalizeNumber(product.price ?? product.originalPrice, 0),
    prodId,
    soldNum: normalizeNonNegativeInteger(product.soldNum, 0),
    title
  };
}

function normalizeJavaPage<T>(page: JavaPage<T> | null | undefined, fallback: { current: number; size: number }): Required<JavaPage<T>> {
  return {
    current: normalizeNonNegativeInteger(page?.current, fallback.current),
    pages: normalizeNonNegativeInteger(page?.pages, 0),
    records: Array.isArray(page?.records) ? page.records : [],
    size: normalizeNonNegativeInteger(page?.size, fallback.size),
    total: normalizeNonNegativeInteger(page?.total, 0)
  };
}

function mapPage<T>(page: Required<JavaPage<T>>): SellerActivityPage {
  const current = normalizeNonNegativeInteger(page.current, 1);
  const size = normalizeNonNegativeInteger(page.size, 10);
  const pages = normalizeNonNegativeInteger(page.pages, 0);
  const total = normalizeNonNegativeInteger(page.total, 0);

  return {
    current,
    hasMore: pages > 0 ? current < pages : page.records.length >= size && current * size < total,
    pages,
    size,
    total
  };
}

function createCommissionText(skus: SellerActivitySkuDto[] | undefined) {
  const commission = Array.isArray(skus) ? skus.map((sku) => normalizeOptionalNumber(sku.commission)).find((value) => value !== undefined) : undefined;
  return commission === undefined ? undefined : `佣金: ¥${formatAmount(commission)}`;
}

function appendOptionalParam(searchParams: URLSearchParams, key: string, value: string | number | undefined) {
  if (value !== undefined && value !== "") {
    searchParams.set(key, String(value));
  }
}

function resolveJavaImageUrl(value: string | undefined, assetBaseUrl: string | undefined) {
  const imagePath = value?.trim();
  if (!imagePath) {
    return undefined;
  }
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(imagePath) || imagePath.startsWith("data:")) {
    return imagePath;
  }
  if (!assetBaseUrl?.trim()) {
    return imagePath;
  }
  return `${assetBaseUrl.trim().replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
}

function normalizePageParams({ current, size }: { current: number; size: number }) {
  return {
    current: Math.max(1, normalizeNonNegativeInteger(current, 1)),
    size: Math.min(100, Math.max(1, normalizeNonNegativeInteger(size, 10)))
  };
}

function normalizeId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.floor(value));
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeOptionalInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : undefined;
}

function normalizeNonNegativeInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}

function normalizeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalNumberField<TKey extends string>(key: TKey, value: number | undefined): Record<TKey, number> | Record<string, never> {
  return value === undefined ? {} : { [key]: value } as Record<TKey, number>;
}

function optionalStringField<TKey extends string>(key: TKey, value: string | undefined): Record<TKey, string> | Record<string, never> {
  return value === undefined ? {} : { [key]: value } as Record<TKey, string>;
}

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function isSellerActivitySummary(activity: SellerActivitySummary | null): activity is SellerActivitySummary {
  return activity !== null;
}

function isSellerActivityProduct(product: SellerActivityProduct | null): product is SellerActivityProduct {
  return product !== null;
}

function isSellerActivitySku(sku: SellerActivitySku | null): sku is SellerActivitySku {
  return sku !== null;
}

function isSellerAvailableProduct(product: SellerAvailableProduct | null): product is SellerAvailableProduct {
  return product !== null;
}
