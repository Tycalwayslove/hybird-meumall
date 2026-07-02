"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

import { AppScreen, EmptyState, Skeleton, TopNavigation } from "@/design-system";
import { localAssetUrl, type LocalAssetKey } from "@/lib/assets";
import { createH5Client } from "@/lib/http";

import { createPromotionApi, type PromotionApi } from "../api";
import type { PromotionIncentiveActivitiesBffData } from "../server/promotion-incentive-activities-real-service";
import type { PromotionActivitiesPage, PromotionActivity } from "../types";
import { activityCenterTheme, activityStatusTone } from "../theme/promotion-page-theme";

const PAGE_SIZE = 10;
const ONGOING_DISPLAY_STATES = [1, 2, 3, 4];
const PAUSED_DISPLAY_STATES = [0];
const HISTORY_DISPLAY_STATES = [6];

const activityIconAssetKey: Record<PromotionActivity["iconKind"], LocalAssetKey> = {
  order: "promotion.activityIcon.order",
  pk: "promotion.activityIcon.pk"
};

type ActivityListKind = "ongoing" | "paused" | "history";

type ActivityListState = {
  activeCount: number;
  items: PromotionActivity[];
  page: PromotionActivitiesPage;
  status: "idle" | "skeleton" | "loadingMore" | "error";
};

type PromotionActivitiesScreenProps = {
  ongoingData: PromotionIncentiveActivitiesBffData;
  pausedData: PromotionIncentiveActivitiesBffData;
  promotionApi?: Pick<PromotionApi, "getActivities">;
};

type PromotionActivityHistoryScreenProps = {
  data: PromotionIncentiveActivitiesBffData;
  promotionApi?: Pick<PromotionApi, "getActivities">;
};

export function PromotionActivitiesScreen({
  ongoingData,
  pausedData,
  promotionApi
}: PromotionActivitiesScreenProps) {
  const api = usePromotionActivitiesApi(promotionApi);
  const [ongoing, setOngoing] = useState<ActivityListState>(() => toListState(ongoingData));
  const [paused, setPaused] = useState<ActivityListState>(() => toListState(pausedData));
  const loadingSeq = useRef({ ongoing: 0, paused: 0, history: 0 });

  const loadActivities = useCallback(
    async (kind: Exclude<ActivityListKind, "history">, append = false) => {
      const setState = kind === "ongoing" ? setOngoing : setPaused;
      const currentState = kind === "ongoing" ? ongoing : paused;
      const seq = loadingSeq.current[kind] + 1;
      loadingSeq.current[kind] = seq;

      setState((state) => ({ ...state, status: append ? "loadingMore" : "skeleton" }));

      try {
        const result = await api.getActivities({
          current: append ? currentState.page.current + 1 : 1,
          displayStates: kind === "ongoing" ? ONGOING_DISPLAY_STATES : PAUSED_DISPLAY_STATES,
          orderBy: "-createTime",
          size: PAGE_SIZE
        });
        if (loadingSeq.current[kind] !== seq) {
          return;
        }
        if (!result.success) {
          setState((state) => ({ ...state, status: "error" }));
          return;
        }
        setState((state) => ({
          activeCount: result.data.activeCount,
          items: append ? [...state.items, ...result.data.items] : result.data.items,
          page: result.data.page,
          status: "idle"
        }));
      } catch {
        if (loadingSeq.current[kind] === seq) {
          setState((state) => ({ ...state, status: "error" }));
        }
      }
    },
    [api, ongoing, paused]
  );

  const pausedCount = paused.page.total ?? paused.items.length;

  return (
    <AppScreen className="bg-fill-white" contentClassName="flex h-screen min-h-screen flex-col">
      <ActivitiesHeader title="活动中心" backHref="/promotion" />
      <main className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-[86px] pt-[14px]">
        <p className="mb-3 text-[15px] font-semibold leading-[21px] text-text-primary">
          当前<span className="text-success-strong">{ongoing.activeCount}</span>个进行中
        </p>
        <div className="space-y-5">
          <ActivitySection
            emptyText="暂无进行中的活动"
            kind="ongoing"
            loadMore={() => loadActivities("ongoing", true)}
            reload={() => loadActivities("ongoing")}
            showTitle={false}
            state={ongoing}
          />
          <section className="space-y-3">
            <p className="text-[15px] font-semibold leading-[21px] text-text-primary">
              当前<span className="text-success-strong">{pausedCount}</span>个已暂停
            </p>
            <ActivitySection
              emptyText="暂无已暂停的活动"
              kind="paused"
              loadMore={() => loadActivities("paused", true)}
              reload={() => loadActivities("paused")}
              showTitle={false}
              state={paused}
            />
          </section>
        </div>
      </main>
      <Link
        className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[58px] max-w-[430px] items-center justify-center border-t border-line-subtle bg-fill-white pb-[env(safe-area-inset-bottom)] text-[15px] font-semibold leading-5 text-text-primary"
        href="/promotion/activities/history"
      >
        历史活动
      </Link>
    </AppScreen>
  );
}

export function PromotionActivityHistoryScreen({
  data,
  promotionApi
}: PromotionActivityHistoryScreenProps) {
  const api = usePromotionActivitiesApi(promotionApi);
  const [history, setHistory] = useState<ActivityListState>(() => toListState(data));
  const loadingSeq = useRef(0);

  async function loadHistory(append = false) {
    const seq = loadingSeq.current + 1;
    loadingSeq.current = seq;
    setHistory((state) => ({ ...state, status: append ? "loadingMore" : "skeleton" }));

    try {
      const result = await api.getActivities({
        current: append ? history.page.current + 1 : 1,
        displayStates: HISTORY_DISPLAY_STATES,
        orderBy: "-createTime",
        size: PAGE_SIZE
      });
      if (loadingSeq.current !== seq) {
        return;
      }
      if (!result.success) {
        setHistory((state) => ({ ...state, status: "error" }));
        return;
      }
      setHistory((state) => ({
        activeCount: result.data.activeCount,
        items: append ? [...state.items, ...result.data.items] : result.data.items,
        page: result.data.page,
        status: "idle"
      }));
    } catch {
      if (loadingSeq.current === seq) {
        setHistory((state) => ({ ...state, status: "error" }));
      }
    }
  }

  const total = history.page.total ?? history.items.length;

  return (
    <AppScreen className="bg-fill-white" contentClassName="flex h-screen min-h-screen flex-col">
      <ActivitiesHeader title="历史活动" backHref="/promotion/activities" />
      <main className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-8 pt-[14px]">
        <p className="mb-3 text-[15px] font-semibold leading-[21px] text-text-primary">
          当前<span className="text-success-strong">{total}</span>个历史活动
        </p>
        {history.items.length === 0 && history.status !== "skeleton" ? (
          <EmptyState className="min-h-[360px]" text="暂无历史活动" />
        ) : (
          <ActivitySection
            emptyText="暂无历史活动"
            kind="history"
            loadMore={() => loadHistory(true)}
            reload={() => loadHistory()}
            showTitle={false}
            state={history}
          />
        )}
      </main>
    </AppScreen>
  );
}

function ActivitiesHeader({ backHref, title }: { backHref: string; title: string }) {
  return (
    <header className="shrink-0 bg-fill-white">
      <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />
      <TopNavigation backHref={backHref} title={title} />
    </header>
  );
}

function ActivitySection({
  emptyText,
  kind,
  loadMore,
  reload,
  showTitle,
  state,
  title
}: {
  emptyText: string;
  kind: ActivityListKind;
  loadMore: () => void;
  reload: () => void;
  showTitle: boolean;
  state: ActivityListState;
  title?: string;
}) {
  return (
    <section className="space-y-3">
      {showTitle && title ? <h2 className="text-[15px] font-semibold leading-[21px] text-text-primary">{title}</h2> : null}
      {state.status === "skeleton" ? <ActivityCardSkeletonList /> : null}
      {state.status !== "skeleton" && state.items.length === 0 ? (
        <EmptyState className="min-h-[240px]" imageSize={132} text={emptyText} />
      ) : null}
      {state.status !== "skeleton" && state.items.length > 0 ? (
        <div className="space-y-4">
          {state.items.map((item) => <ActivityCard item={item} kind={kind} key={item.id} />)}
        </div>
      ) : null}
      {state.status === "error" ? (
        <button className="mx-auto block h-9 px-4 text-[14px] font-medium leading-5 text-price" onClick={reload} type="button">
          加载失败，点击重试
        </button>
      ) : null}
      {state.page.hasMore && state.status !== "skeleton" ? (
        <button
          className="mx-auto block h-10 px-4 text-[14px] font-medium leading-5 text-text-secondary disabled:text-text-disabled"
          disabled={state.status === "loadingMore"}
          onClick={loadMore}
          type="button"
        >
          {state.status === "loadingMore" ? "加载中..." : "加载更多"}
        </button>
      ) : null}
      {state.status === "loadingMore" ? <ActivityCardSkeletonList count={1} /> : null}
    </section>
  );
}

function ActivityCard({ item, kind }: { item: PromotionActivity; kind: ActivityListKind }) {
  const progressPercent = Math.max(0, Math.min(item.progressPercent, 100));
  const theme = getActivityCardTheme(item, kind);

  return (
    <Link
      className="block min-h-[132px] overflow-hidden rounded-[14px] px-3 pb-[18px] pt-3"
      href={item.href}
      style={{ backgroundColor: theme.background }}
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
      <div className="mt-[18px] flex items-end justify-between gap-3">
        <p className="min-w-0 text-[13px] font-medium leading-[18px] text-text-tertiary">
          {item.progressLabel} <span className={theme.valueClassName}>{item.progressValue}</span>
        </p>
        <p className="shrink-0 text-right text-[12px] leading-[17px] text-text-tertiary">{item.periodText}</p>
      </div>
      <div className="mt-2 h-2.5 rounded-pill bg-fill-white p-0.5">
        <div
          aria-hidden="true"
          className="h-full rounded-pill"
          style={{ width: `${progressPercent}%`, backgroundColor: theme.progressFill }}
        />
      </div>
    </Link>
  );
}

function ActivityIcon({ kind }: { kind: PromotionActivity["iconKind"] }) {
  return (
    <img alt="" className="size-[18px] shrink-0" src={localAssetUrl(activityIconAssetKey[kind])} />
  );
}

function ActivityCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div className="rounded-[14px] bg-fill-muted px-3 pb-[18px] pt-3" key={index}>
          <div className="flex items-center gap-2">
            <Skeleton className="size-[18px] rounded-full" />
            <Skeleton className="h-5 w-[42%]" />
          </div>
          <Skeleton className="mt-3 h-4 w-[68%]" />
          <Skeleton className="mt-[22px] h-4 w-[44%]" />
          <Skeleton className="mt-2 h-2.5 rounded-pill" />
        </div>
      ))}
    </div>
  );
}

function usePromotionActivitiesApi(promotionApi?: Pick<PromotionApi, "getActivities">) {
  const defaultApi = useMemo(() => createPromotionApi(createH5Client()), []);
  return promotionApi ?? defaultApi;
}

function toListState(data: PromotionIncentiveActivitiesBffData): ActivityListState {
  return {
    activeCount: data.activeCount,
    items: data.items,
    page: data.page,
    status: "idle"
  };
}

function getActivityCardTheme(item: PromotionActivity, kind: ActivityListKind) {
  if (kind === "history" || item.status === "ended") {
    return {
      background: "#F6F8FA",
      progressFill: "#C8CCD3",
      valueClassName: "text-text-secondary"
    };
  }
  if (item.status === "paused") {
    return {
      background: "#F7F9FB",
      progressFill: "#D7DCE2",
      valueClassName: "text-text-secondary"
    };
  }
  if (item.iconKind === "pk") {
    return {
      background: "#FFF8EB",
      progressFill: "#FFB24A",
      valueClassName: "text-price"
    };
  }
  return {
    background: activityCenterTheme.cardBackground,
    progressFill: activityCenterTheme.progressFill,
    valueClassName: "text-price"
  };
}
