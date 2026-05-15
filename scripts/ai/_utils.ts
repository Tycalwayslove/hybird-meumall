#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const ROOT = path.resolve(__dirname, "../..");

function usage(scriptName, lines) {
  return [`用法：npm run ${scriptName} -- ${lines.join(" ")}`].join("\n");
}

function parseArgs(argv, config) {
  const result = {};
  const allowed = new Set([...(config.required || []), ...(config.optional || []), ...(config.boolean || []), "help"]);
  const booleans = new Set([...(config.boolean || []), "help"]);

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith("--")) {
      throw new Error(`不支持的位置参数：${raw}`);
    }

    const eqIndex = raw.indexOf("=");
    const key = raw.slice(2, eqIndex === -1 ? undefined : eqIndex);
    if (!allowed.has(key)) {
      throw new Error(`未知参数：--${key}`);
    }

    if (booleans.has(key)) {
      result[key] = eqIndex === -1 ? true : raw.slice(eqIndex + 1) === "true";
      continue;
    }

    const value = eqIndex === -1 ? argv[index + 1] : raw.slice(eqIndex + 1);
    if (!value || value.startsWith("--")) {
      throw new Error(`缺少参数值：--${key}`);
    }
    result[key] = value;
    if (eqIndex === -1) {
      index += 1;
    }
  }

  for (const key of config.required || []) {
    if (!result[key]) {
      throw new Error(`缺少必填参数：--${key}`);
    }
  }

  return result;
}

function runCli(main, helpText) {
  try {
    if (process.argv.includes("--help")) {
      console.log(helpText);
      return;
    }
    main();
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

function rootPath(relativePath) {
  return path.resolve(ROOT, relativePath);
}

function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(readText(filePath));
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function timestamp() {
  return new Date().toISOString();
}

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "task";
}

function listFromCsv(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getGitCommit() {
  try {
    return childProcess.execSync("git rev-parse --short HEAD", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (_) {
    return null;
  }
}

function getGitChangedFiles() {
  try {
    const output = childProcess.execSync("git diff --name-only", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch (_) {
    return null;
  }
}

function appendSection(filePath, section) {
  const existing = fs.existsSync(filePath) ? readText(filePath) : "";
  const separator = existing.endsWith("\n") || existing.length === 0 ? "" : "\n";
  writeText(filePath, `${existing}${separator}${section.trim()}\n`);
}

function isInsideDirectory(parentPath, childPath) {
  const relative = path.relative(parentPath, childPath);
  return relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function requireExistingFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label || "文件"}不存在：${filePath}`);
  }
}

function replaceText(filePath, replacer) {
  const existing = readText(filePath);
  writeText(filePath, replacer(existing));
}

module.exports = {
  ROOT,
  appendSection,
  ensureDir,
  getGitChangedFiles,
  getGitCommit,
  listFromCsv,
  parseArgs,
  readJson,
  readText,
  replaceText,
  requireExistingFile,
  rootPath,
  runCli,
  slugify,
  timestamp,
  today,
  usage,
  writeJson,
  writeText,
  isInsideDirectory
};
