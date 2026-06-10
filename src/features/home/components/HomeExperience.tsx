"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

import { cn } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { HybridLink } from "@/lib/navigation";

import { BridgeDebugPanel } from "../BridgeDebugPanel";
import type { HomeActivityCard, HomeExperienceData, HomeProductCard } from "../home-page-data";
import { NativeRuntimePanel } from "../NativeRuntimePanel";
import styles from "./HomeExperience.module.css";

export function HomeExperience({ data, releaseLabel }: { data: HomeExperienceData; releaseLabel?: string }) {
  void releaseLabel;

  return (
    <main className={styles.screen}>
      <div className={styles.viewport}>
        <HomeHeader data={data} />
        <div className={styles.content}>
          <HomeBanner data={data} />
          <CategoryGrid data={data} />
          <ActivityGrid activities={data.activities} />
          <RecommendationSection data={data} />
        </div>
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
      <img className={styles.bannerImage} src={localAssetUrl(data.banner.assetKey)} alt={data.banner.alt} />
    </HybridLink>
  );
}

function CategoryGrid({ data }: { data: HomeExperienceData }) {
  return (
    <nav className={styles.categoryGrid} aria-label="首页分类">
      {data.categories.map((category) => (
        <HybridLink className={styles.categoryItem} href={category.href} key={category.label} source="home" strategy="new-webview" title="商品分类">
          <span className={styles.categoryIcon} aria-hidden="true" />
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

function RecommendationSection({ data }: { data: HomeExperienceData }) {
  return (
    <section className={styles.recommendSection} aria-label="为您推荐">
      <div className={styles.recommendHeader}>
        <div className={styles.recommendTitle}>
          <img className={styles.recommendIcon} src={localAssetUrl(data.recommendationIconAssetKey)} alt="" />
          <h2 className={styles.recommendTitleText}>为您推荐</h2>
        </div>
        <HybridLink className={styles.moreLink} href="/category" source="home" strategy="new-webview" title="商品分类">
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
    </section>
  );
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
