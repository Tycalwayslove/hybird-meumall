import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import { resolveRichContentAssetUrl, sanitizeProductRichContent } from "../rich-content";
import type { OrderConfirmData, OrderConfirmItem, ProductDetailData, ProductSkuOption } from "../types";

type ProductBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export type ProductServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type JavaProductInfo = {
  afterSaleContent?: string;
  afterSaleType?: string;
  brief?: string;
  content?: string;
  defaultPrice?: number;
  deliveryTime?: number | string;
  deliveryTimeUnit?: string;
  deliveryModeVO?: {
    hasCityDelivery?: boolean;
    hasShopDelivery?: boolean;
    hasUserPickUp?: boolean;
  };
  imgs?: string;
  isDelivery?: boolean;
  pic?: string;
  price?: number;
  prodCertificateRecordDtoList?: Array<Record<string, unknown>>;
  prodId?: number | string;
  prodName?: string;
  returnWarrantyPolicy?: Array<Record<string, unknown>>;
  shopId?: number | string;
  skuList?: JavaProductSku[];
  soldNum?: number;
  totalStocks?: number;
  totalTransFee?: number;
  video?: string;
  waterSoldNum?: number;
  [key: string]: unknown;
};

export type JavaShopHeadInfo = {
  shopId?: number | string;
  shopLogo?: string;
  shopName?: string;
  shopStatus?: number;
  type?: number;
  [key: string]: unknown;
};

export type JavaProductCommentSummary = {
  negativeNumber?: number;
  number?: number;
  picNumber?: number;
  positiveRating?: number;
  praiseNumber?: number;
  secondaryNumber?: number;
  [key: string]: unknown;
};

export type JavaProductComment = {
  content?: string;
  isAnonymous?: number;
  isWriteOff?: boolean;
  nickName?: string;
  pic?: string;
  pics?: string;
  score?: number;
  skuName?: string;
  [key: string]: unknown;
};

export type JavaProductCommentPage = {
  current?: number;
  pages?: number;
  records?: JavaProductComment[];
  [key: string]: unknown;
};

export type JavaProductSku = {
  actualStocks?: number;
  matchingPrice?: number;
  pic?: string;
  price?: number;
  properties?: string;
  skuId?: number | string;
  skuName?: string;
  stocks?: number | null;
  stock?: number | null;
  [key: string]: unknown;
};

export type ProductDetailBffData = {
  debugRaw?: {
    prodInfo: ProductServerResponse<JavaProductInfo>;
  };
  modules: {
    commentPage?: JavaProductCommentPage;
    commentSummary?: JavaProductCommentSummary;
    productInfo: JavaProductInfo;
    shopInfo?: JavaShopHeadInfo;
    skuList: JavaProductSku[];
  };
  view: ProductDetailData;
};

export type OrderConfirmBffData = {
  debugRaw?: {
    prodInfo: ProductServerResponse<JavaProductInfo>;
  };
  modules: {
    productInfo: JavaProductInfo;
    selectedSku: JavaProductSku;
  };
  view: OrderConfirmData;
};

export type FetchProductDetailOptions = {
  addrId?: string;
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: ProductBackendClient;
  clientContext?: ClientRequestContext;
  dvyType?: "1";
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  prodId: string;
};

export type FetchProductOrderConfirmOptions = {
  addrId?: string;
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: ProductBackendClient;
  clientContext?: ClientRequestContext;
  dvyType?: "1";
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
  productId: string;
  quantity?: number;
  skuId: string;
};

export async function fetchProductDetailData({
  addrId = "0",
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  dvyType = "1",
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  prodId
}: FetchProductDetailOptions): Promise<BackendApiResult<ProductDetailBffData>> {
  const result = await backendClient.request<ProductServerResponse<JavaProductInfo>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/prod/prodInfo?${new URLSearchParams({ prodId, addrId, dvyType }).toString()}`,
    route: "/product/[id]"
  });
  if (!result.ok) {
    return result;
  }

  const product = unwrapProductData(result.data, result.meta.requestId);
  if (!product.ok) {
    return product;
  }
  const optionalData = await fetchProductOptionalData({
    addrId,
    authRequired,
    authToken,
    backendClient,
    clientContext,
    prodId,
    productInfo: product.data
  });

  return {
    ok: true,
    data: createProductDetailBffData({
      commentPage: optionalData.commentPage,
      commentSummary: optionalData.commentSummary,
      javaOssAssetBaseUrl,
      productInfo: product.data,
      raw: includeDebugRaw ? result.data : undefined,
      shopInfo: optionalData.shopInfo
    }),
    meta: result.meta
  };
}

export async function fetchProductOrderConfirmData({
  addrId = "0",
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  dvyType = "1",
  includeDebugRaw = false,
  javaOssAssetBaseUrl,
  productId,
  quantity = 1,
  skuId
}: FetchProductOrderConfirmOptions): Promise<BackendApiResult<OrderConfirmBffData>> {
  const result = await backendClient.request<ProductServerResponse<JavaProductInfo>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/prod/prodInfo?${new URLSearchParams({ prodId: productId, addrId, dvyType }).toString()}`,
    route: "/order-confirm"
  });
  if (!result.ok) {
    return result;
  }

  const product = unwrapProductData(result.data, result.meta.requestId);
  if (!product.ok) {
    return product;
  }

  const selectedSku = findSku(product.data.skuList, skuId);
  if (!selectedSku) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        httpStatus: 404,
        message: "所选规格不存在，请返回商品详情重新选择。",
        requestId: result.meta.requestId
      })
    };
  }

  const stock = normalizeStock(selectedSku);
  const normalizedQuantity = normalizeQuantity(quantity);
  if (stock <= 0 || normalizedQuantity > stock) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        httpStatus: 409,
        message: "所选规格库存不足，请返回商品详情重新选择。",
        requestId: result.meta.requestId
      })
    };
  }

  return {
    ok: true,
    data: createOrderConfirmBffData({
      javaOssAssetBaseUrl,
      productInfo: product.data,
      quantity: normalizedQuantity,
      raw: includeDebugRaw ? result.data : undefined,
      selectedSkuId: skuId
    }),
    meta: result.meta
  };
}

export function createProductDetailBffData({
  commentPage,
  commentSummary,
  javaOssAssetBaseUrl,
  productInfo,
  raw,
  shopInfo
}: {
  commentPage?: JavaProductCommentPage;
  commentSummary?: JavaProductCommentSummary;
  javaOssAssetBaseUrl?: string;
  productInfo: JavaProductInfo;
  raw?: ProductServerResponse<JavaProductInfo>;
  shopInfo?: JavaShopHeadInfo;
}): ProductDetailBffData {
  const normalizedSkus = normalizeSkus(productInfo, javaOssAssetBaseUrl);
  const defaultSku = selectDefaultSku(normalizedSkus);
  const imageUrls = splitAssetList(productInfo.imgs, javaOssAssetBaseUrl);
  const heroImageUrls = imageUrls.length > 0 ? imageUrls : splitAssetList(productInfo.pic, javaOssAssetBaseUrl);
  const mediaItems = normalizeMediaItems(productInfo, heroImageUrls, javaOssAssetBaseUrl);
  const productId = normalizeId(productInfo.prodId);
  const title = normalizeText(productInfo.prodName, "商品");
  const price = defaultSku?.price ?? normalizeMoney(productInfo.price ?? productInfo.defaultPrice);
  const originalPrice = normalizeMoney(productInfo.price ?? productInfo.defaultPrice ?? price);
  const services = normalizeServices(productInfo);
  const deliveryText = productInfo.isDelivery === false || productInfo.deliveryModeVO?.hasShopDelivery === false ? "暂不支持快递配送" : "快递配送";
  const deliveryLeadText = formatDeliveryLeadText(productInfo);
  const freightText = productInfo.isDelivery === false ? "当前地址不可配送" : formatFreightText(productInfo.totalTransFee);
  const richContentHtml = sanitizeProductRichContent(productInfo.content, javaOssAssetBaseUrl);
  const reviews = normalizeCommentReviews(commentPage, javaOssAssetBaseUrl);
  const reviewTags = normalizeCommentTags(commentSummary);
  const stockText = defaultSku ? `${defaultSku.stock}件可买` : "暂无可购买规格";

  return {
    ...(raw === undefined ? {} : { debugRaw: { prodInfo: raw } }),
    modules: {
      ...(commentPage === undefined ? {} : { commentPage }),
      ...(commentSummary === undefined ? {} : { commentSummary }),
      productInfo,
      ...(shopInfo === undefined ? {} : { shopInfo }),
      skuList: productInfo.skuList ?? []
    },
    view: {
      buyHref: "/order-confirm",
      consultHref: "/consult",
      consultPlaceholder: "咨询商品详情",
      countdown: ["00", "00", "00"],
      detail: {
        description: stripHtml(productInfo.content) || normalizeText(productInfo.brief, ""),
        imageLabel: `${title}详情图`,
        ...(richContentHtml ? { richContentHtml } : {}),
        title: "商品详情"
      },
      galleryText: mediaItems.length > 0 ? `1/${mediaItems.length}` : "0/0",
      ...(heroImageUrls.length > 0 ? { heroImageUrls } : {}),
      ...(mediaItems.length > 0 ? { mediaItems } : {}),
      id: productId,
      licenseTags: normalizeCertificateTags(productInfo),
      originalPrice: formatPrice(originalPrice),
      price: formatPrice(price),
      purchase: {
        defaultDeliveryId: "express",
        defaultQuantity: 1,
        defaultSkuId: defaultSku?.id ?? "",
        deliveryOptions: [{ id: "express", label: deliveryText }],
        deliveryTitle: "配送方式",
        imageLabel: title,
        skus: normalizedSkus,
        specsTitle: "选择规格"
      },
      reviewSummary: {
        countText: formatReviewCount(commentSummary),
        positiveRateText: formatPositiveRating(commentSummary),
        reviews,
        tags: reviewTags
      },
      selectionRows: [
        {
          action: "purchase",
          label: "选择",
          value: defaultSku ? `已选：${defaultSku.specsText}，${stockText}` : "请选择规格"
        },
        {
          accentPrefix: deliveryText,
          label: "配送",
          value: [deliveryText, deliveryLeadText, freightText].filter(Boolean).join("  |  ")
        }
      ],
      services,
      ...(shopInfo ? { shop: normalizeShopSummary(shopInfo, javaOssAssetBaseUrl) } : {}),
      soldText: `已售 ${formatCount((productInfo.soldNum ?? 0) + (productInfo.waterSoldNum ?? 0))}`,
      subtitle: normalizeText(productInfo.brief, ""),
      talentLevelLabel: "达人专享价",
      title
    }
  };
}

async function fetchProductOptionalData({
  addrId,
  authRequired,
  authToken,
  backendClient,
  clientContext,
  prodId,
  productInfo
}: {
  addrId: string;
  authRequired: boolean;
  authToken?: string | null;
  backendClient: ProductBackendClient;
  clientContext?: ClientRequestContext;
  prodId: string;
  productInfo: JavaProductInfo;
}) {
  const shopId = normalizeId(productInfo.shopId);
  const [shopInfo, commentSummary, commentPage] = await Promise.all([
    shopId
      ? fetchOptionalJavaEnvelope<JavaShopHeadInfo>({
          authRequired,
          authToken,
          backendClient,
          clientContext,
          path: `/shop/headInfo?${new URLSearchParams({ shopId }).toString()}`
        })
      : Promise.resolve(undefined),
    fetchOptionalJavaEnvelope<JavaProductCommentSummary>({
      authRequired,
      authToken,
      backendClient,
      clientContext,
      path: `/prod/prodCommData?${new URLSearchParams({ prodId, stationId: addrId === "0" ? "" : addrId }).toString()}`
    }),
    fetchOptionalJavaEnvelope<JavaProductCommentPage>({
      authRequired,
      authToken,
      backendClient,
      clientContext,
      path: `/prod/prodCommPageByProd?${new URLSearchParams({
        prodId,
        size: "10",
        current: "1",
        evaluate: "-1",
        stationId: addrId === "0" ? "" : addrId
      }).toString()}`
    })
  ]);

  return {
    commentPage,
    commentSummary,
    shopInfo
  };
}

async function fetchOptionalJavaEnvelope<T>({
  authRequired,
  authToken,
  backendClient,
  clientContext,
  path
}: {
  authRequired: boolean;
  authToken?: string | null;
  backendClient: ProductBackendClient;
  clientContext?: ClientRequestContext;
  path: string;
}) {
  const result = await backendClient.request<ProductServerResponse<T>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path,
    route: "/product/[id]"
  });

  if (!result.ok || result.data.success === false || !result.data.data) {
    return undefined;
  }

  return result.data.data;
}

export function createOrderConfirmBffData({
  javaOssAssetBaseUrl,
  productInfo,
  quantity,
  raw,
  selectedSkuId
}: {
  javaOssAssetBaseUrl?: string;
  productInfo: JavaProductInfo;
  quantity: number;
  raw?: ProductServerResponse<JavaProductInfo>;
  selectedSkuId: string;
}): OrderConfirmBffData {
  const normalizedSkus = normalizeSkus(productInfo, javaOssAssetBaseUrl);
  const selectedSku = normalizedSkus.find((sku) => sku.id === selectedSkuId) ?? normalizedSkus[0];
  const rawSku = findSku(productInfo.skuList, selectedSku?.id);
  const normalizedQuantity = normalizeQuantity(quantity);
  const title = normalizeText(productInfo.prodName, "商品");
  const price = selectedSku?.price ?? normalizeMoney(productInfo.price ?? productInfo.defaultPrice);
  const totalAmount = price * normalizedQuantity;
  const item: OrderConfirmItem = {
    id: `${normalizeId(productInfo.prodId)}-${selectedSku?.id ?? "sku"}`,
    imageLabel: title,
    ...(selectedSku?.imageUrl ? { imageUrl: selectedSku.imageUrl } : {}),
    price,
    quantity: normalizedQuantity,
    specsText: selectedSku?.specsText ?? "默认规格",
    title
  };

  return {
    ...(raw === undefined ? {} : { debugRaw: { prodInfo: raw } }),
    modules: {
      productInfo,
      selectedSku: rawSku ?? {}
    },
    view: {
      address: null,
      canSubmit: true,
      discountRows: [{ label: "实付款", value: `￥${formatPrice(totalAmount)}`, tone: "price" }],
      items: [item],
      productId: normalizeId(productInfo.prodId),
      serviceRows: [
        { label: "配送服务", value: "快递配送", tone: "muted" },
        { label: "配送费用", value: `￥${formatPrice(normalizeMoney(productInfo.totalTransFee))}`, tone: "primary" },
        { label: "订单备注", value: "选填", tone: "muted", navigable: true }
      ],
      totalAmount,
      totalQuantity: normalizedQuantity
    }
  };
}

function unwrapProductData<T extends JavaProductInfo>(response: ProductServerResponse<T>, requestId: string): BackendApiResult<T> {
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

  if (!response.data || !response.data.prodId || !response.data.prodName) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        details: { code: response.code },
        message: response.msg ?? "商品详情数据缺失。",
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
      route: "/product/[id]"
    }
  };
}

function normalizeSkus(productInfo: JavaProductInfo, assetBaseUrl?: string): ProductSkuOption[] {
  return (productInfo.skuList ?? [])
    .filter((sku) => sku.skuId !== undefined && sku.skuId !== null)
    .map((sku) => {
      const productTitle = normalizeText(productInfo.prodName, "商品");
      const specsText = formatSkuProperties(sku.properties) || normalizeText(sku.skuName, "默认规格");
      const imageUrl = resolveJavaImageUrl(sku.pic ?? productInfo.pic, assetBaseUrl);

      return {
        id: normalizeId(sku.skuId),
        ...(imageUrl ? { imageUrl } : {}),
        label: specsText,
        price: normalizeMoney(sku.matchingPrice ?? sku.price ?? productInfo.price ?? productInfo.defaultPrice),
        selectedLabel: productTitle,
        specsText,
        stock: normalizeStock(sku)
      };
    });
}

function selectDefaultSku(skus: ProductSkuOption[]) {
  const inStockSkus = skus.filter((sku) => sku.stock > 0);
  const source = inStockSkus.length > 0 ? inStockSkus : skus;
  return [...source].sort((left, right) => left.price - right.price)[0];
}

function findSku(skus: JavaProductSku[] | undefined, skuId: string | undefined) {
  if (!skuId) {
    return undefined;
  }
  return (skus ?? []).find((sku) => normalizeId(sku.skuId) === skuId);
}

function normalizeStock(sku: JavaProductSku) {
  const value = sku.stocks ?? sku.actualStocks ?? sku.stock ?? 0;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function normalizeQuantity(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function normalizeMoney(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeId(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function normalizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeServices(productInfo: JavaProductInfo) {
  const afterSaleTags = normalizeAfterSaleTags(productInfo).slice(0, 4).map((label) => ({ label }));
  if (afterSaleTags.length > 0) {
    return afterSaleTags;
  }

  const policies = (productInfo.returnWarrantyPolicy ?? [])
    .map((item) => normalizeText(item.policyName ?? item.name ?? item.title ?? item.label, ""))
    .filter(Boolean)
    .slice(0, 4)
    .map((label) => ({ label }));

  return policies;
}

function normalizeAfterSaleTags(productInfo: JavaProductInfo) {
  const tags = String(productInfo.afterSaleType ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      const label = getAfterSaleName(item);
      if (label === "其他") {
        return normalizeText(productInfo.afterSaleContent, "");
      }
      return label;
    })
    .filter(Boolean);

  return Array.from(new Set(tags));
}

function getAfterSaleName(value: string) {
  switch (value) {
    case "1":
      return "7天无理由退货";
    case "2":
      return "假一罚十";
    case "3":
      return "售后私信协商";
    case "4":
      return "退货免运费";
    case "5":
      return "其他";
    default:
      return "其他";
  }
}

function normalizeCertificateTags(productInfo: JavaProductInfo) {
  return (productInfo.prodCertificateRecordDtoList ?? [])
    .map((item) =>
      normalizeText(
        item.title ??
          item.name ??
          item.certificateName ??
          item.label ??
          item.value ??
          item.policyName ??
          item.warrantyPolicyName ??
          item.returnWarrantyPolicyName,
        ""
      )
    )
    .filter(Boolean);
}

function normalizeMediaItems(productInfo: JavaProductInfo, imageUrls: string[], assetBaseUrl?: string) {
  const mediaItems = imageUrls.map((url, index) => ({
    id: `image-${index}`,
    type: "image" as const,
    url
  }));
  const videoUrl = resolveJavaImageUrl(normalizeText(productInfo.video, ""), assetBaseUrl);
  if (!videoUrl) {
    return mediaItems;
  }

  return [
    {
      id: "video-0",
      posterUrl: createVideoPosterUrl(videoUrl),
      type: "video" as const,
      url: videoUrl
    },
    ...mediaItems
  ];
}

function createVideoPosterUrl(videoUrl: string) {
  return `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}x-oss-process=video/snapshot,t_1,m_fast,f_jpg`;
}

function formatDeliveryLeadText(productInfo: JavaProductInfo) {
  if (productInfo.deliveryTimeUnit !== "" && productInfo.deliveryTime !== undefined && productInfo.deliveryTime !== null && productInfo.deliveryTime !== "") {
    return `${productInfo.deliveryTime}${productInfo.deliveryTimeUnit ?? ""}内发货`;
  }
  return "";
}

function formatFreightText(value: unknown) {
  const freight = normalizeMoney(value);
  return freight === 0 ? "免运费" : `运费￥${formatPrice(freight)}`;
}

function normalizeShopSummary(shopInfo: JavaShopHeadInfo, assetBaseUrl?: string) {
  const shopId = normalizeId(shopInfo.shopId);
  const logoUrl = resolveRichContentAssetUrl(normalizeText(shopInfo.shopLogo, ""), assetBaseUrl);

  return {
    href: `/shop/${shopId}`,
    id: shopId,
    ...(logoUrl ? { logoUrl } : {}),
    name: normalizeText(shopInfo.shopName, "店铺"),
    statusText: formatShopStatus(shopInfo.shopStatus)
  };
}

function formatShopStatus(status: unknown) {
  if (status === 1) {
    return "营业中";
  }
  if (status === 0) {
    return "停业中";
  }
  if (status === -1) {
    return "未开通";
  }
  if (status === 2 || status === 3) {
    return "已下线";
  }
  return "店铺信息";
}

function normalizeCommentReviews(commentPage: JavaProductCommentPage | undefined, assetBaseUrl?: string) {
  return (commentPage?.records ?? []).slice(0, 2).map((item) => ({
    author: formatCommentAuthor(item),
    ...(resolveJavaImageUrl(normalizeText(item.pic, ""), assetBaseUrl) ? { avatarUrl: resolveJavaImageUrl(normalizeText(item.pic, ""), assetBaseUrl) } : {}),
    content: normalizeText(item.content, ""),
    imageUrls: splitAssetList(item.pics, assetBaseUrl),
    rating: normalizeRating(item.score),
    skuText: formatSkuName(item.skuName)
  }));
}

function formatCommentAuthor(comment: JavaProductComment) {
  if (comment.isWriteOff) {
    return "核销用户";
  }
  if (comment.isAnonymous === 1) {
    return "匿名评价";
  }
  return normalizeText(comment.nickName, "匿名评价");
}

function normalizeRating(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 5;
}

function formatSkuName(value: unknown) {
  return String(value ?? "")
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("；");
}

function normalizeCommentTags(summary: JavaProductCommentSummary | undefined) {
  return [
    `全部 ${formatCount(summary?.number ?? 0)}`,
    `好评 ${formatCount(summary?.praiseNumber ?? 0)}`,
    `中评 ${formatCount(summary?.secondaryNumber ?? 0)}`,
    `差评 ${formatCount(summary?.negativeNumber ?? 0)}`,
    `有图 ${formatCount(summary?.picNumber ?? 0)}`
  ];
}

function formatReviewCount(summary: JavaProductCommentSummary | undefined) {
  return `评价：${formatCount(summary?.number ?? 0)}`;
}

function formatPositiveRating(summary: JavaProductCommentSummary | undefined) {
  return `好评率${formatPrice(typeof summary?.positiveRating === "number" ? summary.positiveRating : 0)}%`;
}

function formatSkuProperties(properties: string | undefined) {
  return String(properties ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("，");
}

function splitAssetList(input: string | undefined, assetBaseUrl?: string) {
  return String(input ?? "")
    .split(",")
    .map((item) => resolveJavaImageUrl(item, assetBaseUrl))
    .filter((item): item is string => Boolean(item));
}

function resolveJavaImageUrl(value: string | undefined, assetBaseUrl?: string) {
  const imagePath = value?.trim();
  if (!imagePath) {
    return undefined;
  }
  if (isAbsoluteAssetUrl(imagePath)) {
    return imagePath;
  }
  const base = assetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL;
  if (!base?.trim()) {
    return imagePath;
  }
  return `${base.trim().replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
}

function isAbsoluteAssetUrl(value: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(value) || value.startsWith("data:");
}

function stripHtml(value: unknown) {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : "";
}

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatCount(value: number) {
  return value >= 10000 ? `${(value / 10000).toFixed(1).replace(/\.0$/, "")}万` : String(value);
}

export function createProductBffFailure<T>(error: ApiError): BackendApiResult<T> {
  return {
    ok: false,
    error
  };
}
