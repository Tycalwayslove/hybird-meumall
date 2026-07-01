"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { EmptyState, StandardNavPage } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";

import { createWalletApi } from "../api";
import type { WalletWithdrawRecordGroupView, WalletWithdrawRecordsPageData } from "../server/wallet-real-service";
import styles from "./WithdrawRecordsScreen.module.css";

type WithdrawRecordsStaticViewProps = {
  error: string;
  groups: WalletWithdrawRecordGroupView[];
  loading: boolean;
  loadingMore: boolean;
  loadMoreRef?: RefObject<HTMLDivElement | null>;
  page: WalletWithdrawRecordsPageData["page"] | null;
  onLoadMore: () => void;
  onReload: () => void;
};

const withdrawRecordPageSize = 10;

export function WithdrawRecordsScreen() {
  const [groups, setGroups] = useState<WalletWithdrawRecordGroupView[]>([]);
  const [page, setPage] = useState<WalletWithdrawRecordsPageData["page"] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const requestSeq = useRef(0);
  const api = useMemo(() => createWalletApi(createH5Client()), []);

  const loadRecords = useCallback(
    async ({ append, current }: { append: boolean; current: number }) => {
      const seq = requestSeq.current + 1;
      requestSeq.current = seq;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setGroups([]);
        setPage(null);
      }
      setError("");

      try {
        const result = await api.getWithdrawRecords({ current, size: withdrawRecordPageSize });
        if (requestSeq.current !== seq) {
          return;
        }
        if (!result.success) {
          if (!append) {
            setGroups([]);
            setPage(null);
          }
          setError(result.message || "提现记录加载失败，请稍后重试。");
          setLoading(false);
          setLoadingMore(false);
          return;
        }

        setGroups((previous) => (append ? mergeWithdrawGroups(previous, result.data.view.groups) : result.data.view.groups));
        setPage(result.data.page);
        setLoading(false);
        setLoadingMore(false);
      } catch {
        if (requestSeq.current !== seq) {
          return;
        }
        if (!append) {
          setGroups([]);
          setPage(null);
        }
        setError("提现记录加载失败，请稍后重试。");
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [api]
  );

  useEffect(() => {
    void loadRecords({ append: false, current: 1 });
  }, [loadRecords]);

  const loadMore = useCallback(() => {
    if (!page?.hasMore || loading || loadingMore) {
      return;
    }
    void loadRecords({ append: true, current: page.current + 1 });
  }, [loadRecords, loading, loadingMore, page]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !page?.hasMore || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore, page?.hasMore]);

  return (
    <WithdrawRecordsStaticView
      error={error}
      groups={groups}
      loading={loading}
      loadingMore={loadingMore}
      loadMoreRef={loadMoreRef}
      page={page}
      onLoadMore={loadMore}
      onReload={() => void loadRecords({ append: false, current: 1 })}
    />
  );
}

export function WithdrawRecordsStaticView({
  error,
  groups,
  loading,
  loadingMore,
  loadMoreRef,
  page,
  onLoadMore,
  onReload
}: WithdrawRecordsStaticViewProps) {
  return (
    <StandardNavPage title="提现记录" backHref="/wallet" className={styles.screen} contentClassName={styles.content}>
      {error ? <WithdrawRecordsError message={error} onReload={onReload} /> : null}
      {loading ? (
        <WithdrawRecordsLoading />
      ) : groups.length ? (
        <>
          <div className={styles.recordPanel} aria-label="提现记录列表">
            {groups.map((group) => (
              <section className={styles.monthGroup} key={group.date}>
                <h2>{group.date}</h2>
                <div className={styles.recordList}>
	                  {group.records.map((record) => (
	                    <article className={styles.recordItem} key={record.id}>
	                      <img className={styles.recordIcon} src={localAssetUrl("wallet.withdrawRecordIcon")} alt="" />
	                      <div className={styles.recordInfo}>
                        <h3>{record.title}</h3>
                        <p>{record.time || "时间待确认"}</p>
                      </div>
                      <div className={styles.recordMeta}>
                        <strong>{record.amountText}</strong>
                        <span className={styles[`status_${record.status}`]}>{record.statusText}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <WithdrawRecordsLoadMore hasMore={Boolean(page?.hasMore)} loading={loadingMore} onLoadMore={onLoadMore} sentinelRef={loadMoreRef} />
        </>
      ) : error ? null : (
        <EmptyState className={styles.emptyState} imageSize={142} text="暂无提现记录" />
      )}
    </StandardNavPage>
  );
}

function WithdrawRecordsLoading() {
  return (
    <div className={styles.loadingPanel} aria-label="提现记录加载中">
      {Array.from({ length: 7 }).map((_, index) => (
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

function WithdrawRecordsLoadMore({
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

function WithdrawRecordsError({ message, onReload }: { message: string; onReload: () => void }) {
  return (
    <div className={styles.errorBox}>
      <p>{message}</p>
      <button type="button" onClick={onReload}>
        重新加载
      </button>
    </div>
  );
}

function mergeWithdrawGroups(previous: WalletWithdrawRecordGroupView[], incoming: WalletWithdrawRecordGroupView[]) {
  const merged = previous.map((group) => ({ ...group, records: [...group.records] }));
  for (const group of incoming) {
    const existing = merged.find((item) => item.date === group.date);
    if (existing) {
      existing.records.push(...group.records);
    } else {
      merged.push(group);
    }
  }
  return merged;
}
