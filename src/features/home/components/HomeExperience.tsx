"use client";

/* eslint-disable @next/next/no-img-element */
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { HybridLink } from "@/lib/navigation";

import { BridgeDebugPanel } from "../BridgeDebugPanel";
import type { HomeApi } from "../home-api";
import { createHomeApi } from "../home-api";
import type { HomeActivityCard, HomeExperienceData, HomeProductCard } from "../home-page-data";
import { NativeRuntimePanel } from "../NativeRuntimePanel";
import styles from "./HomeExperience.module.css";

type HomeRecommendPageInfo = {
  current: number;
  size: number;
  total?: number;
  pages?: number;
  hasMore: boolean;
};

export type HomeRecommendPageState = {
  products: HomeProductCard[];
  page: HomeRecommendPageInfo;
  status: "idle" | "loading" | "finished" | "error";
};

const HOME_RECOMMEND_PAGE_SIZE = 10;
const HOME_BACK_TO_TOP_MIN_PAGE = 2;

export function HomeExperience({
  data,
  homeApi,
  releaseLabel
}: {
  data: HomeExperienceData;
  homeApi?: Pick<HomeApi, "getRecommendProducts">;
  releaseLabel?: string;
}) {
  void releaseLabel;
  const defaultHomeApi = useMemo(() => createHomeApi(createH5Client()), []);
  const api = homeApi ?? defaultHomeApi;
  const [recommendState, setRecommendState] = useState<HomeRecommendPageState>(() => createInitialHomeRecommendPageState(data.products));
  const loadingNextRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreProducts = useCallback(async () => {
    if (loadingNextRef.current || (recommendState.status !== "idle" && recommendState.status !== "error") || !recommendState.page.hasMore) {
      return;
    }

    loadingNextRef.current = true;
    const currentState = recommendState;
    setRecommendState((state) => ({
      ...state,
      status: "loading"
    }));

    try {
      const nextState = await loadNextHomeRecommendProductsPage({
        homeApi: api,
        state: currentState
      });
      setRecommendState(nextState);
    } finally {
      loadingNextRef.current = false;
    }
  }, [api, recommendState]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || recommendState.status !== "idle" || !recommendState.page.hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreProducts();
        }
      },
      {
        rootMargin: "180px 0px"
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreProducts, recommendState.page.hasMore, recommendState.status]);

  function handleBackToTop() {
    window.scrollTo({
      behavior: "smooth",
      top: 0
    });
  }

  const pageData = useMemo(
    () => ({
      ...data,
      products: recommendState.products
    }),
    [data, recommendState.products]
  );

  return (
    <main className={styles.screen}>
      <div className={styles.viewport}>
        <HomeHeader data={pageData} />
        <div className={styles.content}>
          <HomeBanner data={pageData} />
          <CategoryGrid data={pageData} />
          <ActivityGrid activities={pageData.activities} />
          <RecommendationSection data={pageData} loadMoreRef={loadMoreRef} onLoadMore={loadMoreProducts} recommendState={recommendState} />
        </div>
        {shouldShowHomeBackToTop(recommendState) ? (
          <button className={styles.backToTopButton} type="button" onClick={handleBackToTop}>
            顶部
          </button>
        ) : null}
        <HomeDebugDrawer />
      </div>
    </main>
  );
}

function HomeHeader({ data }: { data: HomeExperienceData }) {
  return (
    <header className={styles.stickyHeader}>
      <div className={styles.topBar}>
        <HybridLink className={styles.logoLink} href="/" strategy="switch-tab" tab="home" aria-label="喵呜AI 首页">
          <img className={styles.logoImage} src={localAssetUrl(data.logoAssetKey)} alt="喵呜AI" />
        </HybridLink>
        <div className={styles.headerActions}>
          <HybridLink className={styles.searchLink} href="/search" source="home" strategy="new-webview" title="搜索" aria-label="搜索商品">
            <span className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} aria-hidden="true" />
            <span className={styles.searchText}>请输入关键词</span>
          </HybridLink>
          <HybridLink className={styles.messageLink} href="/messages" source="home" strategy="new-webview" title="消息中心" aria-label="进入消息中心，当前 22 条未读">
            <img className={styles.messageIcon} src={localAssetUrl(data.messageAssetKey)} alt="" />
            <span className={styles.messageBadge}>22</span>
          </HybridLink>
        </div>
      </div>
    </header>
  );
}

function HomeBanner({ data }: { data: HomeExperienceData }) {
  return (
    <HybridLink className={styles.bannerLink} href={data.banner.href} strategy="switch-tab" tab="promotion" aria-label={data.banner.alt}>
      <img className={styles.bannerImage} src={data.banner.imageUrl ?? localAssetUrl(data.banner.assetKey ?? "home.banner.springPlan")} alt={data.banner.alt} />
    </HybridLink>
  );
}

function CategoryGrid({ data }: { data: HomeExperienceData }) {
  return (
    <nav className={styles.categoryGrid} aria-label="首页分类">
      {data.categories.map((category) => (
        <HybridLink className={styles.categoryItem} href={category.href} key={category.label} source="home" strategy="new-webview" title="商品分类">
          <span className={cn(styles.categoryIcon, category.iconUrl && styles.categoryIconRemote)} aria-hidden="true">
            {category.iconUrl ? <img className={styles.categoryIconImage} src={category.iconUrl} alt="" /> : null}
          </span>
          <span className={styles.categoryLabel}>{category.label}</span>
        </HybridLink>
      ))}
    </nav>
  );
}

function ActivityGrid({ activities }: { activities: HomeActivityCard[] }) {
  return (
    <section className={styles.activityGrid} aria-label="限时活动">
      {activities.map((activity) => (
        <HybridLink
          className={styles.activityCard}
          href={activity.href}
          key={activity.title}
          source="home"
          strategy={activity.href === "/promotion" ? "switch-tab" : "new-webview"}
          tab={activity.href === "/promotion" ? "promotion" : undefined}
          title={activity.title}
        >
          <img className={styles.activityBg} src={localAssetUrl(activity.backgroundAssetKey)} alt="" />
          <div className={styles.activityText}>
            <p className={styles.activityTitle}>{activity.title}</p>
            <p className={styles.activitySubtitle}>{activity.subtitle}</p>
          </div>
        </HybridLink>
      ))}
    </section>
  );
}

function RecommendationSection({
  data,
  loadMoreRef,
  onLoadMore,
  recommendState
}: {
  data: HomeExperienceData;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
  recommendState: HomeRecommendPageState;
}) {
  return (
    <section className={styles.recommendSection} aria-label="为您推荐">
      <div className={styles.recommendHeader}>
        <div className={styles.recommendTitle}>
          <img className={styles.recommendIcon} src={localAssetUrl(data.recommendationIconAssetKey)} alt="" />
          <h2 className={styles.recommendTitleText}>为您推荐</h2>
        </div>
        <HybridLink className={styles.moreLink} href="/home/recommend-products" source="home" strategy="new-webview" title="相似推荐商品">
          更多
          <img className={styles.moreIcon} src={localAssetUrl(data.moreAssetKey)} alt="" />
        </HybridLink>
      </div>
      <div className={styles.productGrid}>
        {data.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            seckillLabelAssetKey={data.seckillLabelAssetKey}
            talentPriceTagAssetKey={data.talentPriceTagAssetKey}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className={styles.loadMore} data-home-recommend-load-more="true">
        {recommendState.status === "loading" ? <span>加载中...</span> : null}
        {recommendState.status === "idle" && recommendState.page.hasMore ? (
          <button className={styles.loadMoreButton} type="button" onClick={onLoadMore}>
            加载更多
          </button>
        ) : null}
        {recommendState.status === "finished" || (!recommendState.page.hasMore && recommendState.status !== "loading" && recommendState.status !== "error") ? (
          <span>没有更多了</span>
        ) : null}
        {recommendState.status === "error" && recommendState.page.hasMore ? (
          <button className={styles.loadMoreButton} type="button" onClick={onLoadMore}>
            继续加载
          </button>
        ) : null}
      </div>
    </section>
  );
}

export async function loadNextHomeRecommendProductsPage({
  homeApi,
  state
}: {
  homeApi: Pick<HomeApi, "getRecommendProducts">;
  state: HomeRecommendPageState;
}): Promise<HomeRecommendPageState> {
  if (!state.page.hasMore || state.status === "loading" || state.status === "finished") {
    return state;
  }

  try {
    const result = await homeApi.getRecommendProducts({
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

export function shouldShowHomeBackToTop(state: HomeRecommendPageState) {
  return state.page.current >= HOME_BACK_TO_TOP_MIN_PAGE || state.products.length > state.page.size;
}

function createInitialHomeRecommendPageState(products: HomeProductCard[]): HomeRecommendPageState {
  return {
    page: {
      current: 1,
      hasMore: products.length >= HOME_RECOMMEND_PAGE_SIZE,
      size: HOME_RECOMMEND_PAGE_SIZE
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

function ProductCard({
  product,
  seckillLabelAssetKey,
  talentPriceTagAssetKey
}: {
  product: HomeProductCard;
  seckillLabelAssetKey: HomeExperienceData["seckillLabelAssetKey"];
  talentPriceTagAssetKey: HomeExperienceData["talentPriceTagAssetKey"];
}) {
  return (
    <HybridLink className={styles.productCard} href={product.href} source="home" strategy="new-webview" title="商品详情">
      <div className={styles.productMedia}>
        {product.imageUrl ? <img className={styles.productImage} src={product.imageUrl} alt="" /> : null}
        <span className={cn(styles.productBadge, product.badge === "推荐" && styles.productBadgeRecommended)}>{product.badge}</span>
      </div>
      <div className={styles.productBody}>
        <p className={styles.productTitle}>{product.title}</p>
        <div className={styles.productMeta}>
          {product.promoType === "seckill" ? (
            <img className={styles.seckillTagImage} src={localAssetUrl(seckillLabelAssetKey)} alt="限时秒杀" />
          ) : (
            <img className={styles.talentTag} src={localAssetUrl(talentPriceTagAssetKey)} alt="喵呜达人 V2" />
          )}
          <span className={styles.soldText}>{product.soldText}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>
            <span className={styles.priceSymbol}>￥</span>
            {product.price}
          </span>
          <span className={styles.originalPrice}>￥{product.originalPrice}</span>
        </div>
      </div>
    </HybridLink>
  );
}

function HomeDebugDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.debugLayer}>
      <button
        type="button"
        className={cn(styles.debugToggle, isOpen && styles.debugToggleOpen)}
        aria-label={isOpen ? "收起调试面板" : "展开调试面板"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={styles.debugIcon} aria-hidden="true" />
      </button>
      {isOpen ? (
        <aside className={styles.debugPanel} aria-label="首页调试面板">
          <div className={styles.debugHeader}>
            <div>
              <h2 className={styles.debugTitle}>Debug</h2>
              <p className={styles.debugSubtitle}>Bridge / Runtime</p>
            </div>
            <button type="button" className={styles.debugClose} aria-label="关闭调试面板" onClick={() => setIsOpen(false)}>
              x
            </button>
          </div>
          <NativeRuntimePanel />
          <BridgeDebugPanel />
        </aside>
      ) : null}
    </div>
  );
}
