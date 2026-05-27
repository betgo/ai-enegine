# ai-enegine

Web 3D UGC 游戏平台的第一阶段 MVP。当前只做 **3D Tower Defense Runtime**：用纯 JSON 描述地图，独立 Runtime 读取 JSON 并用 Three.js 渲染基础 3D 地图，Editor 只负责加载示例 JSON 和挂载预览。

## 当前 MVP 范围

已完成的最小闭环：

- monorepo workspace 基础结构。
- `packages/schema`：`game.json` TypeScript 类型与最小校验。
- `packages/runtime`：独立 Three.js runtime，可读取 `GameDefinition` 生成基础地图场景。
- `apps/editor`：Vite React 预览壳，加载 `game.sample.json` 并调用 runtime。

当前不做：

- 登录、商城、社交、发布系统。
- 大型编辑器。
- AI Agent 生成流程。
- Lua、脚本系统、ECS、MMO。
- 完整多人联机。
- 怪物移动、攻击、血量、波次等后续玩法逻辑。

## 目录结构

```txt
apps/
  editor/        # Vite React preview，加载 JSON 并挂载 runtime
  server/        # 未来 Colyseus/server 入口，当前仅占位

packages/
  schema/        # game.json 类型与校验
  runtime/       # Three.js runtime，独立于 React UI
  shared/        # 共享工具占位，当前保持空

docs/            # 项目计划、架构原则、开发流程、Agent prompts
goal-1/          # Goal Mode 规划与任务记录
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

- 页面显示 `3D Tower Defense Runtime`。
- Inspector 显示 `Runtime Demo`、地图尺寸、tile 数、路径数和 tower slot 数。
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

## 下一步

下一阶段从 `docs/project-plan.md` 的路线图继续，优先实现怪物路径移动前的地图加载与 runtime state 基础，而不是扩展平台功能。
