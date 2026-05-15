#!/usr/bin/env node

const {
  appendSection,
  parseArgs,
  readJson,
  rootPath,
  runCli,
  today,
  usage,
  writeJson
} = require("./_utils.ts");

const help = usage("ai:rollback", [
  "--manifest <path>",
  "--target-version <version>",
  "--reason <reason>",
  "[--note <path>]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["manifest", "target-version", "reason"],
    optional: ["note"]
  });

  const manifestPath = rootPath(args.manifest);
  const manifest = readJson(manifestPath, null);
  if (!manifest) {
    throw new Error(`未找到 manifest 草案：${args.manifest}`);
  }

  const previousActiveVersion = manifest.activeVersion;
  manifest.activeVersion = args["target-version"];
  manifest.rollbackVersion = previousActiveVersion || manifest.rollbackVersion || args["target-version"];
  manifest.channel = "rollback";
  manifest.rollout = {
    type: "all",
    percentage: 100,
    includeUserIds: [],
    excludeUserIds: []
  };
  manifest.rollback = {
    reason: args.reason,
    previousActiveVersion,
    targetVersion: args["target-version"],
    updatedAt: new Date().toISOString()
  };

  writeJson(manifestPath, manifest);

  if (args.note) {
    appendSection(rootPath(args.note), `## ${today()} - 回滚草案

### 原因

- ${args.reason}

### 版本变化

- 原 active version：${previousActiveVersion || "unknown"}
- 回滚目标版本：${args["target-version"]}

### 约束

- 仅修改 manifest 草案，未重新构建。`);
  }

  console.log(`已更新回滚草案：${args.manifest}`);
}

runCli(main, help);
