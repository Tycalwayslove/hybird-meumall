import { describe, expect, test } from "vitest";
import { buildNativeRuntimeContext } from "./native-context";

describe("native runtime context", () => {
  test("summarizes native cookies without exposing full sensitive token", () => {
    const context = buildNativeRuntimeContext({
      cookieHeader: [
        "meu_access_token=abcdef1234567890",
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
      tokenCookieName: "meu_access_token",
      tokenPresent: true,
      tokenPreview: "abcdef1234567890",
      tokenLength: 16
    });
    expect(context.pageConfig).toEqual({
      channel: "ios",
      theme: "green"
    });
    expect(context.cookies).toEqual([
      {
        name: "meu_access_token",
        sensitive: true,
        present: true,
        preview: "abcdef1234567890"
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
      h5Version: "v1.0.3"
    });
  });

  test("reports missing token and invalid page config safely", () => {
    const context = buildNativeRuntimeContext({
      cookieHeader: "meu_page_config=not-json",
      sourceSearch: ""
    });

    expect(context.auth.tokenPresent).toBe(false);
    expect(context.pageConfig).toBeNull();
  });
});
