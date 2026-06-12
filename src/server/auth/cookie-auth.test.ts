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

  test("uses local env tokens only when local cookies are missing", () => {
    const auth = readCookieAuthFromHeader("theme=dark", {
      env: {
        APP_ENV: "local",
        H5_LOCAL_JAVA_TOKEN: " local-java-token ",
        H5_LOCAL_PYTHON_TOKEN: "local-python-token"
      }
    });

    expect(auth.mallToken).toBe("local-java-token");
    expect(auth.pythonToken).toBe("local-python-token");
    expect(getBackendAuthToken(auth, "java")).toBe("local-java-token");
    expect(getBackendAuthToken(auth, "python")).toBe("local-python-token");
  });

  test("keeps cookie tokens ahead of local env token fallback", () => {
    const auth = readCookieAuthFromHeader("mallToken=cookie-java; pythonToken=cookie-python", {
      env: {
        APP_ENV: "local",
        H5_LOCAL_JAVA_TOKEN: "local-java-token",
        H5_LOCAL_PYTHON_TOKEN: "local-python-token"
      }
    });

    expect(auth.mallToken).toBe("cookie-java");
    expect(auth.pythonToken).toBe("cookie-python");
  });

  test("treats empty cookie tokens as missing and uses local fallback", () => {
    const auth = readCookieAuthFromHeader("mallToken=; pythonToken=", {
      env: {
        APP_ENV: "local",
        H5_LOCAL_JAVA_TOKEN: "local-java-token",
        H5_LOCAL_PYTHON_TOKEN: "local-python-token"
      }
    });

    expect(auth.mallToken).toBe("local-java-token");
    expect(auth.pythonToken).toBe("local-python-token");
  });

  test("ignores local token fallback outside local app env", () => {
    const auth = readCookieAuthFromHeader("theme=dark", {
      env: {
        APP_ENV: "test",
        H5_LOCAL_JAVA_TOKEN: "local-java-token",
        H5_LOCAL_PYTHON_TOKEN: "local-python-token"
      }
    });

    expect(auth.mallToken).toBeNull();
    expect(auth.pythonToken).toBeNull();
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
