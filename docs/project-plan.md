# Web 3D UGC 游戏平台项目计划

## 1. 项目愿景

目标是逐步构建一个浏览器运行的 Web 3D UGC 游戏平台。长期方向参考 Warcraft 3 World Editor、Roblox、Fortnite Creative 和 RPG Maker，但第一阶段只验证最小闭环：数据驱动的 3D Tower Defense Runtime。

平台长期能力可以包括 Three.js 3D 运行时、可视化编辑器、用户发布地图、多人联机和 AI 生成玩法配置。但这些能力必须通过连续的小功能演进获得，不能在项目初期一次性建设完整平台或大型游戏引擎。

## 2. 当前 MVP 边界

第一阶段只做：3D Tower Defense Runtime。

MVP 必须证明：

- `game.json` 可以描述一张 Tower Defense 地图。
- Runtime 可以读取 `game.json` 并生成 Three.js 场景。
- Runtime 与 Editor 解耦，Editor 只修改 JSON 并调用 Runtime 预览。
- 玩法逻辑由 JSON 数据驱动，不依赖任意脚本。
- 后续逻辑可以序列化，并适合多人同步。

第一阶段不做：

- 登录、账号、权限、用户资料。
- 商城、付费、资产市场。
- 社交、好友、公会、聊天。
- 大型编辑器、复杂工具链、插件系统。
- AI Agent 生成流程。
- Lua、JS 脚本注入、任意代码执行。
- ECS 框架、大型通用游戏引擎。
- MMO、大世界、跨地图持久状态。

## 3. 第一阶段路线图

### 阶段 1：`game.json` schema

目标：定义 Tower Defense MVP 的最小数据结构。

验收标准：

- 存在可导入的 TypeScript 类型。
- 顶层结构至少包含 `map`、`units`、`waves`、`triggers`。
- JSON 保持纯数据，不包含函数、表达式或脚本文本。
- 示例 JSON 可以通过最小校验。

### 阶段 2：Three.js runtime

目标：创建独立 runtime 包，能纯代码挂载到容器并渲染场景。

验收标准：

- Runtime 不依赖 React、Zustand 或 Editor UI。
- Runtime 可以接收 `game.json` 数据创建 Three.js scene。
- Runtime 提供清晰的初始化和销毁接口。
- Runtime 可以未来迁移到服务端逻辑包，不绑定浏览器 UI 状态。

### 阶段 3：地图加载

目标：从 `game.json.map` 加载基础地形、网格、路径和塔位。

验收标准：

- 修改 JSON 后，地图渲染随数据变化。
- 地图数据可序列化、可校验。
- 地图加载失败时能返回明确错误，不静默失败。

### 阶段 4：怪物路径移动

目标：怪物按 JSON 描述的路径移动。

验收标准：

- 路径由 JSON 中的点或节点定义。
- 移动逻辑使用固定步进或明确时间输入，避免不可控随机。
- 怪物状态可序列化，包含位置、路径进度、生命等必要字段。

### 阶段 5：防御塔自动攻击

目标：塔根据 JSON 配置自动选择范围内目标并攻击。

验收标准：

- 塔属性来自 JSON，例如射程、攻击间隔、伤害。
- 目标选择规则明确且 deterministic。
- 攻击结果只改变可序列化游戏状态。

### 阶段 6：血量系统

目标：为怪物、基地或玩家生命建立最小血量逻辑。

验收标准：

- 伤害、死亡、漏怪扣血都通过状态变更表达。
- 死亡和胜负条件不依赖渲染层判断。
- 血量变化可被 UI 或网络同步消费。

### 阶段 7：波次系统

目标：按照 JSON 描述生成多波敌人。

验收标准：

- 波次包含开始时间、怪物类型、数量、间隔等数据。
- Runtime 可根据时间推进波次。
- 波次进度可序列化，支持暂停、恢复和同步。

### 阶段 8：游戏状态管理

目标：形成最小 deterministic simulation state。

验收标准：

- Runtime 区分 definition 和 state。
- 状态推进由显式 `tick` 或等价入口触发。
- 渲染只读取状态，不拥有核心玩法逻辑。

### 阶段 9：简单地图编辑器

目标：提供最小可视化方式修改地图 JSON。

验收标准：

- Editor 只修改 JSON，不实现玩法逻辑。
- Editor 可以调用 Runtime 预览当前 JSON。
- 至少支持地图尺寸、路径点、塔位的基础编辑。

### 阶段 10：保存/加载地图

目标：支持本地保存和加载 `game.json`。

验收标准：

- 可以导入、导出 JSON 文件。
- 保存内容可被 schema 校验和 runtime 加载。
- 不引入账号、云存储或发布系统。

## 4. 风险清单

- 过早抽象：在只有一个玩法时抽象通用引擎，会拖慢 MVP 并制造错误边界。
- Runtime 与 Editor 耦合：一旦玩法逻辑进入 UI，后续多人同步和服务端模拟会变困难。
- 非确定性逻辑：未控制随机数、时间输入或遍历顺序，会影响回放、同步和测试。
- JSON 膨胀：过早支持复杂 trigger/action 会让 AI 难以稳定生成有效内容。
- 多人同步复杂度：必须先保证状态可序列化和逻辑 deterministic，再接入 Colyseus。
- 视觉优先陷阱：漂亮编辑器不能替代可验证 runtime 行为。

## 5. 推进原则

- 每次只完成一个小功能。
- 每个功能都先定义数据，再实现 runtime 行为，最后接 UI。
- 所有 gameplay 必须来自 `game.json` 或 simulation state。
- Runtime 不能依赖 Editor。
- AI 最终产物是 JSON，不是代码。
- 新增能力必须说明如何校验、如何序列化、如何同步。
