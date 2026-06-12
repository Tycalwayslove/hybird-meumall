"use client";

import { useState } from "react";

import { TransparentActionNavPage, cn } from "@/design-system";

import { walletSettlementViews, walletSummary, type WalletRecord, type WalletSettlementTab } from "../mock/data";
import styles from "./WalletScreen.module.css";

const settlementTabs: Array<{ id: WalletSettlementTab; title: string }> = [
  { id: "settled", title: "已结算" },
  { id: "pending", title: "待结算" }
];

export function WalletScreen() {
  const [activeTab, setActiveTab] = useState<WalletSettlementTab>("settled");
  const settlementView = walletSettlementViews[activeTab];

  return (
    <TransparentActionNavPage
      title="我的钱包"
      backHref="/mine"
      foreground="dark"
      rightNode={<HistoryWalletEntry />}
      className={styles.screen}
      contentClassName={styles.content}
    >
      <section className={styles.balanceCard} aria-label="钱包余额">
        <div className={styles.balanceTop}>
          <div>
            <div className={styles.balanceLabelRow}>
              <p className={styles.balanceLabel}>帐户余额(元)</p>
              <span>认证：2026-6-12</span>
            </div>
            <strong className={styles.balanceValue}>{walletSummary.balance}</strong>
          </div>
          <button className={styles.withdrawButton} type="button">
            提现
          </button>
        </div>
        <div className={styles.balanceLine} />
        <div className={styles.balanceMeta}>
          <div>
            <p>可提现金额(元)</p>
            <strong>{walletSummary.withdrawable}</strong>
          </div>
          <span aria-hidden="true" />
          <div>
            <p>未结算金额(元)</p>
            <strong>{walletSummary.unsettled}</strong>
          </div>
        </div>
      </section>

      <section className={styles.recordsCard} aria-label="钱包流水">
        <WalletSettlementTabs activeTab={activeTab} onChange={setActiveTab} />
        <div className={styles.filters}>
          <button type="button">本月(1月1日~1月31日)</button>
          <button type="button">全部类型</button>
        </div>
        <div className={styles.settlementData} key={activeTab} aria-live="polite">
          <div className={styles.summaryPanel}>
            <div>
              <span>收入(元)</span>
              <strong className={styles.income}>{settlementView.summary.income}</strong>
            </div>
            <div>
              <span>支出(元)</span>
              <strong className={styles.expense}>{settlementView.summary.expense}</strong>
            </div>
            <div>
              <span>提现(元)</span>
              <strong>{settlementView.summary.withdraw}</strong>
            </div>
          </div>
          <div className={styles.recordList}>
            {settlementView.records.map((record) => (
              <WalletRecordItem key={record.id} record={record} />
            ))}
          </div>
        </div>
      </section>
    </TransparentActionNavPage>
  );
}

function HistoryWalletEntry() {
  return (
    <button className={styles.historyWalletButton} type="button">
      <span>历史钱包</span>
      <span className={styles.historyWalletIcon} aria-hidden="true" />
    </button>
  );
}

function WalletSettlementTabs({
  activeTab,
  onChange
}: {
  activeTab: WalletSettlementTab;
  onChange: (tab: WalletSettlementTab) => void;
}) {
  return (
    <div className={cn(styles.tabs, activeTab === "pending" ? styles.tabsPending : "")} role="tablist" aria-label="结算状态">
      <span className={styles.tabTrack} aria-hidden="true" />
      {settlementTabs.map((tab) => {
        const active = activeTab === tab.id;

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

function WalletRecordItem({ record }: { record: WalletRecord }) {
  return (
    <article className={styles.recordItem}>
      <span className={record.avatarTone === "refund" ? styles.refundAvatar : styles.walletAvatar} aria-hidden="true">
        {record.avatarTone === "refund" ? "退" : null}
      </span>
      <div className={styles.recordInfo}>
        <h2>{record.title}</h2>
        <p>{record.time}</p>
      </div>
      <strong className={record.type === "income" ? styles.recordIncome : styles.recordExpense}>{record.amount}</strong>
      <span className={styles.chevron} aria-hidden="true" />
    </article>
  );
}
