import type { H5BffResult } from "@/lib/http";
import type { H5RequestOptions } from "@/lib/http";
import type { OrderFlowLogParam } from "./order-flow-log";
import type { OrderConfirmBffData, OrderSubmitBffData, ProductDetailBffData } from "./server/product-real-service";

export type ProductHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export type ProductDetailParams = {
  addrId?: string;
  prodId: string;
};

export type ProductOrderConfirmParams = {
  addrId?: string;
  productId: string;
  quantity?: number;
  skuId: string;
};

export type ProductOrderSubmitParams = ProductOrderConfirmParams & {
  orderFlowLogParam?: OrderFlowLogParam;
};

export function createProductApi(client: ProductHttpClient) {
  return {
    getOrderConfirm({ addrId, productId, quantity = 1, skuId }: ProductOrderConfirmParams) {
      const query = new URLSearchParams({
        productId,
        skuId,
        quantity: String(quantity)
      });

      if (addrId) {
        query.set("addrId", addrId);
      }

      return client.request<OrderConfirmBffData>(`/api/bff/order-confirm?${query.toString()}`);
    },
    getProductDetail({ addrId, prodId }: ProductDetailParams) {
      const query = new URLSearchParams({
        prodId
      });

      if (addrId) {
        query.set("addrId", addrId);
      }

      return client.request<ProductDetailBffData>(`/api/bff/product-detail?${query.toString()}`);
    },
    submitOrder({ addrId, orderFlowLogParam, productId, quantity = 1, skuId }: ProductOrderSubmitParams) {
      return client.request<OrderSubmitBffData>("/api/bff/order-submit", {
        body: {
          addrId,
          orderFlowLogParam,
          productId,
          quantity,
          skuId
        },
        method: "POST"
      });
    }
  };
}

export type ProductApi = ReturnType<typeof createProductApi>;
export type { OrderConfirmBffData, OrderSubmitBffData, ProductDetailBffData };
