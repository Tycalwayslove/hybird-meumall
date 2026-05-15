#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  listFromCsv,
  parseArgs,
  rootPath,
  runCli,
  slugify,
  today,
  usage,
  writeText
} = require("./_utils.ts");

const help = usage("ai:create-task", [
  "--title <title>",
  "[--goal <goal>]",
  "[--labels docs,infra]",
  "[--force]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["title"],
    optional: ["goal", "labels"],
    boolean: ["force"]
  });

  const date = today();
  const slug = slugify(args.title);
  const taskPath = rootPath(path.join(".ai/tasks", `${date}-${slug}.md`));
  if (fs.existsSync(taskPath) && !args.force) {
    throw new Error(`任务已存在：${path.relative(rootPath("."), taskPath)}。如需覆盖请使用 --force。`);
  }

  const labels = listFromCsv(args.labels || "docs").map((label) => `- ${label}`).join("\n");
  const content = `# 任务：${args.title}

## 目标

${args.goal || "在实现前补充任务目标。"}

## 标签

${labels}

## 范围

### 包含

- 定义请求的工作流或实现范围。

### 不包含

- 未明确要求时不实现业务功能。

## 上下文

- 相关文档：
- 相关文件：

## 验收标准

- [ ] 范围清晰。
- [ ] 验证路径已记录。

## 验证

- 命令或人工检查：
- 预期结果：

## 风险和假设

- 实现前确认 native、release、theme 或 API 影响。
`;

  writeText(taskPath, content);
  console.log(`已创建 ${path.relative(rootPath("."), taskPath)}`);
}

runCli(main, help);
