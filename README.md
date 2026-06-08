# ai-enegine

Web 3D UGC 游戏平台的 Tower Defense MVP。当前已完成本地创作与运行闭环：用纯 JSON 描述地图与玩法，Editor 修改并导出 `game.json`，Player 导入并运行该 JSON，Runtime 负责 deterministic simulation 和 Three.js 渲染。

## 当前 MVP 范围

已完成的最小闭环：

- monorepo workspace 基础结构。
- `packages/schema`：`game.json` TypeScript 类型与最小校验，覆盖 map、units、towers、waves、base 和 triggers。
- `packages/runtime`：独立 Three.js runtime，可读取 `GameDefinition` 生成基础地图场景，并通过显式 `tick(deltaMs)` 推进怪物移动、塔攻击、血量、漏怪、波次和最小游戏状态。
- `apps/editor`：Vite React 最小编辑器，支持地图尺寸、路径点、塔位、基地血量、怪物属性、防御塔和波次配置，调用 runtime 预览当前有效 JSON，支持在 3D 预览中选择、添加和拖拽路径点/塔位，并支持本地导入/导出 `game.json`。

当前不做：

- 登录、商城、社交、发布系统。
- 大型编辑器。
- AI Agent 生成流程。
- Lua、脚本系统、ECS、MMO。
- 完整多人联机。
- 云存储、发布系统、自动保存、版本历史。

Playable Runtime：

- 新增 `apps/player` 作为浏览器游戏运行入口。
- Player 将读取 `GameDefinition`，驱动 Runtime `tick(deltaMs)` / `render()`，并展示 `getState()`。
- `apps/player` 已提供最小 Playable Runtime 入口，支持 Play / Pause / Step / Reset、HUD 和本地 JSON 导入。

Editor Gameplay Configuration：

- Editor 已支持配置 Tower Defense MVP 的核心玩法数据。
- 地图配置仍只修改 `map` definition；玩法配置只修改 `base`、`units`、`towers` 和 `waves` definition。
- Editor 不保存 runtime state，也不复制怪物移动、攻击、血量、波次或胜负逻辑。

Editor Interactive Map Editing：

- Editor 已支持 Select、Add Path Point 和 Add Tower Slot 三个 3D 预览工具。
- 用户可以在 3D 预览中点击选择路径点或塔位，并拖拽到整数网格坐标。
- 交互编辑仍只修改 `GameDefinition` JSON，不修改 Runtime gameplay 规则。

## 目录结构

```txt
apps/
  editor/        # Vite React editor，只修改 JSON 并调用 runtime 预览
  player/        # Vite React player，运行 JSON 并驱动 runtime
  server/        # 未来 Colyseus/server 入口，当前仅占位

packages/
  schema/        # game.json 类型与校验
  runtime/       # Three.js runtime + deterministic simulation，独立于 React UI
  shared/        # 共享工具占位，当前保持空

docs/            # 项目计划、架构原则、开发流程、Agent prompts
goal-1/          # Goal Mode 规划与任务记录
goal-2/          # 阶段 4-10 的三 Agent 执行记录
goal-3/          # Playable Runtime MVP 的 Goal Mode 执行记录
```

## 安装

```bash
npm install
```

## 本地预览 Editor

```bash
npm run dev -w apps/editor
```

默认地址：

```txt
http://127.0.0.1:5173/
```

预期结果：

- 页面显示 Map Editor 和 3D runtime preview。
- Inspector 显示 Tools、File、Runtime、Map Size、Path Points、Tower Slots、Base、Monsters、Towers、Waves 和 `game.json` 区块。
- 可以编辑地图尺寸、路径点、塔位、基地血量、怪物属性、防御塔和波次；也可以用 3D 预览工具选择、添加和拖拽路径点/塔位；schema 有效时 runtime preview 会重建。
- 可以导出当前有效 `game.json`，也可以导入本地 JSON；无效导入会保留当前 draft/preview。
- 画布中显示网格、路径、塔位标记和 blocked tile。

## 本地运行 Player

```bash
npm run dev -w apps/player
```

默认地址：

```txt
http://127.0.0.1:5174/
```

预期结果：

- 页面显示 Playable Runtime、Controls 和 HUD。
- Play / Pause / Step / Reset 可以控制 runtime。
- HUD 显示 `status`、elapsed、base hp、active monster count 和 wave progress。
- 可以导入本地 `game.json`；无效导入不会替换当前 game。

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

## 开发约定

后续功能、修复和文档更新默认直接在 `main` 分支推进。只有在需要隔离高风险实验、长期并行任务或外部协作时，才额外创建短生命周期功能分支。

## 当前状态

`docs/project-plan.md` 第一阶段的阶段 1-10 已完成到本地 MVP 闭环。第二阶段 `Playable Runtime MVP` 已完成最小运行入口。第三阶段 `Editor Gameplay Configuration MVP` 已完成最小创作闭环。第四阶段 `Editor Interactive Map Editing MVP` 已完成首版 3D 预览交互编辑：`apps/editor` 可以配置地图与玩法，导出的 `game.json` 可在 `apps/player` 导入运行。
