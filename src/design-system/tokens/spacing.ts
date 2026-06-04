export const meuSpacingTokens = {
  screenX: "12px",
  sectionGap: "8px",
  cardPadding: "14px",
  compactGap: "6px",
  safeTop: "env(safe-area-inset-top)",
  nativeStatusTop: "calc(env(safe-area-inset-top) + var(--meu-status-bar-height, var(--native-status-height, 0px)))"
} as const;
