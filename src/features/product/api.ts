import type { H5BffResult } from "@/lib/http";
import type { OrderConfirmBffData, ProductDetailBffData } from "./server/product-real-service";

export type ProductHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export type ProductDetailParams = {
  prodId: string;
};

export type ProductOrderConfirmParams = {
  productId: string;
  quantity?: number;
  skuId: string;
};

export function createProductApi(client: ProductHttpClient) {
  return {
    getOrderConfirm({ productId, quantity = 1, skuId }: ProductOrderConfirmParams) {
      return client.request<OrderConfirmBffData>(
        `/api/bff/order-confirm?${new URLSearchParams({
          productId,
          skuId,
          quantity: String(quantity)
        }).toString()}`
      );
    },
    getProductDetail({ prodId }: ProductDetailParams) {
      return client.request<ProductDetailBffData>(
        `/api/bff/product-detail?${new URLSearchParams({
          prodId
        }).toString()}`
      );
    }
  };
}

export type ProductApi = ReturnType<typeof createProductApi>;
export type { OrderConfirmBffData, ProductDetailBffData };
