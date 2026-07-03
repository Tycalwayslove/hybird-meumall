export type AddressFlowMode = "manage" | "select";
export type AddressFlowSource = "mine" | "order-confirm" | "product-detail" | "promotion-reward";

export type AddressFlowContext = {
  activityId?: string;
  addressId?: string;
  flowId: string;
  from: AddressFlowSource;
  mode: AddressFlowMode;
  productId?: string;
  quantity?: string;
  skuId?: string;
};

export type AddressFlowResult = {
  addressId: string;
  flowId: string;
  type: "save" | "select";
};

const flowResultKeyPrefix = "meumall.addressFlow.";

export function parseAddressFlowContext(params: Record<string, string | string[] | undefined>): AddressFlowContext {
  const mode: AddressFlowMode = normalizeParam(params.select) === "1" || normalizeParam(params.mode) === "select" ? "select" : "manage";
  const from = normalizeAddressFlowSource(normalizeParam(params.from), mode);
  const productId = normalizeParam(params.productId);
  const activityId = normalizeParam(params.activityId);
  const skuId = normalizeParam(params.skuId);
  const quantity = normalizeParam(params.quantity);
  const addressId = normalizeParam(params.addressId) || normalizeParam(params.addrId);
  const explicitFlowId = normalizeParam(params.flowId);

  return {
    ...(addressId ? { addressId } : {}),
    flowId: explicitFlowId || createStableAddressFlowId({ activityId, from, productId, quantity, skuId }),
    from,
    ...(activityId ? { activityId } : {}),
    mode,
    ...(productId ? { productId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(skuId ? { skuId } : {})
  };
}

export function createAddressListHref(context: AddressFlowContext): string {
  return `/address${createAddressFlowSearch(context)}`;
}

export function createAddressEditHref(context: AddressFlowContext, addrId?: string): string {
  const query = createAddressFlowQuery(context);
  if (addrId) {
    query.set("addrId", addrId);
  }

  return `/address/edit${query.toString() ? `?${query.toString()}` : ""}`;
}

export function createAddressReturnHref(context: AddressFlowContext, addressId: string): string {
  if (context.from === "product-detail" && context.productId) {
    return `/product/${encodeURIComponent(context.productId)}?${new URLSearchParams({ addressId }).toString()}`;
  }

  if (context.from === "order-confirm") {
    const query = new URLSearchParams();
    if (context.productId) {
      query.set("productId", context.productId);
    }
    if (context.skuId) {
      query.set("skuId", context.skuId);
    }
    if (context.quantity) {
      query.set("quantity", context.quantity);
    }
    query.set("addressId", addressId);
    return `/order-confirm?${query.toString()}`;
  }

  if (context.from === "promotion-reward" && context.activityId) {
    return `/promotion/activities/${encodeURIComponent(context.activityId)}/reward?mode=receive`;
  }

  return "/address";
}

export function createAddressBackHref(context: AddressFlowContext): string {
  if (context.mode === "select") {
    if (context.from === "product-detail" && context.productId) {
      return `/product/${encodeURIComponent(context.productId)}`;
    }
    if (context.from === "order-confirm") {
      const query = new URLSearchParams();
      if (context.productId) {
        query.set("productId", context.productId);
      }
      if (context.skuId) {
        query.set("skuId", context.skuId);
      }
      if (context.quantity) {
        query.set("quantity", context.quantity);
      }
      if (context.addressId) {
        query.set("addressId", context.addressId);
      }
      return `/order-confirm${query.toString() ? `?${query.toString()}` : ""}`;
    }
    if (context.from === "promotion-reward" && context.activityId) {
      return `/promotion/activities/${encodeURIComponent(context.activityId)}/reward?mode=receive`;
    }
  }

  return "/mine";
}

export function createStableAddressFlowId({
  activityId,
  from,
  productId,
  quantity,
  skuId
}: {
  activityId?: string;
  from: AddressFlowSource;
  productId?: string;
  quantity?: string;
  skuId?: string;
}): string {
  if (from === "product-detail" && productId) {
    return `product-${productId}`;
  }
  if (from === "order-confirm" && productId && skuId) {
    return `order-${productId}-${skuId}-${quantity || "1"}`;
  }
  if (from === "promotion-reward" && activityId) {
    return `promotion-reward-${activityId}`;
  }

  return "address-manage";
}

export function createAddressFlowResultKey(flowId: string): string {
  return `${flowResultKeyPrefix}${flowId}`;
}

export function writeAddressFlowResult(result: AddressFlowResult, storage: Storage | undefined = getSessionStorage()) {
  storage?.setItem(createAddressFlowResultKey(result.flowId), JSON.stringify(result));
}

export function consumeAddressFlowResult(flowId: string, storage: Storage | undefined = getSessionStorage()): AddressFlowResult | null {
  if (!storage) {
    return null;
  }

  const key = createAddressFlowResultKey(flowId);
  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }

  storage.removeItem(key);
  try {
    const parsed = JSON.parse(raw) as Partial<AddressFlowResult>;
    if (!parsed.addressId || parsed.flowId !== flowId || (parsed.type !== "select" && parsed.type !== "save")) {
      return null;
    }

    return {
      addressId: parsed.addressId,
      flowId,
      type: parsed.type
    };
  } catch {
    return null;
  }
}

function createAddressFlowSearch(context: AddressFlowContext): string {
  const query = createAddressFlowQuery(context);
  return query.toString() ? `?${query.toString()}` : "";
}

function createAddressFlowQuery(context: AddressFlowContext): URLSearchParams {
  const query = new URLSearchParams();
  if (context.mode === "select") {
    query.set("select", "1");
    query.set("from", context.from);
    query.set("flowId", context.flowId);
  }
  if (context.productId) {
    query.set("productId", context.productId);
  }
  if (context.activityId) {
    query.set("activityId", context.activityId);
  }
  if (context.skuId) {
    query.set("skuId", context.skuId);
  }
  if (context.quantity) {
    query.set("quantity", context.quantity);
  }
  if (context.addressId) {
    query.set("addressId", context.addressId);
  }

  return query;
}

function normalizeAddressFlowSource(value: string, mode: AddressFlowMode): AddressFlowSource {
  if (value === "product-detail" || value === "order-confirm" || value === "mine" || value === "promotion-reward") {
    return value;
  }

  return mode === "select" ? "order-confirm" : "mine";
}

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getSessionStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.sessionStorage;
}
