import type { Config } from "tailwindcss";
import { meuRadiusTokens, meuShadowTokens, meuSpacingTokens, meuTailwindColors, meuTypographyTokens } from "./src/design-system/tokens";
import { themeColorTokens, themeRadiusTokens } from "./src/lib/theme/tokens";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/design-system/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ...themeColorTokens,
        ...meuTailwindColors
      },
      borderRadius: {
        ...themeRadiusTokens,
        ...meuRadiusTokens
      },
      boxShadow: meuShadowTokens,
      fontSize: meuTypographyTokens,
      spacing: meuSpacingTokens
    }
  },
  plugins: []
};

export default config;
