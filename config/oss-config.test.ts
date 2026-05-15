import { describe, expect, test } from "vitest";
import ossConfig from "./oss.config.example.json";

describe("oss config example", () => {
  test("contains non-sensitive upload target fields", () => {
    expect(ossConfig.provider).toBe("aliyun-oss");
    expect(ossConfig.bucket).toBe("<your-bucket>");
    expect(ossConfig.region).toBe("<your-region>");
    expect(ossConfig.endpoint).toBe("<your-endpoint>");
    expect(ossConfig.remotePrefix).toBe("h5/prod");
  });

  test("keeps credentials outside of the repository template", () => {
    const serialized = JSON.stringify(ossConfig).toLowerCase();

    expect(serialized).not.toContain("accesskeysecret");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("token");
  });
});
