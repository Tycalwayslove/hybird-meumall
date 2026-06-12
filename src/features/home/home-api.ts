import type { H5BffResult } from "@/lib/http";
import type { HomeBffData, HomeForYouProductsBffData, HomeRecommendProductsBffData } from "./server/home-real-service";

export type HomeHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export type HomeForYouProductsParams = {
  current?: number;
  size?: number;
};

export function createHomeApi(client: HomeHttpClient) {
  return {
    getForYouProducts({ current = 1, size = 10 }: HomeForYouProductsParams = {}) {
      return client.request<HomeForYouProductsBffData>(
        `/api/bff/home/for-you-products?${new URLSearchParams({
          current: String(current),
          size: String(size)
        }).toString()}`
      );
    },
    getHome() {
      return client.request<HomeBffData>("/api/bff/home");
    },
    getRecommendProducts({ current = 1, size = 10 }: HomeForYouProductsParams = {}) {
      return client.request<HomeRecommendProductsBffData>(
        `/api/bff/home/recommend-products?${new URLSearchParams({
          current: String(current),
          size: String(size)
        }).toString()}`
      );
    }
  };
}

export type HomeApi = ReturnType<typeof createHomeApi>;
export type { HomeBffData, HomeForYouProductsBffData, HomeRecommendProductsBffData };
