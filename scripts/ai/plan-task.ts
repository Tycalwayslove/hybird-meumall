#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  appendSection,
  isInsideDirectory,
  listFromCsv,
  parseArgs,
  rootPath,
  runCli,
  usage
} = require("./_utils.ts");

const help = usage("ai:plan-task", [
  "--task <.ai/tasks/file.md>",
  "[--files file1,file2]",
  "[--verification <command-or-check>]",
  "[--force]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["task"],
    optional: ["files", "verification"],
    boolean: ["force"]
  });

  const taskPath = rootPath(args.task);
  if (!fs.existsSync(taskPath)) {
    throw new Error(`任务文件不存在：${args.task}`);
  }
  if (!isInsideDirectory(rootPath(".ai/tasks"), taskPath)) {
    throw new Error("--task 必须指向 .ai/tasks/ 下的文件。");
  }

  const existing = fs.readFileSync(taskPath, "utf8");
  if (existing.includes("## 计划") && !args.force) {
    throw new Error("任务文件已包含计划。如需追加请使用 --force。");
  }

  const files = listFromCsv(args.files).map((file) => `- ${file}`).join("\n") || "- 待在计划评审中确认。";
  const verification = args.verification || "运行与任务相关的最小验证命令，并记录结果。";
  appendSection(taskPath, `## 计划

### 文件影响

${files}

### 步骤

1. 读取任务和相关文档，确认范围。
2. 在不扩大范围的前提下完成实现或文档变更。
3. 执行验证并记录结果。
4. 更新 AI 状态文件。
5. 通过审查后归档任务。

### 验证计划

- ${verification}

### 风险

- 如发现范围、发布安全或原生兼容问题，先记录并停止实现。`);

  console.log(`已更新任务计划：${path.relative(rootPath("."), taskPath)}`);
}

runCli(main, help);
