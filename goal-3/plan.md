# Goal 3 Plan：完成 docs 中的 Playable Runtime 计划

## 1. 需求分析

当前 active goal 是“完成 `docs/` 中的 plan”。以当前仓库为准，`docs/project-plan.md` 已将下一阶段定义为第二阶段 `Playable Runtime MVP`，目标是新增 `apps/player`，让用户可以在浏览器中运行现有 Tower Defense Runtime，而不只是通过 Editor 编辑和预览地图。

本 Goal 要完成 `docs/project-plan.md` 的阶段 11 到阶段 16：

1. 新增 `apps/player`
2. Runtime 渲染动态怪物状态
3. Player 支持 Play / Pause / Step / Reset
4. Player 显示 HUD：`status`、`base.hp`、wave progress、monster count
5. Player 支持导入本地 `game.json`
6. 完成 player smoke test 与文档同步

## 2. 上下文梳理

已完成基础：

- `packages/schema` 已定义 `GameDefinition`、`base`、`map`、`units`、`towers`、`waves`、`triggers`。
- `packages/runtime` 已有 Three.js scene 和 deterministic simulation：`tick(deltaMs)`、`getState()`、`render()`。
- `apps/editor` 已有最小 React/Vite 编辑器、JSON 导入导出 helper 和 sample `game.sample.json`。
- `docs/architecture-principles.md` 明确 Player 只能读取 JSON、驱动 Runtime、展示 Runtime state，不能复制 gameplay 逻辑。
- `docs/development-workflow.md` 明确 Player loop 固定步进默认值为 `SIM_STEP_MS = 100`。

## 3. 风险评估

| 风险 | 影响 | 控制方式 |
| --- | --- | --- |
| Player 复制 runtime 逻辑 | 破坏 Runtime 作为玩法真相 | Player 只调用 `tick/render/getState`，不计算移动/攻击/胜负 |
| 动态渲染写在 React 里 | 后续服务端/多端同步边界混乱 | 怪物 mesh 更新放在 `packages/runtime` |
| Reset 新增 runtime mutation API | API 提前扩张 | Reset 通过 dispose/recreate runtime 实现 |
| RAF 直接决定 gameplay | 非确定性、难同步 | RAF 只累积时间，按 `SIM_STEP_MS = 100` 固定步进 |
| 新增 app 未接入根脚本 | 验证遗漏 Player | 根 `typecheck/test/build` 必须覆盖 `apps/player` |
| 导入 JSON 污染运行状态 | state/definition 混淆 | 导入只接受 schema-valid `GameDefinition`，失败不替换当前 game |

## 4. 执行方案

按项目三 Agent 流程推进，但本轮在主会话中顺序执行并记录：

1. 架构/任务拆解：锁定阶段 11-16 的最小切片和边界。
2. 全栈开发：先 runtime 动态渲染，再 player shell/control/HUD/import。
3. 测试/代码审查：检查 Runtime/Player 解耦、deterministic loop、schema 兼容、边界未越界。
4. 修复验证：运行完整验证和浏览器 smoke。

最小实现策略：

- Runtime 增加动态怪物 mesh 的内部管理，并在 `render()` 前同步 simulation state 到 scene。
- Runtime 保持公共 API 不扩张；可增加 scene summary 中的 runtime 可观测字段，或通过测试读取 scene object 名称/位置。
- `apps/player` 采用 Vite + React + TypeScript，结构尽量复用 editor 的模式，但不依赖 `apps/editor`。
- Player 初始加载当前 sample JSON 的副本，导入后替换当前 game 并重建 runtime。
- Player controls 使用 `SIM_STEP_MS = 100`，Play 使用 RAF 累积时间并执行固定步进。
- HUD 只展示 `runtime.getState()` 的状态，不自行推导 gameplay。

## 5. 验证方式

基础验证：

- `npm run typecheck`
- `npm run test`
- `npm run build`

定向验证：

- runtime 测试：`tick(deltaMs)` 后动态怪物 mesh 位置随 state 更新；dead/escaped 不表现为 active monster。
- player helper 测试：固定步进累积、Play/Pause/Step/Reset 状态转换、导入失败不替换当前 game。
- 浏览器 smoke：启动 `apps/player`，确认页面打开、Play/Pause/Step/Reset 可用、HUD 与 Runtime state 一致。

## 6. 回滚方案

- 每个任务结束检查 `git diff`，避免越界改动。
- 不使用 `git reset --hard`。
- 如果 runtime 动态渲染方案破坏现有 editor preview，先回退 runtime 动态层并缩小阶段 12。
- 如果 player scope 膨胀到联机、发布、账号、云存储或大型编辑器，立即停止并回到架构拆解。

## 7. 当前执行状态

- 状态：进行中。
- 当前任务：创建 Goal 3 核心文件并开始阶段 11-16 实现。
- 下一任务：实现 Runtime 动态怪物渲染的最小切片。
