#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  appendSection,
  isInsideDirectory,
  parseArgs,
  rootPath,
  runCli,
  slugify,
  today,
  usage,
  writeText
} = require("./_utils.ts");

const help = usage("ai:review-task", [
  "--task <.ai/tasks/file.md>",
  "--status <passed|needs-fix|needs-clarification>",
  "--summary <summary>"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["task", "status", "summary"]
  });

  if (!["passed", "needs-fix", "needs-clarification"].includes(args.status)) {
    throw new Error("--status 必须是 passed、needs-fix 或 needs-clarification。");
  }

  const taskPath = rootPath(args.task);
  if (!fs.existsSync(taskPath)) {
    throw new Error(`任务文件不存在：${args.task}`);
  }
  if (!isInsideDirectory(rootPath(".ai/tasks"), taskPath)) {
    throw new Error("--task 必须指向 .ai/tasks/ 下的文件。");
  }

  const taskName = path.basename(args.task, ".md");
  const reportPath = rootPath(path.join(".ai/test-reports", `${today()}-${slugify(taskName)}-review.md`));
  writeText(reportPath, `# 审查：${taskName}

## 日期

${today()}

## 范围

- ${args.task}

## 状态

${args.status}

## 结论

${args.summary}
`);

  appendSection(taskPath, `## 审查记录

- 状态：${args.status}
- 摘要：${args.summary}
- 报告：${path.relative(rootPath("."), reportPath)}`);

  console.log(`已生成审查记录：${path.relative(rootPath("."), reportPath)}`);
}

runCli(main, help);
