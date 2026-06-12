"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DropdownFilterBar, ProductImagePlaceholder, StandardNavPage, useDropdownFilterBarState } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";
import type { HomeApi } from "../home-api";
import { createHomeApi } from "../home-api";
import type { HomeProductCard } from "../home-page-data";
import styles from "./HomeRecommendProductsScreen.module.css";

type RecommendFilterState = "sales" | "price" | "category";
type RecommendProductsPageInfo = {
  current: number;
  size: number;
  total?: number;
  pages?: number;
  hasMore: boolean;
};

export type RecommendProductsPageState = {
  products: HomeProductCard[];
  page: RecommendProductsPageInfo;
  status: "idle" | "loading" | "finished" | "error";
};

const RECOMMEND_PRODUCTS_PAGE_SIZE = 10;

export function HomeRecommendProductsScreen({
  homeApi,
  initialProducts
}: {
  homeApi?: Pick<HomeApi, "getForYouProducts">;
  initialProducts: HomeProductCard[];
}) {
  const defaultHomeApi = useMemo(() => createHomeApi(createH5Client()), []);
  const api = homeApi ?? defaultHomeApi;
  const [pageState, setPageState] = useState<RecommendProductsPageState>(() => createInitialRecommendProductsPageState(initialProducts));
  const [keyword, setKeyword] = useState("");
  const loadingNextRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filterState = useDropdownFilterBarState<RecommendFilterState>({
    initialActiveKey: "sales",
    initialSelectedOptions: {
      category: "all",
      price: "price_asc"
    },
    isDropdownKey: (key) => key === "price" || key === "category"
  });
  const { activeKey, expandedKey, selectedOptions } = filterState;

  useEffect(() => {
    let disposed = false;

    async function loadProducts() {
      setPageState((current) => ({
        ...current,
        status: "loading"
      }));

      try {
        const result = await api.getForYouProducts({ current: 1, size: RECOMMEND_PRODUCTS_PAGE_SIZE });
        if (!disposed && result.success) {
          setPageState({
            page: result.data.page,
            products: result.data.view.products,
            status: result.data.page.hasMore ? "idle" : "finished"
          });
        } else if (!disposed) {
          setPageState((current) => ({
            ...current,
            status: "error"
          }));
        }
      } catch {
        if (!disposed) {
          setPageState((current) => ({
            ...current,
            status: "error"
          }));
        }
      }
    }

    void loadProducts();

    return () => {
      disposed = true;
    };
  }, [api]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingNextRef.current || (pageState.status !== "idle" && pageState.status !== "error") || !pageState.page.hasMore) {
      return;
    }

    loadingNextRef.current = true;
    const currentState = pageState;
    setPageState((state) => ({
      ...state,
      status: "loading"
    }));

    try {
      const nextState = await loadNextRecommendProductsPage({
        homeApi: api,
        state: currentState
      });
      setPageState(nextState);
    } finally {
      loadingNextRef.current = false;
    }
  }, [api, pageState]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || pageState.status !== "idle" || !pageState.page.hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreProducts();
        }
      },
      {
        rootMargin: "160px 0px"
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreProducts, pageState.page.hasMore, pageState.status]);

  const visibleProducts = useMemo(
    () => getVisibleProducts(pageState.products, activeKey, selectedOptions, keyword),
    [activeKey, keyword, pageState.products, selectedOptions]
  );
  const filterItems = useMemo(
    () => [
      { key: "sales", label: "销量", href: "/home/recommend-products", active: activeKey === "sales", showCaret: false },
      {
        key: "price",
        label: "价格",
        href: "/home/recommend-products?filter=price",
        active: activeKey === "price",
        selectedOptionKey: selectedOptions.price,
        options: [
          { key: "price_asc", label: "价格从低到高", href: "/home/recommend-products?sort=price_asc", selected: selectedOptions.price === "price_asc" },
          { key: "price_desc", label: "价格从高到低", href: "/home/recommend-products?sort=price_desc", selected: selectedOptions.price === "price_desc" }
        ]
      },
      {
        key: "category",
        label: "分类",
        href: "/home/recommend-products?filter=category",
        active: activeKey === "category",
        selectedOptionKey: selectedOptions.category,
        options: [
          { key: "all", label: "全部商品", href: "/home/recommend-products?category=all", selected: selectedOptions.category === "all" },
          { key: "seckill", label: "限时秒杀", href: "/home/recommend-products?category=seckill", selected: selectedOptions.category === "seckill" },
          { key: "talent", label: "达人专享", href: "/home/recommend-products?category=talent", selected: selectedOptions.category === "talent" },
          { key: "hot", label: "热卖商品", href: "/home/recommend-products?category=hot", selected: selectedOptions.category === "hot" }
        ]
      }
    ],
    [activeKey, selectedOptions.category, selectedOptions.price]
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setKeyword(String(formData.get("q") ?? "").trim());
  }

  return (
    <StandardNavPage title="相似推荐商品" backHref="/" contentClassName={styles.viewport}>
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <form className={styles.searchForm} role="search" onSubmit={handleSearchSubmit}>
            <span aria-hidden="true" className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} />
            <input className={styles.searchInput} name="q" placeholder="请输入商品名称搜索" type="search" />
            <button className={styles.searchButton} type="submit">
              搜索
            </button>
          </form>
        </div>
        <DropdownFilterBar
          className={styles.filterBar}
          expandedKey={expandedKey}
          items={filterItems}
          onItemSelect={filterState.onItemSelect}
          onOptionSelect={filterState.onOptionSelect}
          onRequestClose={filterState.closeDropdown}
        />
      </div>
      <main className={styles.grid} aria-label="相似推荐商品列表">
        {visibleProducts.map((product) => (
          <RecommendProductCard key={product.id} product={product} />
        ))}
      </main>
      <div ref={loadMoreRef} className={styles.loadMore} data-recommend-load-more="true">
        {pageState.status === "loading" ? <span>加载中...</span> : null}
        {pageState.status === "idle" && pageState.page.hasMore ? (
          <button className={styles.loadMoreButton} type="button" onClick={loadMoreProducts}>
            加载更多
          </button>
        ) : null}
        {pageState.status === "finished" || (!pageState.page.hasMore && pageState.status !== "loading" && pageState.status !== "error") ? <span>没有更多了</span> : null}
        {pageState.status === "error" && pageState.page.hasMore ? (
          <button className={styles.loadMoreButton} type="button" onClick={loadMoreProducts}>
            继续加载
          </button>
        ) : null}
      </div>
    </StandardNavPage>
  );
}

export async function loadNextRecommendProductsPage({
  homeApi,
  state
}: {
  homeApi: Pick<HomeApi, "getForYouProducts">;
  state: RecommendProductsPageState;
}): Promise<RecommendProductsPageState> {
  if (!state.page.hasMore || state.status === "loading" || state.status === "finished") {
    return state;
  }

  try {
    const result = await homeApi.getForYouProducts({
      current: state.page.current + 1,
      size: state.page.size
    });

    if (!result.success) {
      return {
        ...state,
        status: "error"
      };
    }

    return {
      page: result.data.page,
      products: mergeProductsById(state.products, result.data.view.products),
      status: result.data.page.hasMore ? "idle" : "finished"
    };
  } catch {
    return {
      ...state,
      status: "error"
    };
  }
}

function createInitialRecommendProductsPageState(products: HomeProductCard[]): RecommendProductsPageState {
  return {
    page: {
      current: 1,
      hasMore: products.length >= RECOMMEND_PRODUCTS_PAGE_SIZE,
      size: RECOMMEND_PRODUCTS_PAGE_SIZE
    },
    products,
    status: "idle"
  };
}

function mergeProductsById(currentProducts: HomeProductCard[], nextProducts: HomeProductCard[]) {
  const seen = new Set(currentProducts.map((product) => product.id));
  const merged = [...currentProducts];

  nextProducts.forEach((product) => {
    if (!seen.has(product.id)) {
      seen.add(product.id);
      merged.push(product);
    }
  });

  return merged;
}

function RecommendProductCard({ product }: { product: HomeProductCard }) {
  return (
    <Link className={styles.card} href={buildClientHref(product.href)}>
      <ProductImagePlaceholder decorative className={styles.visual}>
        {product.imageUrl ? <span aria-hidden="true" className={styles.image} style={{ backgroundImage: `url(${product.imageUrl})` }} /> : null}
        <span className={styles.badge}>{product.badge}</span>
      </ProductImagePlaceholder>
      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <div className={styles.meta}>
          <span>{product.promoType === "seckill" ? "限时秒杀" : "达人专享"}</span>
          <span>{product.soldText}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>
            <span className={styles.currency}>￥</span>
            {product.price}
          </span>
          <span className={styles.originalPrice}>￥{product.originalPrice}</span>
        </div>
      </div>
    </Link>
  );
}

function getVisibleProducts(products: HomeProductCard[], activeKey: RecommendFilterState, selectedOptions: Record<string, string>, keyword: string) {
  let nextProducts = products;
  if (keyword) {
    nextProducts = nextProducts.filter((product) => product.title.includes(keyword));
  }

  if (activeKey === "category") {
    const category = selectedOptions.category;
    if (category === "seckill") {
      nextProducts = nextProducts.filter((product) => product.promoType === "seckill");
    } else if (category === "talent") {
      nextProducts = nextProducts.filter((product) => product.promoType !== "seckill");
    } else if (category === "hot") {
      nextProducts = nextProducts.filter((product) => product.badge === "热卖");
    }
  }

  if (activeKey === "price") {
    return [...nextProducts].sort((left, right) =>
      selectedOptions.price === "price_desc" ? Number(right.price) - Number(left.price) : Number(left.price) - Number(right.price)
    );
  }

  if (activeKey === "sales") {
    return [...nextProducts].sort((left, right) => right.soldText.localeCompare(left.soldText, "zh-Hans-CN"));
  }

  return nextProducts;
}
