"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { EmptyState, TransparentActionNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createWalletApi } from "../api";
import type { WalletOrderView, WalletOrdersPageData, WalletState, WalletSummaryData } from "../server/wallet-real-service";
import styles from "./WalletScreen.module.css";

const settlementTabs: Array<{ id: WalletState; title: string }> = [
  { id: "settled", title: "已结算" },
  { id: "pending", title: "待结算" }
];

type WalletStaticViewProps = {
  activeState: WalletState;
  loadingMore: boolean;
  loadMoreRef?: RefObject<HTMLDivElement | null>;
  orders: WalletOrderView[];
  ordersError: string;
  ordersLoading: boolean;
  page: WalletOrdersPageData["page"] | null;
  summaryData: WalletSummaryData | null;
  summaryError: string;
  onLoadMore: () => void;
  onReloadOrders: () => void;
  onReloadSummary: () => void;
  onStateChange: (state: WalletState) => void;
};

const walletOrderPageSize = 10;

export function WalletScreen() {
  const [activeState, setActiveState] = useState<WalletState>("settled");
  const [summaryData, setSummaryData] = useState<WalletSummaryData | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [, setSummaryLoading] = useState(true);
  const [orders, setOrders] = useState<WalletOrderView[]>([]);
  const [page, setPage] = useState<WalletOrdersPageData["page"] | null>(null);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const ordersRequestSeq = useRef(0);
  const api = useMemo(() => createWalletApi(createH5Client()), []);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const result = await api.getWalletSummary();
      if (!result.success) {
        setSummaryData(null);
        setSummaryError(result.message || "钱包数据加载失败，请稍后重试。");
        setSummaryLoading(false);
        return;
      }
      setSummaryData(result.data);
      setSummaryLoading(false);
    } catch {
      setSummaryData(null);
      setSummaryError("钱包数据加载失败，请稍后重试。");
      setSummaryLoading(false);
    }
  }, [api]);

  const loadOrders = useCallback(
    async ({ append, current, state }: { append: boolean; current: number; state: WalletState }) => {
      const requestSeq = ordersRequestSeq.current + 1;
      ordersRequestSeq.current = requestSeq;
      if (append) {
        setLoadingMore(true);
      } else {
        setOrdersLoading(true);
        setOrders([]);
        setPage(null);
      }
      setOrdersError("");
      try {
        const result = await api.getWalletOrders({ current, size: walletOrderPageSize, state });
        if (ordersRequestSeq.current !== requestSeq) {
          return;
        }
        if (!result.success) {
          if (!append) {
            setOrders([]);
            setPage(null);
          }
          setOrdersError(result.message || "推广订单加载失败，请稍后重试。");
          setOrdersLoading(false);
          setLoadingMore(false);
          return;
        }
        setOrders((previous) => (append ? [...previous, ...result.data.view.orders] : result.data.view.orders));
        setPage(result.data.page);
        setOrdersLoading(false);
        setLoadingMore(false);
      } catch {
        if (ordersRequestSeq.current !== requestSeq) {
          return;
        }
        if (!append) {
          setOrders([]);
          setPage(null);
        }
        setOrdersError("推广订单加载失败，请稍后重试。");
        setOrdersLoading(false);
        setLoadingMore(false);
      }
    },
    [api]
  );

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadOrders({ append: false, current: 1, state: activeState });
  }, [activeState, loadOrders]);

  const loadMoreOrders = useCallback(() => {
    if (!page?.hasMore || ordersLoading || loadingMore) {
      return;
    }
    void loadOrders({ append: true, current: page.current + 1, state: activeState });
  }, [activeState, loadOrders, loadingMore, ordersLoading, page]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !page?.hasMore || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreOrders();
        }
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMoreOrders, page?.hasMore]);

  return (
    <WalletStaticView
      activeState={activeState}
      loadingMore={loadingMore}
      loadMoreRef={loadMoreRef}
      orders={orders}
      ordersError={ordersError}
      ordersLoading={ordersLoading}
      page={page}
      summaryData={summaryData}
      summaryError={summaryError}
      onLoadMore={loadMoreOrders}
      onReloadOrders={() => void loadOrders({ append: false, current: 1, state: activeState })}
      onReloadSummary={() => void loadSummary()}
      onStateChange={setActiveState}
    />
  );
}

export function WalletStaticView({
  activeState,
  loadingMore,
  loadMoreRef,
  orders,
  ordersError,
  ordersLoading,
  page,
  summaryData,
  summaryError,
  onLoadMore,
  onReloadOrders,
  onReloadSummary,
  onStateChange
}: WalletStaticViewProps) {
  const summary = summaryData?.view.summary;

  return (
    <TransparentActionNavPage
      title="我的钱包"
      backHref="/mine"
      foreground="dark"
      className={styles.screen}
      contentClassName={styles.content}
    >
      <section className={styles.balanceCard} aria-label="钱包余额">
        <div className={styles.balanceTop}>
          <p className={styles.balanceLabel}>帐户余额(元)</p>
          <WithdrawRecordEntry />
        </div>
        <div className={styles.balanceAmountRow} aria-label="账户余额与提现">
          <strong className={styles.balanceValue}>{summary?.balanceText ?? "--"}</strong>
          <button className={styles.withdrawButton} type="button" disabled>
            提现
          </button>
        </div>
        <div className={styles.balanceLine} />
        <div className={styles.balanceMeta}>
          <div>
            <p>可提现金额(元)</p>
            <strong>{summary?.withdrawableText ?? "--"}</strong>
          </div>
          <span aria-hidden="true" />
          <div>
            <p>未结算金额(元)</p>
            <strong>{summary?.unsettledText ?? "--"}</strong>
          </div>
        </div>
      </section>

      {summaryError ? <WalletError message={summaryError} onReload={onReloadSummary} /> : null}

      <section className={styles.entryGrid} aria-label="钱包管理">
        <button className={styles.entryButton} type="button" disabled>
          <span className={cn(styles.entryIcon, styles.accountIcon)} aria-hidden="true" />
          帐户管理
        </button>
        <a className={styles.entryButton} href={buildClientHref("/wallet/bank-cards")}>
          <span className={cn(styles.entryIcon, styles.bankIcon)} aria-hidden="true" />
          银行卡管理
        </a>
      </section>

      <section className={styles.recordsCard} aria-label="钱包流水">
        <WalletSettlementTabs activeState={activeState} onChange={onStateChange} />
        <div className={styles.settlementData} key={activeState} aria-live="polite">
          {ordersError ? (
            <WalletError message={ordersError} onReload={onReloadOrders} />
          ) : ordersLoading ? (
            <WalletLoading />
          ) : orders.length ? (
            <>
              <WalletRecordList records={orders} />
              <WalletLoadMoreFooter hasMore={Boolean(page?.hasMore)} loading={loadingMore} onLoadMore={onLoadMore} sentinelRef={loadMoreRef} />
            </>
          ) : (
            <EmptyState className={styles.emptyState} imageSize={132} text="暂无推广订单" />
          )}
        </div>
      </section>
    </TransparentActionNavPage>
  );
}

function WalletLoadMoreFooter({
  hasMore,
  loading,
  onLoadMore,
  sentinelRef
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  sentinelRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={styles.loadMoreFooter} ref={sentinelRef}>
      {hasMore ? (
        <button type="button" onClick={onLoadMore} disabled={loading}>
          {loading ? "加载中..." : "上拉加载更多"}
        </button>
      ) : (
        <span>没有更多了</span>
      )}
    </div>
  );
}

function WithdrawRecordEntry() {
  return (
    <a className={styles.historyWalletButton} href={buildClientHref("/wallet/withdraw-records")}>
      <span>提现记录</span>
      <span className={styles.historyWalletIcon} aria-hidden="true" />
    </a>
  );
}

function WalletSettlementTabs({
  activeState,
  onChange
}: {
  activeState: WalletState;
  onChange: (state: WalletState) => void;
}) {
  return (
    <div className={cn(styles.tabs, activeState === "pending" ? styles.tabsPending : "")} role="tablist" aria-label="结算状态">
      <span className={styles.tabTrack} aria-hidden="true" />
      {settlementTabs.map((tab) => {
        const active = activeState === tab.id;

        return (
          <button
            aria-selected={active}
            className={cn(styles.tabButton, active ? styles.tabButtonActive : "")}
            key={tab.id}
            role="tab"
            type="button"
            onClick={() => onChange(tab.id)}
          >
            {tab.title}
          </button>
        );
      })}
    </div>
  );
}

function WalletRecordList({ records }: { records: WalletOrderView[] }) {
  return (
    <div className={styles.recordList}>
      {records.map((record) => (
        <WalletRecordItem key={record.id} record={record} />
      ))}
    </div>
  );
}

function WalletRecordItem({ record }: { record: WalletOrderView }) {
  return (
    <article className={styles.recordItem}>
      {record.imageUrl ? (
        <span className={styles.walletAvatar} aria-hidden="true" style={{ backgroundImage: `url(${record.imageUrl})` }} />
      ) : (
        <span className={record.status === "invalid" ? styles.refundAvatar : styles.walletAvatar} aria-hidden="true">
          {record.status === "invalid" ? "退" : null}
        </span>
      )}
      <div className={styles.recordInfo}>
        <h2>{record.title}</h2>
        <p>{record.time || "时间待确认"}</p>
      </div>
      <strong className={record.amountText.startsWith("-") ? styles.recordExpense : styles.recordIncome}>{record.amountText}</strong>
    </article>
  );
}

function WalletLoading() {
  return (
    <div className={styles.loadingList} aria-label="钱包数据加载中">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className={styles.loadingRow} key={index}>
          <span />
          <div>
            <i />
            <i />
          </div>
          <strong />
        </div>
      ))}
    </div>
  );
}

function WalletError({ message, onReload }: { message: string; onReload: () => void }) {
  return (
    <div className={styles.errorBox}>
      <p>{message}</p>
      <button type="button" onClick={onReload}>
        重新加载
      </button>
    </div>
  );
}
