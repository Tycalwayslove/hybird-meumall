import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";

type SearchBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export type SearchServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type ProdRankTabDto = {
  categoryId?: number | string | null;
  rankName?: string | null;
  rankType?: number | null;
  [key: string]: unknown;
};

export type ProductCardVO = {
  activityType?: number | null;
  displayPrice?: number | string | null;
  discountAmount?: number | string | null;
  isHot?: boolean | null;
  isRecommend?: boolean | null;
  oriPrice?: number | string | null;
  pic?: string | null;
  price?: number | string | null;
  prodId?: number | string | null;
  prodName?: string | null;
  soldNum?: number | string | null;
  [key: string]: unknown;
};

export type IPageProductCardVO = {
  current?: number | string | null;
  pages?: number | string | null;
  records?: ProductCardVO[] | null;
  size?: number | string | null;
  total?: number | string | null;
  [key: string]: unknown;
};

export type CategoryVO = {
  categories?: CategoryVO[] | null;
  children?: CategoryVO[] | null;
  categoryId?: number | string | null;
  categoryName?: string | null;
  parentId?: number | string | null;
  seq?: number | null;
  status?: number | null;
  [key: string]: unknown;
};

export type SearchProductCategoryOption = {
  children?: SearchProductCategoryOption[];
  id: string;
  label: string;
};

export type HotSearchDto = {
  content?: string;
  hotSearchId?: number;
  jumpType?: number;
  jumpValue?: string;
  seq?: number;
  shopId?: number;
  status?: number;
  title?: string;
  type?: number;
  [key: string]: unknown;
};

export type SearchHotKeywordsBffData = {
  view: {
    hotKeywords: string[];
  };
  modules: {
    hotSearches: HotSearchDto[];
  };
  debugRaw?: {
    hotSearch: SearchServerResponse<HotSearchDto[]>;
  };
};

export type SearchRankingBffData = {
  view: {
    activeTabId: string;
    notice: string;
    products: Array<{
      badge?: { label: string; type: "hot" | "recommend" | "seckill" };
      feature: string;
      href: string;
      id: string;
      imageUrl?: string;
      originalPrice: number;
      price: number;
      soldText: string;
      title: string;
    }>;
    tabs: Array<{
      categoryId?: string;
      id: string;
      label: string;
      rankType: 1 | 2;
    }>;
  };
  modules: {
    products: ProductCardVO[];
    rankTabs: ProdRankTabDto[];
  };
  debugRaw?: {
    products: SearchServerResponse<ProductCardVO[]>;
    rankTabs: SearchServerResponse<ProdRankTabDto[]>;
  };
};

export type SearchProductsBffData = {
  page: {
    current: number;
    hasMore: boolean;
    pages?: number;
    size: number;
    total?: number;
  };
  view: {
    activeCategoryId?: string;
    categories: SearchProductCategoryOption[];
    keyword: string;
    products: Array<{
      badge?: { label: string; type: "hot" | "recommend" | "seckill" };
      feature: string;
      href: string;
      id: string;
      imageUrl?: string;
      originalPrice: number;
      price: number;
      soldText: string;
      tag: "热卖" | "推荐";
      title: string;
    }>;
  };
  modules: {
    categories: CategoryVO[];
    productPage: IPageProductCardVO;
    products: ProductCardVO[];
  };
  debugRaw?: {
    categories: SearchServerResponse<CategoryVO[]>;
    products: SearchServerResponse<IPageProductCardVO>;
  };
};

export type FetchSearchHotKeywordsOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: SearchBackendClient;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
  type?: 1 | 2;
};

export type FetchSearchRankingOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: SearchBackendClient;
  categoryBoardCount?: number;
  categoryId?: string;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  rankType?: 1 | 2;
};

export type FetchSearchProductsOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: SearchBackendClient;
  categoryId?: string;
  categoryOptionsParentId?: string;
  clientContext?: ClientRequestContext;
  current?: number;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  keyword?: string;
  orderBy?: string;
  scopeCategoryId?: string;
  size?: number;
};

export async function fetchSearchProductsData({
  authRequired = false,
  authToken,
  backendClient,
  categoryId,
  categoryOptionsParentId,
  clientContext,
  current = 1,
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  keyword = "",
  orderBy,
  scopeCategoryId,
  size = 10
}: FetchSearchProductsOptions): Promise<BackendApiResult<SearchProductsBffData>> {
  const productResult = await backendClient.request<SearchServerResponse<IPageProductCardVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: buildSearchProductsPath({ categoryId, current, keyword, orderBy, size }),
    route: "/search"
  });
  if (!productResult.ok) {
    return productResult;
  }

  const productPage = unwrapSearchData(productResult.data, productResult.meta.requestId);
  if (!productPage.ok) {
    return productPage;
  }

  const categoriesResult = await backendClient.request<SearchServerResponse<CategoryVO[]>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: buildSearchCategoryOptionsPath(categoryOptionsParentId ?? scopeCategoryId),
    route: "/search"
  });
  if (!categoriesResult.ok) {
    return categoriesResult;
  }

  const categories = unwrapSearchData(categoriesResult.data, categoriesResult.meta.requestId);
  if (!categories.ok) {
    return categories;
  }

  return {
    ok: true,
    data: createSearchProductsBffData({
      activeCategoryId: categoryId,
      categories: categories.data,
      javaOssAssetBaseUrl,
      keyword,
      productPage: productPage.data,
      raw: includeDebugRaw ? { categories: categoriesResult.data, products: productResult.data } : undefined
    }),
    meta: productResult.meta
  };
}

export async function fetchSearchRankingData({
  authRequired = false,
  authToken,
  backendClient,
  categoryBoardCount,
  categoryId,
  clientContext,
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  rankType
}: FetchSearchRankingOptions): Promise<BackendApiResult<SearchRankingBffData>> {
  const tabsResult = await backendClient.request<SearchServerResponse<ProdRankTabDto[]>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: buildRankingTabsPath(categoryBoardCount),
    route: "/search"
  });
  if (!tabsResult.ok) {
    return tabsResult;
  }

  const tabs = unwrapSearchData(tabsResult.data, tabsResult.meta.requestId);
  if (!tabs.ok) {
    return tabs;
  }

  const viewTabs = mapRankingTabs(tabs.data);
  const selectedTab = findSelectedRankingTab({ categoryId, rankType, tabs: viewTabs });
  const selectedRankType = rankType ?? selectedTab?.rankType ?? 1;
  const selectedCategoryId = categoryId ?? selectedTab?.categoryId;
  const productPath = buildRankingProductsPath(selectedRankType, selectedCategoryId);
  const productsResult = await backendClient.request<SearchServerResponse<ProductCardVO[]>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: productPath,
    route: "/search"
  });
  if (!productsResult.ok) {
    return productsResult;
  }

  const products = unwrapSearchData(productsResult.data, productsResult.meta.requestId);
  if (!products.ok) {
    return products;
  }

  return {
    ok: true,
    data: createSearchRankingBffData({
      activeTabId: selectedTab?.id ?? buildRankingTabId({ categoryId: selectedCategoryId, rankType: selectedRankType }),
      javaOssAssetBaseUrl,
      products: products.data,
      raw: includeDebugRaw ? { products: productsResult.data, rankTabs: tabsResult.data } : undefined,
      rankTabs: tabs.data,
      tabs: viewTabs
    }),
    meta: productsResult.meta
  };
}

export async function fetchSearchHotKeywordsData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false,
  type = 1
}: FetchSearchHotKeywordsOptions): Promise<BackendApiResult<SearchHotKeywordsBffData>> {
  const result = await backendClient.request<SearchServerResponse<HotSearchDto[]>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/search/hotSearch?${new URLSearchParams({ type: String(type) }).toString()}`,
    route: "/search"
  });
  if (!result.ok) {
    return result;
  }

  const hotSearches = unwrapSearchData(result.data, result.meta.requestId);
  if (!hotSearches.ok) {
    return hotSearches;
  }

  return {
    ok: true,
    data: createSearchHotKeywordsBffData({
      hotSearches: hotSearches.data,
      raw: includeDebugRaw ? result.data : undefined
    }),
    meta: result.meta
  };
}

export function createSearchHotKeywordsBffData({
  hotSearches,
  raw
}: {
  hotSearches: HotSearchDto[];
  raw?: SearchServerResponse<HotSearchDto[]>;
}): SearchHotKeywordsBffData {
  return {
    ...(raw === undefined ? {} : { debugRaw: { hotSearch: raw } }),
    modules: {
      hotSearches
    },
    view: {
      hotKeywords: mapHotKeywords(hotSearches)
    }
  };
}

export function createSearchRankingBffData({
  activeTabId,
  javaOssAssetBaseUrl,
  products,
  raw,
  rankTabs,
  tabs = mapRankingTabs(rankTabs)
}: {
  activeTabId: string;
  javaOssAssetBaseUrl?: string;
  products: ProductCardVO[];
  raw?: { products: SearchServerResponse<ProductCardVO[]>; rankTabs: SearchServerResponse<ProdRankTabDto[]> };
  rankTabs: ProdRankTabDto[];
  tabs?: SearchRankingBffData["view"]["tabs"];
}): SearchRankingBffData {
  return {
    ...(raw === undefined ? {} : { debugRaw: raw }),
    modules: {
      products,
      rankTabs
    },
    view: {
      activeTabId,
      notice: "官方榜单 · 近30天销量 · 实时更新",
      products: products.map((product) => mapRankingProduct(product, javaOssAssetBaseUrl)).filter((product) => product.id && product.title),
      tabs
    }
  };
}

export function createSearchProductsBffData({
  activeCategoryId,
  categories,
  javaOssAssetBaseUrl,
  keyword,
  productPage,
  raw
}: {
  activeCategoryId?: string;
  categories: CategoryVO[];
  javaOssAssetBaseUrl?: string;
  keyword: string;
  productPage: IPageProductCardVO;
  raw?: { categories: SearchServerResponse<CategoryVO[]>; products: SearchServerResponse<IPageProductCardVO> };
}): SearchProductsBffData {
  const current = normalizePositiveInteger(productPage.current, 1);
  const size = normalizePositiveInteger(productPage.size, 10);
  const total = normalizeOptionalNonNegativeInteger(productPage.total);
  const pages = normalizeOptionalNonNegativeInteger(productPage.pages);
  const products = mapSearchProducts(productPage.records, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL);

  return {
    ...(raw === undefined ? {} : { debugRaw: raw }),
    modules: {
      categories,
      productPage,
      products: productPage.records ?? []
    },
    page: {
      current,
      hasMore: hasMorePages({ current, pages, recordCount: productPage.records?.length ?? 0, size, total }),
      ...(pages === undefined ? {} : { pages }),
      size,
      ...(total === undefined ? {} : { total })
    },
    view: {
      ...(activeCategoryId ? { activeCategoryId } : {}),
      categories: mapSearchCategoryOptions(categories),
      keyword: keyword.trim(),
      products
    }
  };
}

function unwrapSearchData<T>(response: SearchServerResponse<T>, requestId: string): BackendApiResult<T> {
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
      route: "/search"
    }
  };
}

function mapHotKeywords(hotSearches: HotSearchDto[]) {
  return hotSearches
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.status !== 0)
    .sort((left, right) => normalizeSeq(left.item.seq, left.index) - normalizeSeq(right.item.seq, right.index))
    .map(({ item }) => (item.title || item.content || "").trim())
    .filter(Boolean)
    .slice(0, 7);
}

function mapRankingTabs(rankTabs: ProdRankTabDto[]): SearchRankingBffData["view"]["tabs"] {
  return rankTabs
    .map((tab, index) => {
      const rankType = normalizeRankType(tab.rankType);
      const categoryId = tab.categoryId === undefined || tab.categoryId === null ? undefined : String(tab.categoryId);
      const label = (tab.rankName || (rankType === 1 ? "喵呜热榜" : "品类热榜")).trim();
      return {
        ...(categoryId === undefined ? {} : { categoryId }),
        id: buildRankingTabId({ categoryId, index, rankType }),
        label,
        rankType
      };
    })
    .filter((tab) => tab.label);
}

function mapRankingProduct(product: ProductCardVO, assetBaseUrl?: string): SearchRankingBffData["view"]["products"][number] {
  const id = normalizeText(product.prodId);
  const soldNum = normalizeNumber(product.soldNum, 0);
  const displayPrice = normalizeNumber(product.displayPrice, NaN);
  const price = Number.isFinite(displayPrice) ? displayPrice : normalizeNumber(product.price, 0);
  return {
    ...(mapRankingBadge(product) ? { badge: mapRankingBadge(product) } : {}),
    feature: soldNum > 0 ? `近30天热卖 ${formatSoldCount(soldNum)}` : "近30天热卖",
    href: id ? `/product/${id}` : "/product",
    id,
    ...optionalImageUrl("imageUrl", resolveJavaImageUrl(product.pic, assetBaseUrl)),
    originalPrice: normalizeNumber(product.oriPrice, price),
    price,
    soldText: `已售: ${formatSoldCount(soldNum)}`,
    title: normalizeText(product.prodName)
  };
}

function mapSearchProducts(products: ProductCardVO[] | null | undefined, assetBaseUrl?: string): SearchProductsBffData["view"]["products"] {
  return (products ?? [])
    .map((product) => mapSearchProduct(product, assetBaseUrl))
    .filter((product) => product.id && product.title);
}

function mapSearchProduct(product: ProductCardVO, assetBaseUrl?: string): SearchProductsBffData["view"]["products"][number] {
  const rankingProduct = mapRankingProduct(product, assetBaseUrl);
  const isRecommend = product.isRecommend === true;
  return {
    ...rankingProduct,
    soldText: rankingProduct.soldText.replace("已售:", "已售"),
    tag: isRecommend ? "推荐" : "热卖"
  };
}

function mapSearchCategoryOptions(categories: CategoryVO[]): SearchProductCategoryOption[] {
  return categories
    .filter((category) => category.status !== 0 && category.categoryId !== undefined && category.categoryId !== null && category.categoryName)
    .sort((left, right) => normalizeSeq(left.seq, Number.MAX_SAFE_INTEGER) - normalizeSeq(right.seq, Number.MAX_SAFE_INTEGER))
    .map((category) => {
      const children = mapSearchCategoryOptions(category.children ?? category.categories ?? []);
      return {
        ...(children.length > 0 ? { children } : {}),
        id: String(category.categoryId),
        label: normalizeText(category.categoryName)
      };
    })
    .filter((category) => category.id && category.label);
}

function mapRankingBadge(product: ProductCardVO) {
  if (product.activityType === 1) {
    return { label: "限时秒杀", type: "seckill" as const };
  }
  if (product.isHot) {
    return { label: "热销", type: "hot" as const };
  }
  if (product.isRecommend) {
    return { label: "推荐", type: "recommend" as const };
  }
  return undefined;
}

function buildRankingProductsPath(rankType: 1 | 2, categoryId?: string) {
  const query = new URLSearchParams();
  if (rankType === 2 && categoryId) {
    query.set("categoryId", categoryId);
  }
  const queryText = query.toString();
  return `/search/rank/${rankType}${queryText ? `?${queryText}` : ""}`;
}

function buildRankingTabsPath(categoryBoardCount?: number) {
  if (categoryBoardCount === undefined) {
    return "/search/rankTabs";
  }

  return `/search/rankTabs?${new URLSearchParams({ categoryBoardCount: String(categoryBoardCount) }).toString()}`;
}

function buildSearchProductsPath({
  categoryId,
  current,
  keyword,
  orderBy,
  size
}: {
  categoryId?: string;
  current: number;
  keyword?: string;
  orderBy?: string;
  size: number;
}) {
  const query = new URLSearchParams({
    current: String(normalizePositiveInteger(current, 1)),
    size: String(normalizePositiveInteger(size, 10))
  });
  if (orderBy) {
    query.set("orderBy", orderBy);
  }
  if (keyword?.trim()) {
    query.set("keyword", keyword.trim());
  }
  if (categoryId?.trim()) {
    query.set("categoryId", categoryId.trim());
  }
  return `/p/app/prod/page?${query.toString()}`;
}

function buildSearchCategoryOptionsPath(parentId?: string) {
  return `/category/list?${new URLSearchParams({
    parentId: parentId?.trim() || "0",
    shopId: "0"
  }).toString()}`;
}

function findSelectedRankingTab({
  categoryId,
  rankType,
  tabs
}: {
  categoryId?: string;
  rankType?: 1 | 2;
  tabs: SearchRankingBffData["view"]["tabs"];
}) {
  if (rankType === 2 && categoryId) {
    return tabs.find((tab) => tab.rankType === 2 && tab.categoryId === categoryId);
  }
  if (rankType) {
    return tabs.find((tab) => tab.rankType === rankType && (rankType === 1 || !categoryId || tab.categoryId === categoryId));
  }
  return tabs[0];
}

function buildRankingTabId({ categoryId, index, rankType }: { categoryId?: string; index?: number; rankType: 1 | 2 }) {
  if (rankType === 2 && categoryId) {
    return `rank-2-${categoryId}`;
  }
  if (rankType === 1) {
    return "rank-1";
  }
  return `rank-${rankType}-${index ?? "unknown"}`;
}

function normalizeRankType(value: unknown): 1 | 2 {
  return Number(value) === 2 ? 2 : 1;
}

function normalizeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeText(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function formatSoldCount(value: number) {
  if (value >= 10000) {
    return `${Math.floor(value / 1000) / 10}w+`;
  }
  return value > 0 ? `${value}` : "0";
}

function resolveJavaImageUrl(value: unknown, assetBaseUrl?: string) {
  const src = normalizeText(value);
  if (!src) {
    return "";
  }
  if (/^(https?:|data:|blob:)/i.test(src)) {
    return src;
  }
  if (!assetBaseUrl) {
    return src;
  }
  return `${assetBaseUrl.replace(/\/+$/g, "")}/${src.replace(/^\/+/g, "")}`;
}

function optionalImageUrl(key: "imageUrl", value: string) {
  return value ? { [key]: value } : {};
}

function normalizeSeq(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeOptionalNonNegativeInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined;
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
