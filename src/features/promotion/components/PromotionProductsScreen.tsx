"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState, ProductImagePlaceholder, StandardNavPage } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createWindowProtocolBridge, type NativeEventMap, type ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { createH5Client } from "@/lib/http";
import { HybridLink } from "@/lib/navigation";

import { createPromotionApi, type PromotionApi } from "../api";
import type { PromotionProductItem } from "../mock/products";
import { DEFAULT_PROMOTION_PRODUCT_ORDER_BY, type PromotionProductQueryValue } from "../promotion-product-query";
import { PromotionProductQueryControls } from "./PromotionProductQueryControls";
import styles from "./PromotionProductsScreen.module.css";

type PromotionProductsScreenProps = {
  incentiveId?: string;
  initialProducts?: PromotionProductItem[];
  promotionProductsApi?: Pick<PromotionApi, "getProducts">;
};

type PromotionProductsPageState = {
  products: PromotionProductItem[];
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
  status: "idle" | "loading" | "finished" | "error";
};

const PROMOTION_PRODUCTS_PAGE_SIZE = 10;

export function PromotionProductsScreen({ incentiveId, initialProducts = [], promotionProductsApi }: PromotionProductsScreenProps) {
  const bridge = useMemo(() => createWindowProtocolBridge(), []);
  const defaultPromotionProductsApi = useMemo(() => createPromotionApi(createH5Client()), []);
  const api = promotionProductsApi ?? defaultPromotionProductsApi;
  const [queryValue, setQueryValue] = useState<PromotionProductQueryValue>({
    keyword: "",
    orderBy: DEFAULT_PROMOTION_PRODUCT_ORDER_BY
  });
  const [pageState, setPageState] = useState<PromotionProductsPageState>(() =>
    createInitialPromotionProductsPageState(initialProducts)
  );
  const loadingRef = useRef(false);
  const pageStateRef = useRef(pageState);

  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  const loadProducts = useCallback(
    async ({ append }: { append: boolean }) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setPageState((currentState) => ({
        ...currentState,
        status: "loading"
      }));

      try {
        const currentPage = append ? pageStateRef.current.page.current + 1 : 1;
        const result = await api.getProducts({
          categoryId: queryValue.categoryId,
          current: currentPage,
          incentiveId,
          keyword: queryValue.keyword || undefined,
          orderBy: queryValue.orderBy,
          size: PROMOTION_PRODUCTS_PAGE_SIZE
        });

        if (!result.success) {
          setPageState((currentState) => ({
            ...currentState,
            status: append ? "error" : "idle"
          }));
          return;
        }

        setPageState((currentState) => {
          const products = append ? [...currentState.products, ...result.data.view.products] : result.data.view.products;
          return {
            page: result.data.page,
            products,
            status: result.data.page.hasMore ? "idle" : "finished"
          };
        });
      } catch {
        setPageState((currentState) => ({
          ...currentState,
          status: append ? "error" : "idle"
        }));
      } finally {
        loadingRef.current = false;
      }
    },
    [api, incentiveId, queryValue]
  );

  useEffect(() => {
    let disposed = false;

    async function loadInitialProducts() {
      try {
        const result = await api.getProducts({
          categoryId: queryValue.categoryId,
          current: 1,
          incentiveId,
          keyword: queryValue.keyword || undefined,
          orderBy: queryValue.orderBy,
          size: PROMOTION_PRODUCTS_PAGE_SIZE
        });
        if (disposed) {
          return;
        }
        if (!result.success) {
          setPageState(createInitialPromotionProductsPageState([]));
          return;
        }
        setPageState({
          page: result.data.page,
          products: result.data.view.products,
          status: result.data.page.hasMore ? "idle" : "finished"
        });
      } catch {
        if (!disposed) {
          setPageState(createInitialPromotionProductsPageState([]));
        }
      }
    }

    void loadInitialProducts();

    return () => {
      disposed = true;
    };
  }, [api, incentiveId, queryValue]);

  return (
    <StandardNavPage title="推广商品" backHref="/promotion" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.notice} aria-label="达人佣金膨胀提示">
        <span aria-hidden="true" className={styles.noticeBadge}>V3</span>
        <span>
          您是平台的<span>“黄金达人”</span>，带货佣金每单将膨胀<span>50%</span>
        </span>
      </section>
      <PromotionProductQueryControls className={styles.queryControls} value={queryValue} onChange={setQueryValue} />
      <main key={`${queryValue.keyword}-${queryValue.categoryId ?? ""}-${queryValue.orderBy}`} className={styles.list} aria-label="推广商品列表">
        {pageState.products.length === 0 && pageState.status !== "loading" ? <EmptyState className={styles.emptyState} text="暂无推广商品" /> : null}
        {pageState.products.map((product) => (
          <PromotionProductCard key={product.id} bridge={bridge} product={product} />
        ))}
        <PromotionProductsLoadMore state={pageState} onLoadMore={() => loadProducts({ append: true })} />
      </main>
    </StandardNavPage>
  );
}

function createInitialPromotionProductsPageState(products: PromotionProductItem[]): PromotionProductsPageState {
  return {
    page: {
      current: 1,
      hasMore: false,
      size: PROMOTION_PRODUCTS_PAGE_SIZE
    },
    products,
    status: "idle"
  };
}

type PromotionShareBridge = Pick<ProtocolBridge, "emit" | "isAvailable">;

export function buildPromotionSharePayload(product: PromotionProductItem): NativeEventMap["share"] {
  return {
    productId: product.id,
    title: product.title,
    source: "promotion_products"
  };
}

export function sharePromotionProduct(product: PromotionProductItem, bridge: PromotionShareBridge = createWindowProtocolBridge()) {
  if (!bridge.isAvailable()) {
    return false;
  }

  bridge.emit("share", buildPromotionSharePayload(product));
  return true;
}

function PromotionProductCard({ bridge, product }: { bridge: PromotionShareBridge; product: PromotionProductItem }) {
  const href = product.href ?? `/product/${product.id}`;

  return (
    <article className={styles.card}>
      <HybridLink href={href} className={styles.productImageLink} title="商品详情">
        {product.imageUrl ? <img className={styles.productImageReal} src={product.imageUrl} alt={product.title} /> : <ProductImagePlaceholder decorative className={styles.productImage} />}
      </HybridLink>
      <div className={styles.cardInfo}>
        <HybridLink href={href} className={styles.titleLink} title="商品详情">
          <h2>{product.title}</h2>
        </HybridLink>
        <p className={styles.sales}>销量：{product.sales}</p>
        <div className={styles.pricePanel}>
          <p>
            <strong>￥{product.userPrice}</strong>
            <span>用户价</span>
          </p>
          <p>
            预计可赚：
            <strong>￥{product.estimatedCommission}</strong>
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => sharePromotionProduct(product, bridge)}>
            <span aria-hidden="true" className={styles.actionIcon} style={{ backgroundImage: `url(${localAssetUrl("promotion.icon.share")})` }} />
            推广
          </button>
          <button type="button">
            <span aria-hidden="true" className={styles.actionIcon} style={{ backgroundImage: `url(${localAssetUrl("promotion.icon.collect")})` }} />
            {product.isFavorite ? "已收藏" : "收藏"}
          </button>
        </div>
      </div>
    </article>
  );
}

function PromotionProductsLoadMore({ onLoadMore, state }: { onLoadMore: () => void; state: PromotionProductsPageState }) {
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
