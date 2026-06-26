"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState, ProductImagePlaceholder, TransparentNavPage } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { HybridLink } from "@/lib/navigation";

import type { SeckillApi } from "../api";
import { createSeckillApi } from "../api";
import type { SeckillProduct } from "../mock/seckill-page-data";
import styles from "./SeckillScreen.module.css";

type SeckillPageInfo = {
  current: number;
  size: number;
  total?: number;
  pages?: number;
  hasMore: boolean;
};

type SeckillPageState = {
  products: SeckillProduct[];
  page: SeckillPageInfo;
  status: "idle" | "loading" | "finished" | "error";
};

const SECKILL_PAGE_SIZE = 10;

export function SeckillScreen({
  initialProducts = [],
  seckillApi
}: {
  initialProducts?: SeckillProduct[];
  seckillApi?: Pick<SeckillApi, "getProducts">;
}) {
  const defaultSeckillApi = useMemo(() => createSeckillApi(createH5Client()), []);
  const api = seckillApi ?? defaultSeckillApi;
  const [state, setState] = useState<SeckillPageState>(() => createInitialSeckillPageState(initialProducts));
  const loadingRef = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadProducts = useCallback(
    async ({ append }: { append: boolean }) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setState((currentState) => ({
        ...currentState,
        status: "loading"
      }));

      try {
        const currentPage = append ? stateRef.current.page.current + 1 : 1;
        const result = await api.getProducts({ current: currentPage, size: SECKILL_PAGE_SIZE });
        if (!result.success) {
          setState((currentState) => ({
            ...currentState,
            status: append ? "error" : "idle"
          }));
          return;
        }

        setState((currentState) => {
          const products = append ? [...currentState.products, ...result.data.view.products] : result.data.view.products;
          return {
            page: result.data.page,
            products,
            status: result.data.page.hasMore ? "idle" : "finished"
          };
        });
      } catch {
        setState((currentState) => ({
          ...currentState,
          status: append ? "error" : "idle"
        }));
      } finally {
        loadingRef.current = false;
      }
    },
    [api]
  );

  useEffect(() => {
    let disposed = false;

    async function loadInitialProducts() {
      try {
        const result = await api.getProducts({ current: 1, size: SECKILL_PAGE_SIZE });
        if (disposed || !result.success) {
          return;
        }
        setState({
          page: result.data.page,
          products: result.data.view.products,
          status: result.data.page.hasMore ? "idle" : "finished"
        });
      } catch {
        return;
      }
    }

    void loadInitialProducts();

    return () => {
      disposed = true;
    };
  }, [api]);

  return (
    <TransparentNavPage backHref="/" foreground="light" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.hero} style={{ backgroundImage: `url(${localAssetUrl("seckill.heroBg")})` }} aria-label="限时秒杀">
        <h1 className="sr-only">限时秒杀</h1>
      </section>
      <main className={styles.list} aria-label="秒杀商品列表">
        {state.products.length === 0 && state.status !== "loading" ? <EmptyState className={styles.emptyState} text="暂无秒杀商品" /> : null}
        {state.products.map((product, index) => (
          <SeckillProductCard key={`${product.id}-${index}`} product={product} />
        ))}
        <SeckillLoadMore state={state} onLoadMore={() => loadProducts({ append: true })} />
      </main>
    </TransparentNavPage>
  );
}

function createInitialSeckillPageState(products: SeckillProduct[]): SeckillPageState {
  return {
    page: {
      current: 1,
      hasMore: false,
      size: SECKILL_PAGE_SIZE
    },
    products,
    status: "idle"
  };
}

function SeckillProductCard({ product }: { product: SeckillProduct }) {
  const href = product.href ?? `/product/${product.id}`;

  return (
    <article className={styles.card}>
      <HybridLink href={href} className={styles.visualLink} title="商品详情">
        {product.imageUrl ? <img className={styles.visualImage} src={product.imageUrl} alt={product.title} /> : <ProductImagePlaceholder decorative className={styles.visual} />}
      </HybridLink>
      <div className={styles.info}>
        <HybridLink href={href} className={styles.titleLink} title="商品详情">
          <h2>{product.title}</h2>
        </HybridLink>
        <p className={styles.meta}>
          <span>{product.soldText}</span>
          <span>{product.stockText}</span>
        </p>
        <p className={styles.price}>
          <strong>￥{product.price}</strong>
          <span>￥{product.originalPrice}</span>
        </p>
        <div className={styles.actionPanel}>
          <div>
            <p>剩余时间：{product.countdown}</p>
            <div className={styles.progress}>
              <span style={{ width: `${product.progress}%` }} />
            </div>
          </div>
          <HybridLink href={href} className={styles.seckillButton} title="商品详情">
            <strong>秒杀</strong>
            <span>{product.limitText}</span>
          </HybridLink>
        </div>
      </div>
    </article>
  );
}

function SeckillLoadMore({ onLoadMore, state }: { onLoadMore: () => void; state: SeckillPageState }) {
  if (state.products.length === 0 && state.status !== "loading") {
    return null;
  }
  if (state.status === "loading") {
    return <div className={styles.loadMore}>加载中...</div>;
  }
  if (state.status === "error" && state.page.hasMore) {
    return (
      <button className={styles.loadMoreButton} type="button" onClick={onLoadMore}>
        继续加载
      </button>
    );
  }
  if (state.page.hasMore) {
    return (
      <button className={styles.loadMoreButton} type="button" onClick={onLoadMore}>
        加载更多
      </button>
    );
  }
  return <div className={styles.loadMore}>没有更多了</div>;
}
