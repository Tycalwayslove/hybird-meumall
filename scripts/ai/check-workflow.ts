#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parseArgs, readText, rootPath, runCli, usage } = require("./_utils.ts");

const help = usage("ai:check-workflow", ["[--strict]"]);

const requiredDocs = [
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

const requiredSkills = [
  "task-create",
  "task-plan",
  "task-implement",
  "task-test",
  "task-review",
  "task-archive",
  "release-prepare",
  "rollback"
];

const requiredScripts = [
  "ai:create-task",
  "ai:diff-summary",
  "ai:check-docs-sync",
  "ai:check-workflow",
  "ai:archive-task",
  "ai:plan-task",
  "ai:test-task",
  "ai:review-task",
  "ai:build-json",
  "ai:release-prepare",
  "ai:prepare-ssr-release",
  "ai:smoke-ssr-release",
  "ai:update-changelog",
  "ai:update-manifest",
  "ai:rollback"
];

const requiredTaskSections = [
  "## 目标",
  "## 标签",
  "## 范围",
  "## 上下文",
  "## 验收标准",
  "## 验证",
  "## 风险和假设"
];

function failIfAny(errors) {
  if (errors.length > 0) {
    throw new Error(`工作流检查失败：\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
}

function checkDocs(errors, strict) {
  for (const file of requiredDocs) {
    const fullPath = rootPath(file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`缺少文档：${file}`);
      continue;
    }
    if (strict && fs.statSync(fullPath).size === 0) {
      errors.push(`文档为空：${file}`);
    }
  }
}

function checkSkills(errors) {
  for (const skill of requiredSkills) {
    const file = `.codex/skills/${skill}/SKILL.md`;
    const fullPath = rootPath(file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`缺少 Skill：${file}`);
      continue;
    }
    const text = readText(fullPath);
    for (const pattern of [`name: ${skill}`, "description:", "## 何时使用", "## 输入", "## 输出"]) {
      if (!text.includes(pattern)) {
        errors.push(`${file} 缺少 ${pattern}`);
      }
    }
    const hasSteps = text.includes("## 步骤") || text.includes("## 对话式创建流程");
    if (!hasSteps) {
      errors.push(`${file} 缺少步骤或对话式流程说明`);
    }
  }
}

function checkTasks(errors, strict) {
  const taskDir = rootPath(".ai/tasks");
  const taskFiles = fs.readdirSync(taskDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(".ai/tasks", file));

  for (const file of taskFiles) {
    const text = readText(rootPath(file));
    for (const section of requiredTaskSections) {
      if (!text.includes(section)) {
        errors.push(`${file} 缺少 ${section}`);
      }
    }
    if (strict && !/- \[[ xX]\] /.test(text)) {
      errors.push(`${file} 缺少验收标准 checklist`);
    }
  }
}

function checkPackage(errors) {
  const packagePath = rootPath("package.json");
  if (!fs.existsSync(packagePath)) {
    errors.push("缺少 package.json");
    return;
  }
  const pkg = JSON.parse(readText(packagePath));
  const scripts = pkg.scripts || {};
  for (const script of requiredScripts) {
    if (!scripts[script]) {
      errors.push(`package.json 缺少 script：${script}`);
    }
  }
}

function checkScriptFiles(errors) {
  const expectedFiles = [
    "create-task.ts",
    "generate-diff-summary.ts",
    "check-docs-sync.ts",
    "check-workflow.ts",
    "archive-task.ts",
    "plan-task.ts",
    "test-task.ts",
    "review-task.ts",
    "generate-build-json.ts",
    "release-prepare.ts",
    "prepare-ssr-release.ts",
    "smoke-ssr-release.ts",
    "update-changelog.ts",
    "update-manifest.ts",
    "rollback.ts"
  ];
  for (const file of expectedFiles) {
    if (!fs.existsSync(rootPath(path.join("scripts/ai", file)))) {
      errors.push(`缺少脚本文件：scripts/ai/${file}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    boolean: ["strict"]
  });

  const errors = [];
  checkDocs(errors, args.strict);
  checkSkills(errors);
  checkTasks(errors, args.strict);
  checkPackage(errors);
  checkScriptFiles(errors);
  failIfAny(errors);

  console.log("AI 工作流检查通过。");
  console.log(`- 文档：${requiredDocs.length} 个`);
  console.log(`- Skills：${requiredSkills.length} 个`);
  console.log(`- package scripts：${requiredScripts.length} 个`);
}

runCli(main, help);
