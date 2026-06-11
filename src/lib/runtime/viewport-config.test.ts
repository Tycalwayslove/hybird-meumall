import { describe, expect, test } from "vitest";

import { appViewport } from "./viewport-config";

describe("app viewport", () => {
  test("disables H5 page zoom for app WebView", () => {
    expect(appViewport).toMatchObject({
      width: "device-width",
      initialScale: 1,
      minimumScale: 1,
      maximumScale: 1,
      userScalable: false,
      viewportFit: "cover"
    });
  });
});
