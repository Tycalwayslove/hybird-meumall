"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

import { AppScreen, DropdownFilterBar, ProductImagePlaceholder, StandardNavPage, useDropdownFilterBarState } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { buildClientHref } from "@/lib/navigation";

import type { SearchFilterState, SearchPageData, SearchProduct, SearchResultProduct } from "../types";
import styles from "./SearchScreen.module.css";

type SearchScreenProps = {
  data: SearchPageData;
  filter?: SearchFilterState;
  initialShowClearDialog?: boolean;
  query?: string;
};

export function SearchScreen({ data, filter = "none", initialShowClearDialog = false, query = "" }: SearchScreenProps) {
  if (query) {
    return <SearchResultScreen data={data} filter={filter} query={query} />;
  }

  return <SearchHomeScreen data={data} initialShowClearDialog={initialShowClearDialog} />;
}

export function SearchRankingScreen({ data }: { data: SearchPageData }) {
  const [activeRankingTab, setActiveRankingTab] = useState(data.activeRankingTab);
  const products = useMemo(() => getRankingProductsForTab(data, activeRankingTab), [activeRankingTab, data]);

  return (
    <StandardNavPage title="喵呜热榜" backHref="/search" contentClassName={styles.rankingPage}>
      <div className={styles.rankingTabsSticky}>
        <RankingTabs activeTab={activeRankingTab} data={data} onTabSelect={setActiveRankingTab} />
      </div>
      <div className={styles.fullRankingList}>
        {[...products, ...products].map((product, index) => (
          <RankingProductCard key={`${product.id}-${index}`} product={{ ...product, id: `${product.id}-${index}` }} rank={index + 1} />
        ))}
      </div>
    </StandardNavPage>
  );
}

function SearchHomeScreen({ data, initialShowClearDialog }: { data: SearchPageData; initialShowClearDialog: boolean }) {
  const [showClearDialog, setShowClearDialog] = useState(initialShowClearDialog);
  const [activeRankingTab, setActiveRankingTab] = useState(data.activeRankingTab);
  const rankingProducts = useMemo(() => getRankingProductsForTab(data, activeRankingTab), [activeRankingTab, data]);

  return (
    <AppScreen className={styles.screen} contentClassName={styles.viewport}>
      <SearchHeader placeholder="请输入商品名称搜索" />

      <main className={styles.content}>
        <div className={styles.keywordPanel}>
          <KeywordSection keywords={data.hotKeywords} title="热门搜索" />
          <KeywordSection
            action={
              <button
                aria-label="清空搜索历史"
                className={styles.clearButton}
                style={{ backgroundImage: `url(${localAssetUrl("common.icon.delete")})` }}
                type="button"
                onClick={() => setShowClearDialog(true)}
              />
            }
            keywords={data.historyKeywords}
            title="搜索历史"
          />
        </div>

        <section aria-labelledby="search-ranking-title" className={styles.ranking}>
          <h2 className="sr-only" id="search-ranking-title">
            搜索热榜
          </h2>
          <RankingTabs activeTab={activeRankingTab} data={data} onTabSelect={setActiveRankingTab} />
          <div className={styles.rankingBody}>
            <p className={styles.notice}>
              <span aria-hidden="true" className={styles.noticeLeaf} />
              <span>{activeRankingTab === data.activeRankingTab ? data.rankingNotice : `${activeRankingTab}榜单 · 每日热卖 · 实时更新`}</span>
              <span aria-hidden="true" className={`${styles.noticeLeaf} ${styles.noticeLeafEnd}`} />
            </p>
            <div key={activeRankingTab} className={styles.productList}>
              {rankingProducts.map((product, index) => (
                <RankingProductCard key={product.id} product={product} rank={index + 1} />
              ))}
            </div>
            <Link className={styles.moreRankingButton} href="/search/ranking">
              查看完整榜单
            </Link>
          </div>
        </section>
      </main>

      {showClearDialog ? (
        <div className={styles.dialogMask} role="presentation">
          <div aria-modal="true" className={styles.dialog} role="dialog">
            <p className={styles.dialogTitle}>确认删除全部历史记录？</p>
            <div className={styles.dialogActions}>
              <button type="button" onClick={() => setShowClearDialog(false)}>
                取消
              </button>
              <button type="button" onClick={() => setShowClearDialog(false)}>
                确认
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppScreen>
  );
}

function SearchResultScreen({ data, filter, query }: { data: SearchPageData; filter: SearchFilterState; query: string }) {
  const filterState = useDropdownFilterBarState<SearchFilterState>({
    initialActiveKey: filter === "none" ? "sales" : filter,
    initialExpandedKey: isSearchDropdownFilter(filter) ? filter : null,
    initialSelectedOptions: {
      category: data.categories[1] ?? data.categories[0] ?? "",
      price: "price_asc"
    },
    isDropdownKey: isSearchDropdownFilter
  });
  const { activeKey: activeFilter, expandedKey: expandedFilter, selectedOptions } = filterState;
  const resultProducts = useMemo(
    () => getSearchResultProducts(data.resultProducts, activeFilter, selectedOptions),
    [activeFilter, data.resultProducts, selectedOptions]
  );
  const filterItems = useMemo(
    () => [
      { key: "sales", label: "销量", href: `/search?q=${encodeURIComponent(query)}`, active: activeFilter === "sales", showCaret: false },
      {
        key: "price",
        label: "价格",
        href: `/search?q=${encodeURIComponent(query)}&filter=price`,
        active: activeFilter === "price",
        selectedOptionKey: selectedOptions.price,
        options: [
          {
            key: "price_asc",
            label: "价格从低到高",
            href: `/search?q=${encodeURIComponent(query)}&sort=price_asc`,
            selected: selectedOptions.price === "price_asc"
          },
          {
            key: "price_desc",
            label: "价格从高到低",
            href: `/search?q=${encodeURIComponent(query)}&sort=price_desc`,
            selected: selectedOptions.price === "price_desc"
          }
        ]
      },
      {
        key: "category",
        label: "分类",
        href: `/search?q=${encodeURIComponent(query)}&filter=category`,
        active: activeFilter === "category",
        selectedOptionKey: selectedOptions.category,
        options: data.categories.map((category, index) => ({
          key: category,
          label: category,
          href: `/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`,
          selected: selectedOptions.category ? selectedOptions.category === category : index === 1
        }))
      }
    ],
    [activeFilter, data.categories, query, selectedOptions.category, selectedOptions.price]
  );

  return (
    <AppScreen className={styles.resultScreen} contentClassName={styles.resultViewport}>
      <div className={styles.resultFixedControls}>
        <SearchHeader value={query} />
        <DropdownFilterBar
          className={styles.resultFilterBar}
          expandedKey={expandedFilter}
          items={filterItems}
          onItemSelect={filterState.onItemSelect}
          onOptionSelect={filterState.onOptionSelect}
          onRequestClose={filterState.closeDropdown}
        />
      </div>
      <main key={`${activeFilter}-${selectedOptions.category}-${selectedOptions.price}`} className={styles.resultGrid} aria-label="搜索结果">
        {resultProducts.map((product) => (
          <SearchResultProductCard key={product.id} product={product} />
        ))}
      </main>
    </AppScreen>
  );
}

function isSearchDropdownFilter(filter: SearchFilterState) {
  return filter === "price" || filter === "category";
}

function SearchHeader({ placeholder, value }: { placeholder?: string; value?: string }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get("q") ?? "").trim();
    if (!keyword) {
      return;
    }

    if (typeof window !== "undefined") {
      window.location.replace(buildClientHref(`/search?q=${encodeURIComponent(keyword)}`));
    }
  }

  return (
    <header className={styles.header}>
      <Link aria-label="返回" className={styles.backLink} href="/" />
      <form className={styles.searchForm} method="get" role="search" onSubmit={handleSubmit}>
        <span aria-hidden="true" className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} />
        <input
          className={styles.searchInput}
          defaultValue={value}
          name="q"
          placeholder={placeholder}
          type="search"
        />
        {value ? (
          <button
            aria-label="清空搜索词"
            className={styles.closeSearchButton}
            style={{ backgroundImage: `url(${localAssetUrl("common.icon.close")})` }}
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.replace(buildClientHref("/search"));
              }
            }}
          />
        ) : null}
        <button className={styles.searchButton} type="submit">
          搜索
        </button>
      </form>
    </header>
  );
}

function KeywordSection({
  action,
  keywords,
  title
}: {
  action?: ReactNode;
  keywords: string[];
  title: string;
}) {
  return (
    <section className={styles.keywordSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {action}
      </div>
      <div className={styles.chips}>
        {keywords.map((keyword, index) => (
          <Link key={`${keyword}-${index}`} className={styles.chip} href={`/search?q=${encodeURIComponent(keyword)}`}>
            {keyword}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RankingTabs({ activeTab, data, onTabSelect }: { activeTab: string; data: SearchPageData; onTabSelect: (tab: string) => void }) {
  return (
    <nav aria-label="热榜分类" className={styles.tabs}>
      {data.rankingTabs.map((tab) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            aria-current={active ? "page" : undefined}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
            type="button"
            onClick={() => onTabSelect(tab)}
          >
            {tab}
          </button>
        );
      })}
    </nav>
  );
}

function RankingProductCard({ product, rank }: { product: SearchProduct; rank: number }) {
  return (
    <Link className={styles.productCard} href={product.href}>
      <div className={styles.productInner}>
        <ProductImagePlaceholder decorative className={styles.productVisual}>
          {rank <= 3 ? <span className={`${styles.rankFlag} ${styles[`rankFlag${rank}`]}`}>TOP<br />{rank}</span> : null}
        </ProductImagePlaceholder>
        <div className={styles.productInfo}>
          <h3 className={styles.productTitle}>
            <ProductBadge product={product} />
            {product.title}
          </h3>
          <p className={styles.feature}>{product.feature}</p>
          <div className={styles.priceRow}>
            <p className={styles.priceGroup}>
              <span className={styles.price}>
                <span className={styles.currency}>￥</span>
                {product.price}
              </span>
              <span className={styles.originalPrice}>￥{product.originalPrice}</span>
            </p>
            <p className={styles.sold}>{product.soldText}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchResultProductCard({ product }: { product: SearchResultProduct }) {
  return (
    <Link className={styles.resultCard} href={product.href}>
      <ProductImagePlaceholder decorative className={styles.resultVisual}>
        <span className={styles.cornerTag}>{product.tag}</span>
      </ProductImagePlaceholder>
      <div className={styles.resultCardBody}>
        <h3 className={styles.resultTitle}>{product.title}</h3>
        <p className={styles.resultFeature}>{product.feature}</p>
        <div className={styles.resultMeta}>
          <ProductBadge product={product} />
          <span>{product.soldText}</span>
        </div>
        <p className={styles.resultPrice}>
          <span className={styles.currency}>￥</span>
          {product.price}
          <span>￥{product.originalPrice}</span>
        </p>
      </div>
    </Link>
  );
}

function ProductBadge({ product }: { product: SearchProduct }) {
  if (product.badge.type === "seckill") {
    return <span className={`${styles.badge} ${styles.seckillBadge}`}>{product.badge.label}</span>;
  }

  return (
    <span className={styles.badge}>
      <span className={styles.talentBadgeMain}>{product.badge.label}</span>
      <span className={styles.talentBadgeLevel}>{product.badge.level}</span>
    </span>
  );
}

function getRankingProductsForTab(data: SearchPageData, activeTab: string) {
  const tabIndex = Math.max(0, data.rankingTabs.indexOf(activeTab));

  if (tabIndex === 0) {
    return data.products;
  }

  return data.products.map((product, index) => {
    const priceOffset = tabIndex * 16 + index * 9;
    const soldText = index === 0 ? `已售: ${tabIndex + 1}.${index + 8}w+` : `已售: ${tabIndex * 1200 + (index + 2) * 600}+`;

    return {
      ...product,
      id: `${product.id}-${activeTab}`,
      feature: `${activeTab}热卖 · ${product.feature}`,
      price: product.price + priceOffset,
      soldText
    };
  });
}

function getSearchResultProducts(products: SearchResultProduct[], activeFilter: SearchFilterState, selectedOptions: Record<string, string>) {
  const nextProducts = products.map((product, index) => {
    if (activeFilter === "category" && selectedOptions.category) {
      return {
        ...product,
        id: `${product.id}-${selectedOptions.category}`,
        feature: `${selectedOptions.category} · ${product.feature}`,
        tag: index % 3 === 0 ? "推荐" as const : product.tag
      };
    }

    return product;
  });

  if (activeFilter === "price") {
    return [...nextProducts].sort((a, b) =>
      selectedOptions.price === "price_desc" ? b.price - a.price : a.price - b.price
    );
  }

  if (activeFilter === "sales") {
    return [...nextProducts].sort((a, b) => b.soldText.localeCompare(a.soldText, "zh-Hans-CN"));
  }

  return nextProducts;
}
