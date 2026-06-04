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
      "--native-status-height": "44px",
      "--meu-status-bar-height": "44px",
      "--meu-nav-height": "44px",
      "--meu-top-bar-height": "calc(var(--meu-status-bar-height) + var(--meu-nav-height))"
    });
  });
});
