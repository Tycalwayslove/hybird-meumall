"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";

import { AppScreen, EmptyState, TopNavigation } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";

import { createPromotionApi, type PromotionApi } from "../api";
import type { PromotionActivityRewardData, PromotionActivityRewardItem } from "../types";

type PromotionActivityRewardMode = "receive" | "view";

type PromotionActivityRewardScreenProps = {
  data: PromotionActivityRewardData;
  mode: PromotionActivityRewardMode;
  promotionApi?: Pick<PromotionApi, "getActivityReward" | "receiveActivityReward">;
};

export function PromotionActivityRewardScreen({
  data,
  mode,
  promotionApi
}: PromotionActivityRewardScreenProps) {
  const api = usePromotionRewardApi(promotionApi);
  const [viewData, setViewData] = useState(data);
  const [selectedReward, setSelectedReward] = useState<PromotionActivityRewardItem | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  async function receiveReward(reward: PromotionActivityRewardItem) {
    if (!reward.canReceive || receivingId) {
      return;
    }

    setReceivingId(reward.id);
    try {
      const result = await api.receiveActivityReward(reward.id, reward.addressId === undefined ? {} : { addressId: reward.addressId });
      if (!result.success) {
        showToast(result.message || "领取失败，请稍后重试");
        return;
      }

      const latest = await api.getActivityReward(viewData.activityId);
      if (latest.success && latest.data.view) {
        setViewData(latest.data.view);
      } else {
        setViewData((current) => ({
          ...current,
          rewards: current.rewards.map((item) => item.id === reward.id ? {
            ...item,
            actionText: "查看",
            canReceive: false,
            statusKind: "pending",
            statusText: "待发放"
          } : item)
        }));
      }
      showToast("领取成功");
    } catch {
      showToast("领取失败，请稍后重试");
    } finally {
      setReceivingId(null);
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  const navTitle = mode === "receive" ? "领取奖励" : "查看奖励";

  return (
    <AppScreen className="bg-[#FFF3F3]" contentClassName="relative h-screen min-h-screen overflow-y-auto">
      <div className="absolute inset-x-0 top-0 h-[312px] bg-[linear-gradient(180deg,#FF6464_0%,#FF8A8A_42%,#FFFFFF_100%)]" />
      <div aria-hidden="true" className="absolute left-[-42px] top-[70px] size-[150px] rounded-full bg-white/20 blur-[2px]" />
      <div aria-hidden="true" className="absolute right-[-30px] top-[62px] size-[118px] rounded-full bg-white/15" />

      <header className="relative z-20">
        <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />
        <TopNavigation backHref={`/promotion/activities/${viewData.activityId}`} background="transparent" foreground="light" title={navTitle} />
      </header>

      <main className="relative z-10 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <section className="mx-auto mt-[10px] w-[286px] rounded-[14px] border border-[#FFE7A8] bg-white px-5 py-[18px] text-center shadow-[0_10px_20px_rgba(117,45,0,0.20)]">
          <div className="flex items-center justify-center gap-[5px]">
            <span aria-hidden="true" className="h-0.5 w-[19px] rounded-pill bg-[linear-gradient(90deg,rgba(255,45,80,0),#FF2D50)]" />
            <p className="text-[22px] font-semibold leading-[26px] text-price">恭喜您!</p>
            <span aria-hidden="true" className="h-0.5 w-[19px] rounded-pill bg-[linear-gradient(90deg,#FF2D50,rgba(255,45,80,0))]" />
          </div>
          <p className="mt-4 text-[16px] leading-[22px] text-text-primary">{viewData.completion.activityLine}</p>
          <p className="mt-0.5 text-[16px] leading-[22px] text-text-primary">
            {viewData.completion.actionText}
            {viewData.completion.valueText ? <span className="text-price">{viewData.completion.valueText}</span> : null}
          </p>
        </section>

        <section className="mt-[30px] min-h-[530px] rounded-t-[20px] bg-fill-white px-[14px] pb-8 pt-3">
          <SectionTitle />
          {viewData.rewards.length === 0 ? (
            <EmptyState className="min-h-[260px]" text="暂无可查看的奖励" />
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              {viewData.rewards.map((reward) => (
                <RewardRow
                  key={reward.id}
                  disabled={receivingId === reward.id}
                  reward={reward}
                  onReceive={() => receiveReward(reward)}
                  onView={() => setSelectedReward(reward)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedReward ? <RewardDetailSheet reward={selectedReward} onClose={() => setSelectedReward(null)} /> : null}
      {toast ? <div className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 rounded-pill bg-black/75 px-4 py-2 text-[14px] text-white">{toast}</div> : null}
    </AppScreen>
  );
}

function SectionTitle() {
  return (
    <h2 className="flex items-center justify-center gap-1 text-center text-[20px] font-black leading-7">
      <span className="text-[13px] text-price">✦</span>
      <span className="bg-[linear-gradient(141deg,#B61515_14%,#0F0F0F_58%)] bg-clip-text text-transparent">获得奖励</span>
      <span className="text-[13px] text-price">✦</span>
    </h2>
  );
}

function RewardRow({
  disabled,
  onReceive,
  onView,
  reward
}: {
  disabled: boolean;
  onReceive: () => void;
  onView: () => void;
  reward: PromotionActivityRewardItem;
}) {
  const statusClassName = reward.statusKind === "done"
    ? "bg-[#B0F95C] text-text-primary"
    : "bg-fill-muted text-text-inverse";
  const action = reward.canReceive ? onReceive : onView;

  return (
    <div className="flex min-h-[42px] items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-[7px]">
        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#FF7479]">
          <img alt="" className="h-[22px] w-[26px]" src={localAssetUrl("promotion.rewardGiftIcon")} />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1">
            <p className="min-w-0 truncate text-[14px] font-semibold leading-[18px] text-text-primary">{reward.title}</p>
            {reward.statusText ? (
              <span className={`shrink-0 rounded-[6px] px-[5px] py-px text-[11px] font-medium leading-4 ${statusClassName}`}>
                {reward.statusText}
              </span>
            ) : null}
          </div>
          {reward.description ? <p className="mt-1 max-w-[190px] truncate text-[13px] leading-[18px] text-text-secondary">{reward.description}</p> : null}
        </div>
      </div>
      <button
        className={reward.canReceive ? "h-[30px] rounded-pill bg-price px-[18px] text-[14px] font-semibold leading-6 text-white disabled:opacity-60" : "h-[30px] rounded-pill border border-fill-muted px-[18px] text-[14px] font-semibold leading-6 text-text-primary"}
        disabled={disabled}
        type="button"
        onClick={action}
      >
        {disabled ? "领取中" : reward.actionText}
      </button>
    </div>
  );
}

function RewardDetailSheet({ onClose, reward }: { onClose: () => void; reward: PromotionActivityRewardItem }) {
  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px] bg-black/60" role="presentation">
      <section
        aria-labelledby="promotion-reward-detail-title"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 min-h-[362px] rounded-t-[14px] bg-fill-white px-[19px] pb-[calc(env(safe-area-inset-bottom)+28px)] pt-4"
        role="dialog"
      >
        <button aria-label="关闭" className="absolute right-3 top-3 flex size-8 items-center justify-center text-[30px] font-light leading-none text-text-secondary" type="button" onClick={onClose}>
          ×
        </button>
        <h2 id="promotion-reward-detail-title" className="text-center text-[18px] font-semibold leading-[25px] text-[#151515]">奖励详情</h2>
        <div className="mt-7 space-y-4">
          <div className="flex min-w-0 items-center gap-1">
            <p className="min-w-0 truncate text-[16px] font-semibold leading-[22px] text-text-primary">奖品：{reward.title}</p>
            {reward.statusText ? (
              <span className={reward.statusKind === "done" ? "shrink-0 rounded-[6px] bg-[#B0F95C] px-[5px] py-px text-[12px] font-medium leading-4 text-text-primary" : "shrink-0 rounded-[6px] bg-fill-muted px-[5px] py-px text-[12px] font-medium leading-4 text-text-inverse"}>
                {reward.statusText}
              </span>
            ) : null}
          </div>
          <div className="rounded-[12px] bg-[#F7F9FB] px-[10px] py-1.5 text-[14px] leading-5 text-text-secondary">
            {reward.addressText ? `奖品发放地址：${reward.addressText}` : reward.description || "奖励发放信息以平台通知为准"}
          </div>
        </div>
      </section>
    </div>
  );
}

function usePromotionRewardApi(promotionApi?: Pick<PromotionApi, "getActivityReward" | "receiveActivityReward">) {
  const defaultApi = useMemo(() => createPromotionApi(createH5Client()), []);
  return promotionApi ?? defaultApi;
}
