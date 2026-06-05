import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { TransparentActionNavPage } from "@/design-system";

import { activityDetailTheme } from "../theme/promotion-page-theme";
import type { PromotionActivityDetailData } from "../types";

const designWidth = 375;
const heroVisualHeight = 425;

type ActivityHeroStyle = CSSProperties & {
  "--activity-scale"?: string;
};

export function PromotionActivityDetailScreen({ data }: { data: PromotionActivityDetailData }) {
  const heroStyle: ActivityHeroStyle = {
    "--activity-scale": `calc(min(100vw, 430px) / ${designWidth}px)`
  };

  return (
    <TransparentActionNavPage
      backHref="/promotion/activities"
      className="bg-fill-page"
      contentClassName="bg-fill-page pb-8"
      foreground="light"
      rightHref={data.rewardRecordHref}
      rightText="奖励记录"
    >
      <section
        className="relative aspect-[375/399] overflow-visible"
        style={heroStyle}
      >
        <div
          className="absolute left-1/2 top-0 overflow-visible"
          style={{
            height: heroVisualHeight,
            transform: "translateX(-50%) scale(var(--activity-scale))",
            transformOrigin: "top center",
            width: designWidth
          }}
        >
          <img alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" src={data.heroBackgroundSrc} />

          <ActivityHeroTitle data={data} />
          <HeroBadge text={data.badgeText} />
          <HeroMetrics data={data} />
          <ActivityAction data={data} />
        </div>
      </section>

      <section className="relative z-10 rounded-t-[20px] bg-fill-white px-3 pb-8 pt-[42px]">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-[12px] px-1.5 py-1 text-center text-[13px] font-medium leading-[18px]" style={{ backgroundColor: activityDetailTheme.periodBackground, color: activityDetailTheme.periodText }}>
          {data.periodText}
        </div>

        <div className="space-y-[26px]">
          <ActivitySection gap="compact" title="目标进度">
            <ProgressCard progress={data.progress} />
          </ActivitySection>

          <ActivitySection title="奖励规则">
            <p className="text-[13px] leading-[18px] text-text-primary">{data.rules.description}</p>
            <RulesTable rules={data.rules} />
          </ActivitySection>
        </div>
      </section>
    </TransparentActionNavPage>
  );
}

function ActivityHeroTitle({ data }: { data: PromotionActivityDetailData }) {
  const highlightColor = data.title.highlightTone === "order" ? activityDetailTheme.orderTitleColor : activityDetailTheme.pkTitleColor;
  const titleText = `${data.title.prefix}${data.title.highlight}${data.title.suffix}`;

  return (
    <h1
      aria-label={titleText}
      className="absolute left-1/2 top-[75px] w-full -translate-x-1/2 text-center text-[44px] font-black leading-[48px] tracking-normal text-text-primary"
      style={{
        textShadow: activityDetailTheme.heroTitleShadow,
        WebkitTextStroke: `4px ${activityDetailTheme.heroTitleStroke}`,
        paintOrder: "stroke fill"
      }}
    >
      <span>{data.title.prefix}</span>
      <span style={{ color: highlightColor }}>{data.title.highlight}</span>
      <span>{data.title.suffix}</span>
    </h1>
  );
}

function HeroBadge({ text }: { text: string }) {
  return (
    <div className="absolute left-1/2 top-[144px] -translate-x-1/2 rounded-pill px-1.5 py-px text-[13px] font-semibold leading-[18px] text-text-inverse" style={{ backgroundColor: activityDetailTheme.badgeBackground }}>
      {text}
    </div>
  );
}

function HeroMetrics({ data }: { data: PromotionActivityDetailData }) {
  if (data.metrics.kind === "single") {
    return (
      <div className="absolute left-1/2 top-[181px] -translate-x-1/2 text-center">
        <DecoratedLabel>{data.metrics.label}</DecoratedLabel>
        <p className="mt-1 text-[32px] font-semibold leading-10" style={{ color: activityDetailTheme.priceColor }}>
          {data.metrics.value}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute left-[88px] top-[180px] w-[202px] text-center">
      <div className="grid grid-cols-2 text-[16px] font-black leading-[22px] text-text-primary">
        {data.metrics.items.map((item) => <span key={item.label}>{item.label}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-2 text-[28px] font-semibold leading-9" style={{ color: activityDetailTheme.priceColor }}>
        {data.metrics.items.map((item) => <span key={item.label}>{item.value}</span>)}
      </div>
    </div>
  );
}

function ActivityAction({ data }: { data: PromotionActivityDetailData }) {
  const content = (
    <>
      <span>{data.statusText}</span>
      {data.statusKind === "primary" ? <span aria-hidden="true" className="ml-2 flex size-7 items-center justify-center rounded-full bg-fill-white/80 text-[24px] leading-none" style={{ color: activityDetailTheme.priceColor }}>›</span> : null}
    </>
  );

  const className = "absolute left-1/2 top-[316px] flex h-12 min-w-[148px] -translate-x-1/2 items-center justify-center rounded-pill px-6 text-[20px] font-black leading-none shadow-[0_4px_12px_rgba(255,71,71,0.24)]";
  const style: CSSProperties = {
    background: data.statusKind === "primary" ? activityDetailTheme.actionBackground : activityDetailTheme.neutralActionBackground,
    color: data.statusKind === "primary" ? activityDetailTheme.actionTextColor : undefined
  };

  if (data.actionHref && data.statusKind === "primary") {
    return (
      <Link className={className} href={data.actionHref} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

function ActivitySection({
  children,
  gap = "regular",
  title
}: {
  children: ReactNode;
  gap?: "compact" | "regular";
  title: string;
}) {
  return (
    <section className={`flex flex-col items-center ${gap === "compact" ? "gap-[10px]" : "gap-3.5"}`}>
      <h2 className="flex items-center justify-center gap-1 text-center text-[20px] font-black leading-7">
        <span className="text-[13px]" style={{ color: activityDetailTheme.priceColor }}>✦</span>
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: activityDetailTheme.titleGradient }}>{title}</span>
        <span className="text-[13px]" style={{ color: activityDetailTheme.priceColor }}>✦</span>
      </h2>
      {children}
    </section>
  );
}

function ProgressCard({ progress }: { progress: PromotionActivityDetailData["progress"] }) {
  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden rounded-[12px] bg-fill-page px-2.5 pb-2 pt-2.5">
      <div className="flex w-full flex-col gap-[10px]">
        <p className="text-[16px] font-semibold leading-[22px] text-text-primary">
          {renderHighlightedNumber(progress.completedText)}
        </p>
        <p className="text-[14px] font-medium leading-5 text-text-secondary">{renderHighlightedNumber(progress.hintText)}</p>
      </div>

      <div className="flex flex-col gap-1 rounded-[10px] bg-fill-white px-[11px] py-2.5">
        {progress.amountLabels ? <MilestoneLabels labels={progress.amountLabels} mutedFirst /> : null}
        <ProgressBar progress={progress} />
        <MilestoneLabels labels={progress.milestoneLabels} />
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: PromotionActivityDetailData["progress"] }) {
  const safePercent = Math.max(0, Math.min(progress.percent, 100));
  const labelLeft = progress.complete ? "50%" : `calc(3px + (100% - 6px) * ${safePercent} / 100)`;
  const fillWidth = progress.complete ? "calc(100% - 6px)" : `calc((100% - 6px) * ${safePercent} / 100)`;

  return (
    <div
      className="relative h-[18px] rounded-pill"
      style={{ backgroundColor: progress.complete ? activityDetailTheme.progressCompleteTrack : activityDetailTheme.progressTrack }}
    >
      <div
        className="absolute left-[3px] top-[3px] h-3 rounded-pill"
        style={{
          background: progress.complete ? activityDetailTheme.progressCompleteFill : activityDetailTheme.progressFill,
          width: fillWidth
        }}
      />
      <span
        className="absolute top-px -translate-x-1/2 text-[10px] font-semibold leading-4 text-text-inverse"
        style={{ left: labelLeft }}
      >
        {progress.complete ? "激励活动已完成" : `${safePercent}%`}
      </span>
    </div>
  );
}

function MilestoneLabels({ labels, mutedFirst = false }: { labels: string[]; mutedFirst?: boolean }) {
  return (
    <div className="flex w-full items-center justify-between text-[14px] font-medium leading-5 text-text-primary">
      {labels.map((label, index) => (
        <span key={`${label}-${index}`} style={{ color: mutedFirst && index === 0 ? "transparent" : undefined }}>
          {label}
        </span>
      ))}
    </div>
  );
}

function RulesTable({ rules }: { rules: PromotionActivityDetailData["rules"] }) {
  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div className="grid h-8 grid-cols-2 place-items-center rounded-t-lg text-[14px] font-medium text-text-primary" style={{ backgroundColor: activityDetailTheme.ruleHeaderBackground }}>
        <span>{rules.columns[0]}</span>
        <span>{rules.columns[1]}</span>
      </div>
      {rules.rows.map((row, index) => (
        <div
          key={row.join("-")}
          className={`grid h-11 grid-cols-2 place-items-center border-l border-r border-fill-muted text-[14px] text-text-secondary ${index === rules.rows.length - 1 ? "rounded-b-lg border-b" : ""} ${index % 2 === 1 ? "bg-fill-page" : "bg-fill-white"}`}
        >
          <span>{row[0]}</span>
          <span>{row[1]}</span>
        </div>
      ))}
    </div>
  );
}

function DecoratedLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-0.5 text-[18px] font-black leading-6 text-text-primary">
      <span style={{ color: activityDetailTheme.priceColor }}>✦</span>
      <span>{children}</span>
      <span style={{ color: activityDetailTheme.priceColor }}>✦</span>
    </p>
  );
}

function renderHighlightedNumber(text: string) {
  const parts = text.split(/(\d[\d,.]*元?)/g);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    const highlight = /\d/.test(part);

    return (
      <span key={`${part}-${index}`} style={highlight ? { color: activityDetailTheme.priceColor } : undefined}>
        {part}
      </span>
    );
  });
}
