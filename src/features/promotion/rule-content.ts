import sanitizeHtml from "sanitize-html";

const ruleContentAllowedTags = [
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "h2",
  "h3",
  "h4",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "s",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
];

export function sanitizePromotionRuleContent(html: string | undefined, assetBaseUrl?: string) {
  const source = String(html ?? "").trim();
  if (!source) {
    return "";
  }

  return sanitizeHtml(source, {
    allowedAttributes: {
      a: ["href", "rel", "target", "title"],
      img: ["alt", "height", "src", "title", "width"]
    },
    allowedSchemes: ["http", "https", "data"],
    allowedTags: ruleContentAllowedTags,
    nonTextTags: ["script", "style", "textarea", "option", "iframe", "object", "embed"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank"
        }
      }),
      img: (_tagName, attribs) => {
        const src = resolveRuleContentAssetUrl(attribs.src, assetBaseUrl);
        return {
          tagName: "img",
          attribs: {
            ...attribs,
            ...(src ? { src } : {}),
            alt: attribs.alt ?? ""
          }
        };
      }
    }
  }).trim();
}

function resolveRuleContentAssetUrl(value: string | undefined, assetBaseUrl?: string) {
  const assetPath = value?.trim();
  if (!assetPath) {
    return undefined;
  }
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(assetPath) || assetPath.startsWith("data:")) {
    return assetPath;
  }
  const base = assetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL;
  if (!base?.trim()) {
    return assetPath;
  }
  return `${base.trim().replace(/\/+$/, "")}/${assetPath.replace(/^\/+/, "")}`;
}
