"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState, TransparentActionNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createWalletApi } from "../api";
import type { WalletOrderView, WalletPageData, WalletState } from "../server/wallet-real-service";
import styles from "./WalletScreen.module.css";

const settlementTabs: Array<{ id: WalletState; title: string }> = [
  { id: "settled", title: "已结算" },
  { id: "pending", title: "待结算" }
];

type WalletStaticViewProps = {
  activeState: WalletState;
  data: WalletPageData | null;
  error: string;
  loading: boolean;
  onReload: () => void;
  onStateChange: (state: WalletState) => void;
};

export function WalletScreen() {
  const [activeState, setActiveState] = useState<WalletState>("settled");
  const [data, setData] = useState<WalletPageData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const api = useMemo(() => createWalletApi(createH5Client()), []);

  const loadWallet = useCallback(
    async (state: WalletState) => {
      setLoading(true);
      setError("");
      try {
        const result = await api.getWallet({ current: 1, size: 10, state });
        if (!result.success) {
          setData(null);
          setError(result.message || "钱包数据加载失败，请稍后重试。");
          setLoading(false);
          return;
        }
        setData(result.data);
        setLoading(false);
      } catch {
        setData(null);
        setError("钱包数据加载失败，请稍后重试。");
        setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    void loadWallet(activeState);
  }, [activeState, loadWallet]);

  return (
    <WalletStaticView
      activeState={activeState}
      data={data}
      error={error}
      loading={loading}
      onReload={() => void loadWallet(activeState)}
      onStateChange={setActiveState}
    />
  );
}

export function WalletStaticView({ activeState, data, error, loading, onReload, onStateChange }: WalletStaticViewProps) {
  const summary = data?.view.summary;
  const orders = data?.view.orders ?? [];

  return (
    <TransparentActionNavPage
      title="我的钱包"
      backHref="/mine"
      foreground="dark"
      rightNode={<WithdrawRecordEntry />}
      className={styles.screen}
      contentClassName={styles.content}
    >
      <section className={styles.balanceCard} aria-label="钱包余额">
        <div className={styles.balanceTop}>
          <div>
            <p className={styles.balanceLabel}>帐户余额(元)</p>
            <strong className={styles.balanceValue}>{summary?.balanceText ?? "--"}</strong>
          </div>
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
        <div className={styles.filters}>
          <button type="button" disabled>
            本月(1月1日~1月31日)
          </button>
          <button type="button" disabled>
            全部类型
          </button>
        </div>
        <div className={styles.settlementData} key={activeState} aria-live="polite">
          <div className={styles.summaryPanel}>
            <div>
              <span>收入(元)</span>
              <strong className={styles.income}>{activeState === "settled" ? summary?.settledIncomeText ?? "--" : summary?.pendingIncomeText ?? "--"}</strong>
            </div>
            <div>
              <span>支出(元)</span>
              <strong className={styles.expense}>0.00</strong>
            </div>
            <div>
              <span>提现(元)</span>
              <strong>{summary?.withdrawText ?? "--"}</strong>
            </div>
          </div>
          {error ? <WalletError message={error} onReload={onReload} /> : loading ? <WalletLoading /> : orders.length ? <WalletRecordList records={orders} /> : <EmptyState className={styles.emptyState} imageSize={132} text="暂无推广订单" />}
        </div>
      </section>
    </TransparentActionNavPage>
  );
}

function WithdrawRecordEntry() {
  return (
    <button className={styles.historyWalletButton} type="button" disabled>
      <span>提现记录</span>
      <span className={styles.historyWalletIcon} aria-hidden="true" />
    </button>
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
  const content = (
    <>
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
      <span className={styles.chevron} aria-hidden="true" />
    </>
  );

  if (!record.detailHref) {
    return <article className={styles.recordItem}>{content}</article>;
  }

  return (
    <a className={styles.recordItem} href={buildClientHref(record.detailHref)}>
      {content}
    </a>
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
