#!/usr/bin/env node

const http = require("http");
const https = require("https");
const { parseArgs, readJson, rootPath, runCli, usage, writeJson } = require("./_utils.ts");

const help = usage("ai:smoke-ssr-release", [
  "--plan archives/releases/<version>/ssr-release-plan.json",
  "[--output archives/releases/<version>/ssr-smoke-report.json]"
]);

function headerValue(headers, name) {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(",") : value || "";
}

function evaluateSsrSmokeResult(result) {
  const issues = [];
  if (result.statusCode < 200 || result.statusCode >= 400) {
    issues.push(`statusCode must be 2xx or 3xx, received ${result.statusCode}.`);
  }
  const contentType = headerValue(result.headers, "content-type").toLowerCase();
  const acceptsJson = result.kind === "health";
  if (!contentType.includes("text/html") && !(acceptsJson && contentType.includes("application/json"))) {
    issues.push("content-type must include text/html.");
  }
  return {
    ok: issues.length === 0,
    kind: result.kind || "route",
    url: result.url,
    statusCode: result.statusCode,
    headers: result.headers,
    issues
  };
}

function requestHead(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.request(url, { method: "HEAD", timeout: 10000 }, (response) => {
      response.resume();
      response.on("end", () => {
        resolve({
          url,
          statusCode: response.statusCode || 0,
          headers: response.headers
        });
      });
    });
    request.on("timeout", () => {
      request.destroy(new Error(`SSR smoke timeout: ${url}`));
    });
    request.on("error", reject);
    request.end();
  });
}

async function smokePlan(plan) {
  const targets = [
    { kind: "health", url: plan.service.healthCheckUrl },
    ...(plan.service.smokeUrls || []).map((url) => ({ kind: "route", url }))
  ].filter((target, index, all) => all.findIndex((item) => item.url === target.url) === index);
  const checks = [];
  for (const target of targets) {
    const raw = await requestHead(target.url);
    checks.push(evaluateSsrSmokeResult({ ...raw, kind: target.kind }));
  }
  return {
    ok: checks.every((check) => check.ok),
    version: plan.version,
    environment: plan.environment,
    checks
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["plan"],
    optional: ["output"]
  });
  const plan = readJson(rootPath(args.plan));
  const report = await smokePlan(plan);
  if (args.output) {
    writeJson(rootPath(args.output), report);
  }
  if (!report.ok) {
    throw new Error("SSR smoke 检查未通过。");
  }
  console.log(`SSR smoke 检查通过：${report.checks.length} 个 URL。`);
}

if (require.main === module) {
  runCli(main, help);
}

module.exports = {
  evaluateSsrSmokeResult,
  smokePlan
};
