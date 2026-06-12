import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import OrderConfirmPage from "@/app/order-confirm/page";
import ProductDetailPage from "@/app/product/[id]/page";
import type { BackendRequestOptions } from "@/server/http/backend-client";
import { ProductDetailScreen } from "./components/ProductDetailScreen";
import { ProductPurchaseSheet } from "./components/ProductPurchaseSheet";
import { createProductLoadingData } from "./server/product-detail-service";
import {
  createOrderConfirmBffData,
  createProductDetailBffData,
  fetchProductDetailData,
  fetchProductOrderConfirmData,
  type JavaProductCommentPage,
  type JavaProductCommentSummary,
  type JavaShopHeadInfo,
  type ProductServerResponse
} from "./server/product-real-service";
import { createProductApi } from "./api";

const sampleProduct = {
  brief: "严选鲜肉配方，适合日常主粮",
  content:
    '<p>真实商品详情</p><img src="products/detail-1.jpg" onclick="alert(1)" /><a href="javascript:alert(1)">危险链接</a><script>alert(1)</script>',
  afterSaleContent: "定制售后说明",
  afterSaleType: "1,2,3,4,5",
  deliveryModeVO: {
    hasCityDelivery: true,
    hasShopDelivery: true,
    hasUserPickUp: true
  },
  deliveryTime: 48,
  deliveryTimeUnit: "小时",
  imgs: "products/cat-food-1.jpg,https://cdn.example.com/cat-food-2.jpg",
  isDelivery: true,
  pic: "products/cat-food-main.jpg",
  price: 399,
  prodId: 1000054,
  prodName: "喵呜鲜肉猫粮 1.5kg",
  prodCertificateRecordDtoList: [{ title: "营业执照" }, { certificateName: "品牌授权" }],
  returnWarrantyPolicy: [{ policyName: "7天无理由退货" }, { name: "假一赔十" }],
  shopId: 8801,
  skuList: [
    {
      pic: "products/sku-chicken.jpg",
      price: 299,
      properties: "规格:1.5kg;口味:鸡肉",
      skuId: 6001,
      stocks: 3
    },
    {
      price: 199,
      properties: "规格:500g;口味:三文鱼",
      skuId: 6002,
      stocks: 0
    }
  ],
  soldNum: 2388,
  video: "videos/cat-food.mp4",
  waterSoldNum: 12
};

const sampleShopInfo: JavaShopHeadInfo = {
  shopId: 8801,
  shopLogo: "shops/logo.jpg",
  shopName: "喵呜自营旗舰店",
  shopStatus: 1,
  type: 1
};

const sampleCommentSummary: JavaProductCommentSummary = {
  negativeNumber: 1,
  number: 128,
  picNumber: 8,
  positiveRating: 97,
  praiseNumber: 120,
  secondaryNumber: 7
};

const sampleCommentPage: JavaProductCommentPage = {
  current: 1,
  pages: 1,
  records: [
    {
      content: "猫咪很爱吃，颗粒大小合适。",
      isAnonymous: 0,
      nickName: "爱猫用户",
      pic: "avatars/user-1.jpg",
      pics: "comments/cat-1.jpg,https://cdn.example.com/comment-2.jpg",
      score: 5,
      skuName: "规格:1.5kg 口味:鸡肉"
    },
    {
      content: "包装完整，发货也快。",
      isAnonymous: 1,
      nickName: "隐藏昵称",
      score: 4
    },
    {
      content: "第三条不应进入首屏概要。",
      nickName: "第三位用户",
      score: 5
    }
  ]
};

describe("product real flow mapper", () => {
  it("maps Java product detail into H5 view data with resolved images and default in-stock sku", () => {
    const data = createProductDetailBffData({
      commentPage: sampleCommentPage,
      commentSummary: sampleCommentSummary,
      productInfo: sampleProduct,
      raw: {
        code: "00000",
        data: sampleProduct,
        success: true
      },
      shopInfo: sampleShopInfo,
      javaOssAssetBaseUrl: "https://assets.example.com/"
    });

    expect(data.view.id).toBe("1000054");
    expect(data.view.title).toBe("喵呜鲜肉猫粮 1.5kg");
    expect(data.view.subtitle).toBe("严选鲜肉配方，适合日常主粮");
    expect(data.view.price).toBe("299");
    expect(data.view.galleryText).toBe("1/3");
    expect(data.view.mediaItems).toEqual([
      {
        id: "video-0",
        posterUrl: "https://assets.example.com/videos/cat-food.mp4?x-oss-process=video/snapshot,t_1,m_fast,f_jpg",
        type: "video",
        url: "https://assets.example.com/videos/cat-food.mp4"
      },
      {
        id: "image-0",
        type: "image",
        url: "https://assets.example.com/products/cat-food-1.jpg"
      },
      {
        id: "image-1",
        type: "image",
        url: "https://cdn.example.com/cat-food-2.jpg"
      }
    ]);
    expect(data.view.heroImageUrls).toEqual(["https://assets.example.com/products/cat-food-1.jpg", "https://cdn.example.com/cat-food-2.jpg"]);
    expect(data.view.detail.richContentHtml).toContain("<p>真实商品详情</p>");
    expect(data.view.detail.richContentHtml).toContain('src="https://assets.example.com/products/detail-1.jpg"');
    expect(data.view.detail.richContentHtml).not.toContain("onclick");
    expect(data.view.detail.richContentHtml).not.toContain("javascript:");
    expect(data.view.detail.richContentHtml).not.toContain("<script");
    expect(data.view.shop).toEqual({
      href: "/shop/8801",
      id: "8801",
      logoUrl: "https://assets.example.com/shops/logo.jpg",
      name: "喵呜自营旗舰店",
      statusText: "营业中"
    });
    expect(data.view.reviewSummary.countText).toBe("评价：128");
    expect(data.view.reviewSummary.positiveRateText).toBe("好评率97%");
    expect(data.view.reviewSummary.tags).toEqual(["全部 128", "好评 120", "中评 7", "差评 1", "有图 8"]);
    expect(data.view.reviewSummary.reviews).toEqual([
      {
        author: "爱猫用户",
        avatarUrl: "https://assets.example.com/avatars/user-1.jpg",
        content: "猫咪很爱吃，颗粒大小合适。",
        imageUrls: ["https://assets.example.com/comments/cat-1.jpg", "https://cdn.example.com/comment-2.jpg"],
        rating: 5,
        skuText: "规格:1.5kg；口味:鸡肉"
      },
      {
        author: "匿名评价",
        content: "包装完整，发货也快。",
        imageUrls: [],
        rating: 4,
        skuText: ""
      }
    ]);
    expect(data.view.services.map((service) => service.label)).toEqual(["7天无理由退货", "假一罚十", "售后私信协商", "退货免运费"]);
    expect(data.view.licenseTags).toEqual(["营业执照", "品牌授权"]);
    expect(data.view.selectionRows.find((row) => row.label === "配送")?.value).toContain("快递配送");
    expect(data.view.selectionRows.find((row) => row.label === "配送")?.value).toContain("48小时内发货");
    expect(data.view.purchase.defaultSkuId).toBe("6001");
    expect(data.view.purchase.skus[0]).toMatchObject({
      id: "6001",
      imageUrl: "https://assets.example.com/products/sku-chicken.jpg",
      price: 299,
      specsText: "规格:1.5kg，口味:鸡肉",
      stock: 3
    });
    expect(data.modules.skuList).toHaveLength(2);
    expect(data.debugRaw?.prodInfo.data?.prodId).toBe(1000054);
  });

  it("creates order confirm data by reusing the latest product detail and selected sku", () => {
    const data = createOrderConfirmBffData({
      productInfo: sampleProduct,
      quantity: 2,
      raw: {
        code: "00000",
        data: sampleProduct,
        success: true
      },
      selectedSkuId: "6001",
      javaOssAssetBaseUrl: "https://assets.example.com/"
    });

    expect(data.view.canSubmit).toBe(true);
    expect(data.view.items).toEqual([
      {
        id: "1000054-6001",
        imageLabel: "喵呜鲜肉猫粮 1.5kg",
        imageUrl: "https://assets.example.com/products/sku-chicken.jpg",
        price: 299,
        quantity: 2,
        specsText: "规格:1.5kg，口味:鸡肉",
        title: "喵呜鲜肉猫粮 1.5kg"
      }
    ]);
    expect(data.view.totalAmount).toBe(598);
    expect(data.view.totalQuantity).toBe(2);
    expect(data.view.productId).toBe("1000054");
    expect(data.modules.selectedSku.skuId).toBe(6001);
  });
});

describe("product real flow service", () => {
  it("requests Java prodInfo with product id, default address and express delivery type", async () => {
    const backendClient = createFakeBackendClient({
      "/prod/prodInfo?prodId=1000054&addrId=0&dvyType=1": {
        code: "00000",
        data: sampleProduct,
        success: true
      },
      "/prod/prodCommData?prodId=1000054&stationId=": {
        code: "00000",
        data: sampleCommentSummary,
        success: true
      },
      "/prod/prodCommPageByProd?prodId=1000054&size=10&current=1&evaluate=-1&stationId=": {
        code: "00000",
        data: sampleCommentPage,
        success: true
      },
      "/shop/headInfo?shopId=8801": {
        code: "00000",
        data: sampleShopInfo,
        success: true
      }
    });

    const result = await fetchProductDetailData({
      authRequired: true,
      authToken: "mall-token",
      backendClient,
      prodId: "1000054"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.shop?.name).toBe("喵呜自营旗舰店");
      expect(result.data.view.reviewSummary.countText).toBe("评价：128");
      expect(result.data.modules.shopInfo?.shopId).toBe(8801);
      expect(result.data.modules.commentSummary?.number).toBe(128);
    }
    expect(backendClient.requests.map((request) => request.path)).toEqual([
      "/prod/prodInfo?prodId=1000054&addrId=0&dvyType=1",
      "/shop/headInfo?shopId=8801",
      "/prod/prodCommData?prodId=1000054&stationId=",
      "/prod/prodCommPageByProd?prodId=1000054&size=10&current=1&evaluate=-1&stationId="
    ]);
    expect(backendClient.requests[0]).toMatchObject({
      authRequired: true,
      authToken: "mall-token",
      backend: "java",
      method: "GET",
      route: "/product/[id]"
    });
  });

  it("keeps product detail successful when optional shop and comment requests fail", async () => {
    const backendClient = createFakeBackendClient({
      "/prod/prodInfo?prodId=1000054&addrId=0&dvyType=1": {
        code: "00000",
        data: sampleProduct,
        success: true
      },
      "/shop/headInfo?shopId=8801": { ok: false },
      "/prod/prodCommData?prodId=1000054&stationId=": { ok: false },
      "/prod/prodCommPageByProd?prodId=1000054&size=10&current=1&evaluate=-1&stationId=": { ok: false }
    });

    const result = await fetchProductDetailData({
      authRequired: true,
      authToken: "mall-token",
      backendClient,
      prodId: "1000054"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.title).toBe("喵呜鲜肉猫粮 1.5kg");
      expect(result.data.view.shop).toBeUndefined();
      expect(result.data.view.reviewSummary.countText).toBe("评价：0");
      expect(result.data.view.reviewSummary.reviews).toEqual([]);
    }
  });

  it("rejects order confirmation when the selected sku is out of stock", async () => {
    const backendClient = createFakeBackendClient({
      "/prod/prodInfo?prodId=1000054&addrId=0&dvyType=1": {
        code: "00000",
        data: sampleProduct,
        success: true
      }
    });

    const result = await fetchProductOrderConfirmData({
      authRequired: true,
      authToken: "mall-token",
      backendClient,
      productId: "1000054",
      quantity: 1,
      skuId: "6002"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("HTTP_ERROR");
      expect(result.error.httpStatus).toBe(409);
      expect(result.error.message).toContain("库存不足");
    }
  });
});

describe("product browser api adapter", () => {
  it("keeps browser requests inside H5 BFF endpoints", async () => {
    const paths: string[] = [];
    const api = createProductApi({
      async request<T>(path: string) {
        paths.push(path);
        return {
          data: {} as T,
          requestId: "req-h5-product",
          success: true
        };
      }
    });

    await api.getProductDetail({ prodId: "1000054" });
    await api.getOrderConfirm({ productId: "1000054", quantity: 2, skuId: "6001" });

    expect(paths).toEqual([
      "/api/bff/product-detail?prodId=1000054",
      "/api/bff/order-confirm?productId=1000054&skuId=6001&quantity=2"
    ]);
  });
});

describe("product real flow rendering", () => {
  it("renders media carousel, real product information and purchase href from mapped data", () => {
    const data = createProductDetailBffData({
      commentPage: sampleCommentPage,
      commentSummary: sampleCommentSummary,
      productInfo: sampleProduct,
      shopInfo: sampleShopInfo,
      javaOssAssetBaseUrl: "https://assets.example.com/"
    });

    const pageHtml = renderToStaticMarkup(<ProductDetailScreen data={data.view} />);
    const sheetHtml = renderToStaticMarkup(<ProductPurchaseSheet data={data.view} onClose={() => undefined} />);

    expect(pageHtml).toContain("<video");
    expect(pageHtml).toContain('src="https://assets.example.com/videos/cat-food.mp4"');
    expect(pageHtml).toContain('poster="https://assets.example.com/videos/cat-food.mp4?x-oss-process=video/snapshot,t_1,m_fast,f_jpg"');
    expect(pageHtml).toContain("喵呜鲜肉猫粮 1.5kg");
    expect(pageHtml).not.toContain("喵呜自营旗舰店");
    expect(pageHtml).toContain("评价：128");
    expect(pageHtml).toContain("猫咪很爱吃，颗粒大小合适。");
    expect(pageHtml).toContain('src="https://assets.example.com/comments/cat-1.jpg"');
    expect(pageHtml).toContain("7天无理由退货");
    expect(pageHtml).toContain("假一罚十");
    expect(pageHtml).toContain("营业执照");
    expect(pageHtml).toContain("品牌授权");
    expect(sheetHtml).toContain("productId=1000054");
    expect(sheetHtml).toContain("skuId=6001");
    expect(sheetHtml).toContain("quantity=1");
  });

  it("keeps review module visible with an empty state when no comments are available", () => {
    const data = createProductDetailBffData({
      commentPage: { current: 1, pages: 0, records: [] },
      commentSummary: {
        negativeNumber: 0,
        number: 0,
        picNumber: 0,
        positiveRating: 0,
        praiseNumber: 0,
        secondaryNumber: 0
      },
      productInfo: sampleProduct,
      javaOssAssetBaseUrl: "https://assets.example.com/"
    });

    const pageHtml = renderToStaticMarkup(<ProductDetailScreen data={data.view} />);

    expect(pageHtml).toContain("评价：0");
    expect(pageHtml).toContain("暂无评价");
    expect(pageHtml).toContain("全部 0");
    expect(pageHtml).not.toContain("店铺信息");
  });

  it("renders a remote product shell for numeric product ids that are not in local mock", async () => {
    const html = renderToStaticMarkup(await ProductDetailPage({ params: Promise.resolve({ id: "1000054" }) }));

    expect(html).toContain("商品详情");
    expect(html).toContain("正在加载商品");
    expect(html).not.toContain("商品暂时不可见");
  });

  it("renders an order confirmation shell for real product parameters", async () => {
    const html = renderToStaticMarkup(
      await OrderConfirmPage({
        searchParams: Promise.resolve({
          productId: "1000054",
          quantity: "1",
          skuId: "6001"
        })
      })
    );

    expect(html).toContain("提交订单");
    expect(html).toContain("正在确认订单");
    expect(html).not.toContain("夏季纯棉短袖 T 恤男女同款宽松百搭休闲圆领上衣");
  });

  it("renders a safe purchase sheet state when sku is not ready", () => {
    const html = renderToStaticMarkup(<ProductPurchaseSheet data={createProductLoadingData("1000054")} onClose={() => undefined} />);

    expect(html).toContain("暂无可购买规格");
    expect(html).not.toContain("href=\"/order-confirm");
  });
});

type FakeBackendResponse =
  | { ok: false }
  | ProductServerResponse<typeof sampleProduct>
  | ProductServerResponse<JavaShopHeadInfo>
  | ProductServerResponse<JavaProductCommentSummary>
  | ProductServerResponse<JavaProductCommentPage>;

function createFakeBackendClient(responses: Record<string, FakeBackendResponse>) {
  const requests: BackendRequestOptions[] = [];

  return {
    requests,
    async request<T>(options: BackendRequestOptions) {
      requests.push(options);
      const response = responses[options.path];

      if (!response || "ok" in response) {
        return {
          error: {
            code: "HTTP_ERROR" as const,
            httpStatus: 502,
            message: "optional request failed",
            recoverable: true,
            requestId: "req-product-test"
          },
          ok: false as const
        };
      }

      return {
        data: response as T,
        meta: {
          appEnv: "test",
          backend: "java" as const,
          h5Version: "test",
          requestId: "req-product-test",
          route: options.route ?? "unknown"
        },
        ok: true as const
      };
    }
  };
}
