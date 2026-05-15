import { describe, expect, it } from "vitest";
import { defaultThemeVariables, themeColorTokens, themeRadiusTokens } from "../tokens";

describe("theme tokens", () => {
  it("maps Tailwind colors to CSS variables", () => {
    expect(themeColorTokens.bg).toBe("rgb(var(--color-bg) / <alpha-value>)");
    expect(themeColorTokens["primary-fg"]).toBe("rgb(var(--color-primary-fg) / <alpha-value>)");
    expect(themeColorTokens.border).toBe("rgb(var(--color-border) / <alpha-value>)");
  });

  it("keeps default variables available before runtime theme injection", () => {
    expect(defaultThemeVariables["--color-bg"]).toBe("255 255 255");
    expect(defaultThemeVariables["--color-fg"]).toBe("17 24 39");
    expect(themeRadiusTokens.md).toBe("var(--radius-md)");
  });
});
