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
  slugify,
  today,
  usage,
  writeText
} = require("./_utils.ts");

const help = usage("ai:test-task", [
  "--task <.ai/tasks/file.md>",
  "--status <passed|failed|manual>",
  "--summary <summary>",
  "[--commands cmd1,cmd2]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["task", "status", "summary"],
    optional: ["commands"]
  });

  if (!["passed", "failed", "manual"].includes(args.status)) {
    throw new Error("--status 必须是 passed、failed 或 manual。");
  }

  const taskPath = rootPath(args.task);
  if (!fs.existsSync(taskPath)) {
    throw new Error(`任务文件不存在：${args.task}`);
  }
  if (!isInsideDirectory(rootPath(".ai/tasks"), taskPath)) {
    throw new Error("--task 必须指向 .ai/tasks/ 下的文件。");
  }

  const taskName = path.basename(args.task, ".md");
  const reportPath = rootPath(path.join(".ai/test-reports", `${today()}-${slugify(taskName)}-verification.md`));
  const commands = listFromCsv(args.commands);
  const commandBlock = commands.length > 0 ? commands.map((command) => `- \`${command}\``).join("\n") : "- 未记录命令。";
  writeText(reportPath, `# 验证：${taskName}

## 日期

${today()}

## 范围

- ${args.task}

## 状态

${args.status}

## 命令

${commandBlock}

## 结果

${args.summary}
`);

  appendSection(taskPath, `## 验证记录

- 状态：${args.status}
- 摘要：${args.summary}
- 报告：${path.relative(rootPath("."), reportPath)}`);

  console.log(`已生成验证记录：${path.relative(rootPath("."), reportPath)}`);
}

runCli(main, help);
