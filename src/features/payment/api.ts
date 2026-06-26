import type { H5BffResult, H5RequestOptions } from "@/lib/http";
import type { OrderPayInfoData } from "./server/cashier-service";

export type PaymentHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export type OrderPayInfoParams = {
  dvyType?: string;
  isPurePoints?: string;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
};

export function createPaymentApi(client: PaymentHttpClient) {
  return {
    getOrderPayInfo({ dvyType, isPurePoints, orderNumbers, orderType, ordermold }: OrderPayInfoParams) {
      const query = new URLSearchParams({ orderNumbers });
      if (dvyType) {
        query.set("dvyType", dvyType);
      }
      if (isPurePoints) {
        query.set("isPurePoints", isPurePoints);
      }
      if (orderType) {
        query.set("orderType", orderType);
      }
      if (ordermold) {
        query.set("ordermold", ordermold);
      }

      return client.request<OrderPayInfoData>(`/api/bff/order-pay-info?${query.toString()}`);
    }
  };
}

export type PaymentApi = ReturnType<typeof createPaymentApi>;
