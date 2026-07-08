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
  DeliveryCompanyView,
  LogisticsView,
  RefundCardView,
  RefundContextInput,
  RefundDetailView,
  JavaOrder,
  JavaPage,
  JavaRefundOrder
} from "./server/orders-real-service";
import type { CollectionMutationData, CollectionsPageData, JavaFavoriteProductGroup, JavaFootprintProduct } from "./server/collections-real-service";
import type {
  AddBankCardInput,
  BankCardMutationData,
  BankCardsPageData,
  WalletHistoryStatusData,
  WalletMemberInfoData,
  WalletOrdersPageData,
  WalletState,
  WalletSummaryData,
  WalletWithdrawApplyData,
  WalletWithdrawRecordsPageData
} from "./server/wallet-real-service";

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

export type RefundActionInput =
  | { action: "cancel-refund"; refundSn: string }
  | { action: "modify-amount"; refundAmount: number | string; refundSn: string }
  | { action: "cancel-platform"; orderNumber: string; refundId: string; refundSn: string };

export type PlatformInterventionInput = {
  imgUrls: string;
  orderNumber: string;
  pageType: 1 | 2;
  refundId: string;
  refundSts?: number | string;
  voucherDesc: string;
};

export type ReturnLogisticsInput = {
  expressId: string | number;
  expressName: string;
  expressNo: string;
  imgs?: string;
  isModify?: boolean;
  mobile?: string;
  refundSn: string;
  senderRemarks?: string;
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
    getOrderLogistics(orderNumber: string, deliveryId?: string) {
      const query = new URLSearchParams({ orderNumber });
      if (deliveryId) {
        query.set("deliveryId", deliveryId);
      }
      return client.request<{ modules: { deliveryList: unknown[]; orderDetail: unknown; selectedDelivery?: unknown }; view: LogisticsView }>(`/api/bff/orders/logistics?${query.toString()}`);
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
    submitPlatformIntervention(input: PlatformInterventionInput) {
      return client.request<OrderMutationData>("/api/bff/orders/platform-intervention", {
        body: input,
        method: "POST"
      });
    },
    submitRefundApplication(input: RefundContextInput) {
      return client.request<OrderMutationData>("/api/bff/orders/refund-apply", {
        body: input,
        method: "POST"
      });
    },
    submitRefundAction(input: RefundActionInput) {
      return client.request<OrderMutationData>("/api/bff/orders/refund-actions", {
        body: input,
        method: "PUT"
      });
    },
    submitReturnLogistics(input: ReturnLogisticsInput) {
      return client.request<OrderMutationData>("/api/bff/orders/return-logistics", {
        body: input,
        method: "POST"
      });
    },
    submitContactMessage(input: ContactMessageInput) {
      return client.request<OrderMutationData>("/api/bff/orders/contact-message", {
        body: input,
        method: "POST"
      });
    },
    getDeliveryCompanies() {
      return client.request<{ modules: { raw: unknown[] }; view: { companies: DeliveryCompanyView[] } }>("/api/bff/orders/delivery-companies");
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

export type GetWalletInput = {
  current?: number;
  size?: number;
  state?: WalletState;
};

export type GetWalletWithdrawRecordsInput = {
  current?: number;
  size?: number;
};

export type ApplyWalletWithdrawInput = {
  amount: number | string;
};

export type UnbindBankCardInput = {
  acctNum: string;
};

export function createWalletApi(client: AddressHttpClient) {
  return {
    addBankCard(input: AddBankCardInput) {
      return client.request<BankCardMutationData>("/api/bff/wallet/bank-cards/apply", {
        body: input,
        method: "POST"
      });
    },
    applyWithdraw(input: ApplyWalletWithdrawInput) {
      return client.request<WalletWithdrawApplyData>("/api/bff/wallet/withdraw", {
        body: input,
        method: "POST"
      });
    },
    getBankCards() {
      return client.request<BankCardsPageData>("/api/bff/wallet/bank-cards");
    },
    getMemberInfo() {
      return client.request<WalletMemberInfoData>("/api/bff/wallet/member-info");
    },
    getWalletOrders({ current = 1, size = 10, state = "settled" }: GetWalletInput = {}) {
      const query = new URLSearchParams({
        current: String(current),
        size: String(size),
        state
      });
      return client.request<WalletOrdersPageData>(`/api/bff/wallet/orders?${query.toString()}`);
    },
    getWalletHistoryStatus() {
      return client.request<WalletHistoryStatusData>("/api/bff/wallet/history-status");
    },
    getWalletSummary() {
      return client.request<WalletSummaryData>("/api/bff/wallet/summary");
    },
    getWithdrawRecords({ current = 1, size = 10 }: GetWalletWithdrawRecordsInput = {}) {
      return client.request<WalletWithdrawRecordsPageData>(`/api/bff/wallet/withdraw-records?${new URLSearchParams({ current: String(current), size: String(size) }).toString()}`);
    },
    unbindBankCard(input: UnbindBankCardInput) {
      return client.request<BankCardMutationData>("/api/bff/wallet/bank-cards/unbind", {
        body: input,
        method: "POST"
      });
    }
  };
}

export type WalletApi = ReturnType<typeof createWalletApi>;
