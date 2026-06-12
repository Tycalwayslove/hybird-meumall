import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import type { HomeExperienceData, HomeProductCard, HomeQuickCategory } from "../home-page-data";

type HomeBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type HomeServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type AppHomeVO = {
  banners?: AppBannerVO[];
  categoryTop8?: CategoryDto[];
  hotCategory?: ProdRankGroupDto | null;
  seckillModule?: AppSeckillModuleVO | null;
  [key: string]: unknown;
};

export type AppBannerVO = {
  imgUrl?: string;
  jumpType?: number;
  jumpValue?: string;
  relation?: number;
  seq?: number;
  [key: string]: unknown;
};

export type ProdRankGroupDto = {
  categoryId?: number;
  icon?: string;
  rankName?: string;
  rankType?: number;
  top3?: ProdRankProdDto[];
  [key: string]: unknown;
};

export type ProdRankProdDto = {
  pic?: string;
  price?: number;
  prodId?: number;
  prodName?: string;
  rankNo?: number;
  soldNum?: number;
  [key: string]: unknown;
};

export type CategoryDto = {
  categories?: unknown[];
  categoryId?: number;
  categoryName?: string;
  icon?: string;
  parentId?: number;
  pic?: string;
  treeCategoryIds?: number[];
  [key: string]: unknown;
};

export type AppSeckillModuleVO = {
  products?: AppSeckillItemVO[];
  [key: string]: unknown;
};

export type AppSeckillItemVO = {
  commissionAmount?: number;
  darenPrice?: number;
  endTime?: string;
  pic?: string;
  prodId?: number;
  prodName?: string;
  seckillId?: number;
  seckillPrice?: number;
  [key: string]: unknown;
};

export type IPageAppRecommendProdVO = {
  current?: number;
  pages?: number;
  records?: AppRecommendProdVO[];
  size?: number;
  total?: number;
  [key: string]: unknown;
};

export type AppRecommendCouponVO = {
  cashCondition?: number;
  couponId?: number;
  couponName?: string;
  couponType?: number;
  couponUserId?: number;
  reduceAmount?: number;
  [key: string]: unknown;
};

export type AppRecommendProdVO = {
  activityTag?: number;
  bestCoupon?: AppRecommendCouponVO | null;
  commissionAmount?: number;
  couponDiscountAmount?: number;
  darenPrice?: number;
  hasMultiSku?: boolean;
  pic?: string;
  price?: number;
  prodId?: number;
  prodName?: string;
  prodTag?: string;
  soldNum?: number;
  [key: string]: unknown;
};

export type HomeBffModules = {
  banners: AppBannerVO[];
  categoryTop8: CategoryDto[];
  hotCategory: ProdRankGroupDto | null;
  seckillModule: AppSeckillModuleVO | null;
};

export type HomeBffDebugRaw = {
  homeIndex: HomeServerResponse<AppHomeVO>;
};

export type HomeBffData = {
  view: HomeExperienceData;
  modules: HomeBffModules;
  debugRaw?: HomeBffDebugRaw;
};

export type HomeRecommendProductsBffModules = {
  recommendProducts: AppRecommendProdVO[];
  recommendPage: IPageAppRecommendProdVO;
};

export type HomeForYouProductsBffModules = {
  forYouProducts: AppRecommendProdVO[];
  forYouPage: IPageAppRecommendProdVO;
};

type HomePagedProductsBffCommon = {
  view: {
    products: HomeProductCard[];
  };
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
};

export type HomeRecommendProductsBffData = HomePagedProductsBffCommon & {
  modules: HomeRecommendProductsBffModules;
  debugRaw?: {
    recommendProds: HomeServerResponse<IPageAppRecommendProdVO>;
  };
};

export type HomeForYouProductsBffData = HomePagedProductsBffCommon & {
  modules: HomeForYouProductsBffModules;
  debugRaw?: {
    forYouProds: HomeServerResponse<IPageAppRecommendProdVO>;
  };
};

export type FetchHomeExperienceOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: HomeBackendClient;
  clientContext?: ClientRequestContext;
  fallback: HomeExperienceData;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
};

export type FetchHomePagedProductsOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: HomeBackendClient;
  clientContext?: ClientRequestContext;
  current?: number;
  fallbackProducts: HomeProductCard[];
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  size?: number;
};

export async function fetchHomeExperienceData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  fallback,
  includeDebugRaw = false,
  javaOssAssetBaseUrl
}: FetchHomeExperienceOptions): Promise<BackendApiResult<HomeBffData>> {
  const commonOptions = {
    authRequired,
    authToken,
    backend: "java" as const,
    clientContext,
    method: "GET",
    route: "/"
  };

  const aggregateResult = await backendClient.request<HomeServerResponse<AppHomeVO>>({
    ...commonOptions,
    path: "/p/app/home/index"
  });
  if (!aggregateResult.ok) {
    return aggregateResult;
  }
  const aggregate = unwrapHomeData(aggregateResult.data, aggregateResult.meta.requestId);
  if (!aggregate.ok) {
    return aggregate;
  }

  return {
    ok: true,
    data: createHomeBffData({
      aggregate: aggregate.data,
      fallback,
      javaOssAssetBaseUrl,
      raw: includeDebugRaw
        ? {
            homeIndex: aggregateResult.data
          }
        : undefined
    }),
    meta: aggregateResult.meta
  };
}

export function createHomeBffData({
  aggregate,
  fallback,
  javaOssAssetBaseUrl,
  raw
}: {
  aggregate: AppHomeVO;
  fallback: HomeExperienceData;
  javaOssAssetBaseUrl?: string;
  raw?: HomeBffDebugRaw;
}): HomeBffData {
  return {
    ...(raw === undefined ? {} : { debugRaw: raw }),
    modules: createHomeBffModules({
      aggregate
    }),
    view: mapHomeApiToExperienceData({
      aggregate,
      fallback,
      javaOssAssetBaseUrl
    })
  };
}

function createHomeBffModules({ aggregate }: { aggregate: AppHomeVO }): HomeBffModules {
  return {
    banners: aggregate.banners ?? [],
    categoryTop8: aggregate.categoryTop8 ?? [],
    hotCategory: aggregate.hotCategory ?? null,
    seckillModule: aggregate.seckillModule ?? null
  };
}

export async function fetchHomeForYouProductsData({
  ...options
}: FetchHomePagedProductsOptions): Promise<BackendApiResult<HomeForYouProductsBffData>> {
  return fetchHomePagedProductsData({
    ...options,
    backendPath: "/p/app/home/forYouProds",
    source: "forYou"
  });
}

export async function fetchHomeRecommendProductsData({
  ...options
}: FetchHomePagedProductsOptions): Promise<BackendApiResult<HomeRecommendProductsBffData>> {
  return fetchHomePagedProductsData({
    ...options,
    backendPath: "/p/app/home/recommendProds",
    source: "recommend"
  });
}

function fetchHomePagedProductsData(
  options: FetchHomePagedProductsOptions & { backendPath: "/p/app/home/forYouProds"; source: "forYou" }
): Promise<BackendApiResult<HomeForYouProductsBffData>>;
function fetchHomePagedProductsData(
  options: FetchHomePagedProductsOptions & { backendPath: "/p/app/home/recommendProds"; source: "recommend" }
): Promise<BackendApiResult<HomeRecommendProductsBffData>>;
async function fetchHomePagedProductsData({
  authRequired = false,
  authToken,
  backendPath,
  backendClient,
  clientContext,
  current = 1,
  fallbackProducts,
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  size = 10,
  source
}: FetchHomePagedProductsOptions & {
  backendPath: "/p/app/home/forYouProds" | "/p/app/home/recommendProds";
  source: "forYou" | "recommend";
}): Promise<BackendApiResult<HomeForYouProductsBffData | HomeRecommendProductsBffData>> {
  const page = normalizePageParams({ current, size });
  const result = await backendClient.request<HomeServerResponse<IPageAppRecommendProdVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `${backendPath}?${new URLSearchParams({
      current: String(page.current),
      size: String(page.size)
    }).toString()}`,
    route: "/"
  });
  if (!result.ok) {
    return result;
  }

  const pagedProducts = unwrapHomeData(result.data, result.meta.requestId);
  if (!pagedProducts.ok) {
    return pagedProducts;
  }

  return {
    ok: true,
    data: createHomePagedProductsBffData({
      fallbackProducts,
      javaOssAssetBaseUrl,
      page,
      pagedProducts: pagedProducts.data,
      raw: includeDebugRaw ? result.data : undefined,
      source
    }),
    meta: result.meta
  };
}

function createHomePagedProductsBffData({
  fallbackProducts,
  javaOssAssetBaseUrl,
  page,
  pagedProducts,
  raw,
  source
}: {
  fallbackProducts: HomeProductCard[];
  javaOssAssetBaseUrl?: string;
  page: { current: number; size: number };
  pagedProducts: IPageAppRecommendProdVO;
  raw?: HomeServerResponse<IPageAppRecommendProdVO>;
  source: "forYou" | "recommend";
}): HomeForYouProductsBffData | HomeRecommendProductsBffData {
  const products = mapProducts(pagedProducts.records, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL);
  const current = normalizePositiveInteger(pagedProducts.current, page.current);
  const size = normalizePositiveInteger(pagedProducts.size, page.size);
  const total = normalizeOptionalNonNegativeInteger(pagedProducts.total);
  const pages = normalizeOptionalNonNegativeInteger(pagedProducts.pages);

  const common = {
    page: {
      current,
      hasMore: hasMorePages({ current, pages, recordCount: pagedProducts.records?.length ?? 0, size, total }),
      ...(pages === undefined ? {} : { pages }),
      size,
      ...(total === undefined ? {} : { total })
    },
    view: {
      products: products.length > 0 ? products : fallbackProducts
    }
  };

  if (source === "recommend") {
    return {
      ...(raw === undefined ? {} : { debugRaw: { recommendProds: raw } }),
      ...common,
      modules: {
        recommendPage: pagedProducts,
        recommendProducts: pagedProducts.records ?? []
      }
    };
  }

  return {
    ...(raw === undefined ? {} : { debugRaw: { forYouProds: raw } }),
    ...common,
    modules: {
      forYouPage: pagedProducts,
      forYouProducts: pagedProducts.records ?? []
    }
  };
}

export function mapHomeApiToExperienceData({
  aggregate,
  fallback,
  javaOssAssetBaseUrl
}: {
  aggregate: AppHomeVO;
  fallback: HomeExperienceData;
  javaOssAssetBaseUrl?: string;
}): HomeExperienceData {
  const assetBaseUrl = javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL;
  const banner = mapBanner(aggregate.banners, fallback, assetBaseUrl);
  const categories = mapCategories(aggregate.categoryTop8, assetBaseUrl);

  return {
    ...fallback,
    banner,
    categories: categories.length > 0 ? categories : fallback.categories
  };
}

function unwrapHomeData<T>(response: HomeServerResponse<T>, requestId: string): BackendApiResult<T> {
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
      route: "/"
    }
  };
}

function mapBanner(banners: AppBannerVO[] | undefined, fallback: HomeExperienceData, assetBaseUrl?: string): HomeExperienceData["banner"] {
  const banner = [...(banners ?? [])].sort((left, right) => (left.seq ?? 0) - (right.seq ?? 0))[0];
  const imageUrl = resolveJavaImageUrl(banner?.imgUrl, assetBaseUrl);
  if (!banner || !imageUrl) {
    return fallback.banner;
  }

  return {
    alt: "首页 Banner",
    assetKey: fallback.banner.assetKey,
    href: mapBannerHref(banner),
    imageUrl
  };
}

function mapBannerHref(banner: AppBannerVO) {
  if (banner.jumpType === 1 && banner.jumpValue) {
    return banner.jumpValue;
  }

  const targetId = banner.jumpValue || (banner.relation === undefined ? "" : String(banner.relation));
  if (banner.jumpType === 2 && targetId) {
    return `/product/${targetId}`;
  }
  if (banner.jumpType === 3 || banner.jumpType === 4) {
    return "/promotion/activities";
  }
  if (banner.jumpType === 5) {
    return "/promotion/rank-center";
  }

  return "/promotion";
}

function mapCategories(categories: CategoryDto[] | undefined, assetBaseUrl?: string): HomeQuickCategory[] {
  return (categories ?? [])
    .filter((category) => category.categoryName && category.categoryId !== undefined)
    .slice(0, 10)
    .map((category) => ({
      href: `/search?categoryId=${encodeURIComponent(String(category.categoryId))}`,
      ...optionalImageUrl("iconUrl", resolveJavaImageUrl(category.icon ?? category.pic, assetBaseUrl)),
      label: category.categoryName ?? ""
    }));
}

function mapProducts(products: AppRecommendProdVO[] | undefined, assetBaseUrl?: string): HomeProductCard[] {
  return (products ?? [])
    .filter((product) => product.prodId !== undefined && product.prodName)
    .map((product) => {
      const displayPrice = product.darenPrice ?? product.price ?? 0;
      const originalPrice = product.price ?? displayPrice;

      return {
        badge: product.prodTag === "热卖" ? "热卖" : "推荐",
        href: `/product/${product.prodId}`,
        id: String(product.prodId),
        ...optionalImageUrl("imageUrl", resolveJavaImageUrl(product.pic, assetBaseUrl)),
        originalPrice: formatPrice(originalPrice),
        price: formatPrice(displayPrice),
        promoType: product.activityTag === 2 ? "seckill" : "talent",
        soldText: `已售 ${formatCount(product.soldNum ?? 0)}`,
        title: product.prodName ?? ""
      };
    });
}

function resolveJavaImageUrl(value: string | undefined, assetBaseUrl: string | undefined) {
  const imagePath = value?.trim();
  if (!imagePath) {
    return undefined;
  }
  if (isAbsoluteAssetUrl(imagePath) || imagePath.startsWith("fallback://")) {
    return imagePath;
  }
  if (!assetBaseUrl?.trim()) {
    return imagePath;
  }

  return `${assetBaseUrl.trim().replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
}

function isAbsoluteAssetUrl(value: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(value) || value.startsWith("data:");
}

function optionalImageUrl<Key extends string>(key: Key, imageUrl: string | undefined): Partial<Record<Key, string>> {
  return imageUrl ? ({ [key]: imageUrl } as Partial<Record<Key, string>>) : {};
}

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatCount(value: number) {
  return value >= 10000 ? `${(value / 10000).toFixed(1).replace(/\.0$/, "")}万` : String(value);
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

export function createHomeBffFailure(error: ApiError): BackendApiResult<HomeBffData> {
  return {
    ok: false,
    error
  };
}
