import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { StandardNavPage, TransparentActionNavPage, TransparentNavPage } from "./NavPageShell";
import { TopNavigation } from "./TopNavigation";
import { UnderlineTabs } from "./UnderlineTabs";

describe("TopNavigation", () => {
  test("renders standard white navigation with title and back link", () => {
    const html = renderToStaticMarkup(<TopNavigation title="榜单中心" backHref="/promotion" />);

    expect(html).toContain("榜单中心");
    expect(html).toContain("<button");
    expect(html).toContain('aria-label="返回"');
    expect(html).toContain("bg-fill-white");
    expect(html).toContain("text-text-primary");
    expect(html).toContain("size-11");
    expect(html).toContain("size-4");
  });

  test("renders transparent white navigation with right text", () => {
    const html = renderToStaticMarkup(
      <TopNavigation
        title="权益中心"
        backHref="/promotion"
        background="transparent"
        foreground="light"
        rightText="权益规则"
      />
    );

    expect(html).toContain("权益中心");
    expect(html).toContain("权益规则");
    expect(html).toContain("bg-transparent");
    expect(html).toContain("text-text-inverse");
  });

  test("renders right text as a link when rightHref is provided", () => {
    const html = renderToStaticMarkup(
      <TopNavigation title="权益中心" backHref="/promotion" rightHref="/promotion/benefits/rules" rightText="权益规则" />
    );

    expect(html).toContain("权益规则");
    expect(html).toContain('href="/promotion/benefits/rules"');
  });

  test("renders a custom right node before right text", () => {
    const html = renderToStaticMarkup(
      <TopNavigation rightNode={<button type="button">分享</button>} rightText="权益规则" title="权益中心" />
    );

    expect(html).toContain("分享");
    expect(html).not.toContain("权益规则");
  });

  test("renders zero as a custom right node before right text", () => {
    const html = renderToStaticMarkup(<TopNavigation rightNode={0} rightText="权益规则" title="权益中心" />);

    expect(html).toContain(">0</div>");
    expect(html).not.toContain("权益规则");
  });

  test("keeps the title and right text in constrained truncate slots", () => {
    const html = renderToStaticMarkup(<TopNavigation rightText="很长很长的权益规则入口" title="很长很长的权益中心标题" />);

    expect(html).toContain("min-w-0 truncate text-center");
    expect(html).toContain("max-w-[96px]");
    expect(html).toContain("truncate");
  });

  test("renders an onBack button before backHref", () => {
    const html = renderToStaticMarkup(<TopNavigation backHref="/promotion" onBack={() => undefined} title="权益中心" />);

    expect(html).toContain("<button");
    expect(html).toContain('aria-label="返回"');
    expect(html).not.toContain('href="/promotion"');
  });
});

describe("navigation page shells", () => {
  test("renders standard nav page with white nav, status spacer, and scroll content", () => {
    const html = renderToStaticMarkup(
      <StandardNavPage title="榜单中心" backHref="/promotion">
        <div>榜单内容</div>
      </StandardNavPage>
    );

    expect(html).toContain("榜单中心");
    expect(html).toContain("bg-fill-white");
    expect(html).toContain("h-[var(--meu-status-bar-height)]");
    expect(html).toContain("min-h-0 flex-1 overflow-y-auto");
    expect(html).toContain("榜单内容");
  });

  test("renders transparent nav page with fixed header and unpadded full-screen content", () => {
    const html = renderToStaticMarkup(
      <TransparentNavPage backHref="/promotion/rank-center">
        <div>排行榜头图</div>
      </TransparentNavPage>
    );

    expect(html).toContain("fixed left-1/2 top-0 z-40 w-full max-w-[430px] -translate-x-1/2");
    expect(html).toContain("h-[var(--meu-top-bar-height)]");
    expect(html).toContain("bg-transparent");
    expect(html).toContain("h-screen overflow-y-auto");
    expect(html).not.toContain("pt-[var(--meu-top-bar-height)]");
    expect(html).toContain("排行榜头图");
  });

  test("renders transparent action nav page with right text", () => {
    const html = renderToStaticMarkup(
      <TransparentActionNavPage title="权益中心" rightText="权益规则" backHref="/promotion">
        <div>权益内容</div>
      </TransparentActionNavPage>
    );

    expect(html).toContain("权益中心");
    expect(html).toContain("权益规则");
    expect(html).toContain("text-text-inverse");
    expect(html).toContain("权益内容");
  });

  test("keeps a single page-level main landmark from AppScreen", () => {
    const standardHtml = renderToStaticMarkup(
      <StandardNavPage title="榜单中心" backHref="/promotion">
        <div>榜单内容</div>
      </StandardNavPage>
    );
    const transparentHtml = renderToStaticMarkup(
      <TransparentNavPage backHref="/promotion/rank-center">
        <div>排行榜头图</div>
      </TransparentNavPage>
    );

    expect(standardHtml.match(/<main/g)).toHaveLength(1);
    expect(transparentHtml.match(/<main/g)).toHaveLength(1);
  });
});

describe("UnderlineTabs", () => {
  test("renders linked tabs with active state and shared tab semantics", () => {
    const html = renderToStaticMarkup(
      <UnderlineTabs
        activeId="settled"
        tabs={[
          { id: "settled", title: "已结算", href: "/promotion/activities/reward-records?tab=settled" },
          { id: "pending", title: "待结算", href: "/promotion/activities/reward-records?tab=pending" }
        ]}
      />
    );

    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(2);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain('href="/promotion/activities/reward-records?tab=settled"');
    expect(html).toContain("inline-flex h-7 items-start justify-center");
    expect(html).toContain("bg-brand-action");
  });
});
