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

- 状态：complete
- 检查项：塔 schema 语义、targeting deterministic、cooldown 可序列化、runtime/editor 解耦、MVP 边界。
- 执行记录：
  - 塔 schema 语义：`towers[]` 作为顶层纯 JSON 定义存在，塔通过 `slotId` 引用 `map.towerSlots[]`，没有混入 `units[]`；schema 校验覆盖 tower id 唯一、slotId 引用、slotId 不重复占用和数值为正。
  - targeting deterministic：target 候选排除 `hp <= 0` 和 `reachedEnd === true` 的怪物；目标优先级为更高 `pathProgress`，并列时使用显式字符串 `<` / `>` 比较 id，避免 `localeCompare` 的跨环境差异。
  - cooldown 可序列化：`RuntimeTowerState` 暴露 `cooldownRemainingMs`，为纯数值状态；无目标时不重置冷却，避免空场等待导致时间推进语义分叉。
  - runtime/editor 解耦：攻击逻辑位于 `packages/runtime/src/tower-attack.ts` 与 `packages/runtime/src/simulation.ts`；`apps/editor` 只同步 sample JSON，没有写入 gameplay 逻辑。
  - MVP 边界：阶段 5 未实现死亡移除、漏怪、基地扣血、胜负、波次、塔建造/升级/出售、Server 联机、AI Agent、Lua、ECS 或大型编辑器。
  - 验证证据：任务 9 已记录 `npm run typecheck`、`npm run test`、`npm run build` 通过；Vite chunk size warning 为现有 Three.js bundle 体积提示，不阻塞阶段 5。

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

### 任务 10：架构/任务拆解 Agent 拆解阶段 6

- 状态：complete
- 目标：让架构/任务拆解 Agent 基于阶段 6“血量系统”拆出最小任务。
- 验证：输出包含当前目标、范围边界、任务拆解、风险与约束、推荐下一步。
- 执行记录：
  - 已派发架构/任务拆解 Agent `Kepler`，只读检查 docs、goal 记录、schema、runtime、tests 与 sample。
  - 阶段 6 被收敛为单个最小任务：实现“单基地 HP + 怪物死亡/漏怪结算”。
  - JSON 最小变化：新增顶层 `base`，最小字段为 `maxHp`；`units[]` 中 monster 增加 `leakDamage`。
  - Runtime 最小状态：`RuntimeSimulationState` 新增 base state；monster 新增显式 `status: "active" | "dead" | "escaped"`。
  - Runtime 最小行为：只推进 active monster；被打到 0 HP 的怪物标记 dead，后续不移动、不再被攻击、不漏怪；活着到终点的怪物只扣一次 base HP 并标记 escaped。
  - 本次明确不做：waves 生成与推进、完整 gameStatus/victory 状态机、金币/奖励、塔建造/升级/出售、投射物/特效、Editor UI、Server 协议、删除或重排 monster 数组。
  - 风险约束：不能只用 `hp === 0` 隐式表达死亡；不能从 `monsters[]` 删除对象；不能把胜利条件提前做进阶段 6；单基地足够，不引入 player/players 或多基地。
  - 推荐下一步：交给全栈开发 Agent 实现“单基地 HP + 怪物死亡/漏怪结算”，顺序为 schema -> sample JSON -> runtime -> 定向测试。
  - 已关闭架构/任务拆解 Agent。
  - 自检：对任务 10 当前拆解有 100% 信心；范围符合阶段 6，不越界到阶段 7。

### 任务 11：全栈开发 Agent 实现阶段 6 最小切片

- 状态：complete
- 目标：实现单基地 HP、怪物死亡状态和漏怪扣血结算。
- 验证：schema/runtime 测试通过，项目 typecheck/test/build 通过。
- 执行记录：
  - 已派发全栈开发 Agent `Bohr` 实现阶段 6 最小切片。
  - 已在 `packages/schema/src/types.ts` 新增 `base: BaseDefinition`，最小字段为 `maxHp`。
  - 已在 monster definition 中新增 `leakDamage`，并在 schema 校验中要求 `base.maxHp` 与 `units[].leakDamage` 为正数。
  - 已同步 `packages/schema/src/test-helpers.ts` 与 `apps/editor/src/game.sample.json`，sample JSON 继续保持纯 JSON。
  - 已在 runtime state 中新增 `base: { hp, maxHp }`，并为 monster state 新增 `status: "active" | "dead" | "escaped"`。
  - 已实现基础结算：active monster 到达终点会扣一次 base hp 并标记 escaped；hp 被塔打到 0 会标记 dead；dead/escaped 不再移动、不再被攻击、不重复漏怪。
  - 已新增/更新 schema 与 runtime 测试，覆盖 base/leakDamage 校验、初始化 state、dead/escaped、base hp clamp、sample 初始化。
  - 全栈开发 Agent 已运行 `npm run test -w packages/schema`、`npm run test -w packages/runtime`、`npm run typecheck`、`npm run test` 并报告通过。
  - 主会话复核发现两个问题需要收尾：阶段 6 tick 分割等价性仍有竞争场景漏洞，且 `index.test.ts` 与 `tower-attack.test.ts` 超过 300 行文件长度约束。
  - 自检：阶段 6 初版方向正确，但在审查修复完成前不作为最终完成态。

### 任务 12：测试/代码审查 Agent 审查阶段 6

- 状态：complete
- 目标：审查阶段 6 改动，确认血量系统 deterministic、可序列化且未越界到阶段 7。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - 已派发测试/代码审查 Agent `Galileo` 只读审查阶段 6 diff。
  - Findings P1：`tick(deltaMs)` 仍按“整段移动完所有怪，再整段结算所有塔攻击”的顺序执行，在“攻击阻止漏怪”的竞争场景下会导致 `tick(1000)` 与 `tick(500)+tick(500)` 结果分叉，破坏等价 tick 分割与未来多人同步。
  - Test Gaps：缺少覆盖“同一总时长下，怪会在该时间窗内死亡或逃脱”的等价性测试。
  - Architecture Check：Runtime/Editor 解耦、纯 JSON、可校验、可序列化、未越界到 waves/gameStatus/Editor UI/Server/AI Agent/Lua/ECS/MMO；`dead monster` 不再移动、不漏怪、不再被选中这一点通过。
  - Recommendation：先修 `tick` 内时间步进模型，补反例测试，再重新验证。
  - 已关闭测试/代码审查 Agent。

### 任务 13：根据阶段 6 审查结果修复并最终验证

- 状态：complete
- 目标：修复阶段 6 tick 分割等价性问题，处理测试文件长度约束，并运行最终验证。
- 验证：`npm run test -w packages/schema`、`npm run test -w packages/runtime`、`npm run typecheck`、`npm run test`、`npm run build` 通过。
- 执行记录：
  - 已按 TDD 新增 `packages/runtime/src/health-system.test.ts`，补充“攻击阻止漏怪”竞争场景：`tick(1000)` 与 `tick(500)+tick(500)` 必须得到相同 state。
  - 已确认新增测试先失败：单 tick 结果为 escaped 且 base 被扣血，拆分 tick 结果为 dead 且 base 未扣血，复现审查 P1。
  - 已新增 `packages/runtime/src/movement.ts`，封装 path data、怪物移动、终点时间和 ready tower 入射程时间计算。
  - 已调整 `packages/runtime/src/simulation.ts`：runtime 内部按剩余时间、下一个塔冷却完成时间、下一个怪物到达终点时间、ready tower 的下一个入射程时间进行子步进，保持大 tick 与拆分 tick 的结算顺序一致。
  - 已调整 `packages/runtime/src/tower-attack.ts`：拆出 ready tower 攻击入口，攻击仍只选择 active monster，hp 到 0 后标记 dead。
  - 已将血量相关测试从 `index.test.ts` 和 `tower-attack.test.ts` 移入 `health-system.test.ts`，所有 source/test 文件均低于 300 行。
  - 已运行 `npm run test -w packages/runtime -- health-system`，先失败后修复通过。
  - 已运行 `npm run test -w packages/runtime`，通过：runtime 27 tests。
  - 已运行 `npm run test -w packages/schema`，通过：schema 19 tests。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 19 tests，runtime 27 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：对阶段 6 当前实现有 100% 信心；审查 P1 已用红绿测试闭环修复，runtime/editor 仍解耦，未实现阶段 7 波次或完整 gameStatus。

### Debug 检查 C：任务 10 到任务 13 后全面检查

- 状态：complete
- 检查项：血量 schema 语义、death/escaped 状态、tick 分割等价性、runtime/editor 解耦、MVP 边界、文件尺寸。
- 执行记录：
  - 血量 schema 语义：`base.maxHp` 与 `units[].leakDamage` 是纯 JSON 正数定义，schema 校验与 sample JSON 已同步。
  - death/escaped 状态：monster 保留稳定数组位置和 id，通过 `status: "active" | "dead" | "escaped"` 表达生命周期；不从 `monsters[]` 删除对象，适合 future diff/sync。
  - tick 分割等价性：已补充失败测试并修复；runtime 内部按关键事件时间子步进，避免大 tick 先漏怪、小 tick 先打死的分叉。
  - runtime/editor 解耦：血量、死亡、漏怪和塔攻击结算均在 `packages/runtime`；`apps/editor` 只同步 sample JSON，没有写入 gameplay 逻辑。
  - MVP 边界：阶段 6 未实现 waves、完整 gameStatus/victory、金币/奖励、塔建造/升级/出售、投射物/特效、Editor UI、Server、AI Agent、Lua、ECS、MMO。
  - 文件尺寸：已运行 `wc -l packages/runtime/src/*.ts packages/schema/src/*.ts apps/editor/src/App.tsx apps/editor/src/main.tsx`，所有检查文件均低于 300 行。
  - 验证证据：`npm run test -w packages/schema`、`npm run test -w packages/runtime`、`npm run typecheck`、`npm run test`、`npm run build` 均通过；Vite chunk size warning 为非阻塞体积提示。

### 任务 14：架构/任务拆解 Agent 拆解阶段 7

- 状态：complete
- 目标：让架构/任务拆解 Agent 基于阶段 7“波次系统”拆出最小任务。
- 验证：输出包含当前目标、范围边界、任务拆解、风险与约束、推荐下一步。
- 执行记录：
  - 已派发架构/任务拆解 Agent `Huygens`，只读检查 docs、goal 记录、schema、runtime、tests 与 sample。
  - 阶段 7 被收敛为单个最小任务：将 `units[]` 迁移为怪物模板，并实现 flat `waves[]` 的绝对时间刷怪。
  - JSON 最小变化：`units[]` 保留 `id`、`kind`、`speed`、`maxHp`、`leakDamage`，移除 `pathId`；`waves[]` 新增 flat wave，字段为 `id`、`startTimeMs`、`unitId`、`pathId`、`count`、`intervalMs`。
  - Runtime 最小行为：初始化时 materialize `startTimeMs === 0` 的 spawn；`tick(deltaMs)` 将下一次 spawn 时间纳入事件子步进；每次 spawn 用 `unitId` 模板和 `pathId` 生成 deterministic monster id，建议格式为 `waveId:spawnIndex`。
  - Runtime 最小状态：`getState()` 新增 `waves[]` 进度，至少包含 `id`、`spawnedCount`、`totalCount`、`completed`。
  - 本次明确不做：完整 gameStatus/victory、手动开波、清怪后自动下一波、奖励/金币、随机刷怪、嵌套 spawns、trigger DSL、Editor 波次 UI、Server 协议、保存/加载、AI Agent、Lua、ECS、MMO。
  - 风险约束：`units[]` 不能继续同时表示实例和模板；`pathId` 应属于 wave spawn；`startTimeMs` 必须是绝对 elapsed time；spawn 事件必须进入 runtime 子步进模型，避免再次破坏 tick 分割等价性。
  - 推荐下一步：交给全栈开发 Agent 实现“1 个模板 + 1 条 `startTimeMs: 0` wave”复刻当前 sample，并补 spawn 边界 deterministic 测试。
  - 已关闭架构/任务拆解 Agent。
  - 自检：对任务 14 当前拆解有 100% 信心；范围符合阶段 7，不越界到阶段 8。

### 任务 15：全栈开发 Agent 实现阶段 7 最小切片

- 状态：complete
- 目标：实现 `units[]` 模板化和 flat `waves[]` 绝对时间刷怪。
- 验证：schema/runtime 测试通过，项目 typecheck/test/build 通过。
- 执行记录：
  - 已派发全栈开发 Agent `Averroes`；该 Agent 长时间未产出可整合 diff，主会话接管阶段 7 实现并完成闭环。
  - 已按 TDD 先修改 schema 测试，确认当前 schema 不支持模板化 `units[]` 和 flat `waves[]`。
  - 已更新 `packages/schema/src/types.ts`：`units[]` 中 monster 模板移除 `pathId`；新增 `WaveDefinition`，字段为 `id`、`startTimeMs`、`unitId`、`pathId`、`count`、`intervalMs`。
  - 已更新 schema 校验：`units[]` 只校验模板字段和 id 唯一；`waves[]` 校验 wave id 唯一、`startTimeMs >= 0`、`unitId` 引用已有 units id、`pathId` 引用已有 map path id、`count` 为正整数、`intervalMs` 为正数。
  - 已更新 `apps/editor/src/game.sample.json`：用 `monster-basic` 模板 + `wave-1` 的 `startTimeMs: 0` 复刻原先开局 1 只怪。
  - 已新增 `packages/runtime/src/waves.ts`，封装 unit template、wave state、spawn timing 和 deterministic monster id 生成。
  - 已更新 runtime：初始化不再把 `units[]` 直接转为怪物；`waves[]` 生成 monster，runtime monster id 为 `${waveId}:${spawnIndex}`；`RuntimeSimulationState` 新增 `waves[]` 进度。
  - 已将下一次 spawn 时间纳入 `simulation.ts` 的事件子步进，保持跨 spawn/attack/leak 边界的 tick 分割等价性。
  - 已新增 `packages/runtime/src/waves.test.ts`，覆盖 `startTimeMs: 0` 初始化刷怪、延迟刷怪、wave progress 和 spawn/attack 边界等价 tick。
  - 已迁移既有 runtime 测试到模板 + wave 语义，避免继续把 `units[]` 当实例。
  - 已运行 `npm run test -w packages/schema`，通过：schema 22 tests。
  - 已运行 `npm run test -w packages/runtime`，通过：runtime 30 tests。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 30 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：阶段 7 初版实现符合 data-driven、serializable、runtime/editor 解耦，但进入审查后发现 runtime fail-fast 仍需补强。

### 任务 16：测试/代码审查 Agent 审查阶段 7

- 状态：complete
- 目标：审查阶段 7 改动，确认 waves deterministic、可序列化且未越界到阶段 8。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - 已派发测试/代码审查 Agent `Bacon` 只读审查阶段 7 diff。
  - Findings P1：runtime 未在 simulation 创建阶段对全部 wave 合同做 fail-fast 校验；`startTimeMs > 0` 的未知 `unitId/pathId` 会延迟到 spawn 时才抛错，重复 wave id 会生成重复 monster id。
  - Test Gaps：缺少 runtime 级 fail-fast 测试；缺少 leak、spawn、tower ready/attack 同时发生时的显式定序测试。
  - Architecture Check：Runtime/Editor 解耦、纯 JSON、AI 易生成、`units[]` 模板语义、wave state 可序列化、多同步适配性和范围控制均通过。
  - Recommendation：先修 P1 再合并。
  - 已关闭测试/代码审查 Agent。

### 任务 17：根据阶段 7 审查结果修复并最终验证

- 状态：complete
- 目标：补齐 runtime wave fail-fast 校验并运行最终验证。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 通过。
- 执行记录：
  - 已按 TDD 在 `packages/runtime/src/waves.test.ts` 中新增失败测试，覆盖延迟 wave 引用未知 `unitId`、未知 `pathId` 和重复 `wave.id`。
  - 已确认新增测试先失败，复现 runtime 延迟报错/重复 id 未校验问题。
  - 已在 `packages/runtime/src/waves.ts` 的 `createWaveStates` 中增加 eager runtime 校验：重复 wave id、未知 unit template、未知 path 均在 simulation 创建阶段立即抛错。
  - 已运行 `npm run test -w packages/runtime -- waves`，先失败后修复通过。
  - 已运行文件长度检查：`wc -l packages/schema/src/*.ts packages/runtime/src/*.ts apps/editor/src/App.tsx apps/editor/src/main.tsx`，所有检查文件均低于 300 行。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 31 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：对阶段 7 当前实现有 100% 信心；审查 P1 已修复，spawn 进度可序列化，未实现阶段 8 gameStatus。

### Debug 检查 D：任务 14 到任务 17 后全面检查

- 状态：complete
- 检查项：wave schema 语义、units 模板化、spawn deterministic、wave state 可序列化、runtime/editor 解耦、MVP 边界、文件尺寸。
- 执行记录：
  - wave schema 语义：flat `waves[]` 使用绝对 `startTimeMs`、`unitId`、`pathId`、`count`、`intervalMs`，schema 校验引用和数值边界。
  - units 模板化：`units[]` 不再包含 `pathId`，只作为 monster template；runtime 不再把 `units[]` 直接生成实例。
  - spawn deterministic：monster id 使用 `${waveId}:${spawnIndex}`；spawn 时间进入 simulation 子步进，跨 spawn/attack 边界的 tick 分割测试通过。
  - wave state 可序列化：`getState().waves[]` 只包含 `id`、`spawnedCount`、`totalCount`、`completed`，适合 UI/网络同步消费。
  - runtime/editor 解耦：波次逻辑位于 `packages/runtime`；`apps/editor` 只更新 sample JSON，没有写 gameplay 逻辑。
  - MVP 边界：阶段 7 未实现完整 gameStatus/victory、手动开波、清怪后自动下一波、奖励/金币、随机刷怪、嵌套 spawns、trigger DSL、Editor 波次 UI、Server、保存/加载、AI Agent、Lua、ECS、MMO。
  - 文件尺寸：所有检查文件均低于 300 行。
  - 验证证据：`npm run typecheck`、`npm run test`、`npm run build` 均通过；Vite chunk size warning 为非阻塞体积提示。
