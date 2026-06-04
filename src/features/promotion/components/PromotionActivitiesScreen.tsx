import Link from "next/link";

import type { PromotionActivitiesData } from "../types";
import { PromotionEmptyState } from "./PromotionStates";
import { PromotionNav, PromotionShell } from "./PromotionShell";

const statusTone = {
  claiming: "bg-[#FFF1E8] text-[#D25F00]",
  active: "bg-[#E8FFEA] text-[#009A29]",
  ended: "bg-[#F2F3F5] text-[#86909C]"
};

export function PromotionActivitiesScreen({ data }: { data: PromotionActivitiesData }) {
  return (
    <PromotionShell background="#F7F9FB">
      <PromotionNav
        title="活动中心"
        trailing={
          <Link className="text-[14px] leading-[22px] text-[#0F0F0F]" href={data.rewardRecordHref}>
            奖励记录
          </Link>
        }
      />
      <div className="px-4 pb-8 pt-3">
        <p className="mb-3 text-[13px] leading-5 text-[#86909C]">{data.couponSummary}</p>
        {data.items.length === 0 ? (
          <PromotionEmptyState title="暂无活动" description="当前没有可参与的奖励活动" />
        ) : (
          <div className="space-y-3">
            {data.items.map((item) => (
              <article key={item.id} className="rounded-[12px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#0F0F0F] px-2.5 py-[3px] text-[11px] font-semibold leading-none text-white">{item.tag}</span>
                      <span className={`rounded-full px-2 py-[3px] text-[11px] font-semibold leading-none ${statusTone[item.status]}`}>{item.statusText}</span>
                    </div>
                    <h2 className="mt-3 truncate text-[17px] font-black leading-6 text-[#0F0F0F]">{item.title}</h2>
                  </div>
                  <div className="shrink-0 rounded-[10px] bg-[#FFF7E8] px-3 py-2 text-right">
                    <p className="text-[11px] leading-4 text-[#86909C]">{item.progressLabel}</p>
                    <p className="mt-1 text-[18px] font-black leading-5 text-[#D25F00]">{item.progressValue}</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-5 text-[#575757]">{item.description}</p>
                <p className="mt-3 rounded-[8px] bg-[#F7F9FB] px-3 py-2 text-[12px] leading-5 text-[#86909C]">{item.periodText}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </PromotionShell>
  );
}
