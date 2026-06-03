#!/usr/bin/env node

const childProcess = require("child_process");
const path = require("path");
const {
  getGitCommit,
  listFromCsv,
  parseArgs,
  rootPath,
  timestamp,
  usage,
  writeJson
} = require("./_utils.ts");

const help = usage("ai:register-release", [
  "--version <version>",
  "--environment <dev|test|staging|prod>",
  "--service-base-url <url>",
  "--rollback-version <version>",
  "[--base-path /hybird]",
  "[--public-asset-base-url https://cdn.example.com/meumall/h5/<version>]",
  "[--health-check-path /api/health]",
  "[--routes /,/promotion,/mine,/category]",
  "[--rollout-percentage <0-100>]",
  "[--git-commit <sha>]",
  "[--git-ref <ref>]",
  "[--git-tag <tag>]",
  "[--package-version <version>]",
  "[--commit-subject <subject>]",
  "[--jenkins-build-number <number>]",
  "[--docker-image <image>]",
  "[--container <name>]",
  "[--server-url http://127.0.0.1:4100]",
  "[--output archives/releases/<version>/release-registration.json]",
  "[--execute]"
]);

function normalizePath(value, fallback) {
  const raw = String(value || fallback || "").trim();
  if (!raw || raw === "/") {
    return "/";
  }
  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
}

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getGitBranch() {
  try {
    return childProcess.execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: rootPath("."),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (_) {
    return null;
  }
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
}

function parsePercentage(value) {
  if (value === undefined) {
    return 0;
  }
  const percentage = Number(value);
  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("--rollout-percentage 必须是 0 到 100 的整数。");
  }
  return percentage;
}

function createReleaseRegistrationPayload(args) {
  const routes = listFromCsv(args.routes);
  const serviceBaseUrl = trimTrailingSlash(args["service-base-url"]);
  if (!serviceBaseUrl) {
    throw new Error("--service-base-url 不能为空。");
  }

  const publicAssetBaseUrl = trimTrailingSlash(args["public-asset-base-url"]);
  const buildMeta = {
    renderMode: "ssr",
    runtime: "next-standalone",
    gitCommit: args["git-commit"] || getGitCommit(),
    gitBranch: getGitBranch(),
    gitRef: args["git-ref"],
    gitTag: args["git-tag"],
    packageVersion: args["package-version"],
    commitSubject: args["commit-subject"],
    jenkinsBuildNumber: args["jenkins-build-number"],
    dockerImage: args["docker-image"],
    container: args.container,
    buildTime: timestamp()
  };

  Object.keys(buildMeta).forEach((key) => {
    if (buildMeta[key] === undefined || buildMeta[key] === null || buildMeta[key] === "") {
      delete buildMeta[key];
    }
  });

  const payload = {
    version: args.version,
    environment: args.environment,
    status: "candidate",
    serviceBaseUrl,
    basePath: normalizePath(args["base-path"], "/hybird"),
    healthCheckPath: normalizePath(args["health-check-path"], "/api/health"),
    rollbackVersion: args["rollback-version"],
    rolloutPercentage: parsePercentage(args["rollout-percentage"]),
    routes: routes.length > 0 ? routes : ["/", "/promotion", "/mine", "/category"],
    buildMeta
  };

  if (publicAssetBaseUrl) {
    payload.publicAssetBaseUrl = publicAssetBaseUrl;
  }

  return payload;
}

async function postRelease(serverUrl, payload) {
  const endpoint = `${trimTrailingSlash(serverUrl)}/api/releases`;
  const timeout = withTimeout(10000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: timeout.signal
    });

    const bodyText = await response.text();
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch (_) {
      body = bodyText;
    }

    if (!response.ok) {
      throw new Error(`release 注册失败：HTTP ${response.status} ${bodyText}`);
    }

    return body;
  } finally {
    timeout.clear();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["version", "environment", "service-base-url", "rollback-version"],
    optional: [
      "base-path",
      "public-asset-base-url",
      "health-check-path",
      "routes",
      "rollout-percentage",
      "git-commit",
      "git-ref",
      "git-tag",
      "package-version",
      "commit-subject",
      "jenkins-build-number",
      "docker-image",
      "container",
      "server-url",
      "output"
    ],
    boolean: ["execute"]
  });

  const payload = createReleaseRegistrationPayload(args);
  const output = rootPath(args.output || path.join("archives/releases", args.version, "release-registration.json"));
  writeJson(output, payload);

  if (!args.execute) {
    console.log(`已生成 release 注册草案：${path.relative(rootPath("."), output)}`);
    console.log("如需提交到 server-meumall，请追加 --execute。");
    return;
  }

  const serverUrl = args["server-url"] || process.env.H5_RELEASE_SERVER_URL || "http://127.0.0.1:4100";
  const result = await postRelease(serverUrl, payload);
  console.log(`已注册 release：${payload.version}`);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  if (process.argv.includes("--help")) {
    console.log(help);
  } else {
    main()
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        console.error(error.message || String(error));
        process.exit(1);
      });
  }
}

module.exports = {
  createReleaseRegistrationPayload,
  postRelease
};
