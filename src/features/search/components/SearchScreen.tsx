"use client";

import Link from "next/link";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppScreen, EmptyState, ProductImagePlaceholder, Skeleton, StandardNavPage } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createSearchApi } from "../api";
import { addSearchHistoryKeyword, clearSearchHistoryKeywords, readSearchHistoryKeywords, removeSearchHistoryKeyword } from "../search-history";
import type { SearchProductsBffData, SearchRankingBffData } from "../server/search-real-service";
import type { SearchFilterState, SearchPageData, SearchProduct, SearchRankingTab, SearchResultProduct } from "../types";
import styles from "./SearchScreen.module.css";

type SearchScreenProps = {
  categoryId?: string;
  data: SearchPageData;
  filter?: SearchFilterState;
  initialShowClearDialog?: boolean;
  query?: string;
};

export function SearchScreen({ categoryId = "", data, filter = "none", initialShowClearDialog = false, query = "" }: SearchScreenProps) {
  if (query || categoryId) {
    return <SearchResultScreen categoryId={categoryId} data={data} filter={filter} key={`${categoryId}:${query}`} query={query} />;
  }

  return <SearchHomeScreen data={data} initialShowClearDialog={initialShowClearDialog} />;
}

export function SearchRankingScreen({ data, initialCategoryId, initialRankType }: { data: SearchPageData; initialCategoryId?: string; initialRankType?: 1 | 2 }) {
  const ranking = useSearchRanking(data, { initialCategoryId, initialRankType });

  return (
    <StandardNavPage title="喵呜热榜" backHref="/search" contentClassName={styles.rankingPage}>
      <div className={styles.rankingTabsSticky}>
        <RankingTabs activeTabId={ranking.activeTabId} tabs={ranking.tabs} onTabSelect={ranking.loadRanking} />
      </div>
      <RankingProducts
        emptyText="暂无榜单商品"
        onRetry={ranking.reloadRanking}
        products={ranking.products}
        status={ranking.status}
        variant="full"
      />
    </StandardNavPage>
  );
}

function SearchHomeScreen({ data, initialShowClearDialog }: { data: SearchPageData; initialShowClearDialog: boolean }) {
  const [showClearDialog, setShowClearDialog] = useState(initialShowClearDialog);
  const [hotKeywords, setHotKeywords] = useState(data.hotKeywords);
  const [hotKeywordsStatus, setHotKeywordsStatus] = useState<"loading" | "success" | "error">(data.hotKeywords.length > 0 ? "success" : "loading");
  const [historyKeywords, setHistoryKeywords] = useState(data.historyKeywords);
  const ranking = useSearchRanking(data, { categoryBoardCount: 4 });
  const activeRankingTab = ranking.tabs.find((tab) => tab.id === ranking.activeTabId);
  const fullRankingHref = buildSearchRankingHref(activeRankingTab);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHistoryKeywords(readSearchHistoryKeywords());
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (data.hotKeywords.length > 0) {
      return;
    }

    let disposed = false;
    const api = createSearchApi(createH5Client());

    api.getHotKeywords(1)
      .then((result) => {
        if (disposed) {
          return;
        }
        if (result.success) {
          setHotKeywords(result.data.view.hotKeywords);
          setHotKeywordsStatus("success");
          return;
        }
        setHotKeywordsStatus("error");
      })
      .catch(() => {
        if (!disposed) {
          setHotKeywordsStatus("error");
        }
      });

    return () => {
      disposed = true;
    };
  }, [data.hotKeywords.length]);

  function handleKeywordSearch(keyword: string) {
    setHistoryKeywords(addSearchHistoryKeyword(getBrowserStorage(), keyword));
  }

  function handleClearHistory() {
    clearSearchHistoryKeywords();
    setHistoryKeywords([]);
    setShowClearDialog(false);
  }

  function handleDeleteHistoryKeyword(keyword: string) {
    setHistoryKeywords(removeSearchHistoryKeyword(getBrowserStorage(), keyword));
  }

  return (
    <AppScreen className={styles.screen} contentClassName={styles.viewport}>
      <SearchHeader placeholder="请输入商品名称搜索" onSearch={handleKeywordSearch} />

      <main className={styles.content}>
        <div className={styles.keywordPanel}>
          <KeywordSection
            emptyText={hotKeywordsStatus === "error" ? "热门搜索加载失败" : "暂无热门搜索"}
            isLoading={hotKeywordsStatus === "loading"}
            keywords={hotKeywords}
            title="热门搜索"
            onKeywordSelect={handleKeywordSearch}
          />
          <KeywordSection
            action={historyKeywords.length > 0 ? (
              <button
                aria-label="清空搜索历史"
                className={styles.clearButton}
                style={{ backgroundImage: `url(${localAssetUrl("common.icon.delete")})` }}
                type="button"
                onClick={() => setShowClearDialog(true)}
              />
            ) : null}
            emptyText="暂无搜索历史"
            keywords={historyKeywords}
            title="搜索历史"
            onKeywordDelete={handleDeleteHistoryKeyword}
            onKeywordSelect={handleKeywordSearch}
          />
        </div>

        <section aria-labelledby="search-ranking-title" className={styles.ranking}>
          <h2 className="sr-only" id="search-ranking-title">
            搜索热榜
          </h2>
          <RankingTabs activeTabId={ranking.activeTabId} tabs={ranking.tabs} onTabSelect={ranking.loadRanking} />
          <div className={styles.rankingBody}>
            <p className={styles.notice}>
              <span aria-hidden="true" className={styles.noticeLeaf} />
              <span>{ranking.notice || "官方榜单 · 近30天销量 · 实时更新"}</span>
              <span aria-hidden="true" className={`${styles.noticeLeaf} ${styles.noticeLeafEnd}`} />
            </p>
            <RankingProducts
              emptyText="暂无榜单商品"
              limit={3}
              onRetry={ranking.reloadRanking}
              products={ranking.products}
              status={ranking.status}
            />
            <Link className={styles.moreRankingButton} href={fullRankingHref} onClick={(event) => handleSearchExitNavigation(event, fullRankingHref)}>
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
              <button type="button" onClick={handleClearHistory}>
                确认
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppScreen>
  );
}

type SearchProductsStatus = "empty" | "error" | "loading" | "success";

type SearchCategoryOption = SearchProductsBffData["view"]["categories"][number];
type SearchSortField = "price" | "soldNum";
type SearchSortDirection = "asc" | "desc";
type SearchSortState = {
  direction: SearchSortDirection;
  field: SearchSortField;
};

function SearchResultScreen({ categoryId, data, filter, query }: { categoryId: string; data: SearchPageData; filter: SearchFilterState; query: string }) {
  const categoryScopeId = categoryId.trim();
  void data;
  const [searchKeyword, setSearchKeyword] = useState(query);
  const [categoryLevels, setCategoryLevels] = useState<SearchCategoryOption[][]>([]);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(filter === "category");
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string[]>([]);
  const [pendingCategoryPath, setPendingCategoryPath] = useState<string[]>([]);
  const [products, setProducts] = useState<SearchResultProduct[]>([]);
  const [page, setPage] = useState<SearchProductsBffData["page"]>({ current: 1, hasMore: false, size: 10 });
  const [sortState, setSortState] = useState<SearchSortState>(filter === "price" ? { direction: "asc", field: "price" } : { direction: "desc", field: "soldNum" });
  const [status, setStatus] = useState<SearchProductsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("商品加载失败");
  const autoLoadRef = useRef<HTMLDivElement | null>(null);
  const api = useMemo(() => createSearchApi(createH5Client()), []);
  const { categoryOptionsParentId, selectedCategoryId } = getSearchCategoryRequestState({
    appliedCategoryPath: selectedCategoryPath,
    categoryScopeId
  });
  const orderBy = getSearchSortOrderBy(sortState);
  const canAutoLoadNextPage = shouldAutoLoadNextSearchPage({
    hasMore: page.hasMore,
    productCount: products.length,
    status
  });

  useEffect(() => {
    if (searchKeyword) {
      addSearchHistoryKeyword(getBrowserStorage(), searchKeyword);
    }
  }, [searchKeyword]);

  useEffect(() => {
    if (!isCategoryPanelOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCategoryPanelOpen]);

  useEffect(() => {
    let disposed = false;
    const timer = window.setTimeout(() => {
      setStatus("loading");

      api.getProducts({
        categoryOptionsParentId,
        categoryId: selectedCategoryId,
        current: 1,
        keyword: searchKeyword,
        orderBy,
        scopeCategoryId: categoryScopeId,
        size: page.size
      }).then((result) => {
        if (disposed) {
          return;
        }
        if (!result.success) {
          setErrorMessage(result.message);
          setStatus("error");
          return;
        }
        applySearchProducts(result.data, { append: false });
      }).catch(() => {
        if (!disposed) {
          setErrorMessage("商品加载失败");
          setStatus("error");
        }
      });
    }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, categoryOptionsParentId, categoryScopeId, orderBy, searchKeyword, selectedCategoryId]);

  function applySearchProducts(nextData: SearchProductsBffData, options: { append: boolean }) {
    setCategoryLevels((current) =>
      buildNextSearchCategoryLevels({
        levels: current,
        nextCategories: nextData.view.categories,
        selectedPath: selectedCategoryPath
      })
    );
    setPage(nextData.page);
    setProducts((current) => (options.append ? [...current, ...nextData.view.products] : nextData.view.products));
    setStatus(nextData.view.products.length > 0 || options.append ? "success" : "empty");
  }

  async function loadNextPage() {
    setStatus("loading");
    const result = await api.getProducts({
      categoryOptionsParentId,
      categoryId: selectedCategoryId,
      current: page.current + 1,
      keyword: searchKeyword,
      orderBy,
      scopeCategoryId: categoryScopeId,
      size: page.size
    }).catch(() => null);
    if (!result?.success) {
      setErrorMessage(result?.message ?? "商品加载失败");
      setStatus("error");
      return;
    }
    applySearchProducts(result.data, { append: true });
  }

  useEffect(() => {
    if (!canAutoLoadNextPage || typeof IntersectionObserver === "undefined") {
      return;
    }

    const target = autoLoadRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAutoLoadNextPage, categoryOptionsParentId, categoryScopeId, orderBy, page.current, page.size, searchKeyword, selectedCategoryId]);

  function handleResultSearch(keyword: string) {
    addSearchHistoryKeyword(getBrowserStorage(), keyword);
    setSearchKeyword(keyword);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", buildClientHref(buildSearchResultHref({ categoryId: categoryScopeId, keyword })));
    }
    return true;
  }

  function handleResultClear() {
    setSearchKeyword("");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", buildClientHref(categoryScopeId ? buildSearchResultHref({ categoryId: categoryScopeId }) : "/search"));
    }
    return true;
  }

  function handleSortSelect(field: SearchSortField) {
    setSortState((current) => getNextSearchSortState(current, field));
    setIsCategoryPanelOpen(false);
  }

  function handleCategorySelect(category: SearchCategoryOption, levelIndex: number) {
    setPendingCategoryPath((current) => [...current.slice(0, levelIndex), category.id]);
    setCategoryLevels((current) => {
      const retainedLevels = current.slice(0, levelIndex + 1);
      return category.children && category.children.length > 0 ? [...retainedLevels, category.children] : retainedLevels;
    });
    setIsCategoryPanelOpen(true);
  }

  function handleCategoryPanelToggle() {
    setIsCategoryPanelOpen((current) => {
      const next = !current;
      if (next) {
        setPendingCategoryPath(selectedCategoryPath);
      }
      return next;
    });
  }

  function handleCategoryConfirm() {
    setSelectedCategoryPath((current) => (areSearchCategoryPathsEqual(current, pendingCategoryPath) ? current : pendingCategoryPath));
    setIsCategoryPanelOpen(false);
  }

  function handleCategoryReset() {
    setPendingCategoryPath([]);
    setSelectedCategoryPath((current) => (current.length === 0 ? current : []));
    setCategoryLevels((current) => (current.length > 0 ? [current[0]] : current));
    setIsCategoryPanelOpen(false);
  }

  return (
    <AppScreen
      className={styles.resultScreen}
      contentClassName={`${styles.resultViewport} ${isCategoryPanelOpen ? styles.resultViewportLocked : ""}`}
    >
      {isCategoryPanelOpen ? <button aria-label="关闭分类筛选" className={styles.categoryCascadeOverlay} type="button" onClick={() => setIsCategoryPanelOpen(false)} /> : null}
      <div className={styles.resultFixedControls}>
        <SearchHeader
          scopeCategoryId={categoryScopeId}
          submitMode={getSearchSubmitMode({ isResultPage: true })}
          value={searchKeyword}
          onClear={handleResultClear}
          onSearch={handleResultSearch}
        />
        <SearchResultFilterBar
          categoryLevels={categoryLevels}
          isCategoryPanelOpen={isCategoryPanelOpen}
          pendingCategoryPath={pendingCategoryPath}
          selectedCategoryPath={selectedCategoryPath}
          sortState={sortState}
          onCategoryConfirm={handleCategoryConfirm}
          onCategoryPanelToggle={handleCategoryPanelToggle}
          onCategoryReset={handleCategoryReset}
          onCategorySelect={handleCategorySelect}
          onSortSelect={handleSortSelect}
        />
      </div>
      <main className={styles.resultGrid} aria-label="搜索结果">
        {products.map((product) => (
          <SearchResultProductCard key={product.id} product={product} />
        ))}
        {status === "loading" && products.length === 0 ? <SearchProductsSkeleton /> : null}
        {status === "empty" ? <EmptyState className={styles.resultEmptyState} imageSize={128} text="暂无相关商品" textSize={13} /> : null}
        {status === "error" ? (
          <div className={styles.resultState}>
            <p className={styles.resultErrorText}>{errorMessage}</p>
            <button className={styles.resultRetryButton} type="button" onClick={() => window.location.reload()}>
              重新加载
            </button>
          </div>
        ) : null}
        {status !== "error" && products.length > 0 && page.hasMore ? (
          <div className={styles.resultAutoLoadSentinel} data-search-auto-load-sentinel="true" ref={autoLoadRef}>
            {status === "loading" ? "加载中..." : "继续下滑加载"}
          </div>
        ) : null}
      </main>
    </AppScreen>
  );
}

export function shouldAutoLoadNextSearchPage({
  hasMore,
  productCount,
  status
}: {
  hasMore: boolean;
  productCount: number;
  status: SearchProductsStatus;
}) {
  return hasMore && productCount > 0 && status === "success";
}

function SearchResultFilterBar({
  categoryLevels,
  isCategoryPanelOpen,
  pendingCategoryPath,
  selectedCategoryPath,
  sortState,
  onCategoryConfirm,
  onCategoryPanelToggle,
  onCategoryReset,
  onCategorySelect,
  onSortSelect
}: {
  categoryLevels: SearchCategoryOption[][];
  isCategoryPanelOpen: boolean;
  pendingCategoryPath: string[];
  selectedCategoryPath: string[];
  sortState: SearchSortState;
  onCategoryConfirm: () => void;
  onCategoryPanelToggle: () => void;
  onCategoryReset: () => void;
  onCategorySelect: (category: SearchCategoryOption, levelIndex: number) => void;
  onSortSelect: (field: SearchSortField) => void;
}) {
  return (
    <div className={styles.resultFilterBar}>
      <div className={styles.resultFilterShell}>
        <div className={styles.resultFilterIntro}>
          <span className={styles.resultFilterEyebrow}>综合筛选</span>
          <span className={styles.resultFilterSummary}>{buildSearchFilterSummary({ selectedCategoryPath, sortState })}</span>
        </div>
        <nav aria-label="搜索结果筛选" className={styles.resultFilterNav}>
          <SearchSortButton field="soldNum" label="销量" sortState={sortState} onSelect={onSortSelect} />
          <SearchSortButton field="price" label="价格" sortState={sortState} onSelect={onSortSelect} />
          <button
            aria-expanded={isCategoryPanelOpen}
            aria-pressed={isCategoryPanelOpen || selectedCategoryPath.length > 0}
            className={`${styles.resultFilterButton} ${isCategoryPanelOpen || selectedCategoryPath.length > 0 ? styles.resultFilterButtonActive : ""}`}
            type="button"
            onClick={onCategoryPanelToggle}
          >
            <span>分类</span>
            <span aria-hidden="true" className={`${styles.categoryCaret} ${isCategoryPanelOpen ? styles.categoryCaretOpen : ""}`} />
          </button>
        </nav>
      </div>
      {isCategoryPanelOpen ? (
        <div className={styles.categoryCascadePanel}>
          {categoryLevels.length > 0 && categoryLevels.some((level) => level.length > 0) ? (
            <div className={styles.categoryCascadeScroller}>
              {categoryLevels.map((level, levelIndex) => (
                <div className={styles.categoryCascadeLevel} key={levelIndex}>
                  <p className={styles.categoryCascadeLevelTitle}>{getSearchCategoryLevelTitle(levelIndex)}</p>
                  {level.map((category) => {
                    const selected = pendingCategoryPath[levelIndex] === category.id;
                    return (
                      <button
                        key={category.id}
                        aria-current={selected ? "true" : undefined}
                        className={`${styles.categoryCascadeOption} ${selected ? styles.categoryCascadeOptionActive : ""}`}
                        type="button"
                        onClick={() => onCategorySelect(category, levelIndex)}
                      >
                        <span>{category.label}</span>
                        {category.children && category.children.length > 0 ? <span aria-hidden="true" className={styles.categoryOptionArrow}>›</span> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className={styles.categoryCascadeLevelTitle}>一级类目</p>
              <p className={styles.categoryCascadeEmpty}>暂无分类</p>
            </div>
          )}
          <div className={styles.categoryCascadeActions}>
            <button className={styles.categoryCascadeReset} type="button" onClick={onCategoryReset}>
              重置
            </button>
            <button className={styles.categoryCascadeConfirm} type="button" onClick={onCategoryConfirm}>
              确认
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchSortButton({
  field,
  label,
  sortState,
  onSelect
}: {
  field: SearchSortField;
  label: string;
  sortState: SearchSortState;
  onSelect: (field: SearchSortField) => void;
}) {
  const active = sortState.field === field;
  return (
    <button
      aria-label={`${label}${active ? (sortState.direction === "asc" ? "升序" : "降序") : "升序"}`}
      aria-pressed={active}
      className={`${styles.resultFilterButton} ${active ? styles.resultFilterButtonActive : ""}`}
      type="button"
      onClick={() => onSelect(field)}
    >
      <span>{label}</span>
      <span aria-hidden="true" className={styles.sortArrows}>
        <span className={`${styles.sortArrow} ${active && sortState.direction === "asc" ? styles.sortArrowActive : ""}`}>↑</span>
        <span className={`${styles.sortArrow} ${active && sortState.direction === "desc" ? styles.sortArrowActive : ""}`}>↓</span>
      </span>
    </button>
  );
}

function SearchHeader({
  onClear,
  onSearch,
  placeholder,
  scopeCategoryId,
  submitMode = "navigate",
  value
}: {
  onClear?: () => boolean | void;
  onSearch?: (keyword: string) => boolean | void;
  placeholder?: string;
  scopeCategoryId?: string;
  submitMode?: ReturnType<typeof getSearchSubmitMode>;
  value?: string;
}) {
  const [inputValue, setInputValue] = useState(value ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = inputValue.trim();
    if (!keyword) {
      return;
    }
    const handled = onSearch?.(keyword);
    if (handled || submitMode === "local") {
      return;
    }

    if (typeof window !== "undefined") {
      window.location.replace(buildClientHref(buildSearchResultHref({ categoryId: scopeCategoryId, keyword })));
    }
  }

  return (
    <header className={styles.header}>
      <Link aria-label="返回" className={styles.backLink} href="/" />
      <form className={styles.searchForm} method="get" role="search" onSubmit={handleSubmit}>
        <span aria-hidden="true" className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} />
        <input
          className={styles.searchInput}
          name="q"
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={inputValue}
        />
        {inputValue ? (
          <button
            aria-label="清空搜索词"
            className={styles.closeSearchButton}
            style={{ backgroundImage: `url(${localAssetUrl("common.icon.close")})` }}
            type="button"
            onClick={() => {
              setInputValue("");
              const handled = onClear?.();
              if (handled) {
                return;
              }
              if (typeof window !== "undefined") {
                window.location.replace(buildClientHref(scopeCategoryId ? buildSearchResultHref({ categoryId: scopeCategoryId }) : "/search"));
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

export function getSearchSubmitMode({ isResultPage }: { isResultPage: boolean }) {
  return isResultPage ? "local" : "navigate";
}

function KeywordSection({
  action,
  emptyText,
  isLoading = false,
  keywords,
  title,
  onKeywordDelete,
  onKeywordSelect
}: {
  action?: ReactNode;
  emptyText?: string;
  isLoading?: boolean;
  keywords: string[];
  title: string;
  onKeywordDelete?: (keyword: string) => void;
  onKeywordSelect?: (keyword: string) => void;
}) {
  return (
    <section className={styles.keywordSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {action}
      </div>
      {isLoading ? <KeywordSkeleton /> : (
        keywords.length > 0 ? (
          <div className={styles.chips}>
            {keywords.map((keyword, index) => (
              onKeywordDelete ? (
                <span className={styles.historyChip} key={`${keyword}-${index}`}>
                  <Link
                    className={`${styles.chip} ${styles.historyChipLink}`}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    onClick={() => onKeywordSelect?.(keyword)}
                  >
                    {keyword}
                  </Link>
                  <button
                    aria-label={`删除搜索历史：${keyword}`}
                    className={styles.historyDeleteButton}
                    type="button"
                    onClick={() => onKeywordDelete(keyword)}
                  >
                    x
                  </button>
                </span>
              ) : (
                <Link
                  key={`${keyword}-${index}`}
                  className={styles.chip}
                  href={`/search?q=${encodeURIComponent(keyword)}`}
                  onClick={() => onKeywordSelect?.(keyword)}
                >
                  {keyword}
                </Link>
              )
            ))}
          </div>
        ) : <p className={styles.keywordEmpty}>{emptyText ?? "暂无数据"}</p>
      )}
    </section>
  );
}

function KeywordSkeleton() {
  return (
    <div className={styles.keywordSkeleton} data-search-hot-keywords-skeleton="true">
      <Skeleton className={styles.keywordSkeletonChip} />
      <Skeleton className={styles.keywordSkeletonChipShort} />
      <Skeleton className={styles.keywordSkeletonChip} />
      <Skeleton className={styles.keywordSkeletonChipShort} />
    </div>
  );
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}

type SearchExitClickEvent = Pick<MouseEvent<HTMLAnchorElement>, "altKey" | "button" | "ctrlKey" | "defaultPrevented" | "metaKey" | "preventDefault" | "shiftKey">;

export function handleSearchExitNavigation(
  event: SearchExitClickEvent,
  href: string,
  replaceLocation: (href: string) => void = defaultSearchExitReplace
) {
  if (event.defaultPrevented || shouldLetBrowserHandleSearchExit(event)) {
    return false;
  }

  event.preventDefault();
  replaceLocation(buildClientHref(href));
  return true;
}

function shouldLetBrowserHandleSearchExit(event: SearchExitClickEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function defaultSearchExitReplace(href: string) {
  if (typeof window !== "undefined") {
    window.location.replace(href);
  }
}

type RankingLoadStatus = "empty" | "error" | "loading" | "success";

function useSearchRanking(data: SearchPageData, options: { categoryBoardCount?: number; initialCategoryId?: string; initialRankType?: 1 | 2 } = {}) {
  const initialStatus: RankingLoadStatus = data.rankingTabs.length > 0 || data.products.length > 0 ? "success" : "loading";
  const [tabs, setTabs] = useState<SearchRankingTab[]>(data.rankingTabs);
  const [activeTabId, setActiveTabId] = useState(data.activeRankingTab || buildRankingTabId({ categoryId: options.initialCategoryId, rankType: options.initialRankType }));
  const [products, setProducts] = useState<SearchProduct[]>(data.products);
  const [notice, setNotice] = useState(data.rankingNotice);
  const [status, setStatus] = useState<RankingLoadStatus>(initialStatus);
  const api = useMemo(() => createSearchApi(createH5Client()), []);

  const applyRankingData = (rankingData: SearchRankingBffData["view"]) => {
    setTabs(rankingData.tabs);
    setActiveTabId(rankingData.activeTabId);
    setProducts(rankingData.products.map((product) => ({ ...product })));
    setNotice(rankingData.notice);
    setStatus(rankingData.products.length > 0 ? "success" : "empty");
  };

  const loadRanking = async (tab?: SearchRankingTab) => {
    if (tab) {
      setActiveTabId(tab.id);
    }
    setStatus("loading");
    const result = await api.getRanking({
      ...(options.categoryBoardCount === undefined ? {} : { categoryBoardCount: options.categoryBoardCount }),
      ...(tab
        ? { categoryId: tab.categoryId, rankType: tab.rankType }
        : {
            ...(options.initialCategoryId ? { categoryId: options.initialCategoryId } : {}),
            ...(options.initialRankType ? { rankType: options.initialRankType } : {})
          })
    }).catch(() => null);

    if (!result?.success) {
      setStatus("error");
      return;
    }

    applyRankingData(result.data.view);
  };

  useEffect(() => {
    if (data.rankingTabs.length > 0 || data.products.length > 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      void loadRanking();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    activeTabId,
    loadRanking,
    notice,
    products,
    reloadRanking: () => loadRanking(tabs.find((tab) => tab.id === activeTabId)),
    status,
    tabs
  };
}

function RankingTabs({ activeTabId, onTabSelect, tabs }: { activeTabId: string; onTabSelect: (tab: SearchRankingTab) => void; tabs: SearchRankingTab[] }) {
  return (
    <nav aria-label="热榜分类" className={styles.tabs}>
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            aria-disabled={active ? "true" : undefined}
            aria-current={active ? "page" : undefined}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
            type="button"
            onClick={() => {
              if (!active) {
                onTabSelect(tab);
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function RankingProducts({
  emptyText,
  limit,
  onRetry,
  products,
  status,
  variant = "compact"
}: {
  emptyText: string;
  limit?: number;
  onRetry?: () => void;
  products: SearchProduct[];
  status: RankingLoadStatus;
  variant?: "compact" | "full";
}) {
  if (status === "loading") {
    return <RankingSkeleton variant={variant} />;
  }

  if (status === "error") {
    return (
      <div className={styles.rankingStateText}>
        <span>热榜加载失败</span>
        {onRetry ? (
          <button className={styles.rankingRetryButton} type="button" onClick={onRetry}>
            重新加载
          </button>
        ) : null}
      </div>
    );
  }

  const visibleProducts = limit === undefined ? products : products.slice(0, limit);
  if (visibleProducts.length === 0) {
    return <EmptyState className={styles.rankingEmptyState} imageSize={118} text={emptyText} textSize={13} />;
  }

  const className = variant === "full" ? styles.fullRankingList : styles.productList;
  return (
    <div className={className}>
      {visibleProducts.map((product, index) => (
        <RankingProductCard key={product.id} product={product} rank={index + 1} />
      ))}
    </div>
  );
}

function RankingSkeleton({ variant }: { variant: "compact" | "full" }) {
  const rows = variant === "full" ? 8 : 3;
  return (
    <div className={variant === "full" ? styles.fullRankingList : styles.productList} data-search-ranking-skeleton="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div className={styles.productCard} key={index}>
          <div className={styles.productInner}>
            <Skeleton className={styles.productVisual} />
            <div className={styles.productInfo}>
              <Skeleton className={styles.rankingSkeletonTitle} />
              <Skeleton className={styles.rankingSkeletonFeature} />
              <Skeleton className={styles.rankingSkeletonPrice} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingProductCard({ product, rank }: { product: SearchProduct; rank: number }) {
  return (
    <Link className={styles.productCard} href={product.href} onClick={(event) => handleSearchExitNavigation(event, product.href)}>
      <div className={styles.productInner}>
        <ProductImagePlaceholder decorative className={styles.productVisual} hideDefaultIcon={Boolean(product.imageUrl)}>
          {product.imageUrl ? <span className={styles.productImage} style={{ backgroundImage: `url(${product.imageUrl})` }} /> : null}
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
              <SearchPriceSubText product={product} variant="ranking" />
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
    <Link className={styles.resultCard} href={product.href} onClick={(event) => handleSearchExitNavigation(event, product.href)}>
      <ProductImagePlaceholder decorative className={styles.resultVisual} hideDefaultIcon={Boolean(product.imageUrl)}>
        {product.imageUrl ? <span className={styles.productImage} style={{ backgroundImage: `url(${product.imageUrl})` }} /> : null}
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
          <SearchPriceSubText product={product} variant="result" />
        </p>
      </div>
    </Link>
  );
}

function SearchPriceSubText({ product, variant }: { product: SearchProduct; variant: "ranking" | "result" }) {
  const priceSubText = product.priceSubText ?? {
    kind: "original" as const,
    text: `￥${product.originalPrice}`
  };
  const className =
    priceSubText.kind === "discount"
      ? variant === "ranking"
        ? styles.discountText
        : styles.resultDiscountText
      : variant === "ranking"
        ? styles.originalPrice
        : styles.resultOriginalPrice;

  return <span className={className}>{priceSubText.text}</span>;
}

function ProductBadge({ product }: { product: SearchProduct }) {
  if (!product.badge) {
    return null;
  }

  if (product.badge.type === "seckill") {
    return <span className={`${styles.badge} ${styles.seckillBadge}`}>{product.badge.label}</span>;
  }

  if (product.badge.type === "hot") {
    return <span className={`${styles.badge} ${styles.hotBadge}`}>{product.badge.label}</span>;
  }

  if (product.badge.type === "recommend") {
    return <span className={`${styles.badge} ${styles.recommendBadge}`}>{product.badge.label}</span>;
  }

  return (
    <span className={styles.badge}>
      <span className={styles.talentBadgeMain}>{product.badge.label}</span>
      <span className={styles.talentBadgeLevel}>{product.badge.level}</span>
    </span>
  );
}

function SearchProductsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div className={styles.resultSkeletonCard} data-search-products-skeleton="true" key={index}>
          <Skeleton className={styles.resultSkeletonVisual} />
          <Skeleton className={styles.resultSkeletonTitle} />
          <Skeleton className={styles.resultSkeletonText} />
          <Skeleton className={styles.resultSkeletonPrice} />
        </div>
      ))}
    </>
  );
}

export function getSearchSortOrderBy(sortState: SearchSortState) {
  const prefix = sortState.direction === "asc" ? "+" : "-";
  return `${prefix}${sortState.field}`;
}

export function getSearchCategoryRequestState({
  appliedCategoryPath,
  categoryScopeId
}: {
  appliedCategoryPath: string[];
  categoryScopeId: string;
}) {
  const appliedCategoryId = appliedCategoryPath[appliedCategoryPath.length - 1];
  const selectedCategoryId = appliedCategoryId || categoryScopeId || undefined;
  return {
    categoryOptionsParentId: selectedCategoryId,
    selectedCategoryId
  };
}

function areSearchCategoryPathsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function getNextSearchSortState(current: SearchSortState, field: SearchSortField): SearchSortState {
  if (current.field === field) {
    return {
      direction: current.direction === "asc" ? "desc" : "asc",
      field
    };
  }

  return {
    direction: field === "price" ? "asc" : "desc",
    field
  };
}

function buildSearchFilterSummary({ selectedCategoryPath, sortState }: { selectedCategoryPath: string[]; sortState: SearchSortState }) {
  const sortLabel = sortState.field === "price" ? "价格" : "销量";
  const directionLabel = sortState.direction === "asc" ? "升序" : "降序";
  return selectedCategoryPath.length > 0 ? `${sortLabel}${directionLabel} · 已选 ${selectedCategoryPath.length} 级分类` : `${sortLabel}${directionLabel}`;
}

function getSearchCategoryLevelTitle(levelIndex: number) {
  if (levelIndex === 0) {
    return "一级类目";
  }
  if (levelIndex === 1) {
    return "二级类目";
  }
  if (levelIndex === 2) {
    return "三级类目";
  }
  return `第 ${levelIndex + 1} 级`;
}

export function buildSearchRankingHref(tab?: SearchRankingTab) {
  if (!tab) {
    return "/search/ranking";
  }

  const params = new URLSearchParams({ rankType: String(tab.rankType) });
  if (tab.categoryId) {
    params.set("categoryId", tab.categoryId);
  }
  return `/search/ranking?${params.toString()}`;
}

function buildRankingTabId({ categoryId, rankType }: { categoryId?: string; rankType?: 1 | 2 }) {
  if (!rankType) {
    return "";
  }

  return rankType === 2 && categoryId ? `rank-2-${categoryId}` : `rank-${rankType}`;
}

export function buildNextSearchCategoryLevels({
  levels,
  nextCategories,
  selectedPath
}: {
  levels: SearchCategoryOption[][];
  nextCategories: SearchCategoryOption[];
  selectedPath: string[];
}) {
  if (selectedPath.length === 0) {
    return nextCategories.length > 0 ? [nextCategories] : [];
  }

  const retainedLevels = levels.slice(0, selectedPath.length);
  const selectedCategory = findSearchCategoryOption(levels, selectedPath);
  const selectedChildren = selectedCategory?.children ?? [];
  const childLevel = nextCategories.length > 0 ? nextCategories : selectedChildren;
  return childLevel.length > 0 ? [...retainedLevels, childLevel] : retainedLevels;
}

function findSearchCategoryOption(levels: SearchCategoryOption[][], selectedPath: string[]) {
  let current: SearchCategoryOption | undefined;
  for (let index = 0; index < selectedPath.length; index += 1) {
    const level = index === 0 ? levels[0] : current?.children ?? levels[index];
    current = level?.find((category) => category.id === selectedPath[index]);
    if (!current) {
      return undefined;
    }
  }
  return current;
}

function buildSearchResultHref({
  categoryId,
  keyword,
  selectedCategoryId
}: {
  categoryId?: string;
  keyword?: string;
  selectedCategoryId?: string;
}) {
  const params = new URLSearchParams();
  if (keyword?.trim()) {
    params.set("q", keyword.trim());
  }
  if (categoryId?.trim()) {
    params.set("categoryId", categoryId.trim());
  }
  if (selectedCategoryId?.trim()) {
    params.set("selectedCategoryId", selectedCategoryId.trim());
  }
  const query = params.toString();
  return `/search${query ? `?${query}` : ""}`;
}
