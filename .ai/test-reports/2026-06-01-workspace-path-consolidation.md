# 2026-06-01 本地工作区路径收敛验证

## 背景

项目已统一移动到 `/Users/mac/person_code/meu-mall`。本次验证目标是移除当前运行配置对旧路径软链接的依赖，避免后续迁移到新机器或新服务器时依赖本机历史目录。

## 变更范围

- `/Users/mac/person_code/meu-mall/meumall-ci/ops/*.sh`
- `/Users/mac/person_code/meu-mall/meumall-ci/agent/start-agent.sh`
- `/Users/mac/person_code/meu-mall/meumall-ci/jenkins/pipelines/hybird-meumall-local-deploy.groovy`
- `/Users/mac/person_code/meu-mall/meumall-ci/jenkins/init.groovy.d/01-bootstrap.groovy`
- `/Users/mac/Library/LaunchAgents/com.meumall.jenkins-agent.plist`
- Jenkins 当前 job 与 node 配置
- H5 与 server 项目的当前路径文档

## 验证项

- `bash -n` 检查本地 CI shell 脚本语法。
- `plutil -lint` 检查 launchd plist。
- 重启 Jenkins controller 和 `mac-studio` agent。
- 通过 Jenkins API 确认 `mac-studio` agent 在线。
- 扫描当前运行配置，确认不再引用旧软链接路径。
- 删除旧软链接后，确认旧入口路径不存在。
- `pnpm run ai:check-workflow --strict` 通过。
- `python3 scripts/ai/check_workflow.py` 通过。
- `pnpm run ai:check-workflow` 通过。
- `bash scripts/ai/check-workflow.sh` 和 `plutil -lint meumall/Info.plist` 通过。

## 结果

- Jenkins controller 正常运行在 `http://127.0.0.1:8082`。
- `mac-studio` agent 在线，remote path 为 `/Users/mac/person_code/meu-mall/meumall-ci/agent/workspace`。
- 当前 CI 运行配置中未发现 `/Users/mac/meumall-ci`、`/Users/mac/company_code/*-meumall` 或 `/Users/mac/person_code/ios/meumall` 依赖。

## 说明

历史构建日志、历史测试报告和 Jenkins build archive 中仍可能保留旧路径，这是当时运行环境的事实记录，不属于当前运行依赖。
