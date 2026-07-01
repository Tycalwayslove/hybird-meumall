import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { IconFont } from "./IconFont";
import { iconFontGlyphs, resolveIconFontClass } from "../icons";

describe("IconFont", () => {
  test("renders an icon with the shared iconfont classes", () => {
    const html = renderToStaticMarkup(<IconFont className="text-text-primary" name="share" size={20} />);

    expect(html).toContain("meu-iconfont");
    expect(html).toContain("meu-iconfont-fenxiang");
    expect(html).toContain("text-text-primary");
    expect(html).toContain("font-size:20px");
    expect(html).toContain('aria-hidden="true"');
  });

  test("supports accessible labels when an icon carries meaning", () => {
    const html = renderToStaticMarkup(<IconFont label="收藏" name="favorite" />);

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="收藏"');
    expect(html).not.toContain("aria-hidden");
  });

  test("resolves semantic aliases and generated keys", () => {
    expect(resolveIconFontClass("wallet")).toBe("qianbao");
    expect(resolveIconFontClass("dialogClose")).toBe("danchuang-guanbi");
    expect(resolveIconFontClass("favorite")).toBe("shoucang");
    expect(resolveIconFontClass("danxuanYixuan")).toBe("danxuan-yixuan");
    expect(resolveIconFontClass("frame")).toBe("Frame");
  });

  test("keeps the full downloaded iconfont glyph set available", () => {
    expect(iconFontGlyphs).toHaveLength(30);
    expect(iconFontGlyphs.map((glyph) => glyph.rawClass)).toContain("qianbao");
    expect(iconFontGlyphs.map((glyph) => glyph.rawClass)).toContain("danchuang-guanbi");
    expect(iconFontGlyphs.map((glyph) => glyph.rawClass)).toContain("shoucang");
    expect(iconFontGlyphs.map((glyph) => glyph.rawClass)).toContain("fenxiang");
    expect(iconFontGlyphs.map((glyph) => glyph.rawClass)).toContain("qingchu");
  });
});
