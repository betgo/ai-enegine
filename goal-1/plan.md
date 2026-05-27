# Goal 1 Plan：完成项目中 MVP 目标

## 1. 需求分析

目标是把当前仓库从“只有项目规划文档”推进到可运行的第一阶段 MVP：3D Tower Defense Runtime 最小 Demo。

MVP 必须满足：

- 使用 monorepo 结构。
- 创建 `packages/schema`，定义 `game.json` 类型与最小校验。
- 创建 `packages/runtime`，Runtime 与 Editor 解耦。
- 使用 Three.js 根据 `game.json` 渲染基础 3D 地图。
- 创建 `apps/editor` 作为最小预览入口，读取示例 JSON 并调用 Runtime。
- 保持玩法数据驱动、纯 JSON、可序列化、适合未来多人同步和 AI 生成。

本 Goal 不实现：

- 登录、商城、社交、发布系统。
- 大型编辑器。
- AI Agent 生成流程。
- Lua、脚本系统、ECS、MMO。
- 完整 Colyseus 联机。
- 怪物移动、攻击、血量、波次以外的后续功能；本 Goal 仅以最小地图渲染 Demo 建立 MVP 基座。

## 2. 上下文梳理

当前仓库状态：

- 根目录已有 `README.md`。
- 已创建项目规划文档：
  - `docs/project-plan.md`
  - `docs/architecture-principles.md`
  - `docs/development-workflow.md`
  - `docs/agent-prompts.md`
- 尚未初始化 monorepo。
- 尚无 `package.json`、`apps/`、`packages/`。

关键架构约束：

- `packages/runtime` 不能依赖 React、Zustand 或 Editor UI。
- `apps/editor` 只能加载 JSON、展示预览、调用 Runtime。
- `packages/schema` 定义 `game.json` 的 authoritative 类型。
- 游戏定义和运行状态必须分离。
- 当前 Demo 可以只渲染地图，不实现完整玩法循环。

## 3. 风险评估

| 风险 | 影响 | 控制方式 |
| --- | --- | --- |
| 一次性做太多平台能力 | MVP 失焦 | 只完成 schema/runtime/editor preview |
| Runtime 依赖 React | 后续服务端模拟受阻 | Runtime 仅暴露纯 TypeScript API |
| JSON schema 过度复杂 | AI 难生成、测试困难 | 第一版只包含 map/units/waves/triggers |
| Three.js 生命周期泄漏 | 页面切换或热更新异常 | Runtime 提供 `dispose()` |
| 工具链过重 | 初始成本过高 | 使用 npm workspaces + TypeScript + Vite + Vitest |
| 缺少验证 | 无法证明 MVP 可运行 | 运行 typecheck/test/build，必要时启动 dev 预览 |

## 4. 执行方案

按 Goal Mode 单任务规则推进，每次只做一个可验证任务：

1. 初始化 monorepo 基础配置。
2. 创建 `packages/schema`，定义 `GameDefinition`、地图类型和最小校验。
3. 创建 `packages/runtime`，实现 Three.js 基础地图渲染 API。
4. 创建 `apps/editor`，加载示例 `game.json` 并调用 runtime。
5. 运行验证，修复问题，更新文档记录。

技术选择：

- 包管理：npm workspaces。
- 语言：TypeScript。
- 前端入口：Vite + React。
- 3D：Three.js。
- 测试：Vitest。
- Runtime 第一版使用 imperative API，不引入 React Three Fiber；R3F 可在后续 Editor 复杂化时评估。

## 5. 验证方式

每个任务完成后至少运行对应验证：

- `npm install`：安装依赖并生成 lockfile。
- `npm run typecheck`：验证 TypeScript。
- `npm run test`：验证 schema/runtime 行为。
- `npm run build`：验证所有 workspace 可构建。
- `npm run dev -w apps/editor`：必要时启动本地预览。

验收时检查：

- `apps/editor` 可以读取示例 JSON。
- Runtime 可以根据 JSON 创建 Three.js 场景。
- Runtime 不依赖 React/Zustand/Editor。
- `game.json` 示例是纯 JSON。
- 文档和任务记录同步。

## 6. 回滚方案

- 每个任务完成后检查 `git diff`，确保改动范围符合当前任务。
- 如果某个任务失败且无法快速修复，回退该任务新增文件或改动，保留已完成任务。
- 禁止使用 `git reset --hard`。
- 删除文件或大范围回滚前必须得到用户确认。

## 7. 当前执行状态

- 状态：完成。
- 当前任务：Debug 检查 B 与最终验收已完成。
- 下一任务：进入下一阶段功能开发。
