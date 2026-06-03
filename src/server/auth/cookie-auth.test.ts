import { describe, expect, test } from "vitest";
import { readCookieAuthFromHeader, readPageConfigFromHeader } from "./cookie-auth";

describe("cookie auth", () => {
  test("reads the HttpOnly token cookie on the server side", () => {
    const auth = readCookieAuthFromHeader("theme=dark; meu_access_token=native-token; foo=bar");

    expect(auth).toEqual({
      token: "native-token",
      tokenCookieName: "meu_access_token"
    });
  });

  test("returns null token when cookie is missing", () => {
    const auth = readCookieAuthFromHeader("theme=dark");

    expect(auth.token).toBeNull();
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
