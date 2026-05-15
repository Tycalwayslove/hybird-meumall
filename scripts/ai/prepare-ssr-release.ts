#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  getGitCommit,
  parseArgs,
  readJson,
  rootPath,
  runCli,
  timestamp,
  usage,
  writeJson
} = require("./_utils.ts");

const help = usage("ai:prepare-ssr-release", [
  "--version <version>",
  "--environment <dev|test|staging|prod>",
  "[--config config/ssr-release.config.example.json]",
  "[--service-base-url https://h5.example.com]",
  "[--base-path /hybird]",
  "[--output archives/releases/<version>/ssr-release-plan.json]"
]);

function normalizePath(value, fallback) {
  const raw = String(value || fallback || "").trim();
  if (!raw || raw === "/") {
    return "/";
  }
  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function joinUrl(...parts) {
  const [firstPart, ...restParts] = parts;
  return [
    trimTrailingSlash(firstPart),
    ...restParts.map((part) => String(part || "").replace(/^\/+|\/+$/g, "")).filter(Boolean)
  ].join("/");
}

function fileStatus(relativePath) {
  const fullPath = rootPath(relativePath);
  return {
    path: relativePath,
    exists: fs.existsSync(fullPath),
    type: fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() ? "directory" : "file"
  };
}

function buildSsrReleasePlan(options) {
  const config = options.config;
  const serviceBaseUrl = trimTrailingSlash(options.serviceBaseUrl || config.serviceBaseUrl);
  const basePath = normalizePath(options.basePath || config.basePath, "/hybird");
  const healthCheckPath = normalizePath(config.healthCheckPath, "/api/health");
  const smokeRoutes = Array.isArray(config.smokeRoutes) ? config.smokeRoutes : ["/"];
  const artifacts = [
    fileStatus(config.entry || ".next/standalone/server.js"),
    fileStatus(config.standaloneDir || ".next/standalone"),
    fileStatus(config.staticDir || ".next/static"),
    fileStatus(config.publicDir || "public")
  ];

  return {
    schemaVersion: "1.0.0",
    kind: "ssr-release-plan",
    version: options.version,
    environment: options.environment,
    createdAt: timestamp(),
    gitCommit: getGitCommit(),
    runtime: {
      type: config.runtime || "node-standalone",
      entry: config.entry || ".next/standalone/server.js",
      startCommand: "node .next/standalone/server.js",
      requiredEnv: config.requiredEnv || ["NODE_ENV", "PORT", "HOSTNAME", "H5_BASE_PATH"]
    },
    service: {
      serviceBaseUrl,
      basePath,
      healthCheckUrl: joinUrl(serviceBaseUrl, basePath, healthCheckPath),
      smokeUrls: smokeRoutes.map((route) => joinUrl(serviceBaseUrl, basePath, route))
    },
    artifacts,
    cacheControl: config.cacheControl || {},
    rollback: {
      strategy: "manifest-pointer",
      command: "pnpm run ai:rollback -- --manifest <manifest> --target-version <version> --reason <reason>",
      rebuildRequired: false
    }
  };
}

function validatePlan(plan) {
  const issues = [];
  if (!plan.service.serviceBaseUrl) {
    issues.push("serviceBaseUrl is required.");
  }
  for (const artifact of plan.artifacts) {
    if (!artifact.exists) {
      issues.push(`missing artifact: ${artifact.path}`);
    }
  }
  return issues;
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["version", "environment"],
    optional: ["config", "service-base-url", "base-path", "output"]
  });
  const config = readJson(rootPath(args.config || "config/ssr-release.config.example.json"));
  const output = rootPath(args.output || path.join("archives/releases", args.version, "ssr-release-plan.json"));
  const plan = buildSsrReleasePlan({
    config,
    version: args.version,
    environment: args.environment,
    serviceBaseUrl: args["service-base-url"],
    basePath: args["base-path"]
  });
  const issues = validatePlan(plan);
  if (issues.length > 0) {
    throw new Error(`SSR release plan invalid:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  }
  writeJson(output, plan);
  console.log(`已生成 SSR 发布计划：${path.relative(rootPath("."), output)}`);
}

if (require.main === module) {
  runCli(main, help);
}

module.exports = {
  buildSsrReleasePlan,
  validatePlan
};
