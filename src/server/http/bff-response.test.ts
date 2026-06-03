import { describe, expect, test } from "vitest";
import { createApiError } from "@/lib/api/errors";
import { toBffResponse } from "./bff-response";

describe("bff response", () => {
  test("converts successful backend result to H5 BFF response", async () => {
    const response = toBffResponse({
      ok: true,
      data: { id: "u1" },
      meta: {
        requestId: "req-success",
        route: "/mine",
        h5Version: "v1.0.3",
        appEnv: "test",
        backend: "java"
      }
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { id: "u1" },
      requestId: "req-success"
    });
  });

  test("maps TOKEN_MISSING to 401 response", async () => {
    const response = toBffResponse({
      ok: false,
      error: createApiError("TOKEN_MISSING", { requestId: "req-missing" })
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      code: "TOKEN_MISSING",
      message: "Auth token is unavailable.",
      requestId: "req-missing",
      recoverable: true
    });
  });
});
