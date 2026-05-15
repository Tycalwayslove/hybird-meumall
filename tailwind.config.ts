import type { Config } from "tailwindcss";
import { themeColorTokens, themeRadiusTokens } from "./src/lib/theme/tokens";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: themeColorTokens,
      borderRadius: themeRadiusTokens
    }
  },
  plugins: []
};

export default config;
