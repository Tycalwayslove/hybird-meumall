#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { rootPath, runCli, usage } = require("./_utils.ts");

const help = usage("ai:prepare-standalone-assets", [
  "[--help]"
]);

function copyDirectory(source, target) {
  if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
    throw new Error(`目录不存在：${source}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function main() {
  const standaloneServer = rootPath(".next/standalone/server.js");
  const nextStatic = rootPath(".next/static");
  const standaloneStatic = rootPath(".next/standalone/.next/static");
  const publicDir = rootPath("public");
  const standalonePublic = rootPath(".next/standalone/public");

  if (!fs.existsSync(standaloneServer)) {
    throw new Error("未找到 .next/standalone/server.js，请先运行 H5_BASE_PATH=/hybird pnpm build。");
  }

  copyDirectory(nextStatic, standaloneStatic);
  if (fs.existsSync(publicDir)) {
    copyDirectory(publicDir, standalonePublic);
  }

  console.log("已复制 standalone 静态资源：");
  console.log(`- ${path.relative(rootPath("."), nextStatic)} -> ${path.relative(rootPath("."), standaloneStatic)}`);
  if (fs.existsSync(publicDir)) {
    console.log(`- ${path.relative(rootPath("."), publicDir)} -> ${path.relative(rootPath("."), standalonePublic)}`);
  }
}

runCli(main, help);
