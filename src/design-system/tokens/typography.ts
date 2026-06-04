export const meuTypographyTokens = {
  screenTitle: ["22px", { lineHeight: "28px", fontWeight: "900" }],
  sectionTitle: ["15px", { lineHeight: "20px", fontWeight: "700" }],
  body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
  bodyStrong: ["14px", { lineHeight: "20px", fontWeight: "700" }],
  caption: ["12px", { lineHeight: "18px", fontWeight: "400" }],
  metric: ["18px", { lineHeight: "20px", fontWeight: "900" }]
} satisfies Record<string, [string, { lineHeight: string; fontWeight: string }]>;
