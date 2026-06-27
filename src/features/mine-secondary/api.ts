import type { H5BffResult, H5RequestOptions } from "@/lib/http";

import type {
  AddressListBffData,
  AddressMutationBffData,
  AddressRegionsBffData,
  AddressSaveBffData,
  JavaAddress
} from "./server/address-real-service";
import type { AddressEntry } from "./mock/address-data";
import type {
  OrderDetailView,
  OrderMutationData,
  OrderStatus,
  OrdersPageData,
  OrderCardView,
  RefundCardView,
  RefundDetailView,
  JavaOrder,
  JavaPage,
  JavaRefundOrder
} from "./server/orders-real-service";
import type { CollectionMutationData, CollectionsPageData, JavaFavoriteProductGroup, JavaFootprintProduct } from "./server/collections-real-service";

type AddressHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export function createAddressApi(client: AddressHttpClient) {
  return {
    deleteAddress(addrId: string) {
      return client.request<AddressMutationBffData>("/api/bff/address/delete", {
        body: { addrId },
        method: "DELETE"
      });
    },
    getAddressInfo(addrId: string) {
      return client.request<AddressEntry | null>("/api/bff/address/info?" + new URLSearchParams({ addrId }).toString());
    },
    getAddressList() {
      return client.request<AddressListBffData>("/api/bff/address/list");
    },
    getAddressRegions(parentId?: string | number) {
      const query = parentId === undefined || parentId === "" ? "" : "?" + new URLSearchParams({ parentId: String(parentId) }).toString();
      return client.request<AddressRegionsBffData>(`/api/bff/address/regions${query}`);
    },
    saveAddress(address: JavaAddress) {
      return client.request<AddressSaveBffData>("/api/bff/address/save", {
        body: address,
        method: address.addrId ? "PUT" : "POST"
      });
    },
    setDefaultAddress(addrId: string) {
      return client.request<AddressMutationBffData>("/api/bff/address/default", {
        body: { addrId },
        method: "PUT"
      });
    }
  };
}

export type AddressApi = ReturnType<typeof createAddressApi>;

export type GetOrdersInput = {
  current?: number;
  keyword?: string;
  size?: number;
  status?: OrderStatus;
};

export type ContactMessageInput = {
  messageContent: string;
  orderNumber: string;
  userMobile: string;
};

export function createOrdersApi(client: AddressHttpClient) {
  return {
    cancelOrder(orderNumber: string) {
      return client.request<OrderMutationData>("/api/bff/orders/cancel", {
        body: { orderNumber },
        method: "PUT"
      });
    },
    deleteOrder(orderNumber: string) {
      return client.request<OrderMutationData>("/api/bff/orders/delete?" + new URLSearchParams({ orderNumber }).toString(), {
        method: "DELETE"
      });
    },
    getOrderDetail(orderNumber: string) {
      return client.request<{ modules: { orderDetail: unknown }; view: OrderDetailView }>("/api/bff/orders/detail?" + new URLSearchParams({ orderNumber }).toString());
    },
    getOrders({ current = 1, keyword, size = 10, status = "all" }: GetOrdersInput = {}) {
      const query = new URLSearchParams({
        current: String(current),
        size: String(size),
        status
      });
      if (keyword) {
        query.set("keyword", keyword);
      }
      return client.request<OrdersPageData<{ orderPage: JavaPage<JavaOrder> }> & { view: { orders: OrderCardView[] } }>(`/api/bff/orders?${query.toString()}`);
    },
    getRefundDetail(refundSn: string) {
      return client.request<{ modules: { refundDetail: unknown }; view: RefundDetailView }>("/api/bff/orders/refund-detail?" + new URLSearchParams({ refundSn }).toString());
    },
    getRefundOrders({ current = 1, size = 10 }: Pick<GetOrdersInput, "current" | "size"> = {}) {
      return client.request<OrdersPageData<{ refundPage: JavaPage<JavaRefundOrder> }> & { view: { refunds: RefundCardView[] } }>(
        `/api/bff/orders/refunds?${new URLSearchParams({ current: String(current), size: String(size) }).toString()}`
      );
    },
    receiptOrder(orderNumber: string) {
      return client.request<OrderMutationData>("/api/bff/orders/receipt", {
        body: { orderNumber },
        method: "PUT"
      });
    },
    submitContactMessage(input: ContactMessageInput) {
      return client.request<OrderMutationData>("/api/bff/orders/contact-message", {
        body: input,
        method: "POST"
      });
    }
  };
}

export type OrdersApi = ReturnType<typeof createOrdersApi>;

export type GetCollectionProductsInput = {
  current?: number;
  size?: number;
};

export function createCollectionsApi(client: AddressHttpClient) {
  return {
    cancelFavoriteProduct(prodId: string) {
      return client.request<CollectionMutationData>("/api/bff/favorites/products/cancel", {
        body: { prodId },
        method: "POST"
      });
    },
    deleteFootprints(ids: string[]) {
      return client.request<CollectionMutationData>("/api/bff/footprints/delete", {
        body: { ids },
        method: "DELETE"
      });
    },
    getFavoriteProducts({ current = 1, size = 20 }: GetCollectionProductsInput = {}) {
      return client.request<CollectionsPageData<{ favoritePage: JavaFavoriteProductGroup[] }>>(
        `/api/bff/favorites/products?${new URLSearchParams({ current: String(current), size: String(size) }).toString()}`
      );
    },
    getFootprints({ current = 1, size = 20 }: GetCollectionProductsInput = {}) {
      return client.request<CollectionsPageData<{ footprintPage: JavaFootprintProduct[] }>>(
        `/api/bff/footprints?${new URLSearchParams({ current: String(current), size: String(size) }).toString()}`
      );
    }
  };
}

export type CollectionsApi = ReturnType<typeof createCollectionsApi>;
