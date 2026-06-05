import Link from "next/link";

import { AppScreen, TopNavigation } from "@/design-system";

import type { PromotionActivitiesData, PromotionActivity } from "../types";
import { activityCenterTheme, activityStatusTone } from "../theme/promotion-page-theme";
import { PromotionEmptyState } from "./PromotionStates";

const activityIconSrc: Record<PromotionActivity["iconKind"], string> = {
  order: "/assets/promotion/activities/order-reward-icon.png",
  pk: "/assets/promotion/activities/pk-reward-icon.png"
};

export function PromotionActivitiesScreen({ data }: { data: PromotionActivitiesData }) {
  return (
    <AppScreen className="bg-fill-white" contentClassName="flex h-screen min-h-screen flex-col">
      <header className="shrink-0 bg-fill-white">
        <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />
        <TopNavigation
          backHref="/promotion"
          rightNode={
            <Link className="text-[14px] font-medium leading-5 text-text-primary" href={data.rewardRecordHref}>
              奖励记录
            </Link>
          }
          title="活动中心"
        />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-8 pt-[14px]">
        <p className="mb-3 text-[15px] font-semibold leading-[21px] text-text-primary">
          当前<span className="text-success-strong">{data.activeCount}</span>个进行中
        </p>
        {data.items.length === 0 ? (
          <PromotionEmptyState title="暂无活动" description="当前没有可参与的奖励活动" />
        ) : (
          <div className="space-y-4">
            {data.items.map((item) => <ActivityCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </AppScreen>
  );
}

function ActivityCard({ item }: { item: PromotionActivity }) {
  const progressPercent = Math.max(0, Math.min(item.progressPercent, 100));

  return (
    <Link
      className="block min-h-[124px] overflow-hidden rounded-[14px] px-3 pb-[18px] pt-3"
      href={item.href}
      style={{ backgroundColor: activityCenterTheme.cardBackground }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <ActivityIcon kind={item.iconKind} />
        <h2 className="min-w-0 truncate text-[17px] font-black leading-6 text-text-primary">{item.title}</h2>
        {item.statusText ? (
          <span className={`shrink-0 rounded-[7px] px-[5px] py-px text-[13px] font-medium leading-[18px] ${activityStatusTone[item.status]}`}>
            {item.statusText}
          </span>
        ) : null}
      </div>
      <p className="mt-[5px] truncate text-[14px] leading-5 text-text-secondary">{item.description}</p>
      <p className="mt-5 text-[13px] font-medium leading-[18px] text-text-tertiary">
        {item.progressLabel} <span className="text-price">{item.progressValue}</span>
      </p>
      <div className="mt-2 h-2.5 rounded-pill bg-fill-white p-0.5">
        <div
          aria-hidden="true"
          className="h-full rounded-pill"
          style={{ width: `${progressPercent}%`, backgroundColor: activityCenterTheme.progressFill }}
        />
      </div>
    </Link>
  );
}

function ActivityIcon({ kind }: { kind: PromotionActivity["iconKind"] }) {
  return (
    <img alt="" className="size-[18px] shrink-0" src={activityIconSrc[kind]} />
  );
}
