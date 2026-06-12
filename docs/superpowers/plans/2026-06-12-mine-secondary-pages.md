# Mine Secondary Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first static high-fidelity H5 versions of the personal-center secondary pages: wallet, favorites, footprints, coupons, and orders.

**Architecture:** Keep the work inside `hybird-meumall` and follow existing Next.js App Router plus feature component patterns. Use Figma as visual reference, but implement with local React/TypeScript components, CSS modules, `StandardNavPage`, `ProductImagePlaceholder`, and mock data instead of Figma-generated code or remote assets.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest, project design-system primitives.

---

## File Structure

- Create `src/features/mine-secondary/mock/data.ts`: shared static mock data for wallet records, saved products, coupons, and orders.
- Create `src/features/mine-secondary/components/WalletScreen.tsx` and `.module.css`: wallet card, settlement tabs, filters, summary, and transaction list.
- Create `src/features/mine-secondary/components/ProductCollectionScreen.tsx` and `.module.css`: shared favorites/footprints list plus edit mode with selection footer.
- Create `src/features/mine-secondary/components/CouponsScreen.tsx` and `.module.css`: coupon summary and coupon cards.
- Create `src/features/mine-secondary/components/OrdersScreen.tsx` and `.module.css`: order search, status tabs, cards, and empty state.
- Create route pages under `src/app/wallet/page.tsx`, `src/app/footprints/page.tsx`, and `src/app/coupons/page.tsx`.
- Replace current low-fidelity `src/app/favorites/products/page.tsx` and `src/app/orders/page.tsx`.
- Modify `src/features/mine/mock/data.ts` so wallet balance, footprint, and coupon entries link to the new pages.
- Add focused render tests in `src/features/mine-secondary/mine-secondary-pages.test.tsx`.

## Tasks

### Task 1: RED Tests

**Files:**
- Create: `src/features/mine-secondary/mine-secondary-pages.test.tsx`

- [x] **Step 1: Write failing render tests**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CouponsScreen } from "./components/CouponsScreen";
import { OrdersScreen } from "./components/OrdersScreen";
import { ProductCollectionScreen } from "./components/ProductCollectionScreen";
import { WalletScreen } from "./components/WalletScreen";

describe("mine secondary pages", () => {
  test("renders the wallet balance card and settlement records", () => {
    const html = renderToStaticMarkup(<WalletScreen />);

    expect(html).toContain("我的钱包");
    expect(html).toContain("帐户余额(元)");
    expect(html).toContain("2383.43");
    expect(html).toContain("已结算");
    expect(html).toContain("本月(1月1日~1月31日)");
  });

  test("renders favorites and edit controls", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="favorites" initialEditing />);

    expect(html).toContain("我的收藏");
    expect(html).toContain("夏季纯棉短袖T恤");
    expect(html).toContain("全选");
    expect(html).toContain("已选8条");
    expect(html).toContain("删除");
  });

  test("renders footprints with the same product list structure", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="footprints" />);

    expect(html).toContain("我的足迹");
    expect(html).toContain("编辑");
    expect(html).toContain("已售: 1w+");
  });

  test("renders coupon cards", () => {
    const html = renderToStaticMarkup(<CouponsScreen />);

    expect(html).toContain("我的优惠券");
    expect(html).toContain("可使用优惠券");
    expect(html).toContain("优惠券名称");
    expect(html).toContain("去使用");
  });

  test("renders orders by status and empty state", () => {
    const receivingHtml = renderToStaticMarkup(<OrdersScreen initialStatus="pending-receipt" />);
    const emptyHtml = renderToStaticMarkup(<OrdersScreen initialStatus="empty" />);

    expect(receivingHtml).toContain("订单列表");
    expect(receivingHtml).toContain("待收货");
    expect(receivingHtml).toContain("继续付款");
    expect(emptyHtml).toContain("这里空空如也~");
  });
});
```

- [x] **Step 2: Run tests and verify failure**

Run:

```bash
cd hybird-meumall
pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx
```

Expected: FAIL because the mine-secondary components do not exist yet.

### Task 2: Static Data

**Files:**
- Create: `src/features/mine-secondary/mock/data.ts`

- [x] **Step 1: Define typed mock data**

Create wallet summary, product collection items, coupon rows, and orders using plain strings and local placeholder-friendly values.

### Task 3: Page Components

**Files:**
- Create: `src/features/mine-secondary/components/*.tsx`
- Create: `src/features/mine-secondary/components/*.module.css`

- [x] **Step 1: Implement `WalletScreen`**

Use `StandardNavPage title="我的钱包" backHref="/mine"` and implement the dark balance card plus records.

- [x] **Step 2: Implement `ProductCollectionScreen`**

Use one client component for favorites and footprints, with `initialEditing` for tests and query-compatible edit behavior.

- [x] **Step 3: Implement `CouponsScreen`**

Use static coupon data and CSS shapes instead of remote Figma coupon assets.

- [x] **Step 4: Implement `OrdersScreen`**

Use status tabs and card data; render an empty state for `initialStatus="empty"`.

### Task 4: Routes And Mine Entry Points

**Files:**
- Create: `src/app/wallet/page.tsx`
- Create: `src/app/footprints/page.tsx`
- Create: `src/app/coupons/page.tsx`
- Modify: `src/app/favorites/products/page.tsx`
- Modify: `src/app/orders/page.tsx`
- Modify: `src/features/mine/mock/data.ts`
- Modify: `src/features/mine/components/MineScreen.tsx`

- [x] **Step 1: Wire routes**

Each route page imports its matching screen and passes query defaults where needed.

- [x] **Step 2: Wire `/mine` links**

Make wallet balance open `/wallet`, footprint open `/footprints`, and coupon metric open `/coupons`.

### Task 5: Verification And Records

**Files:**
- Modify: `.ai/CHANGE_SUMMARY.md`
- Modify: `.ai/PROJECT_STATE.md`
- Modify: `.ai/TODO.md`
- Create: `.ai/test-reports/2026-06-12-mine-secondary-pages.md`

- [x] **Step 1: Run focused tests**

Run:

```bash
cd hybird-meumall
pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/assets/asset-url.test.ts
pnpm typecheck
```

- [x] **Step 2: Smoke routes**

Use existing dev server on `http://localhost:3109` and check:

```bash
curl -sS -I http://localhost:3109/hybird/wallet
curl -sS -I http://localhost:3109/hybird/favorites/products
curl -sS -I http://localhost:3109/hybird/footprints
curl -sS -I http://localhost:3109/hybird/coupons
curl -sS -I "http://localhost:3109/hybird/orders?status=pending-receipt"
```

Expected: all return HTTP 200.

## Self Review

- This plan covers every requested page and the mine entry point for wallet balance.
- It keeps the implementation static/mock-only and avoids API, Bridge, manifest, and product-detail changes.
- It uses project-local components and tests rather than Figma-generated Tailwind code.
