import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import type { PromotionProductItem } from "../mock/products";

type PromotionProductsBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type PromotionProductsServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type DistributionPromoteProdItemDto = {
  commissionAmount?: number;
  isFavorite?: boolean;
  originalPrice?: number;
  pic?: string;
  price?: number;
  prodId?: number;
  prodName?: string;
  soldNum?: number;
  [key: string]: unknown;
};

export type DistributionProdProductPageDto = {
  current?: number;
  pages?: number;
  records?: DistributionPromoteProdItemDto[];
  size?: number;
  total?: number;
  [key: string]: unknown;
};

export type PromotionProductsBffData = {
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
  view: {
    products: PromotionProductItem[];
  };
  modules: {
    productPage: DistributionProdProductPageDto;
    products: DistributionPromoteProdItemDto[];
  };
  debugRaw?: {
    productPage: PromotionProductsServerResponse<DistributionProdProductPageDto>;
  };
};

export type FetchPromotionProductsOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionProductsBackendClient;
  categoryId2?: number;
  categoryId3?: number;
  clientContext?: ClientRequestContext;
  current?: number;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  prodName?: string;
  size?: number;
  sort?: number;
};

export async function fetchPromotionProductsData({
  authRequired = false,
  authToken,
  backendClient,
  categoryId2,
  categoryId3,
  clientContext,
  current = 1,
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  prodName,
  size = 10,
  sort
}: FetchPromotionProductsOptions): Promise<BackendApiResult<PromotionProductsBffData>> {
  const page = normalizePageParams({ current, size });
  const query = new URLSearchParams({
    current: String(page.current),
    size: String(page.size)
  });
  appendOptionalParam(query, "prodName", prodName);
  appendOptionalParam(query, "sort", sort);
  appendOptionalParam(query, "categoryId2", categoryId2);
  appendOptionalParam(query, "categoryId3", categoryId3);

  const result = await backendClient.request<PromotionProductsServerResponse<DistributionProdProductPageDto>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/distribution/prod/productPage?${query.toString()}`,
    route: "/promotion/products"
  });
  if (!result.ok) {
    return result;
  }

  const pagedProducts = unwrapPromotionProductsData(result.data, result.meta.requestId);
  if (!pagedProducts.ok) {
    return pagedProducts;
  }

  return {
    ok: true,
    data: createPromotionProductsBffData({
      javaOssAssetBaseUrl,
      page,
      pagedProducts: pagedProducts.data,
      raw: includeDebugRaw ? result.data : undefined
    }),
    meta: result.meta
  };
}

export function createPromotionProductsBffData({
  javaOssAssetBaseUrl,
  page,
  pagedProducts,
  raw
}: {
  javaOssAssetBaseUrl?: string;
  page: { current: number; size: number };
  pagedProducts: DistributionProdProductPageDto;
  raw?: PromotionProductsServerResponse<DistributionProdProductPageDto>;
}): PromotionProductsBffData {
  const products = mapPromotionProducts(pagedProducts.records, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL);
  const current = normalizePositiveInteger(pagedProducts.current, page.current);
  const size = normalizePositiveInteger(pagedProducts.size, page.size);
  const total = normalizeOptionalNonNegativeInteger(pagedProducts.total);
  const pages = normalizeOptionalNonNegativeInteger(pagedProducts.pages);

  return {
    ...(raw === undefined ? {} : { debugRaw: { productPage: raw } }),
    modules: {
      productPage: pagedProducts,
      products: pagedProducts.records ?? []
    },
    page: {
      current,
      hasMore: hasMorePages({ current, pages, recordCount: pagedProducts.records?.length ?? 0, size, total }),
      ...(pages === undefined ? {} : { pages }),
      size,
      ...(total === undefined ? {} : { total })
    },
    view: {
      products
    }
  };
}

function unwrapPromotionProductsData<T>(response: PromotionProductsServerResponse<T>, requestId: string): BackendApiResult<T> {
  if (response.success === false) {
    const javaCodeMeta = getJavaResponseCodeMeta(response.code);

    return {
      ok: false,
      error: createApiError(mapJavaBusinessCodeToApiErrorCode(response.code), {
        details: {
          code: response.code,
          ...(javaCodeMeta === undefined ? {} : { codeName: javaCodeMeta.name })
        },
        message: response.msg ?? javaCodeMeta?.message,
        requestId
      })
    };
  }

  if (response.data === undefined || response.data === null) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        details: { code: response.code },
        message: response.msg,
        requestId
      })
    };
  }

  return {
    ok: true,
    data: response.data,
    meta: {
      appEnv: "unknown",
      backend: "java",
      h5Version: "unknown",
      requestId,
      route: "/promotion/products"
    }
  };
}

function mapPromotionProducts(products: DistributionPromoteProdItemDto[] | undefined, assetBaseUrl?: string): PromotionProductItem[] {
  return (products ?? [])
    .filter((product) => product.prodId !== undefined && product.prodName)
    .map((product) => ({
      commissionRate: "",
      estimatedCommission: normalizePrice(product.commissionAmount),
      href: `/product/${product.prodId}`,
      id: String(product.prodId),
      imageUrl: resolveJavaImageUrl(product.pic, assetBaseUrl),
      isFavorite: product.isFavorite,
      sales: normalizeOptionalNonNegativeInteger(product.soldNum) ?? 0,
      title: product.prodName ?? "",
      userPrice: normalizePrice(product.price ?? product.originalPrice)
    }));
}

function appendOptionalParam(searchParams: URLSearchParams, key: string, value: string | number | undefined) {
  if (value === undefined || value === "") {
    return;
  }
  searchParams.set(key, String(value));
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
    current: normalizePositiveInteger(current, 1),
    size: Math.min(100, normalizePositiveInteger(size, 10))
  };
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function normalizeOptionalNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
}

function normalizePrice(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function hasMorePages({
  current,
  pages,
  recordCount,
  size,
  total
}: {
  current: number;
  pages?: number;
  recordCount: number;
  size: number;
  total?: number;
}) {
  if (pages !== undefined) {
    return current < pages;
  }
  if (total !== undefined) {
    return current * size < total;
  }
  return recordCount >= size;
}

export function createPromotionProductsBffFailure(error: ApiError): BackendApiResult<PromotionProductsBffData> {
  return {
    ok: false,
    error
  };
}
