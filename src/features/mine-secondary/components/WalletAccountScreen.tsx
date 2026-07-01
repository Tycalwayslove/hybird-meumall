"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createWalletApi } from "../api";
import type { BankCardView, WalletMemberInfoView } from "../server/wallet-real-service";
import styles from "./WalletAccountScreen.module.css";

type AccountCertificationStaticViewProps = {
  bankCards: BankCardView[];
  bankCardsLoading: boolean;
  member: WalletMemberInfoView | null;
  memberLoading: boolean;
};

export function WalletAccountScreen() {
  return <WalletAccountStaticView />;
}

export function WalletAccountStaticView() {
  return (
    <StandardNavPage title="账户管理" backHref="/wallet" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.menuList} aria-label="账户管理">
        <a className={styles.menuItem} href={buildClientHref("/wallet/account/certification")}>
          <span>认证信息</span>
          <span className={styles.chevron} aria-hidden="true" />
        </a>
      </section>
    </StandardNavPage>
  );
}

export function AccountCertificationScreen() {
  const [member, setMember] = useState<WalletMemberInfoView | null>(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const [bankCards, setBankCards] = useState<BankCardView[]>([]);
  const [bankCardsLoading, setBankCardsLoading] = useState(true);
  const api = useMemo(() => createWalletApi(createH5Client()), []);

  const loadMember = useCallback(async () => {
    setMemberLoading(true);
    try {
      const result = await api.getMemberInfo();
      setMember(result.success ? result.data.view.member : null);
    } catch {
      setMember(null);
    } finally {
      setMemberLoading(false);
    }
  }, [api]);

  const loadBankCards = useCallback(async () => {
    setBankCardsLoading(true);
    try {
      const result = await api.getBankCards();
      setBankCards(result.success ? result.data.view.cards : []);
    } catch {
      setBankCards([]);
    } finally {
      setBankCardsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadMember();
    void loadBankCards();
  }, [loadBankCards, loadMember]);

  return <AccountCertificationStaticView bankCards={bankCards} bankCardsLoading={bankCardsLoading} member={member} memberLoading={memberLoading} />;
}

export function AccountCertificationStaticView({ bankCards, bankCardsLoading, member, memberLoading }: AccountCertificationStaticViewProps) {
  return (
    <StandardNavPage title="认证信息" backHref="/wallet/account" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.infoCard} aria-label="认证信息">
        <InfoRow label="姓名" loading={memberLoading} value={member?.nameText ?? "--"} />
        <InfoRow label="身份证号" loading={memberLoading} value={member?.cerNumText ?? "--"} />
      </section>

      <section className={styles.bankSection} aria-label="银行卡列表">
        <a className={styles.sectionHeader} href={buildClientHref("/wallet/bank-cards")}>
          <span>银行卡列表</span>
          <span className={styles.chevron} aria-hidden="true" />
        </a>
        {bankCardsLoading ? (
          <div className={styles.bankLoading}>
            <span />
            <span />
          </div>
        ) : bankCards.length ? (
          <div className={styles.bankPreviewList}>
            {bankCards.slice(0, 2).map((card) => (
              <article className={styles.bankPreview} key={card.id}>
                <div>
                  <h2>{card.bankName}</h2>
                  <p>{card.cardTypeText}</p>
                </div>
                <strong>{card.maskedCardNo}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>暂无绑定银行卡</p>
        )}
      </section>
    </StandardNavPage>
  );
}

function InfoRow({ label, loading, value }: { label: string; loading: boolean; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      {loading ? <i className={styles.valueSkeleton} aria-label={`${label}加载中`} /> : <strong>{value}</strong>}
    </div>
  );
}
