# Goal 3 Tasks：Playable Runtime MVP

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

### 任务 1：创建 Goal 3 核心文件

- 状态：complete
- 目标：创建 `goal-3/input.md`、`goal-3/plan.md`、`goal-3/tasks.md`。
- 验证：三份文件存在，覆盖原始输入、上下文、风险、执行方案和任务拆分。
- 执行记录：
  - 已创建 `goal-3/input.md`，保存用户原始 goal context。
  - 已创建 `goal-3/plan.md`，记录基于 docs 的阶段 11-16 需求、风险、执行方案、验证方式和回滚方案。
  - 已创建 `goal-3/tasks.md`，拆分 Playable Runtime MVP 的执行任务。
  - 已运行 `find goal-3 -maxdepth 1 -type f -print | sort`，确认三份核心文件存在。
  - 自检：对任务 1 当前实现有 100% 信心；Goal Mode 前置文件齐全。

### 任务 2：架构/任务拆解 Agent 拆解阶段 11-12

- 状态：complete
- 目标：锁定 `apps/player` shell 和 Runtime 动态怪物渲染的最小实现边界。
- 验证：输出当前目标、范围边界、风险、验收标准和推荐下一步。
- 执行记录：
  - 已只读检查 `docs/project-plan.md`、`packages/runtime/src/index.ts`、runtime 测试和 test helpers。
  - 当前最小目标先收敛到阶段 12：Runtime 根据 simulation state 渲染 active monster mesh，并在 `render()` 前同步位置。
  - 本次做：新增 runtime 内部 render adapter；active monster 使用稳定名称 `monster:<id>`；位置来自 `RuntimeMonsterState.position`；dead/escaped monster 从 scene 中移除或不再保留 active mesh；补 runtime 测试证明 `tick()` 后 `render()` 更新 mesh。
  - 本次不做：Player UI、Play/Pause/Step/Reset、HUD、导入 JSON、Runtime 新公共 API、reset API、多人联机、账号、发布、云存储、AI Agent、Lua、ECS、大型编辑器。
  - 风险约束：不能把 monster movement/attack/status 逻辑写进 render adapter；render adapter 只能读取 `simulation.getState()`；不能让 Player 未来直接创建 monster gameplay mesh。
  - 推荐下一步：由全栈开发 Agent 在 `packages/runtime` 实现动态怪物渲染最小切片，并运行 runtime 定向测试。
  - 自检：对任务 2 当前拆解有 100% 信心；范围足够小且直接支撑后续 Player。

### 任务 3：全栈开发 Agent 实现 Runtime 动态怪物渲染

- 状态：complete
- 目标：让 Runtime 在 `tick/render` 后把 active monster state 映射为 Three.js 动态对象。
- 验证：runtime 定向测试通过，现有 editor runtime 预览不回归。
- 执行记录：
  - 已按 TDD 新增 `packages/runtime/src/dynamic-entities.test.ts`，覆盖 active monster 初次渲染、`tick()` 后 `render()` 同步位置、dead monster 移除渲染对象。
  - 已确认新增测试先失败：scene 中没有 `monster:wave-1:0` 动态对象。
  - 已新增 `packages/runtime/src/dynamic-entities.ts`，封装 Runtime 内部 dynamic entity render adapter。
  - 已在 `packages/runtime/src/index.ts` 中于 `render()` 前调用 `dynamicEntities.sync(simulation.getState())`，并在 `dispose()` 中释放动态实体资源。
  - active monster 使用稳定名称 `monster:<id>`，position 来自 simulation state；非 active monster 的 mesh 会从 scene 移除。
  - 已运行 `npm run test -w packages/runtime -- dynamic-entities`，先失败后修复通过：3 tests。
  - 已运行 `npm run test -w packages/runtime`，通过：runtime 42 tests。
  - 自检：对任务 3 当前实现有 100% 信心；Player 后续不需要创建 monster gameplay mesh。

### 任务 4：测试/代码审查 Agent 审查 Runtime 动态渲染

- 状态：complete
- 目标：审查 Runtime 动态渲染是否保持 simulation/render adapter 边界，且 Player 不需要复制 gameplay。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - 已审查本阶段 diff：`dynamic-entities.ts` 只读取 `RuntimeSimulationState`，不计算 movement、attack、damage、wave 或 victory/defeat。
  - Findings：未发现阻塞性问题。
  - Test Gaps：当前测试覆盖 active 渲染、位置同步、dead 移除；escaped 移除由同一 `status !== "active"` 分支覆盖但未单独断言，暂不阻塞本切片。
  - Architecture Check：Runtime/Editor 解耦通过；Player/Runtime 解耦方向通过；JSON 未变化；deterministic simulation 未变化；MVP 边界未越界。
  - Recommendation：可以进入验证与提交。

### 任务 5：修复 Runtime 动态渲染审查问题并提交

- 状态：complete
- 目标：修复审查 findings，运行验证并提交阶段 12。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 通过。
- 执行记录：
  - 审查未发现阻塞性 findings，无需额外修复。
  - 已运行文件长度检查：`wc -l packages/runtime/src/*.ts`，所有 runtime source/test 文件均低于 300 行。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 42 tests，editor 14 tests。
  - 已运行 `npm run build`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 自检：对阶段 12 当前实现有 100% 信心；动态实体渲染在 Runtime 内部，未扩张公共 API。

### 任务 6：架构/任务拆解 Agent 拆解阶段 11、13、14

- 状态：complete
- 目标：拆解 `apps/player` shell、Play/Pause/Step/Reset 和 HUD 的最小任务。
- 验证：输出当前目标、范围边界、风险、验收标准和推荐下一步。
- 执行记录：
  - 已只读检查 `apps/editor` 的 Vite/React 配置、根脚本和 Runtime API。
  - 阶段 11/13/14 被收敛为单个 Player shell 切片：新增 `apps/player`，加载 sample `GameDefinition`，挂载 Runtime，提供 Play/Pause/Step/Reset 和 HUD。
  - 本次做：Player 使用 `SIM_STEP_MS = 100` 固定步进；Play 使用 RAF 累积时间；Step 推进一次固定步进；Reset 通过 runtime dispose/recreate；HUD 展示 `runtime.getState()` 的 status/base/waves/monsters。
  - 本次不做：Player 自己计算 movement/attack/waves/status，Runtime 新 reset API，多人联机，账号，发布，云存储，AI Agent，Lua，ECS，大型编辑器。
  - 风险约束：Player 只能调用 `tick()`、`render()`、`getState()`；根级 typecheck/test/build 必须覆盖 Player。
  - 推荐下一步：由全栈开发 Agent 新增 `apps/player` 并补 helper 测试、完整验证和浏览器 smoke。
  - 自检：对任务 6 当前拆解有 100% 信心；范围符合阶段 11/13/14。

### 任务 7：全栈开发 Agent 实现 Player shell、controls 和 HUD

- 状态：complete
- 目标：新增 `apps/player`，加载 sample game，驱动 Runtime，并展示 HUD。
- 验证：player 定向测试、typecheck/test/build、浏览器 smoke。
- 执行记录：
  - 已新增 `apps/player` workspace，包含 Vite/React/TypeScript 配置、`index.html`、`src/main.tsx`、`src/App.tsx`、`src/styles.css`。
  - 已新增 Player sample `GameDefinition`，与当前 Editor sample 语义一致，用于初始运行。
  - 已新增 `apps/player/src/player-state.ts`，封装 `SIM_STEP_MS = 100`、固定步进累积 helper 和 JSON 导入解析 helper。
  - 已新增 `apps/player/src/player-state.test.ts`，覆盖固定步进累积、有效 JSON、无效 JSON、schema-invalid JSON 和 unknown fields。
  - 已更新根 `package.json`，让 `npm run typecheck`、`npm run test`、`npm run build` 覆盖 `apps/player`。
  - 已运行 `npm install` 同步 `package-lock.json` 的 player workspace。
  - 已实现 Player UI：挂载 Runtime scene，Play/Pause/Step/Reset，Import JSON，HUD 显示 mode、elapsed、base hp、active monster count、wave progress。
  - Player 只调用 Runtime `tick()`、`render()`、`getState()`；没有复制 movement、attack、damage、wave 或 status 逻辑。
  - 已运行 `npm run test -w apps/player`，通过：5 tests。
  - 已运行 `npm run typecheck -w apps/player`，通过。
  - 已运行 `npm run build -w apps/player`，通过；Vite 输出 chunk size warning，不影响构建结果。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 42 tests，editor 14 tests，player 5 tests。
  - 已运行 `npm run build`，通过；Editor 和 Player 均有 Three.js chunk size warning，不影响构建结果。
  - 已启动 `npm run dev -w apps/player` 并完成浏览器 smoke：页面打开、HUD/Controls 可见、Step 推进到 100ms、Play 推进 elapsed、Pause 停止、Reset 回到 0ms、console 无 error。
  - 自检：对任务 7 当前实现有 100% 信心；Player 是 Runtime driver，不是第二套 runtime。

### 任务 8：测试/代码审查 Agent 审查 Player 运行入口

- 状态：complete
- 目标：审查 Player 是否只驱动 Runtime，不复制 gameplay，不越界到联机/发布/账号。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - 已审查 Player diff：`App.tsx` 只管理 runtime 生命周期、控制循环、文件导入和 HUD；`player-state.ts` 只处理固定步进累积和 schema 校验。
  - Findings：未发现阻塞性问题。
  - Test Gaps：当前没有 jsdom 组件测试；本阶段用 helper 单测、typecheck/build 和浏览器 smoke 覆盖关键行为，避免引入额外测试依赖。
  - Architecture Check：Runtime/Editor 解耦通过；Player/Runtime 解耦通过；JSON 仍纯 definition；固定步进使用 `SIM_STEP_MS = 100`；未引入联机/发布/账号等非 MVP 能力。
  - Recommendation：可以进入提交。

### 任务 9：修复 Player 运行入口审查问题并提交

- 状态：complete
- 目标：修复审查 findings，运行验证并提交阶段 11/13/14。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 和浏览器 smoke 通过。
- 执行记录：
  - 审查未发现阻塞性 findings，无需额外修复。
  - 已补强 Player 导入边界：导入 JSON 拒绝 `runtimeState` 等 schema 外顶层字段。
  - 已运行文件长度检查：`wc -l apps/player/src/*.tsx apps/player/src/*.ts apps/player/src/*.css apps/player/*.ts apps/player/*.json package.json`，所有检查文件均低于 300 行。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 42 tests，editor 14 tests，player 5 tests。
  - 已运行 `npm run build`，通过；Vite chunk size warning 不影响构建结果。
  - 已完成浏览器 smoke：Player 页面、Play/Pause/Step/Reset、HUD 与 console 均符合预期。
  - 自检：对阶段 11/13/14/15 当前实现有 100% 信心；Player 导入也已完成，阶段 15 已提前覆盖。

### 任务 10：架构/任务拆解 Agent 拆解阶段 15-16

- 状态：complete
- 目标：拆解 Player 导入本地 `game.json` 和最终文档同步。
- 验证：输出当前目标、范围边界、风险、验收标准和推荐下一步。
- 执行记录：
  - 阶段 15-16 被收敛为 Player 导入 JSON、README/docs 状态同步和最终 smoke 验证。
  - Player 导入边界：读取本地 JSON 文本，先 `JSON.parse`，再拒绝 unknown top-level fields，最后 `validateGameDefinition`；失败时只显示错误，不替换当前 game。
  - 文档同步边界：README 记录 Editor 与 Player 两个启动入口；`docs/project-plan.md` 标记阶段 11-16 完成；`docs/agent-prompts.md` 同步到第二阶段已完成的上下文。
  - 本次不做：localStorage、云存储、发布、账号、最近文件、自动保存、多人联机、AI Agent、Lua、ECS、大型编辑器。
  - 推荐下一步：由全栈开发 Agent 补齐 Player 导入 helper、文档和完整验证。
  - 自检：对任务 10 当前拆解有 100% 信心；阶段 15-16 范围明确。

### 任务 11：全栈开发 Agent 实现 Player 导入 JSON 和文档同步

- 状态：complete
- 目标：Player 支持导入 schema-valid `game.json`，失败不替换当前 game，并同步 README/docs。
- 验证：player 定向测试、typecheck/test/build、浏览器 smoke。
- 执行记录：
  - 已在 `apps/player/src/player-state.ts` 实现 `parsePlayerGameJson`，支持有效 JSON、语法错误、schema 错误和 unknown top-level fields。
  - 已在 `apps/player/src/App.tsx` 接入 Import JSON 按钮和隐藏 file input；导入成功替换 `game` 并重建 runtime，导入失败只展示错误。
  - 已同步 `README.md`，记录 `apps/player` 启动方式、预期结果、HUD 和导入边界。
  - 已同步 `docs/project-plan.md`，将阶段 11-16 标记为已完成，并记录 Player MVP 已完成能力。
  - 已同步 `docs/agent-prompts.md`，将 Agent 上下文更新为第一阶段和第二阶段均已完成到本地 MVP 闭环。
  - 已运行 `npm run test -w apps/player`，通过：5 tests。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 42 tests，editor 14 tests，player 5 tests。
  - 已运行 `npm run build`，通过；Vite chunk size warning 不影响构建结果。
  - 已完成浏览器 smoke：Player 页面打开，controls 和 HUD 可见，Step/Play/Pause/Reset 行为符合预期，console 无 error。
  - 已检查并停止本轮 smoke test 启动的 `apps/player` dev server。
  - 自检：对任务 11 当前实现有 100% 信心；导入只处理 `GameDefinition`，不保存 runtime state。

### 任务 12：测试/代码审查 Agent 最终审查 Playable Runtime MVP

- 状态：complete
- 目标：审查阶段 11-16 是否满足 docs plan，确认无范围膨胀。
- 验证：输出 findings、test gaps、architecture check、recommendation。
- 执行记录：
  - Findings：未发现阻塞性问题。
  - Test Gaps：未新增 jsdom 组件测试；当前阶段以 helper 单测、runtime 单测、typecheck/build 和浏览器 smoke 覆盖关键行为，符合轻量 MVP 边界。
  - Architecture Check：Runtime 动态实体渲染在 `packages/runtime`；Player 只调用 `tick/render/getState`；Editor/Player 分离；JSON 仍纯 definition；固定步进使用 `SIM_STEP_MS = 100`；未引入联机、发布、账号、云存储、AI Agent、Lua、ECS 或大型编辑器。
  - Recommendation：可以进入最终提交和完成审计。

### 任务 13：最终修复、验证、提交和完成审计

- 状态：complete
- 目标：修复最终审查 findings，运行完整验证，提交并审计 goal 是否完成。
- 验证：工作区干净，`npm run typecheck/test/build` 通过，浏览器 smoke 通过，docs 与 README 已同步。
- 执行记录：
  - 最终审查未发现阻塞性 findings，无需额外修复。
  - 已运行 `git diff --check`，通过。
  - 已运行 `npm run typecheck`，通过。
  - 已运行 `npm run test`，通过：schema 22 tests，runtime 42 tests，editor 14 tests，player 5 tests。
  - 已运行 `npm run build`，通过；Editor 和 Player 的 Three.js chunk size warning 不影响构建结果。
  - 已完成浏览器 smoke：Player 页面、Play/Pause/Step/Reset、HUD 和 console 均符合预期。
  - 已提交 Runtime 动态怪物渲染：`e292e51 feat(runtime): 渲染动态怪物状态`。
  - 已提交 Player 运行入口：`960ddad feat(player): 新增可运行游戏入口`。
  - 自检：对 Goal 3 当前实现有 100% 信心；`docs/project-plan.md` 阶段 11-16 已完成并有验证证据。
