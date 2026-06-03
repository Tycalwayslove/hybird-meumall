import { describe, expect, test } from "vitest";
import { createBackendRegistry, resolveBackend } from "./backend-registry";

describe("backend registry", () => {
  test("creates Java and Python backends from server-only env", () => {
    const registry = createBackendRegistry({
      APP_ENV: "test",
      JAVA_API_BASE_URL: "https://java-test.example.com/",
      PYTHON_API_BASE_URL: "https://python-test.example.com"
    });

    expect(resolveBackend(registry, "java")).toEqual({
      name: "java",
      baseUrl: "https://java-test.example.com",
      appEnv: "test"
    });
    expect(resolveBackend(registry, "python").baseUrl).toBe("https://python-test.example.com");
  });

  test("fails fast when a required backend base URL is missing", () => {
    expect(() =>
      createBackendRegistry({
        APP_ENV: "prod",
        JAVA_API_BASE_URL: "https://java.example.com"
      })
    ).toThrow("PYTHON_API_BASE_URL is required.");
  });
});
