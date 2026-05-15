#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parseArgs, rootPath, runCli, usage } = require("./_utils.ts");

const help = usage("ai:check-docs-sync", ["[--strict]"]);

const requiredFiles = [
  "AGENTS.md",
  "docs/00_PROJECT_OVERVIEW.md",
  "docs/01_ARCHITECTURE.md",
  "docs/02_NATIVE_BRIDGE_SPEC.md",
  "docs/03_RELEASE_SPEC.md",
  "docs/04_THEME_SPEC.md",
  "docs/05_API_SPEC.md",
  "docs/06_CODING_RULES.md",
  "docs/07_AI_WORKFLOW.md",
  "docs/08_CHANGELOG.md",
  "docs/09_DECISIONS.md",
  ".ai/AI_CONTEXT.md",
  ".ai/PROJECT_STATE.md",
  ".ai/TODO.md",
  ".ai/CHANGE_SUMMARY.md"
];

function main() {
  const args = parseArgs(process.argv.slice(2), {
    boolean: ["strict"]
  });

  const missing = requiredFiles.filter((file) => !fs.existsSync(rootPath(file)));
  if (missing.length > 0) {
    throw new Error(`缺少必需文档：\n${missing.map((file) => `- ${file}`).join("\n")}`);
  }

  if (args.strict) {
    const empty = requiredFiles.filter((file) => fs.statSync(rootPath(file)).size === 0);
    if (empty.length > 0) {
      throw new Error(`以下必需文档为空：\n${empty.map((file) => `- ${file}`).join("\n")}`);
    }
  }

  console.log(`文档同步检查通过，共 ${requiredFiles.length} 个文件。`);
  console.log(requiredFiles.map((file) => `- ${path.relative(rootPath("."), rootPath(file))}`).join("\n"));
}

runCli(main, help);
