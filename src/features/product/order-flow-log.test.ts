import { describe, expect, it } from "vitest";

import { createOrderSubmitFlowLogParam, recordOrderConfirmFlow, recordProductDetailFlow } from "./order-flow-log";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("order flow log", () => {
  it("persists the product-to-order flow context and increments submit step", () => {
    const storage = new MemoryStorage();
    const uuids = ["uuid-user", "uuid-session"];
    const deps = {
      now: () => 1000,
      storage,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      uuidFactory: () => uuids.shift() ?? "next-uuid"
    };

    recordProductDetailFlow({ productId: "1000054" }, deps);
    recordOrderConfirmFlow(deps);

    const submitParam = createOrderSubmitFlowLogParam(deps);

    expect(submitParam).toEqual({
      prevPageId: 3,
      step: 2,
      systemType: 5,
      uuid: "uuid-user",
      uuidSession: "uuid-session",
      visitType: 1
    });
  });
});
