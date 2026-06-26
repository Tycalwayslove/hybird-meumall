import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import type { CategoryLeaf, CategoryPageData, CategorySection } from "../types";

type CategoryBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type CategoryServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type CategoryListTreeVO = {
  actualDeductionRate?: number;
  baseCategoryId?: number;
  categoryId?: number;
  categoryName?: string;
  children?: CategoryListTreeVO[];
  deductionRate?: number;
  grade?: number;
  icon?: string;
  parentId?: number;
  pic?: string;
  recTime?: string;
  seq?: number;
  shopId?: number;
  status?: number;
  updateTime?: string;
  [key: string]: unknown;
};

export type CategoryListBffData = {
  view: CategoryPageData;
  modules: {
    categories: CategoryListTreeVO[];
  };
  debugRaw?: {
    categoryList: CategoryServerResponse<CategoryListTreeVO[]>;
  };
};

export type FetchCategoryListOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: CategoryBackendClient;
  clientContext?: ClientRequestContext;
  depth?: number;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  parentId?: number;
  shopId?: number;
};

export async function fetchCategoryListData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  depth = 3,
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  parentId = -1,
  shopId = 0
}: FetchCategoryListOptions): Promise<BackendApiResult<CategoryListBffData>> {
  const query = new URLSearchParams({
    parentId: String(parentId),
    shopId: String(shopId)
  });
  query.set("depth", String(depth));

  const result = await backendClient.request<CategoryServerResponse<CategoryListTreeVO[]>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/category/list?${query.toString()}`,
    route: "/category"
  });
  if (!result.ok) {
    return result;
  }

  const categories = unwrapCategoryData(result.data, result.meta.requestId);
  if (!categories.ok) {
    return categories;
  }

  return {
    ok: true,
    data: createCategoryListBffData({
      categories: categories.data,
      javaOssAssetBaseUrl,
      raw: includeDebugRaw ? result.data : undefined
    }),
    meta: result.meta
  };
}

export function createCategoryListBffData({
  categories,
  javaOssAssetBaseUrl,
  raw
}: {
  categories: CategoryListTreeVO[];
  javaOssAssetBaseUrl?: string;
  raw?: CategoryServerResponse<CategoryListTreeVO[]>;
}): CategoryListBffData {
  return {
    ...(raw === undefined ? {} : { debugRaw: { categoryList: raw } }),
    modules: {
      categories
    },
    view: mapCategoryTreeToPageData(categories, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL)
  };
}

function unwrapCategoryData<T>(response: CategoryServerResponse<T>, requestId: string): BackendApiResult<T> {
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
      route: "/category"
    }
  };
}

function mapCategoryTreeToPageData(categories: CategoryListTreeVO[], assetBaseUrl?: string): CategoryPageData {
  const primaryNodes = sortActiveCategories(categories);
  const primaryCategories = primaryNodes.map((category) => ({
    id: String(category.categoryId),
    label: category.categoryName ?? ""
  }));

  return {
    activeCategoryId: primaryCategories[0]?.id ?? "",
    categorySectionsByPrimaryId: Object.fromEntries(
      primaryNodes.map((category) => [
        String(category.categoryId),
        mapSections(category.children, assetBaseUrl)
      ])
    ),
    primaryCategories
  };
}

function mapSections(children: CategoryListTreeVO[] | undefined, assetBaseUrl?: string): CategorySection[] {
  return sortActiveCategories(children).map((category) => ({
    id: String(category.categoryId),
    items: mapLeafItems(category.children, category, assetBaseUrl),
    title: category.categoryName ?? ""
  })).filter((section) => section.title && section.items.length > 0);
}

function mapLeafItems(children: CategoryListTreeVO[] | undefined, fallbackCategory: CategoryListTreeVO, assetBaseUrl?: string): CategoryLeaf[] {
  const leaves = sortActiveCategories(children);
  const leafNodes = leaves.length > 0 ? leaves : [fallbackCategory];

  return leafNodes
    .filter((category) => category.categoryId !== undefined && category.categoryName)
    .map((category) => ({
      href: `/search?categoryId=${encodeURIComponent(String(category.categoryId))}`,
      id: String(category.categoryId),
      imageUrl: resolveJavaImageUrl(category.pic ?? category.icon, assetBaseUrl),
      label: category.categoryName ?? ""
    }));
}

function sortActiveCategories(categories: CategoryListTreeVO[] | undefined) {
  return (categories ?? [])
    .filter((category) => category.status !== 0 && category.categoryId !== undefined && category.categoryName)
    .sort((left, right) => normalizeSeq(left.seq) - normalizeSeq(right.seq));
}

function normalizeSeq(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
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
