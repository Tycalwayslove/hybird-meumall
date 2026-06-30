import type { H5BffResult, H5RequestOptions } from "@/lib/http";
import type { AllinpayOrderStatusData, OrderPaymentData, OrderPayInfoData } from "./server/cashier-service";

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

export type SubmitOrderPaymentParams = {
  dvyType?: string;
  isPurePoints?: boolean;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
  payType: 7 | 8 | 0;
};

export type AllinpayOrderStatusParams = {
  bizOrderNo: string;
  orderNumbers?: string;
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
    },
    async submitOrderPayment(params: SubmitOrderPaymentParams) {
      console.info("[MeuMall][order-pay][h5-request]", params);
      try {
        const result = await client.request<OrderPaymentData>("/api/bff/order-pay?debugRaw=1", {
          body: params,
          method: "POST"
        });
        console.info("[MeuMall][order-pay][h5-response]", result);
        if (result.success && result.data.debugRaw?.orderPayRequest) {
          console.info("[MeuMall][order-pay][java-request]", result.data.debugRaw.orderPayRequest);
        }
        if (result.success && result.data.debugRaw?.orderPay) {
          console.info("[MeuMall][order-pay][java-response]", result.data.debugRaw.orderPay);
        }
        return result;
      } catch (error) {
        console.error("[MeuMall][order-pay][h5-error]", error);
        throw error;
      }
    },
    getAllinpayOrderStatus({ bizOrderNo, orderNumbers }: AllinpayOrderStatusParams) {
      const query = new URLSearchParams({ bizOrderNo });
      if (orderNumbers) {
        query.set("orderNumbers", orderNumbers);
      }

      return client.request<AllinpayOrderStatusData>(`/api/bff/allinpay-order-status?${query.toString()}`);
    }
  };
}

export type PaymentApi = ReturnType<typeof createPaymentApi>;
