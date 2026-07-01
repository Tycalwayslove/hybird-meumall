import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CouponsScreen } from "./components/CouponsScreen";
import { OrderEmptyState, OrdersScreen } from "./components/OrdersScreen";
import { RefundsEmptyState, RefundsScreen } from "./components/RefundsScreen";
import { ProductCollectionScreen } from "./components/ProductCollectionScreen";
import { AddBankCardScreen, AddBankCardStaticView, BankCardsScreen, BankCardsStaticView } from "./components/BankCardsScreen";
import { AccountCertificationScreen, AccountCertificationStaticView, WalletAccountScreen, WalletAccountStaticView } from "./components/WalletAccountScreen";
import { WalletScreen, WalletStaticView } from "./components/WalletScreen";
import { WithdrawRecordsScreen, WithdrawRecordsStaticView } from "./components/WithdrawRecordsScreen";

describe("mine secondary pages", () => {
  test("renders the wallet loading state without mock records", () => {
    const html = renderToStaticMarkup(<WalletScreen />);

    expect(html).toContain("我的钱包");
    expect(html).toContain("钱包数据加载中");
    expect(html).not.toContain("商品名称商品名称");
    expect(html).not.toContain("/wallet?tab=");
  });

  test("renders wallet real data and bank card management entry", () => {
    const html = renderToStaticMarkup(
      <WalletStaticView
        activeState="settled"
        loadingMore={false}
        orders={[
          {
            amountText: "+99.50",
            detailHref: "/orders/NO1001",
            id: "NO1001",
            status: "settled",
            time: "2026-06-30 10:00:00",
            title: "推广订单商品"
          }
        ]}
        ordersError=""
        ordersLoading={false}
        page={{ current: 1, hasMore: false, pages: 1, size: 10, total: 1 }}
        summaryData={{
          modules: {
            wallet: { canWithdrawAmount: 1200.5 }
          },
          view: {
            summary: {
              balanceText: "1200.50",
              pendingIncomeText: "+400.00",
              settledIncomeText: "+800.00",
              unsettledText: "400.00",
              withdrawText: "200.00",
              withdrawableText: "800.00"
            }
          }
        }}
        summaryError=""
        onLoadMore={() => undefined}
        onHistoryWalletClick={() => undefined}
        onReloadOrders={() => undefined}
        onReloadSummary={() => undefined}
        onStateChange={() => undefined}
      />
    );

    expect(html).toContain("帐户余额(元)");
    expect(html).toContain("/assets/shared/green-hero-bg.png");
    expect(html).toContain("1200.50");
    expect(html).toContain('aria-label="账户余额与提现"');
    expect(html).toMatch(/aria-label="账户余额与提现"[\s\S]*1200\.50[\s\S]*提现/);
    expect(html).toContain("提现记录");
    expect(html).toContain("/wallet/withdraw-records");
    expect(html).toContain("银行卡管理");
    expect(html).toContain("/wallet/account");
    expect(html).toContain("/wallet/bank-cards");
    expect(html).not.toContain("历史钱包");
    expect(html).toContain("_accountPerson_");
    expect(html).toContain("_accountBadge_");
    expect(html).toContain("_bankCardShape_");
    expect(html).toContain("推广订单商品");
    expect(html).toContain("没有更多了");
    expect(html).not.toContain("/orders/NO1001");
    expect(html).not.toContain("_chevron_");
    expect(html).not.toContain("本月(1月1日~1月31日)");
    expect(html).not.toContain("全部类型");
    expect(html).not.toContain("收入(元)");
    expect(html).not.toContain("支出(元)");
  });

  test("renders wallet account management and certification info pages", () => {
    const accountLoadingHtml = renderToStaticMarkup(<WalletAccountScreen />);
    const accountHtml = renderToStaticMarkup(<WalletAccountStaticView />);

    expect(accountLoadingHtml).toContain("账户管理");
    expect(accountHtml).toContain("认证信息");
    expect(accountHtml).toContain("/wallet/account/certification");
    expect(accountHtml).not.toContain("_certificationIcon_");
    expect(accountHtml).not.toContain("_menuIcon_");

    const certificationLoadingHtml = renderToStaticMarkup(<AccountCertificationScreen />);
    const certificationHtml = renderToStaticMarkup(
      <AccountCertificationStaticView
        bankCards={[
          {
            acctNum: "6222020202025211",
            bankName: "工商银行",
            cardTypeText: "储蓄卡",
            id: "6222020202025211",
            maskedCardNo: "**** **** **** 5211"
          }
        ]}
        bankCardsLoading={false}
        member={{
          cerNumText: "440***********1234",
          nameText: "张三"
        }}
        memberLoading={false}
      />
    );

    expect(certificationLoadingHtml).toContain("认证信息");
    expect(certificationHtml).toContain("姓名");
    expect(certificationHtml).toContain("张三");
    expect(certificationHtml).toContain("身份证号");
    expect(certificationHtml).toContain("440***********1234");
    expect(certificationHtml).toContain("银行卡列表");
    expect(certificationHtml).toContain("/wallet/bank-cards");
    expect(certificationHtml).toContain("工商银行");
    expect(certificationHtml).not.toContain("实名登记");
  });

  test("renders wallet history entry in navigation when historical wallet exists", () => {
    const html = renderToStaticMarkup(
      <WalletStaticView
        activeState="settled"
        hasHistoryWallet
        loadingMore={false}
        orders={[]}
        ordersError=""
        ordersLoading={false}
        page={{ current: 1, hasMore: false, pages: 1, size: 10, total: 0 }}
        summaryData={{
          modules: {
            wallet: { canWithdrawAmount: 0 }
          },
          view: {
            summary: {
              balanceText: "0.00",
              pendingIncomeText: "+0.00",
              settledIncomeText: "+0.00",
              unsettledText: "0.00",
              withdrawText: "0.00",
              withdrawableText: "0.00"
            }
          }
        }}
        summaryError=""
        onHistoryWalletClick={() => undefined}
        onLoadMore={() => undefined}
        onReloadOrders={() => undefined}
        onReloadSummary={() => undefined}
        onStateChange={() => undefined}
      />
    );

    expect(html).toContain("历史钱包");
    expect(html).toContain('aria-label="打开历史钱包"');
  });

  test("renders wallet empty data instead of inline error cards when wallet requests fail", () => {
    const html = renderToStaticMarkup(
      <WalletStaticView
        activeState="settled"
        loadingMore={false}
        orders={[]}
        ordersError="用户手机号缺失，无法获取推广订单。"
        ordersLoading={false}
        page={null}
        summaryData={null}
        summaryError="用户手机号缺失，无法获取钱包数据。"
        onHistoryWalletClick={() => undefined}
        onLoadMore={() => undefined}
        onReloadOrders={() => undefined}
        onReloadSummary={() => undefined}
        onStateChange={() => undefined}
      />
    );

    expect(html).toContain("帐户余额(元)");
    expect(html).toContain("暂无推广订单");
    expect(html).not.toContain("用户手机号缺失，无法获取钱包数据。");
    expect(html).not.toContain("用户手机号缺失，无法获取推广订单。");
    expect(html).not.toContain("重新加载");
  });

  test("renders wallet withdraw dialog with amount input only", () => {
    const html = renderToStaticMarkup(
      <WalletStaticView
        activeState="settled"
        loadingMore={false}
        orders={[]}
        ordersError=""
        ordersLoading={false}
        page={{ current: 1, hasMore: false, pages: 1, size: 10, total: 0 }}
        summaryData={{
          modules: {
            wallet: { canWithdrawAmount: 800 }
          },
          view: {
            summary: {
              balanceText: "1200.50",
              pendingIncomeText: "+400.00",
              settledIncomeText: "+800.00",
              unsettledText: "400.00",
              withdrawText: "200.00",
              withdrawableText: "800.00"
            }
          }
        }}
        summaryError=""
        withdrawAmount="99.50"
        withdrawDialogOpen
        withdrawError=""
        withdrawSubmitting={false}
        withdrawSuccess=""
        onCloseWithdraw={() => undefined}
        onHistoryWalletClick={() => undefined}
        onLoadMore={() => undefined}
        onReloadOrders={() => undefined}
        onReloadSummary={() => undefined}
        onStateChange={() => undefined}
        onSubmitWithdraw={() => undefined}
        onWithdrawAmountChange={() => undefined}
        onWithdrawClick={() => undefined}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain("请输入您需要提现的金额(元)");
    expect(html).toContain('name="amount"');
    expect(html).toContain('value="99.50"');
    expect(html).toContain("可提现金额 800.00 元");
    expect(html).not.toContain('name="signNum"');
    expect(html).not.toContain('name="notifyUrl"');
    expect(html).not.toContain('name="acctNum"');
  });

  test("renders withdraw record groups and empty state", () => {
    const loadingHtml = renderToStaticMarkup(<WithdrawRecordsScreen />);

    expect(loadingHtml).toContain("提现记录");
    expect(loadingHtml).toContain("提现记录加载中");

    const recordsHtml = renderToStaticMarkup(
      <WithdrawRecordsStaticView
        error=""
        groups={[
          {
            date: "2026-07",
            records: [
              {
                amountText: "-¥98.50",
                id: "1001",
                orderNo: "WD1001",
                status: "processing",
                statusText: "到帐中",
                time: "2026-07-01 10:00:00",
                title: "提现"
              }
            ]
          }
        ]}
        loading={false}
        loadingMore={false}
        page={{ current: 1, hasMore: false, pages: 1, size: 10, total: 1 }}
        onLoadMore={() => undefined}
        onReload={() => undefined}
      />
    );

    expect(recordsHtml).toContain("2026-07");
    expect(recordsHtml).toContain("提现");
    expect(recordsHtml).toContain("2026-07-01 10:00:00");
    expect(recordsHtml).toContain("-¥98.50");
    expect(recordsHtml).toContain("到帐中");
    expect(recordsHtml).toContain("/assets/wallet/withdraw-record-icon.png");
    expect(recordsHtml).toContain("没有更多了");

    const emptyHtml = renderToStaticMarkup(
      <WithdrawRecordsStaticView
        error=""
        groups={[]}
        loading={false}
        loadingMore={false}
        page={{ current: 1, hasMore: false, pages: 1, size: 10, total: 0 }}
        onLoadMore={() => undefined}
        onReload={() => undefined}
      />
    );

    expect(emptyHtml).toContain("暂无提现记录");
  });

  test("renders bank cards loading and real card views", () => {
    const loadingHtml = renderToStaticMarkup(<BankCardsScreen />);

    expect(loadingHtml).toContain("银行卡管理");
    expect(loadingHtml).toContain("银行卡加载中");

    const cardsHtml = renderToStaticMarkup(
      <BankCardsStaticView
        cards={[
          {
            acctNum: "6222020202025211",
            bankName: "工商银行",
            cardTypeText: "储蓄卡",
            id: "6222020202025211",
            maskedCardNo: "**** **** **** 5211"
          }
        ]}
        error=""
        loading={false}
        onReload={() => undefined}
        onRequestUnbind={() => undefined}
        pendingCard={null}
        notice=""
        onCancelUnbind={() => undefined}
        onConfirmUnbind={() => undefined}
        unbinding={false}
      />
    );

    expect(cardsHtml).toContain("工商银行");
    expect(cardsHtml).toContain("储蓄卡");
    expect(cardsHtml).toContain("**** **** **** 5211");
    expect(cardsHtml).toContain("解绑");
    expect(cardsHtml).toContain("/wallet/bank-cards/add");
    expect(cardsHtml).not.toContain(">卡</span>");

    const addedHtml = renderToStaticMarkup(
      <BankCardsStaticView
        cards={[]}
        error=""
        loading={false}
        onReload={() => undefined}
        onRequestUnbind={() => undefined}
        pendingCard={null}
        notice="添加成功"
        onCancelUnbind={() => undefined}
        onConfirmUnbind={() => undefined}
        unbinding={false}
      />
    );

    expect(addedHtml).toContain("添加成功");
  });

  test("renders add bank card form with only required fields", () => {
    const loadingHtml = renderToStaticMarkup(<AddBankCardScreen />);

    expect(loadingHtml).toContain("添加银行卡");

    const formHtml = renderToStaticMarkup(<AddBankCardStaticView error="" submitting={false} onSubmit={() => undefined} />);

    expect(formHtml).toContain("银行卡号");
    expect(formHtml).toContain("身份证号");
    expect(formHtml).toContain("手机号");
    expect(formHtml).toContain('name="acctNum"');
    expect(formHtml).toContain('name="cerNum"');
    expect(formHtml).toContain('name="phone"');
    expect(formHtml).not.toContain('name="signNum"');
    expect(formHtml).not.toContain('name="name"');
  });

  test("renders favorites and edit controls", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="favorites" initialEditing />);

    expect(html).toContain("我的收藏");
    expect(html).toContain("商品列表加载中");
    expect(html).toContain("全选");
    expect(html).toContain("已选<span>0</span>条");
    expect(html).toContain("删除");
    expect(html).not.toContain("夏季纯棉短袖T恤");
  });

  test("renders footprints in real-api loading state without mock products", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="footprints" />);

    expect(html).toContain("我的足迹");
    expect(html).toContain("编辑");
    expect(html).toContain("商品列表加载中");
    expect(html).not.toContain("已售: 1w+");
  });

  test("renders coupon cards", () => {
    const html = renderToStaticMarkup(<CouponsScreen />);

    expect(html).toContain("我的优惠券");
    expect(html).toContain("可使用优惠券");
    expect(html).toContain("优惠券名称");
    expect(html).toContain("去使用");
  });

  test("renders orders tabs in real-api loading state without after-sales refund tab", () => {
    const receivingHtml = renderToStaticMarkup(<OrdersScreen initialStatus="pending-receipt" />);

    expect(receivingHtml).toContain("订单列表");
    expect(receivingHtml).toContain("待收货");
    expect(receivingHtml).not.toContain("退货退款");
    expect(receivingHtml).not.toContain("夏季纯棉短袖");
    expect(receivingHtml).not.toContain("/orders?status=");
  });

  test("uses the shared empty state component for order empty state", () => {
    const html = renderToStaticMarkup(<OrderEmptyState text="这里空空如也~" />);

    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/hybird/assets/placeholders/empty-state-mascot.png");
    expect(html).not.toContain("boxTop");
    expect(html).not.toContain("boxBody");
  });

  test("renders refunds as a standalone page", () => {
    const refundHtml = renderToStaticMarkup(<RefundsScreen />);

    expect(refundHtml).toContain("退货退款");
    expect(refundHtml).toContain("退款记录加载中");
    expect(refundHtml).not.toContain("待付款");
  });

  test("uses the shared empty state component for refund list empty state", () => {
    const html = renderToStaticMarkup(<RefundsEmptyState />);

    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/hybird/assets/placeholders/empty-state-mascot.png");
    expect(html).toContain("暂无退货退款记录");
  });
});
