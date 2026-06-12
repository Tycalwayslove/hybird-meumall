import { describe, expect, test } from "vitest";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "./java-response-codes";

describe("java response codes", () => {
  test("maps common Java business codes to H5 api error codes", () => {
    expect(mapJavaBusinessCodeToApiErrorCode("A00004")).toBe("AUTH_FAILED");
    expect(mapJavaBusinessCodeToApiErrorCode("A00005")).toBe("HTTP_ERROR");
    expect(mapJavaBusinessCodeToApiErrorCode("A00013")).toBe("HTTP_ERROR");
    expect(mapJavaBusinessCodeToApiErrorCode(undefined)).toBe("HTTP_ERROR");
  });

  test("exposes Java response enum metadata", () => {
    expect(getJavaResponseCodeMeta("A00004")).toEqual({
      name: "UNAUTHORIZED",
      message: "Unauthorized"
    });
    expect(getJavaResponseCodeMeta("A00005")).toEqual({
      name: "EXCEPTION",
      message: "服务器出了点小差"
    });
    expect(getJavaResponseCodeMeta("unknown")).toBeUndefined();
  });
});
