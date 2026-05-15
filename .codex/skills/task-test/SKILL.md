---
name: task-test
description: Use when verifying a completed task in this Hybrid App H5 project through tests, builds, lint checks, screenshots, or documented manual checks.
---

# Task Test

## 何时使用

实现或文档变更后需要验证时使用。

在声明任务完成、归档任务或准备发布前必须使用。

## 输入

- `.ai/tasks/` 下的任务文件。
- 变更文件列表。
- 已有测试、构建、lint 或人工验证命令。
- 相关 `docs/*.md`。

## 步骤

1. 读取任务验收标准。
2. 识别最小有意义验证：
   - 行为代码使用单元或集成测试。
   - 发布或打包变化使用 build 命令。
   - TypeScript 变化使用 lint 或 type check。
   - 纯文档变化使用人工检查。
3. 运行可用验证命令。
4. 阅读输出并记录结果。
5. 验证较重要时，在 `.ai/test-reports/` 下创建报告。
6. 验证失败时停止并报告，不归档任务。
7. 验证通过或人工检查足够时，更新任务文件验证说明。

## 输出

- 任务文件或 `.ai/test-reports/` 中的验证结果。
- 明确的通过、失败或不适用状态。
- 发现缺口时更新 `.ai/TODO.md`。

## 验证报告模板

```markdown
# 验证：<任务标题>

## 日期

YYYY-MM-DD

## 范围

## 命令

```bash
<command>
```

## 结果

## 备注
```
