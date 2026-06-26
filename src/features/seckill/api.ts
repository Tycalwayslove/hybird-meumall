import type { H5BffResult } from "@/lib/http";
import type { SeckillProductsBffData } from "./server/seckill-real-service";

export type SeckillHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export type SeckillProductsParams = {
  current?: number;
  size?: number;
};

export function createSeckillApi(client: SeckillHttpClient) {
  return {
    getProducts({ current = 1, size = 10 }: SeckillProductsParams = {}) {
      return client.request<SeckillProductsBffData>(
        `/api/bff/seckill/products?${new URLSearchParams({
          current: String(current),
          size: String(size)
        }).toString()}`
      );
    }
  };
}

export type SeckillApi = ReturnType<typeof createSeckillApi>;
