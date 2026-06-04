import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { TopNavigation } from "./TopNavigation";

describe("TopNavigation", () => {
  test("renders standard white navigation with title and back link", () => {
    const html = renderToStaticMarkup(<TopNavigation title="榜单中心" backHref="/promotion" />);

    expect(html).toContain("榜单中心");
    expect(html).toContain('href="/promotion"');
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

  test("renders an onBack button before backHref", () => {
    const html = renderToStaticMarkup(<TopNavigation backHref="/promotion" onBack={() => undefined} title="权益中心" />);

    expect(html).toContain("<button");
    expect(html).toContain('aria-label="返回"');
    expect(html).not.toContain('href="/promotion"');
  });
});
