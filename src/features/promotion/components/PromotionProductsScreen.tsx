"use client";

import { useMemo } from "react";

import { DropdownFilterBar, ProductImagePlaceholder, StandardNavPage, useDropdownFilterBarState } from "@/design-system";
import type { DropdownFilterBarItem } from "@/design-system";
import { createWindowProtocolBridge, type NativeEventMap, type ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { localAssetUrl } from "@/lib/assets";

import { promotionProductFilters, promotionProducts, type PromotionProductItem, type PromotionProductsFilter } from "../mock/products";
import styles from "./PromotionProductsScreen.module.css";

type PromotionProductsScreenProps = {
  filter?: PromotionProductsFilter;
};

export function PromotionProductsScreen({ filter = "none" }: PromotionProductsScreenProps) {
  const bridge = useMemo(() => createWindowProtocolBridge(), []);
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
  const products = useMemo(
    () => getPromotionProducts(activeFilter, selectedOptions),
    [activeFilter, selectedOptions]
  );

  return (
    <StandardNavPage title="推广商品" backHref="/promotion" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.notice} aria-label="达人佣金膨胀提示">
        <span aria-hidden="true" className={styles.noticeBadge}>V3</span>
        <span>
          您是平台的<span>“黄金达人”</span>，带货佣金每单将膨胀<span>50%</span>
        </span>
      </section>
      <form className={styles.searchBox} role="search">
        <span aria-hidden="true" className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} />
        <input name="keyword" placeholder="请输入商品名称搜索" type="search" />
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
        {products.map((product) => (
          <PromotionProductCard key={product.id} bridge={bridge} product={product} />
        ))}
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

function getPromotionProducts(filter: PromotionProductsFilter, selectedOptions: Record<string, string>) {
  const products = promotionProducts.map((product, index) => {
    const categoryText = selectedOptions.category && filter === "category" ? `${selectedOptions.category} · ` : "";
    const propertyBoost = filter === "property" && selectedOptions.property !== "全部商品" ? `【${selectedOptions.property}】` : "";

    return {
      ...product,
      id: `${product.id}-${filter}-${selectedOptions.category}-${selectedOptions.commission}-${selectedOptions.property}-${selectedOptions.price}`,
      title: `${categoryText}${propertyBoost}${product.title}`,
      sales: product.sales + (filter === "sales" ? (promotionProducts.length - index) * 18 : 0),
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

type PromotionShareBridge = Pick<ProtocolBridge, "emit" | "isAvailable">;

export function buildPromotionSharePayload(product: PromotionProductItem): NativeEventMap["share"] {
  return {
    productId: "1001",
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
  return (
    <article className={styles.card}>
      <ProductImagePlaceholder decorative className={styles.productImage} />
      <div className={styles.cardInfo}>
        <h2>{product.title}</h2>
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
            收藏
          </button>
        </div>
      </div>
    </article>
  );
}
