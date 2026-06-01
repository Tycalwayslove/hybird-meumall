import { describe, expect, it } from "vitest";
import { assetUrl } from "./asset-url";

describe("assetUrl", () => {
  it("prefixes local public assets with the H5 basePath", () => {
    expect(assetUrl("/assets/home/banner-renewal.webp", { basePath: "/hybird" })).toBe(
      "/hybird/assets/home/banner-renewal.webp"
    );
  });

  it("uses the public asset CDN prefix when provided", () => {
    expect(
      assetUrl("assets/icons/home.svg", {
        assetBaseUrl: "https://cdn.example.com/meumall/h5/2026.06.01-001/"
      })
    ).toBe("https://cdn.example.com/meumall/h5/2026.06.01-001/assets/icons/home.svg");
  });

  it("keeps absolute and data URLs unchanged", () => {
    expect(assetUrl("https://img.example.com/a.png", { basePath: "/hybird" })).toBe("https://img.example.com/a.png");
    expect(assetUrl("data:image/svg+xml;base64,abc", { assetBaseUrl: "https://cdn.example.com" })).toBe(
      "data:image/svg+xml;base64,abc"
    );
  });

  it("normalizes duplicate slashes without changing protocol separators", () => {
    expect(assetUrl("//assets//home//banner.png", { basePath: "/hybird/" })).toBe("/hybird/assets/home/banner.png");
  });
});
