import { AppScreen, TopNavigation } from "@/design-system";

import type { PromotionActivitiesData } from "../types";
import { activityStatusTone } from "../theme/promotion-page-theme";
import { PromotionEmptyState } from "./PromotionStates";

export function PromotionActivitiesScreen({ data }: { data: PromotionActivitiesData }) {
  return (
    <AppScreen contentClassName="flex h-screen min-h-screen flex-col">
      <header className="shrink-0 bg-fill-white">
        <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />
        <TopNavigation backHref="/promotion" rightHref={data.rewardRecordHref} rightText="奖励记录" title="活动中心" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3">
        <p className="mb-3 text-[13px] leading-5 text-text-disabled">{data.couponSummary}</p>
        {data.items.length === 0 ? (
          <PromotionEmptyState title="暂无活动" description="当前没有可参与的奖励活动" />
        ) : (
          <div className="space-y-3">
            {data.items.map((item) => (
              <article key={item.id} className="rounded-card bg-fill-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-pill bg-text-primary px-2.5 py-[3px] text-[11px] font-semibold leading-none text-text-inverse">{item.tag}</span>
                      <span className={`rounded-pill px-2 py-[3px] text-[11px] font-semibold leading-none ${activityStatusTone[item.status]}`}>{item.statusText}</span>
                    </div>
                    <h2 className="mt-3 truncate text-[17px] font-black leading-6 text-text-primary">{item.title}</h2>
                  </div>
                  <div className="shrink-0 rounded-lg bg-warning-subtle px-3 py-2 text-right">
                    <p className="text-[11px] leading-4 text-text-disabled">{item.progressLabel}</p>
                    <p className="mt-1 text-[18px] font-black leading-5 text-warning-strong">{item.progressValue}</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-5 text-text-quaternary">{item.description}</p>
                <p className="mt-3 rounded-md bg-fill-page px-3 py-2 text-[12px] leading-5 text-text-disabled">{item.periodText}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppScreen>
  );
}
