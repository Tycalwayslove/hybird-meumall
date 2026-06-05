import Link from "next/link";
import type { ReactNode } from "react";

import { AppScreen } from "@/design-system";

import type { SearchPageData, SearchProduct, SearchProductImageTone } from "../types";
import styles from "./SearchScreen.module.css";

const imageToneClassName: Record<SearchProductImageTone, string> = {
  charcoal: "",
  linen: styles.imageToneLinen,
  mint: styles.imageToneMint
};

export function SearchScreen({ data }: { data: SearchPageData }) {
  return (
    <AppScreen className={styles.screen} contentClassName={styles.viewport}>
      <header className={styles.header}>
        <Link aria-label="返回首页" className={styles.backLink} href="/" />
        <form className={styles.searchForm} method="get" role="search">
          <span aria-hidden="true" className={styles.searchIcon} />
          <input className={styles.searchInput} name="q" placeholder="请输入商品名称搜索" type="search" />
          <button className={styles.searchButton} type="submit">
            搜索
          </button>
        </form>
        <Link aria-label="打开 AI 导购" className={styles.aiGuide} href="/consult">
          <span className={styles.aiGuideText}>AI导购</span>
        </Link>
      </header>

      <main className={styles.content}>
        <div className={styles.keywordPanel}>
          <KeywordSection keywords={data.hotKeywords} title="热门搜索" />
          <KeywordSection
            action={
              <button aria-label="清空搜索历史" className={styles.clearButton} type="button" />
            }
            keywords={data.historyKeywords}
            title="搜索历史"
          />
        </div>

        <section aria-labelledby="search-ranking-title" className={styles.ranking}>
          <h2 className="sr-only" id="search-ranking-title">
            搜索热榜
          </h2>
          <nav aria-label="热榜分类" className={styles.tabs}>
            {data.rankingTabs.map((tab) => {
              const active = tab === data.activeRankingTab;
              return (
                <Link
                  key={tab}
                  aria-current={active ? "page" : undefined}
                  className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                  href={`/search?ranking=${encodeURIComponent(tab)}`}
                >
                  {tab}
                </Link>
              );
            })}
          </nav>

          <div className={styles.rankingBody}>
            <p className={styles.notice}>
              <span aria-hidden="true" className={styles.noticeLeaf} />
              <span>{data.rankingNotice}</span>
              <span aria-hidden="true" className={`${styles.noticeLeaf} ${styles.noticeLeafEnd}`} />
            </p>
            <div className={styles.productList}>
              {data.products.map((product) => (
                <RankingProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppScreen>
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

function RankingProductCard({ product }: { product: SearchProduct }) {
  return (
    <article className={styles.productCard}>
      <div className={styles.productInner}>
        <div aria-hidden="true" className={`${styles.productVisual} ${imageToneClassName[product.imageTone]}`} />
        <div className={styles.productInfo}>
          <div className={styles.titleRow}>
            <h3 className={styles.productTitle}>
              <ProductBadge product={product} />
              {product.title}
            </h3>
          </div>
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
    </article>
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
