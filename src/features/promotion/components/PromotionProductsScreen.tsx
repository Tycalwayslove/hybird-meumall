"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { DropdownFilterBar, EmptyState, ProductImagePlaceholder, StandardNavPage, useDropdownFilterBarState } from "@/design-system";
import type { DropdownFilterBarItem } from "@/design-system";
import { createWindowProtocolBridge, type NativeEventMap, type ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { HybridLink } from "@/lib/navigation";

import type { PromotionProductsApi } from "../promotion-products-api";
import { createPromotionProductsApi } from "../promotion-products-api";
import { promotionProductFilters, type PromotionProductItem, type PromotionProductsFilter } from "../mock/products";
import styles from "./PromotionProductsScreen.module.css";

type PromotionProductsScreenProps = {
  filter?: PromotionProductsFilter;
  initialProducts?: PromotionProductItem[];
  promotionProductsApi?: Pick<PromotionProductsApi, "getProducts">;
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

export function PromotionProductsScreen({ filter = "none", initialProducts = [], promotionProductsApi }: PromotionProductsScreenProps) {
  const bridge = useMemo(() => createWindowProtocolBridge(), []);
  const defaultPromotionProductsApi = useMemo(() => createPromotionProductsApi(createH5Client()), []);
  const api = promotionProductsApi ?? defaultPromotionProductsApi;
  const filterState = useDropdownFilterBarState<PromotionProductsFilter>({
    initialActiveKey: filter === "none" ? "sales" : filter,
    initialExpandedKey: hasDropdownOptions(filter) ? filter : null,
    initialSelectedOptions: {
      category: promotionProductFilters.categories[1] ?? promotionProductFilters.categories[0] ?? "",
      commission: "commission_amount_desc",
      property: promotionProductFilters.properties[0] ?? "",
      price: "price_asc"
    },
    isDropdownKey: hasDropdownOptions
  });
  const { activeKey: activeFilter, expandedKey: expandedFilter, selectedOptions } = filterState;
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageState, setPageState] = useState<PromotionProductsPageState>(() =>
    createInitialPromotionProductsPageState(getPromotionProducts(activeFilter, selectedOptions, initialProducts))
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
          current: currentPage,
          prodName: searchKeyword || undefined,
          size: PROMOTION_PRODUCTS_PAGE_SIZE,
          sort: mapPromotionProductsSort(activeFilter, selectedOptions)
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
    [activeFilter, api, searchKeyword, selectedOptions]
  );

  useEffect(() => {
    let disposed = false;

    async function loadInitialProducts() {
      try {
        const result = await api.getProducts({
          current: 1,
          prodName: searchKeyword || undefined,
          size: PROMOTION_PRODUCTS_PAGE_SIZE,
          sort: mapPromotionProductsSort(activeFilter, selectedOptions)
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
  }, [activeFilter, api, searchKeyword, selectedOptions]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
  }

  return (
    <StandardNavPage title="推广商品" backHref="/promotion" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.notice} aria-label="达人佣金膨胀提示">
        <span aria-hidden="true" className={styles.noticeBadge}>V3</span>
        <span>
          您是平台的<span>“黄金达人”</span>，带货佣金每单将膨胀<span>50%</span>
        </span>
      </section>
      <form className={styles.searchBox} role="search" onSubmit={handleSearchSubmit}>
        <span aria-hidden="true" className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} />
        <input name="keyword" placeholder="请输入商品名称搜索" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        <button type="submit">搜索</button>
      </form>
      <DropdownFilterBar
        className={styles.filterBar}
        expandedKey={expandedFilter}
        items={createFilterItems(activeFilter, selectedOptions)}
        onItemSelect={filterState.onItemSelect}
        onOptionSelect={filterState.onOptionSelect}
        onRequestClose={filterState.closeDropdown}
      />
      <main key={`${activeFilter}-${Object.values(selectedOptions).join("-")}`} className={styles.list} aria-label="推广商品列表">
        {pageState.products.length === 0 && pageState.status !== "loading" ? <EmptyState className={styles.emptyState} text="暂无推广商品" /> : null}
        {pageState.products.map((product) => (
          <PromotionProductCard key={product.id} bridge={bridge} product={product} />
        ))}
        <PromotionProductsLoadMore state={pageState} onLoadMore={() => loadProducts({ append: true })} />
      </main>
    </StandardNavPage>
  );
}

function hasDropdownOptions(filter: PromotionProductsFilter) {
  return filter === "category" || filter === "commission" || filter === "property" || filter === "price";
}

function createFilterItems(filter: PromotionProductsFilter, selectedOptions: Record<string, string>): DropdownFilterBarItem[] {
  const commissionOptions = ["commission_amount_desc", "commission_amount_asc", "commission_rate_desc", "commission_rate_asc"];

  return [
    {
      key: "category",
      label: "商品分类",
      href: "/promotion/products?filter=category",
      active: filter === "category",
      selectedOptionKey: selectedOptions.category,
      options: promotionProductFilters.categories.map((label, index) => ({
        key: label,
        label,
        href: `/promotion/products?category=${encodeURIComponent(label)}`,
        selected: selectedOptions.category ? selectedOptions.category === label : index === 1
      }))
    },
    {
      key: "commission",
      label: "佣金属性",
      href: "/promotion/products?filter=commission",
      active: filter === "commission",
      selectedOptionKey: selectedOptions.commission,
      options: promotionProductFilters.commissions.map((label, index) => ({
        key: commissionOptions[index] ?? label,
        label,
        href: `/promotion/products?commissionSort=${index}`,
        selected: selectedOptions.commission === (commissionOptions[index] ?? label)
      }))
    },
    {
      key: "property",
      label: "商品属性",
      href: "/promotion/products?filter=property",
      active: filter === "property",
      selectedOptionKey: selectedOptions.property,
      options: promotionProductFilters.properties.map((label, index) => ({
        key: label,
        label,
        href: `/promotion/products?property=${index}`,
        selected: selectedOptions.property ? selectedOptions.property === label : index === 0
      }))
    },
    {
      key: "sales",
      label: "销量",
      href: "/promotion/products?filter=sales",
      active: filter === "sales",
      showCaret: false
    },
    {
      key: "price",
      label: "价格",
      href: "/promotion/products?filter=price",
      active: filter === "price",
      selectedOptionKey: selectedOptions.price,
      options: [
        { key: "price_asc", label: "价格从低到高", href: "/promotion/products?priceSort=asc", selected: selectedOptions.price === "price_asc" },
        { key: "price_desc", label: "价格从高到低", href: "/promotion/products?priceSort=desc", selected: selectedOptions.price === "price_desc" }
      ]
    }
  ];
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

function getPromotionProducts(filter: PromotionProductsFilter, selectedOptions: Record<string, string>, sourceProducts: PromotionProductItem[]) {
  const products = sourceProducts.map((product, index) => {
    const categoryText = selectedOptions.category && filter === "category" ? `${selectedOptions.category} · ` : "";
    const propertyBoost = filter === "property" && selectedOptions.property !== "全部商品" ? `【${selectedOptions.property}】` : "";

    return {
      ...product,
      id: `${product.id}-${filter}-${selectedOptions.category}-${selectedOptions.commission}-${selectedOptions.property}-${selectedOptions.price}`,
      title: `${categoryText}${propertyBoost}${product.title}`,
      sales: product.sales + (filter === "sales" ? (sourceProducts.length - index) * 18 : 0),
      estimatedCommission: product.estimatedCommission + (filter === "commission" ? index * 4 : 0),
      userPrice: product.userPrice + (filter === "price" ? index * 12 : 0)
    };
  });

  if (filter === "price") {
    return [...products].sort((a, b) => selectedOptions.price === "price_desc" ? b.userPrice - a.userPrice : a.userPrice - b.userPrice);
  }

  if (filter === "commission") {
    return [...products].sort((a, b) =>
      selectedOptions.commission.includes("asc")
        ? a.estimatedCommission - b.estimatedCommission
        : b.estimatedCommission - a.estimatedCommission
    );
  }

  if (filter === "sales") {
    return [...products].sort((a, b) => b.sales - a.sales);
  }

  return products;
}

export function mapPromotionProductsSort(filter: PromotionProductsFilter, selectedOptions: Record<string, string>) {
  if (filter === "price") {
    return selectedOptions.price === "price_desc" ? 2 : 3;
  }
  if (filter === "commission") {
    if (selectedOptions.commission === "commission_amount_asc") {
      return 5;
    }
    if (selectedOptions.commission === "commission_rate_desc") {
      return 6;
    }
    if (selectedOptions.commission === "commission_rate_asc") {
      return 7;
    }
    return 4;
  }
  return 1;
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
