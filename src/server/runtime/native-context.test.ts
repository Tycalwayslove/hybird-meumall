import { describe, expect, test } from "vitest";
import { buildNativeRuntimeContext } from "./native-context";

describe("native runtime context", () => {
  test("summarizes native cookies and status height", () => {
    const context = buildNativeRuntimeContext({
      cookieHeader: [
        "pythonToken=python-token-123",
        "mallToken=mall-token-456",
        "statusHeight=47",
        `meu_page_config=${encodeURIComponent(JSON.stringify({ channel: "ios", theme: "green" }))}`,
        "native_tab=home",
        "refresh_token=secret-refresh"
      ].join("; "),
      env: {
        APP_ENV: "test",
        H5_VERSION: "v1.0.3"
      },
      sourceSearch: "?scene=app-home&debug=1"
    });

    expect(context.auth).toEqual({
      pythonToken: {
        cookieName: "pythonToken",
        present: true,
        preview: "python-token-123",
        length: 16
      },
      mallToken: {
        cookieName: "mallToken",
        present: true,
        preview: "mall-token-456",
        length: 14
      }
    });
    expect(context.statusBar).toEqual({
      statusHeight: 47,
      statusHeightCookieName: "statusHeight"
    });
    expect(context.pageConfig).toEqual({
      channel: "ios",
      theme: "green"
    });
    expect(context.cookies).toEqual([
      {
        name: "pythonToken",
        sensitive: true,
        present: true,
        preview: "python-token-123"
      },
      {
        name: "mallToken",
        sensitive: true,
        present: true,
        preview: "mall-token-456"
      },
      {
        name: "statusHeight",
        sensitive: false,
        present: true,
        preview: "47"
      },
      {
        name: "meu_page_config",
        sensitive: false,
        present: true,
        preview: "{\"channel\":\"ios\",\"theme\":\"green\"}"
      },
      {
        name: "native_tab",
        sensitive: false,
        present: true,
        preview: "home"
      },
      {
        name: "refresh_token",
        sensitive: true,
        present: true,
        preview: "secret-refresh"
      }
    ]);
    expect(context.sourceParams).toEqual({
      scene: "app-home",
      debug: "1"
    });
    expect(context.environment).toEqual({
      appEnv: "test",
      h5Version: "v1.0.3",
      localTokenFallback: {
        enabled: false,
        javaTokenPresent: false,
        pythonTokenPresent: false
      }
    });
  });

  test("reports missing token and invalid page config safely", () => {
    const context = buildNativeRuntimeContext({
      cookieHeader: "meu_page_config=not-json; statusHeight=invalid",
      sourceSearch: ""
    });

    expect(context.auth.pythonToken.present).toBe(false);
    expect(context.auth.mallToken.present).toBe(false);
    expect(context.statusBar.statusHeight).toBeNull();
    expect(context.pageConfig).toBeNull();
  });

  test("reports local token fallback presence without exposing token values", () => {
    const context = buildNativeRuntimeContext({
      env: {
        APP_ENV: "local",
        H5_LOCAL_JAVA_TOKEN: "java-secret",
        H5_LOCAL_PYTHON_TOKEN: "python-secret"
      }
    });

    expect(context.environment.localTokenFallback).toEqual({
      enabled: true,
      javaTokenPresent: true,
      pythonTokenPresent: true
    });
    expect(JSON.stringify(context.environment.localTokenFallback)).not.toContain("secret");
  });
});
