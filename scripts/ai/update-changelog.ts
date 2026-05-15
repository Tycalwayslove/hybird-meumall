#!/usr/bin/env node

const {
  appendSection,
  parseArgs,
  rootPath,
  runCli,
  today,
  usage
} = require("./_utils.ts");

const help = usage("ai:update-changelog", [
  "--title <title>",
  "--summary <summary>",
  "[--file docs/08_CHANGELOG.md]",
  "[--type Added|Changed|Fixed]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["title", "summary"],
    optional: ["file", "type"]
  });

  const type = args.type || "变更";
  const file = args.file || "docs/08_CHANGELOG.md";
  appendSection(rootPath(file), `## ${today()} - ${args.title}

### ${type}

- ${args.summary}`);

  console.log(`已更新 ${file}`);
}

runCli(main, help);
