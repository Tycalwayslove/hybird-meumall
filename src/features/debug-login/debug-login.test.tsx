import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { DebugTokenLoginForm } from "./DebugTokenLoginForm";
import { resolveDebugLoginAccess } from "./debug-login-access";

describe("debug token login access", () => {
  test("allows standalone browser access when both debug tokens are missing", () => {
    expect(resolveDebugLoginAccess({ cookieHeader: "theme=dark", headers: new Headers() })).toEqual({
      action: "allow"
    });
  });

  test("redirects away when debug cookies already provide both backend tokens", () => {
    expect(resolveDebugLoginAccess({ cookieHeader: "mallToken=java-token; pythonToken=python-token", headers: new Headers() })).toEqual({
      action: "redirect"
    });
  });

  test("blocks native app contexts even when a token is missing", () => {
    expect(resolveDebugLoginAccess({ cookieHeader: "statusHeight=44", headers: new Headers() })).toEqual({
      action: "not_found"
    });
    expect(resolveDebugLoginAccess({ cookieHeader: null, headers: new Headers({ "x-app-version": "1.0.0" }) })).toEqual({
      action: "not_found"
    });
  });
});

describe("debug token login form", () => {
  test("renders token fields instead of account-password login fields", () => {
    const html = renderToStaticMarkup(<DebugTokenLoginForm redirectTo="/" />);

    expect(html).toContain("Java Token");
    expect(html).toContain("Python Token");
    expect(html).not.toContain("账号");
    expect(html).not.toContain("密码");
  });
});
