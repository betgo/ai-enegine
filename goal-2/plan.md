# Goal 2 Plan：按 docs/project-plan.md 继续实现 MVP 路线图

## 1. 需求分析

用户要求阅读 `docs/`，按 `docs/project-plan.md` 实现目标，并按照 `docs/agent-prompts.md` 中的 3 个 Agent 角色进行分工合作：

1. 架构/任务拆解 Agent
2. 全栈开发 Agent
3. 测试/代码审查 Agent

当前仓库已经完成 Goal 1：3D Tower Defense Runtime MVP 基座。根据 `docs/project-plan.md`，阶段 1 到阶段 3 已具备基础能力：

- 阶段 1：`game.json` schema
- 阶段 2：Three.js runtime
- 阶段 3：地图加载

因此 Goal 2 的下一步应从阶段 4 开始：怪物路径移动。

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

本轮优先目标：

- 阶段 4：怪物路径移动。
- 最小能力：从 JSON 定义单位类型和一个初始怪物，runtime 创建可序列化 state，通过固定 tick 沿路径移动，并让 editor preview 能显示移动后的怪物位置。

是否接入动画由架构 Agent 拆解后决定；默认先做 deterministic tick 和测试，避免 UI 先行。

## 5. 验证方式

基础验证：

- `npm run typecheck`
- `npm run test`
- `npm run build`

阶段 4 额外验证：

- schema 测试覆盖新增 JSON 字段。
- runtime 测试覆盖相同初始状态和相同 tick 序列产生相同怪物位置。
- runtime 测试覆盖怪物沿路径推进，状态可序列化。
- 浏览器 smoke check 仅在 editor 接入后执行。

## 6. 回滚方案

- 每个任务结束检查 `git diff`，避免越界改动。
- 若实现偏离阶段 4，回退当前任务改动。
- 禁止 `git reset --hard`。
- 删除文件或大范围重构前必须确认。

## 7. 当前执行状态

- 状态：进行中。
- 当前任务：阶段 4 最小切片实现中。
- 已完成：Goal 2 核心文件创建；架构/任务拆解 Agent 已将阶段 4 收敛为“初始怪物沿已有路径 deterministic tick 移动”。
- 下一任务：全栈开发 Agent 实现 schema/runtime/sample/test 后，运行验证并派发测试/代码审查 Agent。
