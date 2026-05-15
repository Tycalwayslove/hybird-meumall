#!/usr/bin/env node

const path = require("path");
const {
  getGitCommit,
  listFromCsv,
  parseArgs,
  rootPath,
  runCli,
  timestamp,
  usage,
  writeJson
} = require("./_utils.ts");

const help = usage("ai:build-json", [
  "--version <version>",
  "--channel <channel>",
  "[--output <path>]",
  "[--artifacts file1,file2]",
  "[--static-routes /a,/b]"
]);

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["version", "channel"],
    optional: ["output", "artifacts", "static-routes"]
  });

  const output = args.output || path.join("archives/releases", args.version, "build.json");
  const buildJson = {
    version: args.version,
    channel: args.channel,
    buildTime: timestamp(),
    gitCommit: getGitCommit(),
    source: "local",
    artifacts: listFromCsv(args.artifacts),
    staticRoutes: listFromCsv(args["static-routes"]),
    verification: {
      commands: [],
      status: "pending"
    }
  };

  writeJson(rootPath(output), buildJson);
  console.log(`已写入 ${output}`);
}

runCli(main, help);
