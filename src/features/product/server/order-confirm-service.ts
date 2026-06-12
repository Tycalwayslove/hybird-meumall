import { getProductDetailById } from "./product-detail-service";
import type { OrderConfirmData, OrderConfirmItem } from "../types";

type GetOrderConfirmInput = {
  addressMode?: string | null;
  productId?: string | null;
  quantity?: string | null;
  skuId?: string | null;
};

export function getOrderConfirmData({
  addressMode,
  productId = "p-1001",
  quantity = "1",
  skuId
}: GetOrderConfirmInput = {}): OrderConfirmData | null {
  const normalizedProductId = productId ?? "p-1001";
  const product = getProductDetailById(normalizedProductId);

  if (!product) {
    if (productId) {
      return null;
    }

    const fallbackProduct = getProductDetailById("p-1001");
    if (!fallbackProduct) {
      return null;
    }

    return createMockOrderConfirmData({
      addressMode,
      product: fallbackProduct,
      quantity,
      skuId
    });
  }

  return createMockOrderConfirmData({
    addressMode,
    product,
    quantity,
    skuId
  });
}

function createMockOrderConfirmData({
  addressMode,
  product,
  quantity = "1",
  skuId
}: {
  addressMode?: string | null;
  product: NonNullable<ReturnType<typeof getProductDetailById>>;
  quantity?: string | null;
  skuId?: string | null;
}): OrderConfirmData | null {
  if (!product) {
    return null;
  }

  const selectedSku = product.purchase.skus.find((sku) => sku.id === skuId) ?? product.purchase.skus[0];
  const baseQuantity = clampQuantity(Number(quantity), selectedSku.stock);
  const items: OrderConfirmItem[] = [
    {
      id: `${product.id}-${selectedSku.id}-1`,
      imageLabel: product.purchase.imageLabel,
      title: product.title,
      specsText: selectedSku.specsText,
      price: selectedSku.price,
      quantity: baseQuantity
    },
    {
      id: `${product.id}-${selectedSku.id}-2`,
      imageLabel: product.purchase.imageLabel,
      title: product.title,
      specsText: selectedSku.id === "shirt-m" ? "黑色，L" : selectedSku.specsText,
      price: selectedSku.id === "shirt-m" ? 828 : selectedSku.price + 200,
      quantity: Math.max(1, baseQuantity + 1)
    }
  ];
  const totalQuantity = 4;
  const totalAmount = 8976;
  const hasAddress = addressMode !== "missing";

  return {
    address: hasAddress
      ? {
          fullAddress: "广东省广州市越秀区东风中路268号",
          name: "秦先生",
          phone: "1827267737"
        }
      : null,
    canSubmit: hasAddress,
    discountRows: [
      { label: "平台优惠券", value: "¥7896", tone: "primary" },
      { label: "店铺优惠", value: "-￥0.00", tone: "primary" },
      { label: "实付款", value: `￥${totalAmount}`, tone: "price" }
    ],
    items,
    productId: product.id,
    serviceRows: [
      { label: "配送服务", value: "快递配送", tone: "muted" },
      { label: "配送费用", value: "￥0.00", tone: "primary" },
      { label: "店铺优惠券", value: "暂无可用", tone: "muted", navigable: true },
      { label: "订单备注", value: "选填", tone: "muted", navigable: true },
      { label: "开具发票", value: "本次不开具发票", tone: "primary", navigable: true }
    ],
    totalAmount,
    totalQuantity
  };
}

function clampQuantity(value: number, stock: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(stock, Math.floor(value)));
}
