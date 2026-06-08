import { describe, expect, it } from "vitest";

import { meuColorVariables, meuColorValues, meuRadiusTokens, meuTailwindColors } from ".";

describe("meu design tokens", () => {
  it("keeps Figma brand and text colors as source values", () => {
    expect(meuColorValues.brand.action).toBe("#94DD42");
    expect(meuColorValues.brand.normal).toBe("#A8F156");
    expect(meuColorValues.text.primary).toBe("#0F0F0F");
    expect(meuColorValues.fill.page).toBe("#F7F9FB");
    expect(meuColorValues.price.default).toBe("#FF2D50");
  });

  it("exports RGB channel CSS variables for runtime themes", () => {
    expect(meuColorVariables["--mm-color-brand-action"]).toBe("148 221 66");
    expect(meuColorVariables["--mm-color-brand-normal"]).toBe("168 241 86");
    expect(meuColorVariables["--mm-color-text-primary"]).toBe("15 15 15");
    expect(meuColorVariables["--mm-color-line-default"]).toBe("241 241 244");
  });

  it("maps Tailwind semantic names to CSS variables", () => {
    expect(meuTailwindColors.brand.action).toBe("rgb(var(--mm-color-brand-action) / <alpha-value>)");
    expect(meuTailwindColors.brand.normal).toBe("rgb(var(--mm-color-brand-normal) / <alpha-value>)");
    expect(meuTailwindColors.fill.page).toBe("rgb(var(--mm-color-fill-page) / <alpha-value>)");
    expect(meuRadiusTokens.card).toBe("12px");
  });
});
