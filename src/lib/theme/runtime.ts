import {
  darkThemeVariables,
  lightThemeVariables,
  themeVariableNames,
  type ThemeVariableName
} from "./tokens";

export type ThemeMode = "light" | "dark";
export type ThemeSource = "native" | "manifest" | "user" | "system" | "default";

export type ThemeConfig = {
  name: string;
  mode: ThemeMode;
  variables: Partial<Record<ThemeVariableName, string>>;
  source: ThemeSource;
};

export type ThemeTarget = {
  dataset: Record<string, string | undefined>;
  style: {
    setProperty(name: string, value: string): void;
  };
};

const allowedVariableNames = new Set<string>(themeVariableNames);

export function getThemeConfig(mode: string | undefined, source: ThemeSource = "default"): ThemeConfig {
  if (mode === "dark") {
    return {
      name: "dark",
      mode: "dark",
      variables: darkThemeVariables,
      source
    };
  }

  return {
    name: "light",
    mode: "light",
    variables: lightThemeVariables,
    source
  };
}

export function sanitizeThemeVariables(
  variables: Record<string, string>
): Partial<Record<ThemeVariableName, string>> {
  const safeVariables: Partial<Record<ThemeVariableName, string>> = {};

  for (const [name, value] of Object.entries(variables)) {
    if (!name.startsWith("--") || !allowedVariableNames.has(name)) {
      continue;
    }
    safeVariables[name as ThemeVariableName] = value;
  }

  return safeVariables;
}

export function applyTheme(mode: string | ThemeConfig | undefined, target: ThemeTarget = getDocumentRoot()): ThemeConfig {
  const theme = typeof mode === "object" && mode !== null ? normalizeThemeConfig(mode) : getThemeConfig(mode);
  const variables = sanitizeThemeVariables(theme.variables as Record<string, string>);

  for (const [name, value] of Object.entries(variables)) {
    target.style.setProperty(name, value);
  }
  target.dataset.theme = theme.mode;

  return {
    ...theme,
    variables
  };
}

function normalizeThemeConfig(theme: ThemeConfig): ThemeConfig {
  const fallback = getThemeConfig(theme.mode, theme.source);

  if (theme.mode !== "light" && theme.mode !== "dark") {
    return fallback;
  }

  return {
    ...theme,
    variables: {
      ...fallback.variables,
      ...theme.variables
    }
  };
}

function getDocumentRoot(): ThemeTarget {
  if (typeof document === "undefined") {
    throw new Error("Theme target is required outside the browser.");
  }
  return document.documentElement;
}
