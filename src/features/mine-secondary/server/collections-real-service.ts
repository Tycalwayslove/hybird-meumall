import { createApiError } from "@/lib/api/errors";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

export type CollectionProductView = {
  browseLogId?: string;
  browseTime?: string;
  detailHref: string;
  groupLabel?: string;
  id: string;
  imageUrl?: string;
  priceText: string;
  prodId: string;
  salesText?: string;
  tag?: string;
  title: string;
};

export type CollectionsPageData<TModules> = {
  modules: TModules;
  page: {
    current: number;
    hasMore: boolean;
    pages: number;
    size: number;
    total: number;
  };
  view: {
    items: CollectionProductView[];
  };
};

export type CollectionMutationData = {
  modules: {
    raw: unknown;
  };
  view: {
    ok: true;
    message: string;
  };
};

export type JavaCollectionEnvelope<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
};

export type JavaPage<T> = {
  current?: number;
  pages?: number;
  records?: T[];
  size?: number;
  total?: number;
};

export type JavaFavoriteProductGroup = {
  products?: JavaCollectionProduct[];
};

export type JavaCollectionProduct = {
  activityPrice?: unknown;
  pic?: unknown;
  price?: unknown;
  prodId?: unknown;
  prodName?: unknown;
  prodType?: unknown;
  shopId?: unknown;
  soldNum?: unknown;
};

export type JavaFootprintProduct = JavaCollectionProduct & {
  browseTime?: unknown;
  prodBrowseLogId?: unknown;
};

type CollectionsBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export async function fetchFavoriteProductsData({
  authToken,
  backendClient,
  current = 1,
  javaOssAssetBaseUrl,
  route,
  size = 20
}: {
  authToken: string | null;
  backendClient: CollectionsBackendClient;
  current?: number;
  javaOssAssetBaseUrl?: string;
  route: string;
  size?: number;
}): Promise<BackendApiResult<CollectionsPageData<{ favoritePage: Required<JavaPage<JavaFavoriteProductGroup>> }>>> {
  const query = new URLSearchParams({
    current: String(normalizePositiveInteger(current, 1)),
    size: String(normalizePositiveInteger(size, 20))
  });
  const response = await backendClient.request<JavaCollectionEnvelope<JavaPage<JavaFavoriteProductGroup>>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/user/collection/prods?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "收藏商品获取失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const favoritePage = normalizePage(envelope.data, 20);
  const products = favoritePage.records.flatMap((group) => (Array.isArray(group?.products) ? group.products : []));

  return {
    ok: true,
    data: {
      modules: {
        favoritePage
      },
      page: mapPage(favoritePage),
      view: {
        items: products.map((product) => mapFavoriteProduct(product, { javaOssAssetBaseUrl })).filter(isCollectionProductView)
      }
    },
    meta: response.meta
  };
}

export async function fetchFootprintsData({
  authToken,
  backendClient,
  current = 1,
  javaOssAssetBaseUrl,
  route,
  size = 20
}: {
  authToken: string | null;
  backendClient: CollectionsBackendClient;
  current?: number;
  javaOssAssetBaseUrl?: string;
  route: string;
  size?: number;
}): Promise<BackendApiResult<CollectionsPageData<{ footprintPage: Required<JavaPage<JavaFootprintProduct>> }>>> {
  const query = new URLSearchParams({
    current: String(normalizePositiveInteger(current, 1)),
    size: String(normalizePositiveInteger(size, 20))
  });
  const response = await backendClient.request<JavaCollectionEnvelope<JavaPage<JavaFootprintProduct>>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/prodBrowseLog/page?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "足迹获取失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const footprintPage = normalizePage(envelope.data, 20);

  return {
    ok: true,
    data: {
      modules: {
        footprintPage
      },
      page: mapPage(footprintPage),
      view: {
        items: footprintPage.records.map((product) => mapFootprintProduct(product, { javaOssAssetBaseUrl })).filter(isCollectionProductView)
      }
    },
    meta: response.meta
  };
}

export async function cancelFavoriteProduct({
  authToken,
  backendClient,
  prodId,
  route
}: {
  authToken: string | null;
  backendClient: CollectionsBackendClient;
  prodId: string;
  route: string;
}): Promise<BackendApiResult<CollectionMutationData>> {
  const response = await backendClient.request<JavaCollectionEnvelope<unknown>>({
    authRequired: true,
    authToken,
    backend: "java",
    body: prodId,
    method: "POST",
    path: "/p/user/collection/addOrCancel",
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "取消收藏失败。");
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
        ok: true,
        message: "已取消收藏。"
      }
    },
    meta: response.meta
  };
}

export async function deleteFootprints({
  authToken,
  backendClient,
  ids,
  route
}: {
  authToken: string | null;
  backendClient: CollectionsBackendClient;
  ids: string[];
  route: string;
}): Promise<BackendApiResult<CollectionMutationData>> {
  const response = await backendClient.request<JavaCollectionEnvelope<unknown>>({
    authRequired: true,
    authToken,
    backend: "java",
    body: ids,
    method: "DELETE",
    path: "/p/prodBrowseLog",
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "删除足迹失败。");
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
        ok: true,
        message: "已删除足迹。"
      }
    },
    meta: response.meta
  };
}

function mapFavoriteProduct(product: JavaCollectionProduct, { javaOssAssetBaseUrl }: { javaOssAssetBaseUrl?: string }): CollectionProductView | null {
  const prodId = normalizeText(product.prodId);
  if (!prodId) {
    return null;
  }
  const soldNum = normalizeText(product.soldNum);

  return {
    detailHref: `/product/${encodeURIComponent(prodId)}`,
    id: prodId,
    imageUrl: resolveAssetUrl(product.pic, javaOssAssetBaseUrl),
    priceText: formatYuan(product.price),
    prodId,
    salesText: soldNum ? `已售: ${soldNum}` : undefined,
    tag: Number(product.shopId) === 1 ? "自营" : "商品收藏",
    title: normalizeText(product.prodName, "未命名商品")
  };
}

function mapFootprintProduct(product: JavaFootprintProduct, { javaOssAssetBaseUrl }: { javaOssAssetBaseUrl?: string }): CollectionProductView | null {
  const prodId = normalizeText(product.prodId);
  if (!prodId) {
    return null;
  }
  const browseLogId = normalizeText(product.prodBrowseLogId, prodId);
  const browseTime = normalizeText(product.browseTime);

  return {
    browseLogId,
    browseTime: browseTime || undefined,
    detailHref: `/product/${encodeURIComponent(prodId)}`,
    groupLabel: formatBrowseGroupLabel(browseTime),
    id: browseLogId,
    imageUrl: resolveAssetUrl(product.pic, javaOssAssetBaseUrl),
    priceText: formatYuan(product.price),
    prodId,
    tag: "浏览足迹",
    title: normalizeText(product.prodName, "未命名商品")
  };
}

function isCollectionProductView(value: CollectionProductView | null): value is CollectionProductView {
  return value !== null;
}

function unwrapJavaEnvelope<T>(envelope: JavaCollectionEnvelope<T>, requestId: string | undefined, fallbackMessage: string): BackendApiResult<T> {
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? fallbackMessage,
        requestId
      })
    };
  }

  return {
    ok: true,
    data: envelope.data as T,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "unknown",
      requestId: requestId ?? "unknown",
      route: "collections"
    }
  };
}

function isJavaSuccess(envelope: JavaCollectionEnvelope<unknown>) {
  return envelope.success !== false && (envelope.code === undefined || envelope.code === "00000");
}

function normalizePage<T>(page: JavaPage<T> | null | undefined, fallbackSize: number): Required<JavaPage<T>> {
  return {
    current: normalizePositiveInteger(page?.current, 1),
    pages: normalizePositiveInteger(page?.pages, 1),
    records: Array.isArray(page?.records) ? page.records : [],
    size: normalizePositiveInteger(page?.size, fallbackSize),
    total: normalizeNumber(page?.total, 0)
  };
}

function mapPage<T>(page: Required<JavaPage<T>>) {
  return {
    current: page.current,
    hasMore: page.current < page.pages,
    pages: page.pages,
    size: page.size,
    total: page.total
  };
}

function normalizeText(value: unknown, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
}

function normalizeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const parsed = Math.floor(normalizeNumber(value, fallback));
  return parsed > 0 ? parsed : fallback;
}

function formatYuan(value: unknown) {
  return `¥${normalizeMoney(value, 0).toFixed(2)}`;
}

function normalizeMoney(value: unknown, fallback: number) {
  const parsed = normalizeNumber(value, fallback);
  return Math.round(parsed * 100) / 100;
}

function resolveAssetUrl(value: unknown, baseUrl?: string) {
  const path = normalizeText(value, "");
  if (!path) {
    return undefined;
  }
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  const base = baseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL ?? "";
  if (!base) {
    return path;
  }
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function formatBrowseGroupLabel(value: string) {
  if (!value) {
    return undefined;
  }
  const datePart = value.slice(0, 10);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (datePart === today) {
    return "今天";
  }
  const [, month, day] = datePart.match(/^\d{4}-(\d{2})-(\d{2})/) ?? [];
  return month && day ? `${month}月${day}日` : value;
}
