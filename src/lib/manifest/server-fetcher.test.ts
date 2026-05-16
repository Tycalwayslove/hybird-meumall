import { describe, expect, it } from "vitest";
import { createHttpManifestFetcher, getDefaultManifestUrl } from "./server-fetcher";

describe("server manifest fetcher", () => {
  it("fetches manifest JSON from the configured URL", async () => {
    const manifest = { schemaVersion: "1.0.0", stableVersion: "2026.05.15-001" };
    const calls: Array<[URL | RequestInfo, RequestInit | undefined]> = [];
    const fetcher = createHttpManifestFetcher({
      url: "http://127.0.0.1:4100/api/h5/manifest/active?environment=prod",
      fetchImpl: async (input, init) => {
        calls.push([input, init]);
        return new Response(JSON.stringify(manifest), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }
    });

    await expect(fetcher()).resolves.toEqual(manifest);
    expect(calls).toEqual([
      [
        "http://127.0.0.1:4100/api/h5/manifest/active?environment=prod",
        {
          headers: {
            accept: "application/json"
          }
        }
      ]
    ]);
  });

  it("throws when the server returns a non-2xx response", async () => {
    const fetcher = createHttpManifestFetcher({
      url: "http://127.0.0.1:4100/api/h5/manifest/active?environment=prod",
      fetchImpl: async () => new Response("not found", { status: 404, statusText: "Not Found" })
    });

    await expect(fetcher()).rejects.toThrow(
      "Failed to fetch active manifest: 404 Not Found from http://127.0.0.1:4100/api/h5/manifest/active?environment=prod"
    );
  });

  it("throws when the response body is not valid JSON", async () => {
    const fetcher = createHttpManifestFetcher({
      url: "http://127.0.0.1:4100/api/h5/manifest/active?environment=prod",
      fetchImpl: async () =>
        new Response("not json", {
          status: 200,
          headers: { "content-type": "application/json" }
        })
    });

    await expect(fetcher()).rejects.toThrow(
      "Failed to parse active manifest JSON from http://127.0.0.1:4100/api/h5/manifest/active?environment=prod"
    );
  });

  it("reads NEXT_PUBLIC_H5_MANIFEST_URL before H5_MANIFEST_URL", () => {
    expect(
      getDefaultManifestUrl({
        NEXT_PUBLIC_H5_MANIFEST_URL: "https://public.example.com/manifest",
        H5_MANIFEST_URL: "https://server.example.com/manifest"
      })
    ).toBe("https://public.example.com/manifest");
  });
});
