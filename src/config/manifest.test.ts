import { describe, expect, it } from "vitest";
import { resolveH5Version, type RootManifest } from "./manifest";

const baseManifest: RootManifest = {
  stableVersion: "1.0.0",
  rollbackVersion: "0.9.0"
};

describe("resolveH5Version", () => {
  it("returns stableVersion by default", () => {
    expect(resolveH5Version({}, baseManifest)).toBe("1.0.0");
  });

  it("returns grayVersion when allowlisted user matches gray rules", () => {
    expect(
      resolveH5Version(
        { userId: "u1", platform: "ios" },
        {
          ...baseManifest,
          grayVersion: "1.1.0",
          grayRules: {
            includeUserIds: ["u1"],
            platforms: ["ios"]
          }
        }
      )
    ).toBe("1.1.0");
  });

  it("keeps excluded users on stableVersion even when included", () => {
    expect(
      resolveH5Version(
        { userId: "u1" },
        {
          ...baseManifest,
          grayVersion: "1.1.0",
          grayRules: {
            includeUserIds: ["u1"],
            excludeUserIds: ["u1"]
          }
        }
      )
    ).toBe("1.0.0");
  });

  it("lets forceVersion override gray and stable versions", () => {
    expect(
      resolveH5Version(
        { userId: "u1" },
        {
          ...baseManifest,
          grayVersion: "1.1.0",
          forceVersion: "2.0.0",
          grayRules: {
            includeUserIds: ["u1"]
          }
        }
      )
    ).toBe("2.0.0");
  });

  it("uses rollbackVersion when the selected candidate is blacklisted", () => {
    expect(
      resolveH5Version(
        { userId: "u1" },
        {
          ...baseManifest,
          grayVersion: "1.1.0",
          grayRules: {
            includeUserIds: ["u1"]
          },
          blacklistVersions: ["1.1.0"]
        }
      )
    ).toBe("0.9.0");
  });

  it("uses rollbackVersion when the current version is blacklisted", () => {
    expect(
      resolveH5Version(
        { currentVersion: "1.1.0" },
        {
          ...baseManifest,
          blacklistVersions: ["1.1.0"]
        }
      )
    ).toBe("0.9.0");
  });

  it("falls back to stableVersion when rollbackVersion is also blacklisted", () => {
    expect(
      resolveH5Version(
        { userId: "u1" },
        {
          ...baseManifest,
          grayVersion: "1.1.0",
          grayRules: {
            includeUserIds: ["u1"]
          },
          blacklistVersions: ["1.1.0", "0.9.0"]
        }
      )
    ).toBe("1.0.0");
  });

  it("matches percentage rollout deterministically by user id and salt", () => {
    const manifest: RootManifest = {
      ...baseManifest,
      grayVersion: "1.1.0",
      grayRules: {
        percentage: 100,
        salt: "manifest-test"
      }
    };

    expect(resolveH5Version({ userId: "u1" }, manifest)).toBe("1.1.0");
    expect(resolveH5Version({ userId: "u1" }, { ...manifest, grayRules: { percentage: 0 } })).toBe("1.0.0");
  });
});
