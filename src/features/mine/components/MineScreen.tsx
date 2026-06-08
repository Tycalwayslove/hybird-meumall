/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { AppScreen, cn } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";

import type { MineMetric, MinePageData } from "../types";
import styles from "./MineScreen.module.css";

type MineScreenProps = {
  data: MinePageData;
};

export function MineScreen({ data }: MineScreenProps) {
  return (
    <AppScreen className={styles.screen} contentClassName={styles.viewport}>
      <div className={styles.heroBg} aria-hidden="true">
        <img className={styles.heroBgImage} src={localAssetUrl(data.heroBackgroundAssetKey)} alt="" />
      </div>
      <div className={styles.content}>
        <ProfileHeader data={data} />
        <BenefitCard data={data} />
        <OrderCard data={data} />
        <SpringPlanBanner data={data} />
        <ToolCard data={data} />
      </div>
    </AppScreen>
  );
}

function ProfileHeader({ data }: MineScreenProps) {
  const notificationIcon = localAssetUrl(data.notificationAssetKey);
  const roleImage = localAssetUrl(data.heroRoleAssetKey);

  return (
    <section className={styles.profileRow} aria-label="用户信息">
      <div className={styles.avatar} aria-hidden="true">
        <span className={styles.avatarHair} />
        <span className={styles.avatarFace} />
        <span className={styles.avatarBody} />
      </div>
      <div className={styles.profileText}>
        <div className={styles.nameLine}>
          <h1 className={styles.nickname}>{data.profile.nickname}</h1>
          <span className={styles.levelBadge}>
            {data.profile.levelCode}
            {data.profile.levelLabel}
          </span>
        </div>
        <p className={styles.phone}>{data.profile.phone}</p>
      </div>
      <Link className={styles.notificationLink} href={data.notificationHref} aria-label="进入消息中心，当前 22 条未读">
        <img className={styles.notificationIcon} src={notificationIcon} alt="" />
      </Link>
      <img className={styles.roleImage} src={roleImage} alt="" aria-hidden="true" />
    </section>
  );
}

function BenefitCard({ data }: MineScreenProps) {
  return (
    <section className={styles.benefitCard} aria-label="达人权益">
      <div className={styles.benefitPattern} />
      <div className={styles.benefitTop}>
        <span className={styles.validText}>喵呜达人有效期至{data.profile.membershipValidUntil}</span>
        <Link className={styles.benefitButton} href={data.benefitsHref}>
          权益中心
          <span aria-hidden="true">›</span>
        </Link>
      </div>
      <div className={styles.metricPanel}>
        {data.metrics.map((metric) => (
          <MineMetricItem key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function MineMetricItem({ metric }: { metric: MineMetric }) {
  return (
    <div className={styles.metricItem}>
      <span className={styles.metricLabel}>{metric.label}</span>
      <strong className={styles.metricValue}>
        {metric.prefix ? <span className={styles.metricPrefix}>{metric.prefix}</span> : null}
        {metric.value}
      </strong>
    </div>
  );
}

function OrderCard({ data }: MineScreenProps) {
  return (
    <section className={cn(styles.card, styles.sectionCard)} aria-label="我的订单">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>我的订单</h2>
        <Link className={styles.sectionLink} href={data.ordersHref}>
          全部订单
          <span aria-hidden="true">›</span>
        </Link>
      </div>
      <div className={styles.orderGrid}>
        {data.orders.map((order) => (
          <Link className={styles.orderItem} href={order.href} key={order.label}>
            <img className={styles.orderIcon} src={localAssetUrl(order.assetKey)} alt="" />
            <span className={styles.itemLabel}>{order.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SpringPlanBanner({ data }: MineScreenProps) {
  return (
    <div className={styles.bannerWrap}>
      <Link className={styles.bannerLink} href={data.banner.href} aria-label={data.banner.alt}>
        <img className={styles.bannerImage} src={localAssetUrl(data.banner.assetKey)} alt={data.banner.alt} />
      </Link>
    </div>
  );
}

function ToolCard({ data }: MineScreenProps) {
  return (
    <section className={cn(styles.card, styles.toolCard)} aria-label="服务与工具">
      <h2 className={styles.sectionTitle}>服务与工具</h2>
      <div className={styles.toolGrid}>
        {data.tools.map((tool) => (
          <Link className={styles.toolItem} href={tool.href} key={tool.label}>
            <img className={styles.toolIcon} src={localAssetUrl(tool.assetKey)} alt="" />
            <span className={styles.itemLabel}>{tool.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
