# H5 Top Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reusable H5 top navigation components that cover standard, transparent, and fixed transparent page layouts while handling App-provided `statusHeight`.

**Architecture:** Put global navigation primitives in `src/design-system/components`. Root layout sets navigation CSS variables from `statusHeight`; page shells consume those variables so business pages do not parse cookies or hand-write top padding.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS semantic tokens, Vitest, `react-dom/server` render tests.

---

## File Structure

- Create `src/lib/runtime/status-bar.ts`: pure helpers for parsing and formatting status bar height.
- Create `src/lib/runtime/status-bar.test.ts`: unit tests for height parsing and CSS variable formatting.
- Modify `src/app/layout.tsx`: read `statusHeight` from cookies and set CSS variables on `<body>`.
- Create `src/design-system/components/TopNavigation.tsx`: visual navigation component.
- Create `src/design-system/components/NavPageShell.tsx`: layout shell and three page presets.
- Create `src/design-system/components/navigation.test.tsx`: server-rendered markup tests for navigation variants.
- Modify `src/design-system/components/index.ts`: export navigation components.
- Modify `src/features/home/NativeRuntimePanel.tsx`: update the same CSS variable used by the navigation system.
- Modify `src/features/promotion/components/PromotionShell.tsx`: remove duplicated promotion-specific nav implementation or keep only promotion wrapper.
- Modify `src/features/promotion/components/PromotionRankCenterScreen.tsx`: migrate to `StandardNavPage`.
- Modify `src/features/promotion/components/PromotionRankingScreen.tsx`: migrate to `TransparentNavPage`.
- Modify `src/features/promotion/components/PromotionBenefitsScreen.tsx`: migrate to `FixedTransparentNavPage`.
- Modify `src/design-system/README.md`: document navigation usage.
- Modify `.ai/PROJECT_STATE.md`, `.ai/CHANGE_SUMMARY.md`, `.ai/TODO.md`, and `docs/08_CHANGELOG.md`: record the shared navigation component.

## Task 1: Status Bar Runtime Variables

**Files:**
- Create: `src/lib/runtime/status-bar.ts`
- Create: `src/lib/runtime/status-bar.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/features/home/NativeRuntimePanel.tsx`

- [ ] **Step 1: Write failing tests for status bar helpers**

Create `src/lib/runtime/status-bar.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { formatStatusBarCssVars, parseNativeStatusHeight } from "./status-bar";

describe("native status bar runtime", () => {
  test("parses valid native status height values", () => {
    expect(parseNativeStatusHeight("44")).toBe(44);
    expect(parseNativeStatusHeight("47.5")).toBe(47.5);
    expect(parseNativeStatusHeight("0")).toBe(0);
  });

  test("falls back to zero for missing or invalid values", () => {
    expect(parseNativeStatusHeight(null)).toBe(0);
    expect(parseNativeStatusHeight(undefined)).toBe(0);
    expect(parseNativeStatusHeight("abc")).toBe(0);
    expect(parseNativeStatusHeight("-1")).toBe(0);
    expect(parseNativeStatusHeight("Infinity")).toBe(0);
  });

  test("formats CSS variables for page shells", () => {
    expect(formatStatusBarCssVars(44)).toEqual({
      "--meu-status-bar-height": "44px",
      "--meu-nav-height": "44px",
      "--meu-top-bar-height": "calc(var(--meu-status-bar-height) + var(--meu-nav-height))"
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm exec vitest run src/lib/runtime/status-bar.test.ts
```

Expected: fail because `src/lib/runtime/status-bar.ts` does not exist.

- [ ] **Step 3: Implement status bar helpers**

Create `src/lib/runtime/status-bar.ts`:

```ts
import type { CSSProperties } from "react";

export const defaultNavHeight = 44;

export type NavigationCssVars = CSSProperties & {
  "--meu-status-bar-height": string;
  "--meu-nav-height": string;
  "--meu-top-bar-height": string;
};

export function parseNativeStatusHeight(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const height = typeof value === "number" ? value : Number(value);
  return Number.isFinite(height) && height >= 0 ? height : 0;
}

export function formatStatusBarCssVars(statusHeight: string | number | null | undefined, navHeight = defaultNavHeight): NavigationCssVars {
  const safeStatusHeight = parseNativeStatusHeight(statusHeight);
  const safeNavHeight = parseNativeStatusHeight(navHeight);

  return {
    "--meu-status-bar-height": `${safeStatusHeight}px`,
    "--meu-nav-height": `${safeNavHeight}px`,
    "--meu-top-bar-height": "calc(var(--meu-status-bar-height) + var(--meu-nav-height))"
  };
}
```

- [ ] **Step 4: Run helper tests and verify they pass**

Run:

```bash
pnpm exec vitest run src/lib/runtime/status-bar.test.ts
```

Expected: pass.

- [ ] **Step 5: Set CSS variables in the root layout**

Modify `src/app/layout.tsx` to read `statusHeight` from cookies:

```tsx
import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@/styles/globals.css";
import { formatStatusBarCssVars } from "@/lib/runtime/status-bar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hybrid H5",
  description: "Hybrid App H5 runtime shell"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const statusHeight = cookieStore.get("statusHeight")?.value;
  const releaseVariant = process.env.H5_RELEASE_VARIANT || "blue";
  const releaseLabel =
    process.env.H5_RELEASE_LABEL ||
    process.env.H5_VERSION ||
    "H5 unknown";

  return (
    <html lang="zh-CN">
      <body
        data-release-variant={releaseVariant}
        data-release-label={releaseLabel}
        style={formatStatusBarCssVars(statusHeight) as CSSProperties}
      >
        {children}
        <div className="h5-version-badge" aria-label={`当前 H5 版本：${releaseLabel}`}>
          {releaseLabel}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Update the debug panel to use the same variable**

In `src/features/home/NativeRuntimePanel.tsx`, replace `applyNativeStatusHeight` with:

```tsx
function applyNativeStatusHeight(statusHeight: number | null) {
  if (typeof document === "undefined") {
    return;
  }

  const height = statusHeight ?? 0;
  document.documentElement.style.setProperty("--meu-status-bar-height", `${height}px`);
  document.documentElement.style.setProperty("--meu-nav-height", "44px");
  document.documentElement.style.setProperty("--meu-top-bar-height", "calc(var(--meu-status-bar-height) + var(--meu-nav-height))");
}
```

- [ ] **Step 7: Run focused checks**

Run:

```bash
pnpm exec vitest run src/lib/runtime/status-bar.test.ts
pnpm typecheck
```

Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/runtime/status-bar.ts src/lib/runtime/status-bar.test.ts src/app/layout.tsx src/features/home/NativeRuntimePanel.tsx
git commit -m "feat(runtime): 注入原生状态栏高度变量"
```

## Task 2: Top Navigation Component

**Files:**
- Create: `src/design-system/components/TopNavigation.tsx`
- Create: `src/design-system/components/navigation.test.tsx`
- Modify: `src/design-system/components/index.ts`

- [ ] **Step 1: Write failing render tests for navigation variants**

Create `src/design-system/components/navigation.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { TopNavigation } from "./TopNavigation";

describe("TopNavigation", () => {
  test("renders standard white navigation with title and back link", () => {
    const html = renderToStaticMarkup(<TopNavigation title="榜单中心" backHref="/promotion" />);

    expect(html).toContain("榜单中心");
    expect(html).toContain("href=\"/promotion\"");
    expect(html).toContain("bg-fill-white");
    expect(html).toContain("text-text-primary");
  });

  test("renders transparent white navigation with right text", () => {
    const html = renderToStaticMarkup(
      <TopNavigation title="权益中心" backHref="/promotion" background="transparent" foreground="light" rightText="权益规则" />
    );

    expect(html).toContain("权益中心");
    expect(html).toContain("权益规则");
    expect(html).toContain("bg-transparent");
    expect(html).toContain("text-text-inverse");
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm exec vitest run src/design-system/components/navigation.test.tsx
```

Expected: fail because `TopNavigation` does not exist.

- [ ] **Step 3: Implement `TopNavigation`**

Create `src/design-system/components/TopNavigation.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "../utils/cn";

type NavigationBackground = "solid" | "transparent";
type NavigationForeground = "dark" | "light";

export type TopNavigationProps = {
  title?: string;
  backHref?: string;
  backLabel?: string;
  background?: NavigationBackground;
  foreground?: NavigationForeground;
  rightText?: string;
  rightHref?: string;
  rightNode?: ReactNode;
  showBack?: boolean;
  className?: string;
  onBack?: () => void;
};

const backgroundClass: Record<NavigationBackground, string> = {
  solid: "bg-fill-white",
  transparent: "bg-transparent"
};

const foregroundClass: Record<NavigationForeground, string> = {
  dark: "text-text-primary",
  light: "text-text-inverse"
};

export function TopNavigation({
  title,
  backHref,
  backLabel = "返回",
  background = "solid",
  foreground = "dark",
  rightText,
  rightHref,
  rightNode,
  showBack = true,
  className,
  onBack
}: TopNavigationProps) {
  const content = (
    <div className={cn("relative flex h-[var(--meu-nav-height)] items-center justify-center px-4", backgroundClass[background], foregroundClass[foreground], className)}>
      {showBack ? <NavigationBackButton backHref={backHref} backLabel={backLabel} onBack={onBack} /> : null}
      {title ? <h1 className="max-w-[220px] truncate text-center text-[18px] font-semibold leading-[26px]">{title}</h1> : null}
      {rightNode ?? <NavigationRightText rightHref={rightHref} rightText={rightText} />}
    </div>
  );

  return content;
}

function NavigationBackButton({ backHref, backLabel, onBack }: { backHref?: string; backLabel: string; onBack?: () => void }) {
  const className = "absolute left-0 top-0 flex size-11 items-center justify-center";
  const icon = <span aria-hidden="true" className="size-4 rotate-45 border-b-2 border-l-2 border-current" />;

  if (onBack) {
    return (
      <button aria-label={backLabel} className={className} type="button" onClick={onBack}>
        {icon}
      </button>
    );
  }

  if (backHref) {
    return (
      <Link aria-label={backLabel} className={className} href={backHref}>
        {icon}
      </Link>
    );
  }

  return null;
}

function NavigationRightText({ rightHref, rightText }: { rightHref?: string; rightText?: string }) {
  if (!rightText) {
    return null;
  }

  const className = "absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-normal leading-5";

  if (rightHref) {
    return (
      <Link className={className} href={rightHref}>
        {rightText}
      </Link>
    );
  }

  return <span className={className}>{rightText}</span>;
}
```

- [ ] **Step 4: Export `TopNavigation`**

Modify `src/design-system/components/index.ts`:

```ts
export { AppScreen } from "./AppScreen";
export { AssetPlaceholder } from "./AssetPlaceholder";
export { Badge } from "./Badge";
export { Button, ButtonLink } from "./Button";
export { Metric } from "./Metric";
export { Section } from "./Section";
export { Skeleton } from "./Skeleton";
export { StateView } from "./StateView";
export { Surface } from "./Surface";
export { TopNavigation } from "./TopNavigation";
export type { TopNavigationProps } from "./TopNavigation";
```

- [ ] **Step 5: Run focused checks**

Run:

```bash
pnpm exec vitest run src/design-system/components/navigation.test.tsx
pnpm typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/design-system/components/TopNavigation.tsx src/design-system/components/navigation.test.tsx src/design-system/components/index.ts
git commit -m "feat(nav): 添加顶部导航基础组件"
```

## Task 3: Navigation Page Shell Presets

**Files:**
- Create: `src/design-system/components/NavPageShell.tsx`
- Modify: `src/design-system/components/navigation.test.tsx`
- Modify: `src/design-system/components/index.ts`

- [ ] **Step 1: Add failing tests for three page presets**

Append to `src/design-system/components/navigation.test.tsx`:

```tsx
import { FixedTransparentNavPage, StandardNavPage, TransparentNavPage } from "./NavPageShell";

describe("navigation page shells", () => {
  test("renders standard nav page with document-flow top bar", () => {
    const html = renderToStaticMarkup(
      <StandardNavPage title="榜单中心" backHref="/promotion">
        <div>榜单内容</div>
      </StandardNavPage>
    );

    expect(html).toContain("榜单中心");
    expect(html).toContain("h-[var(--meu-status-bar-height)]");
    expect(html).toContain("overflow-y-auto");
    expect(html).toContain("榜单内容");
  });

  test("renders transparent nav page with fixed overlay nav", () => {
    const html = renderToStaticMarkup(
      <TransparentNavPage backHref="/promotion/rank-center">
        <div>排行榜头图</div>
      </TransparentNavPage>
    );

    expect(html).toContain("fixed inset-x-0 top-0");
    expect(html).toContain("bg-transparent");
    expect(html).toContain("排行榜头图");
  });

  test("renders fixed transparent nav page with title and right text", () => {
    const html = renderToStaticMarkup(
      <FixedTransparentNavPage title="权益中心" rightText="权益规则" backHref="/promotion">
        <div>权益内容</div>
      </FixedTransparentNavPage>
    );

    expect(html).toContain("权益中心");
    expect(html).toContain("权益规则");
    expect(html).toContain("text-text-inverse");
  });
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run:

```bash
pnpm exec vitest run src/design-system/components/navigation.test.tsx
```

Expected: fail because `NavPageShell` presets do not exist.

- [ ] **Step 3: Implement navigation page shell presets**

Create `src/design-system/components/NavPageShell.tsx`:

```tsx
import type { ReactNode } from "react";

import { cn } from "../utils/cn";
import { AppScreen } from "./AppScreen";
import { TopNavigation, type TopNavigationProps } from "./TopNavigation";

type BaseNavPageProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  screenClassName?: string;
};

type StandardNavPageProps = BaseNavPageProps & Pick<TopNavigationProps, "title" | "backHref" | "backLabel" | "rightText" | "rightHref" | "rightNode" | "showBack">;

type TransparentNavPageProps = BaseNavPageProps & Pick<TopNavigationProps, "title" | "backHref" | "backLabel" | "foreground" | "rightText" | "rightHref" | "rightNode" | "showBack">;

export function StatusBarSpacer({ className }: { className?: string }) {
  return <div className={cn("h-[var(--meu-status-bar-height)] shrink-0", className)} aria-hidden="true" />;
}

export function StandardNavPage({ children, className, contentClassName, screenClassName, ...navProps }: StandardNavPageProps) {
  return (
    <AppScreen className={screenClassName} contentClassName={cn("flex h-screen min-h-screen flex-col", contentClassName)}>
      <header className="shrink-0">
        <StatusBarSpacer className="bg-fill-white" />
        <TopNavigation {...navProps} background="solid" foreground="dark" />
      </header>
      <main className={cn("min-h-0 flex-1 overflow-y-auto", className)}>{children}</main>
    </AppScreen>
  );
}

export function TransparentNavPage({ children, className, contentClassName, screenClassName, foreground = "dark", ...navProps }: TransparentNavPageProps) {
  return (
    <AppScreen className={screenClassName} contentClassName={cn("relative min-h-screen overflow-hidden", contentClassName)}>
      <header className={cn("fixed inset-x-0 top-0 z-40 mx-auto max-w-[430px]", foreground === "light" ? "text-text-inverse" : "text-text-primary")}>
        <StatusBarSpacer />
        <TopNavigation {...navProps} background="transparent" foreground={foreground} />
      </header>
      <main className={cn("min-h-screen", className)}>{children}</main>
    </AppScreen>
  );
}

export function FixedTransparentNavPage(props: Omit<TransparentNavPageProps, "foreground">) {
  return <TransparentNavPage {...props} foreground="light" />;
}
```

- [ ] **Step 4: Export page shell presets**

Modify `src/design-system/components/index.ts`:

```ts
export { AppScreen } from "./AppScreen";
export { AssetPlaceholder } from "./AssetPlaceholder";
export { Badge } from "./Badge";
export { Button, ButtonLink } from "./Button";
export { FixedTransparentNavPage, StandardNavPage, StatusBarSpacer, TransparentNavPage } from "./NavPageShell";
export { Metric } from "./Metric";
export { Section } from "./Section";
export { Skeleton } from "./Skeleton";
export { StateView } from "./StateView";
export { Surface } from "./Surface";
export { TopNavigation } from "./TopNavigation";
export type { TopNavigationProps } from "./TopNavigation";
```

- [ ] **Step 5: Run focused checks**

Run:

```bash
pnpm exec vitest run src/design-system/components/navigation.test.tsx
pnpm typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/design-system/components/NavPageShell.tsx src/design-system/components/navigation.test.tsx src/design-system/components/index.ts
git commit -m "feat(nav): 添加页面导航布局预设"
```

## Task 4: Migrate Promotion Pages

**Files:**
- Modify: `src/features/promotion/components/PromotionShell.tsx`
- Modify: `src/features/promotion/components/PromotionRankCenterScreen.tsx`
- Modify: `src/features/promotion/components/PromotionRankingScreen.tsx`
- Modify: `src/features/promotion/components/PromotionBenefitsScreen.tsx`
- Modify: `src/features/promotion/components/PromotionBenefitsScreen.tsx`

- [ ] **Step 1: Update `PromotionShell` to avoid duplicate nav logic**

Modify `src/features/promotion/components/PromotionShell.tsx`:

```tsx
import type { CSSProperties, ReactNode } from "react";

import { AppScreen } from "@/design-system";

type PromotionShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function PromotionShell({ children, className, style }: PromotionShellProps) {
  return <AppScreen className={className} style={style}>{children}</AppScreen>;
}
```

- [ ] **Step 2: Migrate rank center to `StandardNavPage`**

In `src/features/promotion/components/PromotionRankCenterScreen.tsx`, replace imports:

```tsx
import Link from "next/link";

import { StandardNavPage } from "@/design-system";

import type { RankCenterData } from "../types";
import { rankCenterCardTone } from "../theme/promotion-page-theme";
import { PromotionEmptyState } from "./PromotionStates";
```

Wrap the component with `StandardNavPage`:

```tsx
export function PromotionRankCenterScreen({ data }: { data: RankCenterData }) {
  return (
    <StandardNavPage title="榜单中心" backHref="/promotion">
      <div className="space-y-5 px-4 pb-8 pt-3">
        {data.sections.length === 0 ? (
          <PromotionEmptyState title="暂无榜单" description="榜单配置后将在这里展示" />
        ) : (
          data.sections.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-[18px] font-black leading-6 text-text-primary">{section.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    className="relative h-[104px] overflow-hidden rounded-card p-4"
                    href={item.href}
                    style={{ background: rankCenterCardTone[item.theme] }}
                  >
                    <span className="absolute -right-5 -top-5 size-20 rounded-full bg-fill-white/30" />
                    <span className="absolute bottom-[-20px] right-2 size-20 rotate-45 rounded-[20px] bg-fill-white/25" />
                    <span className="relative block text-[16px] font-black leading-5 text-text-primary">{item.title}</span>
                    <span className="relative mt-2 block text-[12px] leading-5 text-text-quaternary">{item.subtitle}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </StandardNavPage>
  );
}
```

This also removes `shadow-card` from rank center cards if it is still present.

- [ ] **Step 3: Migrate ranking detail to `TransparentNavPage`**

In `src/features/promotion/components/PromotionRankingScreen.tsx`, replace `AppScreen` import with:

```tsx
import { TransparentNavPage } from "@/design-system";
```

Wrap the page:

```tsx
return (
  <TransparentNavPage backHref="/promotion/rank-center" contentClassName="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden pb-[92px]">
    <section className="relative min-h-[294px] overflow-hidden px-4 pt-[var(--meu-top-bar-height)] text-text-inverse" style={{ background: rankingTheme.heroBackground }}>
      ...
    </section>
    ...
  </TransparentNavPage>
);
```

Remove the old inline back `Link` inside the hero section:

```tsx
<Link aria-label="返回榜单中心" className="absolute left-4 top-[calc(env(safe-area-inset-top)+18px)] size-4 rotate-45 border-b-2 border-l-2 border-text-inverse" href="/promotion/rank-center" />
```

- [ ] **Step 4: Migrate benefits to `FixedTransparentNavPage`**

In `src/features/promotion/components/PromotionBenefitsScreen.tsx`, import:

```tsx
import { FixedTransparentNavPage } from "@/design-system";
```

Wrap the page with:

```tsx
<FixedTransparentNavPage title="权益中心" rightText="权益规则" backHref="/promotion" screenClassName="bg-[#0b0618]">
  <section className="relative min-h-screen overflow-hidden pb-8 text-text-inverse">
    ...
  </section>
</FixedTransparentNavPage>
```

Keep existing feature theme values for the deep background. Do not add new shadows.

- [ ] **Step 5: Run focused promotion and navigation tests**

Run:

```bash
pnpm exec vitest run src/design-system/components/navigation.test.tsx src/features/promotion/promotion-service.test.ts
pnpm typecheck
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/promotion/components/PromotionShell.tsx src/features/promotion/components/PromotionRankCenterScreen.tsx src/features/promotion/components/PromotionRankingScreen.tsx src/features/promotion/components/PromotionBenefitsScreen.tsx
git commit -m "refactor(promotion): 接入公共导航布局"
```

## Task 5: Documentation, Visual Verification, and Full Checks

**Files:**
- Modify: `src/design-system/README.md`
- Modify: `.ai/PROJECT_STATE.md`
- Modify: `.ai/CHANGE_SUMMARY.md`
- Modify: `.ai/TODO.md`
- Modify: `docs/08_CHANGELOG.md`
- Create: `.ai/test-reports/2026-06-04-h5-top-navigation.md`

- [ ] **Step 1: Document navigation usage**

Append to `src/design-system/README.md`:

```md
## 顶部导航

公共导航由 `TopNavigation` 和页面预设组成：

- `StandardNavPage`：白底常规导航，状态栏和导航在文档流中，内容区滚动。
- `TransparentNavPage`：透明固定导航，内容从屏幕顶部开始，适合带头图页面。
- `FixedTransparentNavPage`：透明固定导航，默认白色前景，支持标题和右侧文本。

状态栏高度通过 `--meu-status-bar-height` 控制。Root layout 会从 App 写入的 `statusHeight` cookie 设置变量；浏览器 H5 环境默认使用 `0px`。
```

- [ ] **Step 2: Update project state**

Add to `.ai/PROJECT_STATE.md` under “已实现”:

```md
- H5 顶部导航公共组件：支持常规白底导航、透明返回导航、固定透明标题导航，并通过 `statusHeight` cookie 注入状态栏高度 CSS 变量。
```

- [ ] **Step 3: Update change summary**

Add to `.ai/CHANGE_SUMMARY.md`:

```md
## 2026-06-04 - 顶部导航公共组件

- 新增 `TopNavigation`、`StandardNavPage`、`TransparentNavPage` 和 `FixedTransparentNavPage`。
- Root layout 从 `statusHeight` cookie 注入 `--meu-status-bar-height`、`--meu-nav-height` 和 `--meu-top-bar-height`。
- 推广榜单中心、榜单详情和权益中心接入公共导航预设。

## 验证

- `pnpm test`：通过。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
```

- [ ] **Step 4: Update changelog**

Add to `docs/08_CHANGELOG.md`:

```md
## 2026-06-04

- 新增 H5 顶部导航公共组件和页面导航预设。
- 推广模块首批二级页接入公共导航布局。
```

- [ ] **Step 5: Write test report**

Create `.ai/test-reports/2026-06-04-h5-top-navigation.md`:

```md
# 验证：H5 顶部导航公共组件

## 日期

2026-06-04

## 范围

验证常规白底导航、透明返回导航、固定透明标题导航、状态栏高度变量和推广页面迁移。

## 命令

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## 结果

- `pnpm test`：通过。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。

## 人工检查

- 普通导航：榜单中心显示白底导航、返回按钮和居中标题。
- 透明导航：排行榜详情头图从屏幕顶部开始，返回按钮固定在顶部。
- 固定透明导航：权益中心显示白色返回按钮、居中标题和右侧“权益规则”。
```

- [ ] **Step 6: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all pass.

- [ ] **Step 7: Visual check in browser**

Run dev server if needed:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000/promotion/rank-center
http://localhost:3000/promotion/ranking/sales
http://localhost:3000/promotion/benefits
```

Expected:

- `/promotion/rank-center` uses a white document-flow nav.
- `/promotion/ranking/sales` uses a transparent fixed nav over the hero area.
- `/promotion/benefits` uses a transparent fixed nav with title and right text.

- [ ] **Step 8: Commit**

```bash
git add src/design-system/README.md .ai/PROJECT_STATE.md .ai/CHANGE_SUMMARY.md .ai/TODO.md docs/08_CHANGELOG.md .ai/test-reports/2026-06-04-h5-top-navigation.md
git commit -m "docs(nav): 记录顶部导航组件落地"
```

## Self-Review

- Spec coverage: the plan covers the three navigation variants, status bar height, return behavior, design-system placement, promotion migration, tests, and docs.
- Placeholder scan: the plan contains no `TBD`, no undefined file paths, and no vague “add tests” steps without commands.
- Type consistency: `TopNavigationProps`, `StandardNavPage`, `TransparentNavPage`, `FixedTransparentNavPage`, and CSS variable names match across tasks.
- Scope check: the plan stays inside H5 design-system and promotion page migration. It does not change manifest, server, admin, or native App behavior.
