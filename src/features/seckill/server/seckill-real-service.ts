import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import type { SeckillProduct } from "../mock/seckill-page-data";

type SeckillBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type SeckillServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type AppHomeSeckillProdVO = {
  endTime?: string;
  limitNum?: number;
  originalPrice?: number;
  pic?: string;
  prodId?: number;
  prodName?: string;
  remainingSeconds?: number;
  remainingStocks?: number;
  seckillId?: number;
  seckillPrice?: number;
  soldNum?: number;
  [key: string]: unknown;
};

export type IPageAppHomeSeckillProdVO = {
  current?: number;
  pages?: number;
  records?: AppHomeSeckillProdVO[];
  size?: number;
  total?: number;
  [key: string]: unknown;
};

export type SeckillProductsBffData = {
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
  view: {
    products: SeckillProduct[];
  };
  modules: {
    seckillPage: IPageAppHomeSeckillProdVO;
    seckillProducts: AppHomeSeckillProdVO[];
  };
  debugRaw?: {
    seckillProds: SeckillServerResponse<IPageAppHomeSeckillProdVO>;
  };
};

export type FetchSeckillProductsOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: SeckillBackendClient;
  clientContext?: ClientRequestContext;
  current?: number;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  size?: number;
};

export async function fetchSeckillProductsData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  current = 1,
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  size = 10
}: FetchSeckillProductsOptions): Promise<BackendApiResult<SeckillProductsBffData>> {
  const page = normalizePageParams({ current, size });
  const result = await backendClient.request<SeckillServerResponse<IPageAppHomeSeckillProdVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/app/home/seckillProds?${new URLSearchParams({
      current: String(page.current),
      size: String(page.size)
    }).toString()}`,
    route: "/seckill"
  });
  if (!result.ok) {
    return result;
  }

  const pagedProducts = unwrapSeckillData(result.data, result.meta.requestId);
  if (!pagedProducts.ok) {
    return pagedProducts;
  }

  return {
    ok: true,
    data: createSeckillProductsBffData({
      javaOssAssetBaseUrl,
      page,
      pagedProducts: pagedProducts.data,
      raw: includeDebugRaw ? result.data : undefined
    }),
    meta: result.meta
  };
}

export function createSeckillProductsBffData({
  javaOssAssetBaseUrl,
  page,
  pagedProducts,
  raw
}: {
  javaOssAssetBaseUrl?: string;
  page: { current: number; size: number };
  pagedProducts: IPageAppHomeSeckillProdVO;
  raw?: SeckillServerResponse<IPageAppHomeSeckillProdVO>;
}): SeckillProductsBffData {
  const products = mapSeckillProducts(pagedProducts.records, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL);
  const current = normalizePositiveInteger(pagedProducts.current, page.current);
  const size = normalizePositiveInteger(pagedProducts.size, page.size);
  const total = normalizeOptionalNonNegativeInteger(pagedProducts.total);
  const pages = normalizeOptionalNonNegativeInteger(pagedProducts.pages);

  return {
    ...(raw === undefined ? {} : { debugRaw: { seckillProds: raw } }),
    modules: {
      seckillPage: pagedProducts,
      seckillProducts: pagedProducts.records ?? []
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

function unwrapSeckillData<T>(response: SeckillServerResponse<T>, requestId: string): BackendApiResult<T> {
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
      route: "/seckill"
    }
  };
}

function mapSeckillProducts(products: AppHomeSeckillProdVO[] | undefined, assetBaseUrl?: string): SeckillProduct[] {
  return (products ?? [])
    .filter((product) => product.prodId !== undefined && product.prodName)
    .map((product) => {
      const soldNum = normalizeOptionalNonNegativeInteger(product.soldNum) ?? 0;
      const remainingStocks = normalizeOptionalNonNegativeInteger(product.remainingStocks) ?? 0;

      return {
        countdown: formatCountdown(product.remainingSeconds, product.endTime),
        href: `/product/${product.prodId}`,
        id: String(product.seckillId ?? product.prodId),
        imageUrl: resolveJavaImageUrl(product.pic, assetBaseUrl),
        limitText: `限购${normalizePositiveInteger(product.limitNum, 1)}件`,
        originalPrice: normalizePrice(product.originalPrice ?? product.seckillPrice),
        price: normalizePrice(product.seckillPrice ?? product.originalPrice),
        progress: calculateProgress(soldNum, remainingStocks),
        soldText: `已售: ${formatCount(soldNum)}`,
        stockText: `还剩: ${formatCount(remainingStocks)}件`,
        title: product.prodName ?? "",
        tone: "blue" as const
      };
    });
}

function formatCountdown(remainingSeconds: number | undefined, endTime: string | undefined) {
  const seconds = normalizeOptionalNonNegativeInteger(remainingSeconds);
  if (seconds !== undefined) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const nextSeconds = seconds % 60;
    return [hours, minutes, nextSeconds].map((value) => String(value).padStart(2, "0")).join(":");
  }
  return endTime || "进行中";
}

function calculateProgress(soldNum: number, remainingStocks: number) {
  const total = soldNum + remainingStocks;
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((soldNum / total) * 100)));
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

function formatCount(value: number) {
  return value >= 10000 ? `${(value / 10000).toFixed(1).replace(/\.0$/, "")}万` : String(value);
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

export function createSeckillBffFailure(error: ApiError): BackendApiResult<SeckillProductsBffData> {
  return {
    ok: false,
    error
  };
}
