"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { EmptyState, StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createOrdersApi, type ReturnLogisticsInput } from "../api";
import type { DeliveryCompanyView, LogisticsView, OrderProductView, RefundDetailView } from "../server/orders-real-service";
import { OrderProductItem } from "./OrdersScreen";
import { readRefundContext } from "./OrderDetailScreen";
import type { RefundSessionContext } from "./OrderDetailScreen";
import styles from "./OrdersScreen.module.css";

const refundReasons = [
  { label: "拍错/多拍/不喜欢", value: 0 },
  { label: "协商一致退款", value: 1 },
  { label: "商品破损/少件", value: 2 },
  { label: "商品与描述不符", value: 3 },
  { label: "卖家发错货", value: 4 },
  { label: "质量问题", value: 5 },
  { label: "其他", value: 6 }
];

export function OrderLogisticsScreen({ orderNumber }: { orderNumber: string }) {
  const api = useMemo(() => createOrdersApi(createH5Client()), []);
  const [data, setData] = useState<LogisticsView | null>(null);
  const [deliveryId, setDeliveryId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await api.getOrderLogistics(orderNumber, deliveryId || undefined);
      if (cancelled) return;
      if (!result.success) {
        setError(result.message || "物流信息加载失败。");
        setLoading(false);
        return;
      }
      setData(result.data.view);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [api, deliveryId, orderNumber]);

  return (
    <StandardNavPage title="物流详情" backHref={`/orders/${encodeURIComponent(orderNumber)}`} className={styles.screen} contentClassName={styles.content}>
      {error ? <p className={styles.errorText}>{error}</p> : null}
      {loading ? <section className={styles.detailSection}>物流信息加载中</section> : data ? (
        <div className={styles.detailStack}>
          {data.deliveryList.length > 1 ? (
            <section className={styles.detailSection}>
              <h3>多个包裹</h3>
              <div className={styles.packageTabs}>
                {data.deliveryList.map((item, index) => {
                  const id = String(item.orderDeliveryId ?? "");
                  return (
                    <button className={id === deliveryId || (!deliveryId && index === 0) ? styles.packageTabActive : ""} key={`${id}-${index}`} type="button" onClick={() => setDeliveryId(id)}>
                      包裹{index + 1}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
          <section className={styles.detailSection}>
            <h3>{data.selectedDelivery?.deliveryDto?.companyName || "物流信息"}</h3>
            <p>物流单号：{data.selectedDelivery?.deliveryDto?.dvyFlowId || data.selectedDelivery?.dvyFlowId || "-"}</p>
          </section>
          <section className={styles.detailSection}>
            <h3>物流轨迹</h3>
            <div className={styles.timeline}>
              {data.traces.map((trace, index) => (
                <div className={styles.timelineItem} key={`${trace.time}-${index}`}>
                  <strong>{trace.label}</strong>
                  <span>{trace.time}</span>
                </div>
              ))}
            </div>
          </section>
          {data.selectedDelivery?.orderItems?.length ? (
            <section className={styles.detailSection}>
              <h3>{data.order.shopName}</h3>
              <div className={styles.orderItems}>
                {data.selectedDelivery.orderItems.map((item) => (
                  <OrderProductItem item={toProductView(item)} key={`${item.orderItemId}-${item.skuId}`} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState text="暂无物流信息" />
      )}
    </StandardNavPage>
  );
}

export function ChooseRefundWayScreen({ refundType }: { refundType: 1 | 2 }) {
  const [context, setContext] = useState<RefundSessionContext | null>(null);

  useEffect(() => {
    queueMicrotask(() => setContext(readRefundContext()));
  }, []);

  return (
    <StandardNavPage title="申请退款" backHref={context ? `/orders/${encodeURIComponent(context.order.orderNumber)}` : "/orders"} className={styles.screen} contentClassName={styles.content}>
      {!context ? (
        <EmptyState text="退款上下文已失效，请返回订单详情重新发起" />
      ) : (
        <div className={styles.detailStack}>
          <section className={styles.detailSection}>
            <h3>退款商品</h3>
            <div className={styles.orderItems}>{getRefundGoods(context).map((item) => <OrderProductItem item={item} key={`${item.itemId}-${item.skuId}`} />)}</div>
          </section>
          <section className={styles.refundWayPanel}>
            <a href={buildClientHref(`/refunds/apply?type=1&refundType=${refundType}`)}>
              <strong>仅退款</strong>
              <span>未收到货，或与商家协商后仅退回金额</span>
            </a>
            <a href={buildClientHref(`/refunds/apply?type=2&refundType=${refundType}`)}>
              <strong>退货退款</strong>
              <span>已收到货，需要退回商品并退款</span>
            </a>
          </section>
        </div>
      )}
    </StandardNavPage>
  );
}

export function RefundApplyScreen({ applyType, refundType }: { applyType: 1 | 2; refundType: 1 | 2 }) {
  const api = useMemo(() => createOrdersApi(createH5Client()), []);
  const [context, setContext] = useState<RefundSessionContext | null>(null);
  const [isReceiver, setIsReceiver] = useState(applyType === 2 ? 1 : 0);
  const [buyerReason, setBuyerReason] = useState(0);
  const [goodsNum, setGoodsNum] = useState(1);
  const [refundAmount, setRefundAmount] = useState("0.00");
  const [buyerMobile, setBuyerMobile] = useState("");
  const [buyerDesc, setBuyerDesc] = useState("");
  const [photoFiles, setPhotoFiles] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const next = readRefundContext();
      setContext(next);
      if (next) {
        const amount = refundType === 1 ? next.order.totalAmount : next.item?.actualTotal ?? next.item?.price ?? 0;
        setGoodsNum(refundType === 1 ? next.order.items.reduce((sum, item) => sum + item.quantity, 0) : next.item?.quantity ?? 1);
        setRefundAmount(amount.toFixed(2));
        setBuyerMobile(next.order.buyerMobile);
      }
    });
  }, [refundType]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!context) return;
    if (!buyerDesc.trim()) {
      setError("请填写退款说明。");
      return;
    }
    if (buyerMobile && !/^1\d{10}$/.test(buyerMobile)) {
      setError("请输入正确的手机号。");
      return;
    }
    setSubmitting(true);
    setError("");
    const item = context.item;
    const result = await api.submitRefundApplication({
      applyType,
      buyerDesc: buyerDesc.trim(),
      buyerMobile,
      buyerReason: isReceiver === 0 && buyerReason === 2 ? 6 : buyerReason,
      giveawayItemIds: item?.giveawayItems.map((gift) => gift.orderItemId || gift.itemId || "").filter(Boolean),
      goodsNum,
      isReceiver,
      orderId: context.order.orderId,
      orderItemId: refundType === 2 ? item?.orderItemId || item?.itemId : undefined,
      orderNumber: context.order.orderNumber,
      photoFiles,
      refundAmount,
      refundType
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || "退款申请提交失败。");
      return;
    }
    window.location.replace(buildClientHref("/refunds"));
  };

  return (
    <StandardNavPage title="申请退款" backHref={context ? `/orders/${encodeURIComponent(context.order.orderNumber)}` : "/orders"} className={styles.screen} contentClassName={styles.content}>
      {!context ? (
        <EmptyState text="退款上下文已失效，请返回订单详情重新发起" />
      ) : (
        <form className={styles.detailStack} onSubmit={onSubmit}>
          <section className={styles.detailSection}>
            <h3>{applyType === 1 ? "仅退款" : "退货退款"}</h3>
            <div className={styles.orderItems}>{getRefundGoods(context).map((item) => <OrderProductItem item={item} key={`${item.itemId}-${item.skuId}`} />)}</div>
          </section>
          <section className={styles.formPanel}>
            <label>
              货物状态
              <select value={isReceiver} onChange={(event) => setIsReceiver(Number(event.target.value))}>
                <option value={0}>未收到货</option>
                <option value={1}>已收到货</option>
              </select>
            </label>
            <label>
              退款原因
              <select value={buyerReason} onChange={(event) => setBuyerReason(Number(event.target.value))}>
                {refundReasons.map((reason) => (
                  <option value={reason.value} key={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              退款数量
              <input min={1} type="number" value={goodsNum} onChange={(event) => setGoodsNum(Number(event.target.value))} />
            </label>
            <label>
              退款金额
              <input inputMode="decimal" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} />
            </label>
            <label>
              手机号
              <input inputMode="tel" maxLength={11} value={buyerMobile} onChange={(event) => setBuyerMobile(event.target.value)} />
            </label>
            <label>
              退款说明
              <textarea maxLength={50} value={buyerDesc} onChange={(event) => setBuyerDesc(event.target.value)} />
            </label>
            <label>
              凭证图片路径
              <input placeholder="多个路径用英文逗号分隔" value={photoFiles} onChange={(event) => setPhotoFiles(event.target.value)} />
            </label>
          </section>
          {error ? <p className={styles.errorText}>{error}</p> : null}
          <button className={styles.fullPrimaryButton} disabled={submitting} type="submit">
            {submitting ? "提交中..." : "提交申请"}
          </button>
        </form>
      )}
    </StandardNavPage>
  );
}

export function PlatformInterventionScreen({ pageType, refundSn }: { pageType: 1 | 2; refundSn: string }) {
  const api = useMemo(() => createOrdersApi(createH5Client()), []);
  const [detail, setDetail] = useState<RefundDetailView | null>(null);
  const [voucherDesc, setVoucherDesc] = useState("");
  const [imgUrls, setImgUrls] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void api.getRefundDetail(refundSn).then((result) => {
      if (result.success) setDetail(result.data.view);
      else setError(result.message || "退款详情加载失败。");
    });
  }, [api, refundSn]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detail) return;
    setSubmitting(true);
    const result = await api.submitPlatformIntervention({
      imgUrls,
      orderNumber: detail.orderNumber,
      pageType,
      refundId: detail.refundId,
      refundSts: detail.returnMoneySts,
      voucherDesc
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || "提交失败。");
      return;
    }
    window.location.replace(buildClientHref(`/refunds/${encodeURIComponent(refundSn)}`));
  };

  return (
    <StandardNavPage title={pageType === 1 ? "申请平台介入" : "补充凭证"} backHref={`/refunds/${encodeURIComponent(refundSn)}`} className={styles.screen} contentClassName={styles.content}>
      <form className={styles.detailStack} onSubmit={onSubmit}>
        <section className={styles.formPanel}>
          <label>
            {pageType === 1 ? "申请原因" : "凭证说明"}
            <textarea maxLength={200} value={voucherDesc} onChange={(event) => setVoucherDesc(event.target.value)} />
          </label>
          <label>
            凭证图片路径
            <input placeholder="最多 3 张，多个路径用英文逗号分隔" value={imgUrls} onChange={(event) => setImgUrls(event.target.value)} />
          </label>
        </section>
        {error ? <p className={styles.errorText}>{error}</p> : null}
        <button className={styles.fullPrimaryButton} disabled={submitting || !detail} type="submit">
          {submitting ? "提交中..." : "提交"}
        </button>
      </form>
    </StandardNavPage>
  );
}

export function ReturnLogisticsScreen({ isModify, refundSn }: { isModify: boolean; refundSn: string }) {
  const api = useMemo(() => createOrdersApi(createH5Client()), []);
  const [companies, setCompanies] = useState<DeliveryCompanyView[]>([]);
  const [form, setForm] = useState<ReturnLogisticsInput>({ expressId: "", expressName: "", expressNo: "", isModify, refundSn });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void api.getDeliveryCompanies().then((result) => {
      if (result.success) setCompanies(result.data.view.companies);
    });
    if (isModify) {
      void api.getRefundDetail(refundSn).then((result) => {
        if (!result.success || !result.data.view.refundDelivery) return;
        const delivery = result.data.view.refundDelivery;
        setForm((prev) => ({
          ...prev,
          expressName: delivery.companyName,
          expressNo: delivery.expressNo,
          imgs: delivery.imgs.join(","),
          mobile: delivery.mobile,
          senderRemarks: delivery.senderRemarks
        }));
      });
    }
  }, [api, isModify, refundSn]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.expressId || !form.expressName || !form.expressNo) {
      setError("请选择物流公司并填写物流单号。");
      return;
    }
    if (!/^[0-9a-zA-Z]+$/.test(form.expressNo)) {
      setError("物流单号只能输入英文或数字。");
      return;
    }
    setSubmitting(true);
    const result = await api.submitReturnLogistics(form);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || "退货物流提交失败。");
      return;
    }
    window.location.replace(buildClientHref(`/refunds/${encodeURIComponent(refundSn)}`));
  };

  return (
    <StandardNavPage title="填写退货物流" backHref={`/refunds/${encodeURIComponent(refundSn)}`} className={styles.screen} contentClassName={styles.content}>
      <form className={styles.detailStack} onSubmit={onSubmit}>
        <section className={styles.formPanel}>
          <label>
            物流公司
            <select
              value={form.expressId}
              onChange={(event) => {
                const company = companies.find((item) => item.id === event.target.value);
                setForm((prev) => ({ ...prev, expressId: event.target.value, expressName: company?.name || "" }));
              }}
            >
              <option value="">请选择</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            物流单号
            <input maxLength={20} value={form.expressNo} onChange={(event) => setForm((prev) => ({ ...prev, expressNo: event.target.value }))} />
          </label>
          <label>
            备注
            <input maxLength={200} value={form.senderRemarks || ""} onChange={(event) => setForm((prev) => ({ ...prev, senderRemarks: event.target.value }))} />
          </label>
          <label>
            物流凭证路径
            <input placeholder="多个路径用英文逗号分隔" value={form.imgs || ""} onChange={(event) => setForm((prev) => ({ ...prev, imgs: event.target.value }))} />
          </label>
        </section>
        {error ? <p className={styles.errorText}>{error}</p> : null}
        <button className={styles.fullPrimaryButton} disabled={submitting} type="submit">
          {submitting ? "提交中..." : "提交"}
        </button>
      </form>
    </StandardNavPage>
  );
}

function getRefundGoods(context: RefundSessionContext) {
  return context.refundType === 1 ? context.order.items : context.item ? [context.item] : [];
}

function toProductView(item: {
  actualTotal?: number | string | null;
  orderItemId?: number | string | null;
  pic?: string | null;
  price?: number | string | null;
  prodCount?: number | string | null;
  prodId?: number | string | null;
  prodName?: string | null;
  properties?: string | null;
  refundSn?: string | null;
  skuId?: number | string | null;
}): OrderProductView {
  return {
    actualTotal: Number(item.actualTotal ?? item.price ?? 0),
    afterSaleTags: [],
    canRefund: false,
    comboItems: [],
    giveawayItems: [],
    imageUrl: item.pic || undefined,
    isGift: false,
    itemId: String(item.orderItemId ?? ""),
    orderItemId: String(item.orderItemId ?? ""),
    price: Number(item.price ?? 0),
    prodId: String(item.prodId ?? ""),
    properties: item.properties || "",
    quantity: Number(item.prodCount ?? 1),
    refundSn: item.refundSn || "",
    skuId: String(item.skuId ?? ""),
    title: item.prodName || "商品",
    useScore: 0
  };
}
