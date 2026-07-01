"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { EmptyState, TransparentActionNavPage, cn } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";
import { buildClientHref, createHybridNavigator } from "@/lib/navigation";

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
  hasHistoryWallet?: boolean;
  withdrawAmount?: string;
  withdrawDialogOpen?: boolean;
  withdrawError?: string;
  withdrawSubmitting?: boolean;
  withdrawSuccess?: string;
  onCloseWithdraw?: () => void;
  onHistoryWalletClick?: () => void;
  onLoadMore: () => void;
  onReloadOrders: () => void;
  onReloadSummary: () => void;
  onStateChange: (state: WalletState) => void;
  onSubmitWithdraw?: () => void;
  onWithdrawAmountChange?: (amount: string) => void;
  onWithdrawClick?: () => void;
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
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [hasHistoryWallet, setHasHistoryWallet] = useState(false);
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

  const loadHistoryStatus = useCallback(async () => {
    try {
      const result = await api.getWalletHistoryStatus();
      setHasHistoryWallet(result.success ? result.data.view.hasHistoryWallet : false);
    } catch {
      setHasHistoryWallet(false);
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
    void loadHistoryStatus();
  }, [loadHistoryStatus]);

  useEffect(() => {
    void loadOrders({ append: false, current: 1, state: activeState });
  }, [activeState, loadOrders]);

  const loadMoreOrders = useCallback(() => {
    if (!page?.hasMore || ordersLoading || loadingMore) {
      return;
    }
    void loadOrders({ append: true, current: page.current + 1, state: activeState });
  }, [activeState, loadOrders, loadingMore, ordersLoading, page]);

  const submitWithdraw = useCallback(async () => {
    const withdrawableAmount = getWithdrawableAmount(summaryData);
    const validationMessage = validateWithdrawAmount(withdrawAmount, withdrawableAmount);
    if (validationMessage) {
      setWithdrawError(validationMessage);
      return;
    }

    setWithdrawSubmitting(true);
    setWithdrawError("");
    setWithdrawSuccess("");
    try {
      const result = await api.applyWithdraw({ amount: normalizeWithdrawInputAmount(withdrawAmount) });
      if (!result.success) {
        setWithdrawError(result.message || "提现申请失败，请稍后重试。");
        setWithdrawSubmitting(false);
        return;
      }
      setWithdrawSuccess(result.data.view.message || "提现申请已提交");
      setWithdrawDialogOpen(false);
      setWithdrawAmount("");
      setWithdrawSubmitting(false);
      void loadSummary();
    } catch {
      setWithdrawError("提现申请失败，请稍后重试。");
      setWithdrawSubmitting(false);
    }
  }, [api, loadSummary, summaryData, withdrawAmount]);

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
      hasHistoryWallet={hasHistoryWallet}
      withdrawAmount={withdrawAmount}
      withdrawDialogOpen={withdrawDialogOpen}
      withdrawError={withdrawError}
      withdrawSubmitting={withdrawSubmitting}
      withdrawSuccess={withdrawSuccess}
      onCloseWithdraw={() => {
        if (withdrawSubmitting) {
          return;
        }
        setWithdrawDialogOpen(false);
        setWithdrawError("");
      }}
      onHistoryWalletClick={() => createHybridNavigator().openNativePage("history-wallet")}
      onLoadMore={loadMoreOrders}
      onReloadOrders={() => void loadOrders({ append: false, current: 1, state: activeState })}
      onReloadSummary={() => void loadSummary()}
      onStateChange={setActiveState}
      onSubmitWithdraw={() => void submitWithdraw()}
      onWithdrawAmountChange={(amount) => {
        setWithdrawAmount(amount);
        setWithdrawError("");
      }}
      onWithdrawClick={() => {
        setWithdrawSuccess("");
        setWithdrawError("");
        setWithdrawDialogOpen(true);
      }}
    />
  );
}

export function WalletStaticView({
  activeState,
  loadingMore,
  loadMoreRef,
  orders,
  ordersLoading,
  page,
  summaryData,
  hasHistoryWallet = false,
  withdrawAmount = "",
  withdrawDialogOpen = false,
  withdrawError = "",
  withdrawSubmitting = false,
  withdrawSuccess = "",
  onCloseWithdraw = () => undefined,
  onHistoryWalletClick = () => undefined,
  onLoadMore,
  onStateChange,
  onSubmitWithdraw = () => undefined,
  onWithdrawAmountChange = () => undefined,
  onWithdrawClick = () => undefined
}: WalletStaticViewProps) {
  const summary = summaryData?.view.summary;
  const withdrawableText = summary?.withdrawableText ?? "--";

  return (
    <TransparentActionNavPage
      title="我的钱包"
      backHref="/mine"
      foreground="dark"
      className={styles.screen}
      contentClassName={styles.content}
      rightNode={hasHistoryWallet ? <HistoryWalletEntry onClick={onHistoryWalletClick} /> : null}
    >
      <WalletPageBackground />
      <section className={styles.balanceCard} aria-label="钱包余额">
        <div className={styles.balanceTop}>
          <p className={styles.balanceLabel}>帐户余额(元)</p>
          <WithdrawRecordEntry />
        </div>
        <div className={styles.balanceAmountRow} aria-label="账户余额与提现">
          <strong className={styles.balanceValue}>{summary?.balanceText ?? "--"}</strong>
          <button className={styles.withdrawButton} type="button" onClick={onWithdrawClick}>
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

      {withdrawSuccess ? <div className={styles.noticeBox}>{withdrawSuccess}</div> : null}

      <section className={styles.entryGrid} aria-label="钱包管理">
        <a className={styles.entryButton} href={buildClientHref("/wallet/account")}>
          <span className={cn(styles.entryIcon, styles.accountIcon)} aria-hidden="true">
            <span className={styles.accountPerson} />
            <span className={styles.accountBadge} />
          </span>
          帐户管理
        </a>
        <a className={styles.entryButton} href={buildClientHref("/wallet/bank-cards")}>
          <span className={cn(styles.entryIcon, styles.bankIcon)} aria-hidden="true">
            <span className={styles.bankCardShape} />
          </span>
          银行卡管理
        </a>
      </section>

      <section className={styles.recordsCard} aria-label="钱包流水">
        <WalletSettlementTabs activeState={activeState} onChange={onStateChange} />
        <div className={styles.settlementData} key={activeState} aria-live="polite">
          {ordersLoading ? (
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

      {withdrawDialogOpen ? (
        <WalletWithdrawDialog
          amount={withdrawAmount}
          error={withdrawError}
          submitting={withdrawSubmitting}
          withdrawableText={withdrawableText}
          onAmountChange={onWithdrawAmountChange}
          onClose={onCloseWithdraw}
          onSubmit={onSubmitWithdraw}
        />
      ) : null}
    </TransparentActionNavPage>
  );
}

export function validateWithdrawAmount(amountText: string, withdrawableAmount: number) {
  const amount = Number(amountText);
  if (!amountText.trim() || !Number.isFinite(amount) || amount <= 0) {
    return "请输入正确的提现金额。";
  }
  if (!/^\d+(\.\d{1,2})?$/.test(amountText.trim())) {
    return "提现金额最多保留两位小数。";
  }
  if (amount > withdrawableAmount) {
    return "提现金额不能超过可提现金额。";
  }
  return "";
}

function normalizeWithdrawInputAmount(amountText: string) {
  return Math.round(Number(amountText) * 100) / 100;
}

function getWithdrawableAmount(summaryData: WalletSummaryData | null) {
  const amount = Number(summaryData?.modules.wallet.canWithdrawAmount);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

function WalletWithdrawDialog({
  amount,
  error,
  submitting,
  withdrawableText,
  onAmountChange,
  onClose,
  onSubmit
}: {
  amount: string;
  error: string;
  submitting: boolean;
  withdrawableText: string;
  onAmountChange: (amount: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.withdrawOverlay} aria-label="提现弹窗遮罩">
      <form
        className={styles.withdrawDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-withdraw-title"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <button className={styles.withdrawClose} type="button" aria-label="关闭提现弹窗" onClick={onClose} disabled={submitting}>
          ×
        </button>
        <h2 id="wallet-withdraw-title">提现</h2>
        <p className={styles.withdrawDescription}>请输入您需要提现的金额(元)</p>
        <label className={styles.withdrawField}>
          <span className={styles.srOnly}>提现金额</span>
          <input
            inputMode="decimal"
            name="amount"
            placeholder="请输入"
            type="text"
            value={amount}
            onChange={(event) => onAmountChange(event.currentTarget.value)}
          />
        </label>
        <p className={styles.withdrawHint}>可提现金额 {withdrawableText} 元</p>
        {error ? <p className={styles.withdrawError}>{error}</p> : null}
        <button className={styles.withdrawSubmit} type="submit" disabled={submitting}>
          {submitting ? "提交中..." : "确认"}
        </button>
      </form>
    </div>
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

function HistoryWalletEntry({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.historyWalletEntry} type="button" aria-label="打开历史钱包" onClick={onClick}>
      历史钱包
    </button>
  );
}

function WalletPageBackground() {
  return (
    <div className={styles.pageBackground} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- wallet reuses the same local background image pattern as MineScreen. */}
      <img className={styles.pageBackgroundImage} src={localAssetUrl("mine.hero.background")} alt="" />
    </div>
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
