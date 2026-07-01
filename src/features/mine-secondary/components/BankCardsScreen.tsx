"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { EmptyState, StandardNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createWalletApi } from "../api";
import type { BankCardView } from "../server/wallet-real-service";
import styles from "./BankCardsScreen.module.css";

type BankCardsStaticViewProps = {
  cards: BankCardView[];
  error: string;
  loading: boolean;
  notice: string;
  onCancelUnbind: () => void;
  onConfirmUnbind: () => void;
  onReload: () => void;
  onRequestUnbind: (card: BankCardView) => void;
  pendingCard: BankCardView | null;
  unbinding: boolean;
};

type AddBankCardFormInput = {
  acctNum: string;
  cerNum: string;
  phone: string;
};

type AddBankCardStaticViewProps = {
  error: string;
  submitting: boolean;
  onSubmit: (input: AddBankCardFormInput) => void;
};

export function BankCardsScreen({ initialNotice = "" }: { initialNotice?: string } = {}) {
  const [cards, setCards] = useState<BankCardView[]>([]);
  const [pendingCard, setPendingCard] = useState<BankCardView | null>(null);
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [unbinding, setUnbinding] = useState(false);
  const api = useMemo(() => createWalletApi(createH5Client()), []);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.getBankCards();
      if (!result.success) {
        setCards([]);
        setError(result.message || "银行卡加载失败，请稍后重试。");
        setLoading(false);
        return;
      }
      setCards(result.data.view.cards);
      setLoading(false);
    } catch {
      setCards([]);
      setError("银行卡加载失败，请稍后重试。");
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  async function confirmUnbind() {
    if (!pendingCard) {
      return;
    }
    setUnbinding(true);
    setError("");
    const result = await api.unbindBankCard({
      acctNum: pendingCard.acctNum
    });
    if (!result.success) {
      setError(result.message || "解绑银行卡失败，请稍后重试。");
      setUnbinding(false);
      setPendingCard(null);
      return;
    }
    setNotice(result.data.view.message);
    setPendingCard(null);
    setUnbinding(false);
    await loadCards();
  }

  return (
    <BankCardsStaticView
      cards={cards}
      error={error}
      loading={loading}
      notice={notice}
      onCancelUnbind={() => setPendingCard(null)}
      onConfirmUnbind={() => void confirmUnbind()}
      onReload={() => void loadCards()}
      onRequestUnbind={setPendingCard}
      pendingCard={pendingCard}
      unbinding={unbinding}
    />
  );
}

export function AddBankCardScreen() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const api = useMemo(() => createWalletApi(createH5Client()), []);

  async function submit(input: AddBankCardFormInput) {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await api.addBankCard(input);
    if (!result.success) {
      setError(result.message || "添加银行卡失败，请稍后重试。");
      setSubmitting(false);
      return;
    }
    window.location.href = buildClientHref("/wallet/bank-cards?notice=add-success");
  }

  return <AddBankCardStaticView error={error} submitting={submitting} onSubmit={(input) => void submit(input)} />;
}

export function BankCardsStaticView({
  cards,
  error,
  loading,
  notice,
  onCancelUnbind,
  onConfirmUnbind,
  onReload,
  onRequestUnbind,
  pendingCard,
  unbinding
}: BankCardsStaticViewProps) {
  return (
    <StandardNavPage title="银行卡管理" backHref="/wallet" className={styles.screen} contentClassName={styles.content}>
      {error ? (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button type="button" onClick={onReload}>
            重新加载
          </button>
        </div>
      ) : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}
      {loading ? (
        <BankCardsLoading />
      ) : cards.length ? (
        <div className={styles.cardList}>
          {cards.map((card) => (
            <BankCardItem card={card} key={card.id} onRequestUnbind={() => onRequestUnbind(card)} />
          ))}
          <AddCardButton />
        </div>
      ) : error ? null : (
        <div className={styles.emptyWrap}>
          <AddCardButton />
          <EmptyState className={styles.emptyState} imageSize={132} text="暂无绑定银行卡" />
        </div>
      )}
      {pendingCard ? <UnbindDialog card={pendingCard} onCancel={onCancelUnbind} onConfirm={onConfirmUnbind} unbinding={unbinding} /> : null}
    </StandardNavPage>
  );
}

function BankCardItem({ card, onRequestUnbind }: { card: BankCardView; onRequestUnbind: () => void }) {
  return (
    <article className={styles.bankCard}>
      <div className={styles.bankHeader}>
        <div>
          <h2>{card.bankName}</h2>
          <p>{card.cardTypeText}</p>
        </div>
      </div>
      <p className={styles.cardNumber}>{card.maskedCardNo}</p>
      <button className={styles.unbindButton} type="button" onClick={onRequestUnbind}>
        解绑
      </button>
    </article>
  );
}

function AddCardButton() {
  return (
    <a className={styles.addCardButton} href={buildClientHref("/wallet/bank-cards/add")}>
      <span aria-hidden="true">+</span>
      添加银行卡
    </a>
  );
}

export function AddBankCardStaticView({ error, submitting, onSubmit }: AddBankCardStaticViewProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({
      acctNum: String(formData.get("acctNum") ?? ""),
      cerNum: String(formData.get("cerNum") ?? ""),
      phone: String(formData.get("phone") ?? "")
    });
  }

  return (
    <StandardNavPage title="添加银行卡" backHref="/wallet/bank-cards" className={styles.screen} contentClassName={styles.content}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <form className={styles.addForm} onSubmit={handleSubmit}>
        <label>
          <span>银行卡号</span>
          <input autoComplete="cc-number" inputMode="numeric" name="acctNum" placeholder="请输入银行卡号" required />
        </label>
        <label>
          <span>身份证号</span>
          <input autoComplete="off" name="cerNum" placeholder="请输入身份证号" required />
        </label>
        <label>
          <span>手机号</span>
          <input autoComplete="tel" inputMode="tel" name="phone" placeholder="请输入银行预留手机号" required />
        </label>
        <button className={styles.submitButton} type="submit" disabled={submitting}>
          {submitting ? "添加中" : "确认添加"}
        </button>
      </form>
    </StandardNavPage>
  );
}

function BankCardsLoading() {
  return (
    <div className={styles.loadingList} aria-label="银行卡加载中">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className={styles.loadingCard} key={index}>
          <span />
          <i />
          <strong />
        </div>
      ))}
    </div>
  );
}

function UnbindDialog({
  card,
  onCancel,
  onConfirm,
  unbinding
}: {
  card: BankCardView;
  onCancel: () => void;
  onConfirm: () => void;
  unbinding: boolean;
}) {
  return (
    <div className={styles.dialogOverlay} role="presentation">
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="bank-card-unbind-title">
        <h2 id="bank-card-unbind-title">银行卡解绑</h2>
        <p>是否解除绑定该银行卡</p>
        <p className={styles.dialogCard}>{card.bankName} {card.maskedCardNo}</p>
        <div className={styles.dialogActions}>
          <button className={styles.cancelButton} disabled={unbinding} type="button" onClick={onCancel}>
            取消
          </button>
          <button className={cn(styles.confirmButton, unbinding ? styles.confirmButtonLoading : "")} disabled={unbinding} type="button" onClick={onConfirm}>
            {unbinding ? "解绑中" : "确认"}
          </button>
        </div>
      </section>
    </div>
  );
}
