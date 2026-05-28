# ai-enegine

Web 3D UGC 游戏平台的第一阶段 MVP。当前只做 **3D Tower Defense Runtime**：用纯 JSON 描述地图与玩法，独立 Runtime 读取 JSON 并用 Three.js 渲染基础 3D 地图，同时维护 deterministic simulation state；Editor 只负责修改、预览、导入和导出 JSON。

## 当前 MVP 范围

已完成的最小闭环：

- monorepo workspace 基础结构。
- `packages/schema`：`game.json` TypeScript 类型与最小校验，覆盖 map、units、towers、waves、base 和 triggers。
- `packages/runtime`：独立 Three.js runtime，可读取 `GameDefinition` 生成基础地图场景，并通过显式 `tick(deltaMs)` 推进怪物移动、塔攻击、血量、漏怪、波次和最小游戏状态。
- `apps/editor`：Vite React 最小编辑器，支持地图尺寸、路径点、塔位编辑，调用 runtime 预览当前有效 JSON，并支持本地导入/导出 `game.json`。

当前不做：

- 登录、商城、社交、发布系统。
- 大型编辑器。
- AI Agent 生成流程。
- Lua、脚本系统、ECS、MMO。
- 完整多人联机。
- 云存储、发布系统、自动保存、版本历史。

## 目录结构

```txt
apps/
  editor/        # Vite React editor，只修改 JSON 并调用 runtime 预览
  server/        # 未来 Colyseus/server 入口，当前仅占位

packages/
  schema/        # game.json 类型与校验
  runtime/       # Three.js runtime + deterministic simulation，独立于 React UI
  shared/        # 共享工具占位，当前保持空

docs/            # 项目计划、架构原则、开发流程、Agent prompts
goal-1/          # Goal Mode 规划与任务记录
goal-2/          # 阶段 4-10 的三 Agent 执行记录
```

## 安装

```bash
npm install
```

## 本地预览

```bash
npm run dev -w apps/editor
```

默认地址：

```txt
http://127.0.0.1:5173/
```

预期结果：

- 页面显示 Map Editor 和 3D runtime preview。
- Inspector 显示 File、Runtime、Map Size、Path Points、Tower Slots 和 `game.json` 区块。
- 可以编辑地图尺寸、路径点和塔位；schema 有效时 runtime preview 会重建。
- 可以导出当前有效 `game.json`，也可以导入本地 JSON；无效导入会保留当前 draft/preview。
- 画布中显示网格、路径、塔位标记和 blocked tile。

## 验证命令

```bash
npm run typecheck
npm run test
npm run build
```

`npm run build` 当前会出现 Vite chunk size warning，因为 Three.js 进入 MVP 预览 bundle。该提示不影响构建结果，后续需要做体积优化时再评估动态加载或 manual chunks。

## 架构约束

- `game.json` 必须是纯 JSON，不允许任意脚本。
- Runtime 与 Editor 解耦；Runtime 不依赖 React、Zustand 或 Editor UI。
- Editor 只修改或加载 JSON，并调用 Runtime 预览。
- Gameplay 逻辑必须能序列化，并适合未来多人同步。
- AI 未来生成的是 JSON，不是代码。

## 当前状态

`docs/project-plan.md` 第一阶段的阶段 1-10 已完成到本地 MVP 闭环。后续应基于现有 schema/runtime/editor 小步推进，不要直接扩成完整 UGC 平台。
