# 开发流程规范

## 1. 核心节奏

每次只完成一个小功能。默认顺序：

1. 明确当前目标。
2. 明确 `game.json` 数据变化。
3. 明确 Runtime 行为变化。
4. 明确 Editor 或 Server 是否需要接入。
5. 实现最小代码。
6. 运行针对性验证。
7. 更新示例 JSON 和相关文档。
8. 给出下一步建议。

如果一个任务需要同时修改多个核心边界，例如 schema、runtime、server protocol 和 editor UI，应先拆分，不要一次完成。

## 2. Schema-first 流程

所有 gameplay 能力都从数据定义开始。

标准流程：

1. 在 `packages/schema` 中定义或修改类型。
2. 更新示例 `game.json`。
3. 在 `packages/runtime` 中消费该字段。
4. 添加最小验证或测试。
5. 只在 Runtime 行为可用后，再接入 Editor UI。
6. 如未来涉及联机，再接入 `apps/server`。

禁止流程：

- 先在 Editor UI 中写死玩法逻辑。
- 先在 Three.js object 上挂状态，再反推 JSON。
- 先做复杂工具界面，再补 Runtime。
- 通过脚本文本绕过 schema。

## 3. 每个功能的输入模板

开始任何功能前，先写清：

```md
当前目标：
JSON 数据变化：
Runtime 行为：
Editor 影响：
Server 影响：
验证方式：
不做事项：
```

示例：

```md
当前目标：支持怪物沿路径移动。
JSON 数据变化：`map.paths[]` 定义路径点，`waves[]` 引用单位类型和路径 ID。
Runtime 行为：固定 tick 推进怪物路径进度。
Editor 影响：本任务不做 Editor。
Server 影响：本任务不做 Server。
验证方式：运行 unit test，确认相同 tick 后怪物位置一致。
不做事项：不做攻击、不做波次 UI、不做联机。
```

## 4. Definition of Done

一个功能完成必须满足：

- 类型检查通过。
- 直接相关测试或验证通过。
- Demo 或示例 JSON 可运行。
- `game.json` 示例已同步。
- Runtime 与 Editor 仍然解耦。
- 新增 gameplay 状态可序列化。
- 文档中相关路线图或流程说明已更新。
- 输出中说明改动文件、验证命令和下一步建议。

不能验证时，必须明确说明原因，不能声称已完成。

## 5. 禁止事项

第一阶段禁止：

- 一次生成完整平台。
- 建设大型通用游戏引擎。
- 引入 Lua、JS 脚本、表达式执行或任意代码执行。
- 引入 ECS 框架。
- 实现 MMO、大世界、复杂权限、登录、商城、社交。
- 提前建设大型编辑器。
- 为未来 AI Agent 设计复杂自动化流程。
- 把 gameplay 逻辑写进 Editor。
- 让 Runtime 依赖 React、Zustand 或 UI 组件。

## 6. Agent 协作流程

推荐顺序：

```txt
架构/任务拆解 Agent
  -> 全栈开发 Agent
  -> 测试/代码审查 Agent
  -> 全栈开发 Agent 修复
  -> 测试/代码审查 Agent 复核
```

### 架构/任务拆解阶段

产出：

- 当前阶段目标。
- 最小任务拆分。
- 每个任务的边界和验收标准。
- 不做事项。

限制：

- 不写实现代码。
- 不扩大 MVP。
- 不设计大型引擎抽象。

### 全栈开发阶段

产出：

- 小范围代码改动。
- 示例 JSON 更新。
- 最小测试或验证。
- 改动说明和下一步建议。

限制：

- 一次只实现一个任务。
- 优先 schema/runtime，再接 UI。
- 不把逻辑写进 Editor。

### 测试/代码审查阶段

产出：

- 按严重程度排序的问题。
- 具体文件和行号。
- 可复现风险或缺失验证。
- 是否满足 MVP 和架构原则。

限制：

- 不做无关风格点评。
- 不要求超出当前阶段的大型重构。
- 不把偏好包装成 bug。

## 7. 分支与提交建议

默认分支命名：

```txt
codex/<short-feature-name>
```

提交信息格式：

```txt
<type>(scope): <中文动词开头摘要>
```

示例：

```txt
docs: 制定项目规划与 Agent 流程
feat(runtime): 支持基础地图渲染
test(schema): 补充 game.json 校验用例
```

## 8. 验证策略

按风险选择验证等级：

- Level 0：文档或小配置，进行内容一致性检查。
- Level 1：局部代码改动，运行类型检查或定向测试。
- Level 2：新增 gameplay 行为，补测试并验证 deterministic 结果。
- Level 3：影响共享 schema/runtime，进行代码审查。
- Level 4：准备合并或发布前，运行完整 build/test/lint。

当前项目早期允许验证轻量，但必须有证据。没有验证证据时，只能说“尚未验证”。
