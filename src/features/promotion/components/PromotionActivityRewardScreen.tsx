"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppScreen, EmptyState, TopNavigation } from "@/design-system";
import { createAddressApi, type AddressApi } from "@/features/mine-secondary/api";
import {
  consumeAddressFlowResult,
  createAddressListHref,
  createStableAddressFlowId,
  type AddressFlowContext
} from "@/features/mine-secondary/address-flow";
import type { AddressEntry } from "@/features/mine-secondary/mock/address-data";
import { formatAddressLine } from "@/features/mine-secondary/mock/address-data";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createPromotionApi, type PromotionApi } from "../api";
import type { PromotionActivityRewardData, PromotionActivityRewardItem } from "../types";

type PromotionActivityRewardMode = "receive" | "view";

type PromotionActivityRewardScreenProps = {
  data: PromotionActivityRewardData;
  mode: PromotionActivityRewardMode;
  addressApi?: Pick<AddressApi, "getAddressInfo" | "getAddressList">;
  promotionApi?: Pick<PromotionApi, "getActivityReward" | "receiveActivityReward">;
};

export function PromotionActivityRewardScreen({
  addressApi,
  data,
  mode,
  promotionApi
}: PromotionActivityRewardScreenProps) {
  const api = usePromotionRewardApi(promotionApi);
  const addressClient = usePromotionRewardAddressApi(addressApi);
  const addressFlow = useMemo(() => createRewardAddressFlow(viewDataActivityId(data)), [data]);
  const [viewData, setViewData] = useState(data);
  const [selectedReward, setSelectedReward] = useState<PromotionActivityRewardItem | null>(null);
  const [addressReward, setAddressReward] = useState<PromotionActivityRewardItem | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressEntry | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const refreshRewardData = useCallback(
    async (reward: PromotionActivityRewardItem) => {
      const latest = await api.getActivityReward(viewData.activityId);
      if (latest.success && latest.data.view) {
        setViewData(latest.data.view);
        return;
      }

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
    },
    [api, viewData.activityId]
  );

  const loadDefaultAddress = useCallback(
    async (preferredAddressId?: string) => {
      setAddressLoading(true);
      try {
        if (preferredAddressId) {
          const infoResult = await addressClient.getAddressInfo(preferredAddressId);
          if (infoResult.success && infoResult.data) {
            setSelectedAddress(infoResult.data);
            return;
          }
        }

        const listResult = await addressClient.getAddressList();
        if (!listResult.success) {
          setSelectedAddress(null);
          return;
        }
        const addresses = listResult.data.view.addresses;
        setSelectedAddress(addresses.find((address) => address.commonAddr === 1) ?? addresses[0] ?? null);
      } catch {
        setSelectedAddress(null);
      } finally {
        setAddressLoading(false);
      }
    },
    [addressClient]
  );

  useEffect(() => {
    const result = consumeAddressFlowResult(addressFlow.flowId);
    if (!result) {
      return;
    }

    const reward = getStoredAddressReward(viewData.rewards, addressFlow.flowId) ?? viewData.rewards.find(isExpressPhysicalReward);
    if (!reward) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAddressReward(reward);
      void loadDefaultAddress(result.addressId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addressFlow.flowId, loadDefaultAddress, viewData.rewards]);

  async function receiveReward(reward: PromotionActivityRewardItem, addressId?: number) {
    if (!reward.canReceive || receivingId) {
      return;
    }

    if (isExpressPhysicalReward(reward) && addressId === undefined) {
      setAddressReward(reward);
      storeAddressReward(addressFlow.flowId, reward.id);
      void loadDefaultAddress(reward.addressId === undefined ? undefined : String(reward.addressId));
      return;
    }

    setReceivingId(reward.id);
    try {
      const finalAddressId = addressId ?? reward.addressId;
      const result = await api.receiveActivityReward(reward.id, finalAddressId === undefined ? {} : { addressId: finalAddressId });
      if (!result.success) {
        showToast(result.message || "领取失败，请稍后重试");
        return;
      }

      setAddressReward(null);
      await refreshRewardData(reward);
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
    <AppScreen className="bg-[#FFF4F4]" contentClassName="relative h-screen min-h-screen overflow-y-auto">
      <img alt="" aria-hidden="true" className="absolute inset-x-0 top-0 h-[356px] w-full object-cover object-top" src={localAssetUrl("promotion.rewardHeroBg")} />

      <header className="relative z-20">
        <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />
        <TopNavigation backHref={`/promotion/activities/${viewData.activityId}`} background="transparent" foreground="light" title={navTitle} />
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-var(--meu-top-bar-height))] flex-col">
        <section className="relative mx-auto mt-[2px] h-[214px] w-[351px] max-w-[calc(100%-24px)]">
          <img alt="" aria-hidden="true" className="absolute inset-x-0 top-[18px] h-[197px] w-full object-contain" src={localAssetUrl("promotion.rewardInfoCard")} />
          <img alt="" aria-hidden="true" className="absolute -right-[10px] bottom-[0px] h-[112px] w-[132px] object-contain" src={localAssetUrl("promotion.rewardRole")} />
          <div className="absolute inset-x-[54px] top-[66px] text-center">
            <div className="flex items-center justify-center gap-[5px]">
              <span aria-hidden="true" className="h-0.5 w-[19px] rounded-pill bg-[linear-gradient(90deg,rgba(255,45,80,0),#FF2D50)]" />
              <p className="text-[22px] font-semibold leading-[26px] text-price">恭喜您!</p>
              <span aria-hidden="true" className="h-0.5 w-[19px] rounded-pill bg-[linear-gradient(90deg,#FF2D50,rgba(255,45,80,0))]" />
            </div>
            <p className="mt-4 text-[15px] leading-[21px] text-text-primary">{viewData.completion.activityLine}</p>
            <p className="mt-0.5 text-[15px] leading-[21px] text-text-primary">
              {viewData.completion.actionText}
              {viewData.completion.valueText ? <span className="text-price">{viewData.completion.valueText}</span> : null}
            </p>
          </div>
        </section>

        <section className="flex-1 rounded-t-[20px] bg-fill-white px-[14px] pb-[calc(env(safe-area-inset-bottom)+32px)] pt-3">
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
      {addressReward ? (
        <RewardAddressDialog
          address={selectedAddress}
          addressFlow={addressFlow}
          loading={addressLoading}
          receiving={receivingId === addressReward.id}
          reward={addressReward}
          onClose={() => setAddressReward(null)}
          onConfirm={() => {
            if (!selectedAddress?.addrId) {
              showToast("请先选择收货地址");
              return;
            }
            void receiveReward(addressReward, Number(selectedAddress.addrId));
          }}
        />
      ) : null}
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
          {reward.prizeType === 3 && reward.deliverType === 1 ? <p className="mt-1 text-[13px] leading-[18px] text-price">将在公司现场发放</p> : null}
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

function RewardAddressDialog({
  address,
  addressFlow,
  loading,
  onClose,
  onConfirm,
  receiving,
  reward
}: {
  address: AddressEntry | null;
  addressFlow: AddressFlowContext;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  receiving: boolean;
  reward: PromotionActivityRewardItem;
}) {
  const addressHref = buildClientHref(createAddressListHref({
    ...addressFlow,
    ...(address?.addrId ? { addressId: address.addrId } : {})
  }));

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px] bg-black/60 px-6" role="presentation">
      <section
        aria-labelledby="promotion-reward-address-title"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 aspect-[912/1035] w-[342px] max-w-[calc(100%-48px)] -translate-x-1/2 -translate-y-1/2 px-[22px] pb-6 pt-[42px] text-center"
        role="dialog"
      >
        <img alt="" aria-hidden="true" className="absolute inset-0 h-full w-full rounded-[28px] object-fill" src={localAssetUrl("promotion.rewardAddressModalBg")} />
        <button aria-label="关闭" className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center text-[28px] font-light leading-none text-white" type="button" onClick={onClose}>
          ×
        </button>
        <div className="relative z-10 flex h-full flex-col">
          <h2 id="promotion-reward-address-title" className="text-[21px] font-black leading-[28px] text-[#C4161C]">确认领取奖励</h2>
          <p className="mt-2 text-[14px] font-semibold leading-5 text-text-primary">{reward.title}</p>
          <div className="rounded-[16px] px-3 py-4 text-left">
            <p className="text-[14px] font-bold leading-5 text-text-primary">收货地址</p>
            {loading ? (
              <p className="mt-3 text-[13px] leading-5 text-text-secondary">正在读取默认地址...</p>
            ) : address ? (
              <div className="mt-3">
                <p className="text-[15px] font-semibold leading-[21px] text-text-primary">{formatAddressLine(address)}</p>
                <p className="mt-1 text-[13px] leading-[19px] text-text-secondary">{address.addr}</p>
                <p className="mt-2 flex items-center gap-3 text-[13px] leading-[18px] text-text-secondary">
                  <span>{address.receiver}</span>
                  <span>{address.mobile}</span>
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] leading-5 text-text-secondary">暂无可用收货地址，请先新增地址后再领取。</p>
            )}
          </div>
          <div className="absolute inset-x-[18px] bottom-[32px] flex items-center justify-center gap-8">
            <a
              className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-pill bg-white text-[16px] font-bold text-price shadow-[0_10px_22px_rgba(177,19,27,0.24)]"
              href={addressHref}
              onClick={() => storeAddressReward(addressFlow.flowId, reward.id)}
            >
              {address ? "修改地址" : "新增地址"}
            </a>
            <button
              className="h-12 min-w-0 flex-1 rounded-pill bg-white text-[16px] font-bold text-price shadow-[0_10px_22px_rgba(177,19,27,0.24)] disabled:opacity-60"
              disabled={receiving || loading || !address?.addrId}
              type="button"
              onClick={onConfirm}
            >
              {receiving ? "领取中..." : "确认领取"}
            </button>
          </div>
        </div>
      </section>
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

function usePromotionRewardAddressApi(addressApi?: Pick<AddressApi, "getAddressInfo" | "getAddressList">) {
  const defaultApi = useMemo(() => createAddressApi(createH5Client()), []);
  return addressApi ?? defaultApi;
}

function createRewardAddressFlow(activityId: string): AddressFlowContext {
  return {
    activityId,
    flowId: createStableAddressFlowId({ activityId, from: "promotion-reward" }),
    from: "promotion-reward",
    mode: "select"
  };
}

function isExpressPhysicalReward(reward: PromotionActivityRewardItem) {
  return reward.prizeType === 3 && reward.deliverType === 2;
}

function storeAddressReward(flowId: string, rewardId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(createAddressRewardKey(flowId), rewardId);
}

function getStoredAddressReward(rewards: PromotionActivityRewardItem[], flowId: string) {
  if (typeof window === "undefined") {
    return undefined;
  }
  const rewardId = window.sessionStorage.getItem(createAddressRewardKey(flowId));
  if (!rewardId) {
    return undefined;
  }
  window.sessionStorage.removeItem(createAddressRewardKey(flowId));
  return rewards.find((reward) => reward.id === rewardId);
}

function createAddressRewardKey(flowId: string) {
  return `meumall.promotionRewardAddress.${flowId}`;
}

function viewDataActivityId(data: PromotionActivityRewardData) {
  return data.activityId;
}
