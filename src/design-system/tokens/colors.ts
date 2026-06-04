export const meuColorValues = {
  brand: {
    action: "#94DD42",
    hover: "#C4FC85",
    disabled: "#E7FFCD",
    subtle: "#F3FFE5"
  },
  text: {
    primary: "#0F0F0F",
    secondary: "#272727",
    tertiary: "#3F3F3F",
    quaternary: "#575757",
    muted: "#6F6F6F",
    disabled: "#878787",
    placeholder: "#9F9F9F",
    subtle: "#B7B7B7",
    line: "#CFCFCF",
    inverseSubtle: "#E7E7E7",
    inverse: "#FFFFFF"
  },
  line: {
    default: "#F1F1F4"
  },
  success: {
    subtle: "#E8FFEA",
    default: "#00B42A",
    soft: "#AFF0B5",
    medium: "#7BE188",
    strong: "#009A29"
  },
  warning: {
    subtle: "#FFF7E8",
    default: "#FF7D00",
    soft: "#FFE4BA",
    medium: "#FFCF8B",
    strong: "#D25F00"
  },
  danger: {
    subtle: "#FFECE8",
    default: "#F53F3F",
    soft: "#FDCDC5",
    medium: "#FBACA3",
    strong: "#CB2634"
  },
  fill: {
    disabled: "#C9CDD4",
    strong: "#D9DDE5",
    muted: "#EEF0F5",
    page: "#F7F9FB",
    white: "#FFFFFF"
  },
  price: {
    default: "#FF2D50"
  }
} as const;

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

const cssVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export const meuColorVariables = {
  "--mm-color-brand-action": hexToRgb(meuColorValues.brand.action),
  "--mm-color-brand-hover": hexToRgb(meuColorValues.brand.hover),
  "--mm-color-brand-disabled": hexToRgb(meuColorValues.brand.disabled),
  "--mm-color-brand-subtle": hexToRgb(meuColorValues.brand.subtle),
  "--mm-color-text-primary": hexToRgb(meuColorValues.text.primary),
  "--mm-color-text-secondary": hexToRgb(meuColorValues.text.secondary),
  "--mm-color-text-tertiary": hexToRgb(meuColorValues.text.tertiary),
  "--mm-color-text-quaternary": hexToRgb(meuColorValues.text.quaternary),
  "--mm-color-text-muted": hexToRgb(meuColorValues.text.muted),
  "--mm-color-text-disabled": hexToRgb(meuColorValues.text.disabled),
  "--mm-color-text-placeholder": hexToRgb(meuColorValues.text.placeholder),
  "--mm-color-text-subtle": hexToRgb(meuColorValues.text.subtle),
  "--mm-color-text-line": hexToRgb(meuColorValues.text.line),
  "--mm-color-text-inverse-subtle": hexToRgb(meuColorValues.text.inverseSubtle),
  "--mm-color-text-inverse": hexToRgb(meuColorValues.text.inverse),
  "--mm-color-line-default": hexToRgb(meuColorValues.line.default),
  "--mm-color-success-subtle": hexToRgb(meuColorValues.success.subtle),
  "--mm-color-success-default": hexToRgb(meuColorValues.success.default),
  "--mm-color-success-soft": hexToRgb(meuColorValues.success.soft),
  "--mm-color-success-medium": hexToRgb(meuColorValues.success.medium),
  "--mm-color-success-strong": hexToRgb(meuColorValues.success.strong),
  "--mm-color-warning-subtle": hexToRgb(meuColorValues.warning.subtle),
  "--mm-color-warning-default": hexToRgb(meuColorValues.warning.default),
  "--mm-color-warning-soft": hexToRgb(meuColorValues.warning.soft),
  "--mm-color-warning-medium": hexToRgb(meuColorValues.warning.medium),
  "--mm-color-warning-strong": hexToRgb(meuColorValues.warning.strong),
  "--mm-color-danger-subtle": hexToRgb(meuColorValues.danger.subtle),
  "--mm-color-danger-default": hexToRgb(meuColorValues.danger.default),
  "--mm-color-danger-soft": hexToRgb(meuColorValues.danger.soft),
  "--mm-color-danger-medium": hexToRgb(meuColorValues.danger.medium),
  "--mm-color-danger-strong": hexToRgb(meuColorValues.danger.strong),
  "--mm-color-fill-disabled": hexToRgb(meuColorValues.fill.disabled),
  "--mm-color-fill-strong": hexToRgb(meuColorValues.fill.strong),
  "--mm-color-fill-muted": hexToRgb(meuColorValues.fill.muted),
  "--mm-color-fill-page": hexToRgb(meuColorValues.fill.page),
  "--mm-color-fill-white": hexToRgb(meuColorValues.fill.white),
  "--mm-color-price-default": hexToRgb(meuColorValues.price.default)
} as const;

export const meuTailwindColors = {
  brand: {
    action: cssVar("--mm-color-brand-action"),
    hover: cssVar("--mm-color-brand-hover"),
    disabled: cssVar("--mm-color-brand-disabled"),
    subtle: cssVar("--mm-color-brand-subtle")
  },
  text: {
    primary: cssVar("--mm-color-text-primary"),
    secondary: cssVar("--mm-color-text-secondary"),
    tertiary: cssVar("--mm-color-text-tertiary"),
    quaternary: cssVar("--mm-color-text-quaternary"),
    muted: cssVar("--mm-color-text-muted"),
    disabled: cssVar("--mm-color-text-disabled"),
    placeholder: cssVar("--mm-color-text-placeholder"),
    subtle: cssVar("--mm-color-text-subtle"),
    line: cssVar("--mm-color-text-line"),
    inverseSubtle: cssVar("--mm-color-text-inverse-subtle"),
    inverse: cssVar("--mm-color-text-inverse")
  },
  line: {
    DEFAULT: cssVar("--mm-color-line-default")
  },
  success: {
    subtle: cssVar("--mm-color-success-subtle"),
    DEFAULT: cssVar("--mm-color-success-default"),
    soft: cssVar("--mm-color-success-soft"),
    medium: cssVar("--mm-color-success-medium"),
    strong: cssVar("--mm-color-success-strong")
  },
  warning: {
    subtle: cssVar("--mm-color-warning-subtle"),
    DEFAULT: cssVar("--mm-color-warning-default"),
    soft: cssVar("--mm-color-warning-soft"),
    medium: cssVar("--mm-color-warning-medium"),
    strong: cssVar("--mm-color-warning-strong")
  },
  danger: {
    subtle: cssVar("--mm-color-danger-subtle"),
    DEFAULT: cssVar("--mm-color-danger-default"),
    soft: cssVar("--mm-color-danger-soft"),
    medium: cssVar("--mm-color-danger-medium"),
    strong: cssVar("--mm-color-danger-strong")
  },
  fill: {
    disabled: cssVar("--mm-color-fill-disabled"),
    strong: cssVar("--mm-color-fill-strong"),
    muted: cssVar("--mm-color-fill-muted"),
    page: cssVar("--mm-color-fill-page"),
    white: cssVar("--mm-color-fill-white")
  },
  price: {
    DEFAULT: cssVar("--mm-color-price-default")
  }
} as const;
