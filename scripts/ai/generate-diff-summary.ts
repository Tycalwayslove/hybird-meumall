#!/usr/bin/env node

const path = require("path");
const {
  getGitChangedFiles,
  listFromCsv,
  parseArgs,
  rootPath,
  runCli,
  today,
  usage,
  writeText
} = require("./_utils.ts");

const help = usage("ai:diff-summary", [
  "--output <path>",
  "[--title <title>]",
  "[--changed-files file1,file2]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["output"],
    optional: ["title", "changed-files"]
  });

  const changedFiles = listFromCsv(args["changed-files"]);
  const gitFiles = changedFiles.length > 0 ? changedFiles : getGitChangedFiles();
  if (!gitFiles || gitFiles.length === 0) {
    throw new Error("未找到变更文件。git diff 不可用或为空时，请提供 --changed-files。");
  }

  const content = `# Diff 摘要：${args.title || "本地变更"}

## 日期

${today()}

## 变更文件

${gitFiles.map((file) => `- ${file}`).join("\n")}

## 摘要

- 请审查每个变更文件，并将本行替换为人工摘要。

## 验证

- 待补充。
`;

  const outputPath = rootPath(args.output);
  writeText(outputPath, content);
  console.log(`已写入 ${path.relative(rootPath("."), outputPath)}`);
}

runCli(main, help);
