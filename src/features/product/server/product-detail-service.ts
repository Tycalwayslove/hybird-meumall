import { mockProductDetails } from "../mock/product-detail";
import type { ProductDetailData } from "../types";

export function getProductDetailById(id: string) {
  return mockProductDetails.find((product) => product.id === id) ?? null;
}

export function createProductLoadingData(id: string): ProductDetailData {
  return {
    buyHref: "/order-confirm",
    consultHref: "/consult",
    consultPlaceholder: "咨询商品详情",
    countdown: ["00", "00", "00"],
    detail: {
      description: "正在加载商品详情",
      imageLabel: "商品详情加载中",
      title: "商品详情"
    },
    galleryText: "0/0",
    id,
    licenseTags: [],
    originalPrice: "0",
    price: "0",
    purchase: {
      defaultDeliveryId: "express",
      defaultQuantity: 1,
      defaultSkuId: "",
      deliveryOptions: [{ id: "express", label: "快递配送" }],
      deliveryTitle: "配送方式",
      imageLabel: "商品加载中",
      skus: [],
      specsTitle: "选择规格"
    },
    reviewSummary: {
      countText: "评价",
      positiveRateText: "查看更多",
      reviews: [],
      tags: []
    },
    selectionRows: [
      {
        label: "选择",
        value: "正在加载商品规格"
      }
    ],
    services: [{ label: "正在加载商品" }],
    soldText: "已售 0",
    subtitle: "正在加载商品",
    talentLevelLabel: "达人专享价",
    title: "正在加载商品"
  };
}
