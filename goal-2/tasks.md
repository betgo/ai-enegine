# Goal 2 Tasks：按 project-plan 继续实现

## 执行规则

- 单次只执行 1 个任务。
- 三个 Agent 分工：
  - 架构/任务拆解 Agent：只读拆解，不写代码。
  - 全栈开发 Agent：实现单个明确任务。
  - 测试/代码审查 Agent：只读审查，输出 findings。
- 每个开发任务完成后自检：对当前实现是否 100% 有信心。
- 存疑时继续排查并修复。
- 每完成 3 个任务执行一次全面 Debug 检查。
- 如有代码变更，任务确认无误后提交。
- 更新本文件记录执行内容。

## 任务列表

### 任务 1：创建 Goal 2 核心文件

- 状态：complete
- 目标：创建 `goal-2/input.md`、`goal-2/plan.md`、`goal-2/tasks.md`。
- 验证：三份文件存在，覆盖原始输入、上下文、风险、执行方案和任务拆分。
- 执行记录：
  - 已创建 `goal-2/input.md`，保存用户原始目标。
  - 已创建 `goal-2/plan.md`，记录基于 docs 的阶段判断、风险、三 Agent 协作方案、验证方式和回滚方案。
  - 已创建 `goal-2/tasks.md`，拆分为架构拆解、全栈实现、代码审查、修复验证等任务。
  - 已运行 `find goal-2 -maxdepth 1 -type f -print | sort`，确认三份核心文件存在。
  - 自检：对任务 1 当前实现有 100% 信心；Goal Mode 前置文件齐全。

### 任务 2：架构/任务拆解 Agent 拆解阶段 4

- 状态：complete
- 目标：让架构/任务拆解 Agent 基于 `docs/project-plan.md` 和当前代码拆出怪物路径移动的最小任务。
- 验证：输出包含当前目标、范围边界、任务拆解、风险与约束、推荐下一步。
- 执行记录：
  - 已派发架构/任务拆解 Agent `Cicero`，只读检查 docs 与当前代码。
  - 阶段 4 被收敛为单个最小任务：支持 `game.json` 中定义的初始怪物沿已有 `map.paths[].points` 进行 deterministic tick 移动，并暴露可序列化怪物状态。
  - 本次明确做：扩展 `units[]` 最小怪物定义、通过 `pathId` 引用已有路径、runtime 新增显式 `tick(deltaMs)`、维护可序列化 state、同步示例 JSON、补 schema/runtime 测试。
  - 本次明确不做：波次系统、防御塔攻击、伤害/死亡/漏怪/胜负、Editor 动画控制、Server/联机、ECS/Lua/AI Agent/大型编辑器。
  - 推荐下一步：交给全栈开发 Agent 实现“初始怪物沿已有 `map.paths` 的 deterministic tick 移动”，先改 `packages/schema`，再改 `packages/runtime`，最后同步 `apps/editor/src/game.sample.json`。
  - 已关闭架构/任务拆解 Agent。
  - 自检：对任务 2 当前拆解有 100% 信心；范围足够小，且保持 schema -> runtime -> editor 的顺序。

### 任务 3：全栈开发 Agent 实现阶段 4 最小切片

- 状态：complete
- 目标：根据架构拆解实现怪物沿路径移动的最小 deterministic runtime 能力。
- 验证：schema/runtime 测试通过，项目 typecheck/test/build 通过。
- 执行记录：
  - 已切换到分支 `codex/stage-4-monster-movement`。
  - 已派发全栈开发 Agent `Leibniz` 实现阶段 4 最小切片。
  - 已扩展 `packages/schema/src/index.ts`：`units[]` 支持最小 `monster` 定义，包含 `id`、`kind`、`pathId`、`speed`、`maxHp`，并校验 `pathId` 引用已有 `map.paths[].id`。
  - 已扩展 `packages/runtime/src/index.ts`：新增 `RuntimeSimulationState`、`RuntimeMonsterState`、`tick(deltaMs)`、`getState()`，通过显式 `deltaMs` deterministic 推进怪物沿多段路径移动。
  - 已更新 `apps/editor/src/game.sample.json`，加入一个沿 `main-path` 移动的 monster。
  - 已补充 schema/runtime 单元测试，覆盖合法 monster、非法 kind、非正 speed/maxHp、未知 pathId、初始化 state、deterministic tick、多段路径移动、终点停止和 state clone。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 6 tests，runtime 7 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：对任务 3 当前实现有 100% 信心；玩法状态来自 runtime state，Editor 未写入 gameplay 逻辑。

### Debug 检查 A：前三个任务后全面检查

- 状态：complete
- 检查项：schema 设计、runtime/editor 解耦、状态可序列化、测试覆盖、MVP 边界。
- 执行记录：
  - schema 设计：只新增阶段 4 所需最小 monster 定义；`waves`、`triggers` 仍保持占位，未提前实现阶段 7 或 trigger 系统。
  - runtime/editor 解耦：移动逻辑在 `packages/runtime`；`apps/editor` 仅更新 sample JSON。
  - 状态可序列化：`getState()` 返回 `elapsedMs` 和 `monsters[]` 的纯对象，包含数值、字符串、布尔值和坐标对象。
  - deterministic：`tick(deltaMs)` 使用显式时间输入，不使用真实时间、随机数或渲染帧率。
  - 测试覆盖：schema/runtime 单元测试覆盖阶段 4 核心路径；根级 `typecheck/test/build` 已通过。
  - MVP 边界：未引入登录、商城、社交、大型编辑器、AI Agent、Lua、ECS、MMO、波次或攻击系统。

### 任务 4：测试/代码审查 Agent 审查阶段 4

- 状态：complete
- 目标：审查全栈开发 Agent 的改动，确认没有破坏架构边界或 MVP 边界。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - 已派发测试/代码审查 Agent `Planck` 只读审查阶段 4 diff。
  - Findings P1：`map.paths[].id` 和 `units[].id` 缺少唯一性约束，runtime `Map` 会静默覆盖重复 path，重复 monster id 会影响状态 diff、多人同步和 UI 绑定。
  - Findings P2：`map.paths[].points` 只校验至少 2 个点，未拒绝总长度为 0 的路径，会产生合法但无法移动的退化状态。
  - Test Gaps：缺少重复 id、zero-length path、tick 拆分一致性、editor sample schema 回归验证。
  - Architecture Check：runtime/editor 解耦、纯 JSON、可序列化状态、deterministic、MVP 边界均基本通过；主要问题集中在 definition 语义稳定性。
  - Recommendation：不建议直接提交，先修复 P1/P2 并补测试。
  - 已关闭测试/代码审查 Agent。

### 任务 5：根据审查结果修复并最终验证

- 状态：complete
- 目标：修复审查发现的问题，运行最终验证，更新 README/Goal 记录。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 通过；必要时浏览器 smoke check。
- 执行记录：
  - 已按 TDD 补充失败测试：
    - schema 拒绝重复 `map.paths[].id`。
    - schema 拒绝重复 `units[].id`。
    - schema 拒绝 zero-length path。
    - runtime 对重复 path id、重复 unit id、zero-length path fail fast。
    - runtime 验证 `tick(1000)` 与 `tick(250) * 4` 的 movement state 一致。
    - schema 验证 `apps/editor/src/game.sample.json` 可通过校验。
  - 已确认新增测试先失败：schema 3 个新增测试失败，runtime 3 个新增测试失败。
  - 已修复 schema：新增 path id 唯一性、unit id 唯一性和 path 总长度正数校验。
  - 已修复 runtime：新增 `packages/runtime/src/simulation.ts`，封装 deterministic simulation；runtime 初始化对重复 path id、重复 unit id、zero-length path fail fast。
  - 已将 `packages/runtime/src/index.ts` 收敛回渲染入口与 runtime 装配职责，避免单文件继续膨胀。
  - 已新增 `packages/schema/src/types.ts`，让 schema 类型定义与校验逻辑分离，保持文件尺寸在项目约束内。
  - 已新增 `packages/runtime/src/test-helpers.ts`，拆出 runtime 测试 fixture 和 renderer double，保持测试文件尺寸在项目约束内。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 10 tests，runtime 11 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：对当前阶段 4 修复有 100% 信心；审查 findings 已处理，剩余 warning 是现有 Three.js bundle size 层面的非阻塞提示。
