import { describe, expect, it } from "vitest";
import {
  applyTheme,
  darkThemeVariables,
  getThemeConfig,
  lightThemeVariables,
  sanitizeThemeVariables
} from "./index";

describe("theme runtime", () => {
  it("returns light theme by default", () => {
    expect(getThemeConfig("unknown")).toMatchObject({
      name: "light",
      mode: "light",
      variables: lightThemeVariables
    });
  });

  it("returns dark theme config", () => {
    expect(getThemeConfig("dark")).toMatchObject({
      name: "dark",
      mode: "dark",
      variables: darkThemeVariables
    });
  });

  it("filters variables through the allowlist", () => {
    expect(
      sanitizeThemeVariables({
        "--color-bg": "0 0 0",
        "--radius-md": "12px",
        "--unknown": "bad",
        color: "bad"
      })
    ).toEqual({
      "--color-bg": "0 0 0",
      "--radius-md": "12px"
    });
  });

  it("applies variables and data-theme to a target root", () => {
    const root = createFakeThemeRoot();

    const applied = applyTheme("dark", root);

    expect(applied.mode).toBe("dark");
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.getPropertyValue("--color-bg")).toBe(darkThemeVariables["--color-bg"]);
    expect(root.style.getPropertyValue("--color-fg")).toBe(darkThemeVariables["--color-fg"]);
  });

  it("falls back to light when applying an unknown theme", () => {
    const root = createFakeThemeRoot();

    const applied = applyTheme("luxury", root);

    expect(applied.mode).toBe("light");
    expect(root.dataset.theme).toBe("light");
    expect(root.style.getPropertyValue("--color-bg")).toBe(lightThemeVariables["--color-bg"]);
  });
});

function createFakeThemeRoot() {
  const values = new Map<string, string>();

  return {
    dataset: {} as Record<string, string>,
    style: {
      setProperty(name: string, value: string) {
        values.set(name, value);
      },
      getPropertyValue(name: string) {
        return values.get(name) ?? "";
      }
    }
  };
}
