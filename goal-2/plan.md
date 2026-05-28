# Goal 2 Plan：按 docs/project-plan.md 继续实现 MVP 路线图

## 1. 需求分析

用户要求阅读 `docs/`，按 `docs/project-plan.md` 实现目标，并按照 `docs/agent-prompts.md` 中的 3 个 Agent 角色进行分工合作：

1. 架构/任务拆解 Agent
2. 全栈开发 Agent
3. 测试/代码审查 Agent

Goal 2 启动时，仓库已经完成 Goal 1：3D Tower Defense Runtime MVP 基座。根据 `docs/project-plan.md`，阶段 1 到阶段 3 当时已具备基础能力：

- 阶段 1：`game.json` schema
- 阶段 2：Three.js runtime
- 阶段 3：地图加载

因此 Goal 2 从阶段 4 开始推进，并继续完成到阶段 10：保存/加载地图。

## 2. 上下文梳理

已存在关键文件：

- `docs/project-plan.md`：第一阶段路线图，从 schema 到保存/加载地图。
- `docs/agent-prompts.md`：3 个 Agent 的职责、输入、输出格式和验收标准。
- `packages/schema/src/index.ts`：当前 `GameDefinition`、map/path/tower slot 类型与校验。
- `packages/runtime/src/index.ts`：当前 Three.js map runtime。
- `apps/editor/src/game.sample.json`：当前可视化预览用的纯 JSON 示例。
- `README.md`：当前 MVP 基座的启动和验证说明。

当前阶段约束：

- 仍处于第一阶段：3D Tower Defense Runtime。
- 不实现登录、商城、社交、大型编辑器、AI Agent、Lua、ECS、MMO。
- 每次只完成一个小功能。
- Schema-first：先数据，再 runtime 行为，最后接 UI。
- Runtime 和 Editor 必须解耦，Editor 不能拥有 gameplay 逻辑。

## 3. 风险评估

| 风险 | 影响 | 控制方式 |
| --- | --- | --- |
| 阶段 4 过度扩展成完整战斗系统 | 偏离小步推进 | 本轮只实现怪物沿路径移动，不做攻击/血量/波次 |
| movement 绑定渲染对象 | 破坏服务端模拟可能性 | 新增可序列化 simulation state，渲染只读取状态 |
| 使用真实时间导致非确定性 | 难测试、难同步 | 通过显式 `tick(deltaMs)` 推进 |
| JSON 结构过早复杂 | AI 难生成 | 只新增最小 `unitTypes` 或等价单位定义与路径引用 |
| 三 Agent 写入冲突 | 代码混乱 | 架构 Agent 只读拆解；全栈 Agent 写代码；审查 Agent 只读 review |

## 4. 执行方案

按 3 个 Agent 协作：

1. 架构/任务拆解 Agent：读取 docs 与当前代码，拆出阶段 4 的最小任务，不写代码。
2. 全栈开发 Agent：根据拆解实现一个最小功能，优先 schema/runtime，再接 editor。
3. 测试/代码审查 Agent：审查 diff、测试覆盖、架构边界和 MVP 边界。

Goal 2 覆盖目标：

- 阶段 4：怪物路径移动。
- 阶段 5：防御塔自动攻击。
- 阶段 6：血量系统。
- 阶段 7：波次系统。
- 阶段 8：游戏状态管理。
- 阶段 9：简单地图编辑器。
- 阶段 10：保存/加载地图。

每个阶段都按架构/任务拆解 Agent -> 全栈开发 Agent -> 测试/代码审查 Agent -> 修复验证闭环推进。

## 5. 验证方式

基础验证：

- `npm run typecheck`
- `npm run test`
- `npm run build`

阶段验证：

- schema 测试覆盖新增或变化的 JSON 字段。
- runtime 测试覆盖 deterministic tick、可序列化 state、移动、攻击、血量、波次和 game status。
- editor 测试覆盖 JSON helper、地图编辑派生规则、本地导入/导出边界。
- editor 接入后执行可行浏览器 smoke check。

## 6. 回滚方案

- 每个任务结束检查 `git diff`，避免越界改动。
- 若实现偏离阶段 4，回退当前任务改动。
- 禁止 `git reset --hard`。
- 删除文件或大范围重构前必须确认。

## 7. 当前执行状态

- 状态：已完成阶段 4-10 的实现、审查修复和最终验证。
- 已完成：怪物路径移动、防御塔自动攻击、血量系统、波次系统、游戏状态管理、简单地图编辑器、本地保存/加载地图。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 均已在阶段 10 收尾时通过；Vite chunk size warning 为非阻塞提示。
- 记录：逐阶段执行细节、Agent 分工、审查 findings、修复记录和 Debug 检查见 `goal-2/tasks.md`。
