import { describe, expect, test, vi } from "vitest";
import { buildH5ApiPath, createH5Client } from "./h5-client";

describe("h5 client", () => {
  test("builds BFF path from current versioned H5 pathname", () => {
    expect(buildH5ApiPath("/api/bff/user/profile", { pathname: "/h5-v/v1.0.3/mine" })).toBe(
      "/h5-v/v1.0.3/api/bff/user/profile"
    );
  });

  test("requests BFF with credentials included", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ success: true, data: { id: "u1" }, requestId: "req-h5" }));
    const client = createH5Client({
      fetcher,
      pathname: "/h5-v/v1.0.3/mine",
      requestIdFactory: () => "req-h5"
    });

    const result = await client.request<{ id: string }>("/api/bff/user/profile");

    expect(result).toEqual({
      success: true,
      data: { id: "u1" },
      requestId: "req-h5"
    });
    expect(fetcher).toHaveBeenCalledWith(
      "/h5-v/v1.0.3/api/bff/user/profile",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "x-request-id": "req-h5"
        })
      })
    );
  });
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...init.headers
    }
  });
}
