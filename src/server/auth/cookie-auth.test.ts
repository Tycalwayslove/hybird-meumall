import { describe, expect, test } from "vitest";
import { getBackendAuthToken, readCookieAuthFromHeader, readPageConfigFromHeader } from "./cookie-auth";

describe("cookie auth", () => {
  test("reads native runtime cookies on the server side", () => {
    const auth = readCookieAuthFromHeader("theme=dark; pythonToken=python-token; mallToken=mall-token; statusHeight=44; foo=bar");

    expect(auth).toEqual({
      pythonToken: "python-token",
      pythonTokenCookieName: "pythonToken",
      mallToken: "mall-token",
      mallTokenCookieName: "mallToken",
      statusHeight: 44,
      statusHeightCookieName: "statusHeight"
    });
  });

  test("returns null tokens and status height when cookies are missing", () => {
    const auth = readCookieAuthFromHeader("theme=dark");

    expect(auth.pythonToken).toBeNull();
    expect(auth.mallToken).toBeNull();
    expect(auth.statusHeight).toBeNull();
  });

  test("returns backend-specific auth tokens", () => {
    const auth = readCookieAuthFromHeader("pythonToken=python-token; mallToken=mall-token");

    expect(getBackendAuthToken(auth, "python")).toBe("python-token");
    expect(getBackendAuthToken(auth, "java")).toBe("mall-token");
  });

  test("ignores invalid status height", () => {
    expect(readCookieAuthFromHeader("statusHeight=abc").statusHeight).toBeNull();
    expect(readCookieAuthFromHeader("statusHeight=-1").statusHeight).toBeNull();
  });

  test("reads non-sensitive page config from cookie JSON", () => {
    const config = readPageConfigFromHeader(
      `meu_page_config=${encodeURIComponent(JSON.stringify({ source: "app", tab: "home" }))}`
    );

    expect(config).toEqual({
      source: "app",
      tab: "home"
    });
  });
});
