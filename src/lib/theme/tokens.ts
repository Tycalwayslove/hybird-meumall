export const defaultThemeVariables = {
  "--color-bg": "255 255 255",
  "--color-fg": "17 24 39",
  "--color-primary": "37 99 235",
  "--color-primary-fg": "255 255 255",
  "--color-muted": "243 244 246",
  "--color-muted-fg": "107 114 128",
  "--color-border": "229 231 235",
  "--radius-sm": "4px",
  "--radius-md": "8px"
} as const;

export const lightThemeVariables = defaultThemeVariables;

export const darkThemeVariables = {
  "--color-bg": "17 24 39",
  "--color-fg": "249 250 251",
  "--color-primary": "96 165 250",
  "--color-primary-fg": "15 23 42",
  "--color-muted": "31 41 55",
  "--color-muted-fg": "209 213 219",
  "--color-border": "75 85 99",
  "--radius-sm": "4px",
  "--radius-md": "8px"
} as const satisfies Record<ThemeVariableName, string>;

export const themeVariableNames = Object.keys(defaultThemeVariables) as ThemeVariableName[];

export const themeColorTokens = {
  bg: "rgb(var(--color-bg) / <alpha-value>)",
  fg: "rgb(var(--color-fg) / <alpha-value>)",
  primary: "rgb(var(--color-primary) / <alpha-value>)",
  "primary-fg": "rgb(var(--color-primary-fg) / <alpha-value>)",
  muted: "rgb(var(--color-muted) / <alpha-value>)",
  "muted-fg": "rgb(var(--color-muted-fg) / <alpha-value>)",
  border: "rgb(var(--color-border) / <alpha-value>)"
} as const;

export const themeRadiusTokens = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)"
} as const;

export type ThemeVariableName = keyof typeof defaultThemeVariables;
export type ThemeColorToken = keyof typeof themeColorTokens;
export type ThemeRadiusToken = keyof typeof themeRadiusTokens;
