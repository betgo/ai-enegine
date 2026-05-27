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

### 任务 6：架构/任务拆解 Agent 拆解阶段 5

- 状态：complete
- 目标：让架构/任务拆解 Agent 基于阶段 5“防御塔自动攻击”拆出最小任务。
- 验证：输出包含当前目标、范围边界、任务拆解、风险与约束、推荐下一步。
- 执行记录：
  - 已切换到分支 `codex/stage-5-tower-attack`。
  - 已派发架构/任务拆解 Agent `Kuhn`，只读检查 docs、schema、runtime、sample 与阶段 4 状态。
  - 阶段 5 被收敛为单个最小任务：新增顶层 `towers[]`，通过 `slotId` 引用 `map.towerSlots[]`，runtime 在 `tick(deltaMs)` 中以 deterministic 规则自动攻击射程内怪物。
  - JSON 最小字段：`id`、`slotId`、`range`、`attackIntervalMs`、`damage`。
  - Runtime 最小行为：怪物移动后处理塔攻击；目标候选为射程内且 `reachedEnd === false` 的怪物；优先选择 `pathProgress` 最大者，若并列选 `id` 字典序更小者；攻击只扣 `monster.hp` 且下限为 0，并更新塔冷却 state。
  - 本次明确不做：死亡/移除怪物、漏怪、基地扣血、胜负、波次、塔建造/升级/出售、projectile/动画/特效、Editor UI、Server/联机、ECS/Lua/AI Agent/大型抽象。
  - 风险约束：塔定义必须与 `towerSlots` 分离；不能混入 `units[]`；攻击冷却必须进入可序列化 state；不能实现成“每 tick 最多攻击一次”导致等价时间推进结果分叉。
  - 推荐下一步：交给全栈开发 Agent 先改 schema，再改 runtime，最后同步 sample JSON 和测试。
  - 已关闭架构/任务拆解 Agent。
  - 自检：对任务 6 当前拆解有 100% 信心；范围符合阶段 5，不越界到阶段 6。

### 任务 7：全栈开发 Agent 实现阶段 5 最小切片

- 状态：complete
- 目标：实现最小防御塔定义与 deterministic 自动攻击。
- 验证：schema/runtime 测试通过，项目 typecheck/test/build 通过。
- 执行记录：
  - 已派发全栈开发 Agent `Pauli`；该 Agent 被关闭前留下 schema 与 runtime 测试的部分改动，主会话接管实现并完成闭环。
  - 已确认阶段 5 新增测试先失败：schema sample 缺少 `towers`，runtime 缺少 tower state、攻击扣血、clone、fail fast 等行为。
  - 已在 `packages/schema/src/types.ts` 新增顶层 `towers: TowerDefinition[]` 与最小 `TowerDefinition`。
  - 已将 schema 校验拆为 `map-validation.ts`、`entity-validation.ts`、`validation-utils.ts`，并新增 `towers.test.ts` 与 `test-helpers.ts`，保持文件尺寸在项目约束内。
  - 已在 schema 中校验 towers 数组、tower id 唯一、slotId 引用已有 tower slot、slotId 不重复占用、tower 数值为正数、towerSlot id 唯一。
  - 已在 `packages/runtime/src/simulation.ts` 增加 `towers[]` state，并新增 `packages/runtime/src/tower-attack.ts` 封装塔定义构建和攻击逻辑。
  - 已新增 `packages/runtime/src/tower-attack.test.ts`，覆盖 tower state 初始化、射程外不扣血、到达攻击间隔扣血、targeting、等价时间推进、hp 下限、clone、runtime fail fast、sample 初始化。
  - 已更新 `apps/editor/src/game.sample.json`，新增一座放置在 `slot-a` 的 tower。
  - 已运行定向测试：`npm run test -w packages/schema` 通过，schema 17 tests；`npm run test -w packages/runtime` 通过，runtime 20 tests。
  - 自检：阶段 5 初版实现保持 runtime/editor 解耦，攻击结果只写入可序列化 state，未实现死亡/漏怪/胜负。

### Debug 检查 B：任务 6 到任务 8 后全面检查

- 状态：pending
- 检查项：塔 schema 语义、targeting deterministic、cooldown 可序列化、runtime/editor 解耦、MVP 边界。
- 执行记录：
  - 待记录。

### 任务 8：测试/代码审查 Agent 审查阶段 5

- 状态：complete
- 目标：审查阶段 5 改动，确认攻击逻辑 deterministic、状态可序列化且未越界到阶段 6。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - 已派发测试/代码审查 Agent `Dewey` 只读审查阶段 5 diff。
  - Findings P1：无目标时 `cooldownRemainingMs` 被强制置为 0，会让“空场等待后进怪”和“怪一开始在场”产生不一致攻击结果，破坏 deterministic cooldown 语义。
  - Findings P2：target tie-breaker 使用 `localeCompare`，存在跨环境 locale/ICU 差异风险。
  - Test Gaps：缺少无目标等待后的冷却测试、id tie-breaker 不依赖数组顺序测试、hp 为 0 的怪物不应继续被选中测试。
  - Architecture Check：runtime/editor 解耦、纯 JSON、可序列化状态、MVP 边界通过；deterministic 部分需修复 cooldown 和 id 比较。
  - 已关闭测试/代码审查 Agent。

### 任务 9：根据阶段 5 审查结果修复并最终验证

- 状态：complete
- 目标：修复审查发现的问题，运行最终验证，更新 Goal 记录并提交。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 通过。
- 执行记录：
  - 已按 TDD 补充失败测试：`does not target monsters with zero hp`，确认现有逻辑会重复攻击 0 血怪物。
  - 已修复 target 候选条件：排除 `hp <= 0` 且不移除怪物，不越界到阶段 6。
  - 已按审查意见补充失败测试：`keeps cooldown timing while no target is in range`，确认无目标时冷却归零问题。
  - 已修复无目标时冷却语义：不再将 `cooldownRemainingMs` 强制置为 0，保留累计冷却状态。
  - 已将 tie-breaker 从 `localeCompare` 改为显式 `<` / `>` 比较，并补充 id 顺序不依赖 unit 数组顺序的测试。
  - 已拆分过长测试文件，新增 `packages/runtime/src/tower-targeting.test.ts`，保持文件尺寸在项目约束内。
  - 已运行 `npm run test -w packages/runtime`，通过：runtime 23 tests。
  - 已运行 `npm run test -w packages/schema`，通过：schema 17 tests。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 17 tests，runtime 23 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：对阶段 5 当前实现有 100% 信心；审查 findings 已处理，攻击逻辑 deterministic，未实现死亡/漏怪/胜负。
