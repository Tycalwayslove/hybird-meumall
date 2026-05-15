#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  appendSection,
  parseArgs,
  readText,
  rootPath,
  runCli,
  today,
  usage,
  writeText
} = require("./_utils.ts");

const help = usage("ai:archive-task", [
  "--task <.ai/tasks/file.md>",
  "--summary <summary>",
  "--verification-status <passed>",
  "--review-status <passed>",
  "[--verification <verification>]",
  "[--todo-match <text>]",
  "[--keep-active]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["task", "summary", "verification-status", "review-status"],
    optional: ["verification", "todo-match"],
    boolean: ["keep-active"]
  });

  if (args["verification-status"] !== "passed") {
    throw new Error("--verification-status 必须为 passed 才能归档。");
  }
  if (args["review-status"] !== "passed") {
    throw new Error("--review-status 必须为 passed 才能归档。");
  }

  const taskPath = rootPath(args.task);
  if (!fs.existsSync(taskPath)) {
    throw new Error(`任务文件不存在：${args.task}`);
  }
  if (!path.relative(rootPath(".ai/tasks"), taskPath) || path.relative(rootPath(".ai/tasks"), taskPath).startsWith("..")) {
    throw new Error("--task 必须指向 .ai/tasks/ 下的文件。");
  }
  const taskText = readText(taskPath);
  const uncheckedItems = taskText.split("\n").filter((line) => line.trim().startsWith("- [ ]"));
  if (uncheckedItems.length > 0) {
    throw new Error(`任务仍有未完成验收项，不能归档：\n${uncheckedItems.join("\n")}`);
  }
  if (!taskText.includes("## 验证记录")) {
    throw new Error("任务缺少 `## 验证记录`，不能归档。");
  }
  if (!taskText.includes("## 审查记录")) {
    throw new Error("任务缺少 `## 审查记录`，不能归档。");
  }

  const archivePath = rootPath(path.join("archives/tasks", path.basename(taskPath)));
  const archiveNote = `
## 归档说明

### 已完成

- ${args.summary}

### 验证

- ${args.verification || "已记录人工归档验证。"}
`;

  if (args["todo-match"]) {
    const todoPath = rootPath(".ai/TODO.md");
    const todoText = readText(todoPath);
    const updated = todoText.replace(`- [ ] ${args["todo-match"]}`, `- [x] ${args["todo-match"]}`);
    if (updated === todoText) {
      throw new Error(`未找到待标记完成的 TODO：${args["todo-match"]}`);
    }
    writeText(todoPath, updated);
  }

  writeText(archivePath, `${taskText.trim()}\n${archiveNote}`);
  if (!args["keep-active"]) {
    fs.unlinkSync(taskPath);
  }

  appendSection(rootPath(".ai/CHANGE_SUMMARY.md"), `## ${today()} - 归档任务 ${path.basename(taskPath)}

### 变更

- 已将 ${args.task} 归档到 ${path.relative(rootPath("."), archivePath)}。

### 验证

- ${args.verification || "已记录人工归档验证。"}

### 后续

- 暂无。`);

  appendSection(rootPath("docs/08_CHANGELOG.md"), `## ${today()} - 归档任务

### 变更

- ${args.summary}

### 验证

- ${args.verification || "已记录人工归档验证。"}`);

  appendSection(rootPath(".ai/PROJECT_STATE.md"), `## ${today()} 任务归档

- 归档任务：${path.basename(taskPath)}
- 摘要：${args.summary}`);

  console.log(`已归档 ${args.task} -> ${path.relative(rootPath("."), archivePath)}`);
}

runCli(main, help);
