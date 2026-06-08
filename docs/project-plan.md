# Web 3D UGC 游戏平台项目计划

## 1. 项目愿景

目标是逐步构建一个浏览器运行的 Web 3D UGC 游戏平台。长期方向参考 Warcraft 3 World Editor、Roblox、Fortnite Creative 和 RPG Maker，但项目必须通过小阶段验证能力，而不是一开始建设完整平台。

平台长期能力可以包括 Three.js 3D 运行时、可视化编辑器、用户发布地图、多人联机和 AI 生成玩法配置。但这些能力必须通过连续的小功能演进获得，不能在项目初期一次性建设完整平台或大型游戏引擎。

当前状态：

- 第一阶段 `3D Tower Defense Runtime` 已完成到本地 MVP 闭环。
- 第二阶段 `Playable Runtime MVP` 已完成最小运行入口，用户可以通过 `apps/player` 在浏览器里运行游戏。
- 第三阶段 `Editor Gameplay Configuration MVP` 已完成最小创作闭环，用户可以在 `apps/editor` 配置地图与玩法并导出可运行 JSON。
- 第四阶段 `Editor Interactive Map Editing MVP` 已完成首版 3D 预览交互编辑，用户可以直接在预览中选择、添加和拖拽路径点/塔位。
- 第五阶段 `Editor Playtest Preview MVP` 已完成 Editor 内试玩闭环，用户可以在编辑器中用当前 valid draft 快照运行游戏。

## 2. 第一阶段完成状态

第一阶段只做：3D Tower Defense Runtime。

已完成能力：

- `game.json` 可以描述一张 Tower Defense 地图。
- Runtime 可以读取 `game.json` 并生成 Three.js 场景。
- Runtime 可以通过显式 `tick(deltaMs)` 推进 deterministic simulation。
- Runtime 已覆盖怪物路径移动、防御塔攻击、血量、漏怪、波次和最小游戏状态。
- Runtime 与 Editor 解耦，Editor 只修改 JSON 并调用 Runtime 预览。
- Editor 支持地图尺寸、路径点和塔位的基础编辑。
- Editor 支持本地导入和导出 canonical `game.json`。
- 玩法逻辑由 JSON 数据驱动，不依赖任意脚本。
- 运行状态可序列化，并适合未来多人同步。

已完成阶段：

1. `game.json` schema
2. Three.js runtime
3. 地图加载
4. 怪物路径移动
5. 防御塔自动攻击
6. 血量系统
7. 波次系统
8. 游戏状态管理
9. 简单地图编辑器
10. 保存/加载地图

## 3. 仍然不做的范围

- 登录、账号、权限、用户资料。
- 商城、付费、资产市场。
- 社交、好友、公会、聊天。
- 大型编辑器、复杂工具链、插件系统。
- AI Agent 生成流程。
- Lua、JS 脚本注入、任意代码执行。
- ECS 框架、大型通用游戏引擎。
- MMO、大世界、跨地图持久状态。

## 4. 第二阶段完成状态：Playable Runtime MVP

目标：新增 `apps/player`，把现有 runtime simulation 变成浏览器里可运行、可观察、可重置的最小游戏入口。

已完成能力：

- `apps/player` 可以通过 Vite 启动。
- Player 加载 sample `GameDefinition` 并挂载 Runtime。
- Runtime 根据 simulation state 渲染 active monster，并在 `render()` 前同步位置。
- Player 支持 Play / Pause / Step / Reset。
- Player HUD 展示 `status`、elapsed、`base.hp`、wave progress 和 active monster count。
- Player 支持导入本地 `game.json`，无效导入不替换当前 game。
- 根级 `typecheck`、`test`、`build` 已覆盖 `apps/player`。

第二阶段原则：

- 不修改 `game.json` schema，除非当前 runtime 无法表达必要行为。
- Player 只运行 `GameDefinition`，不修改 gameplay 逻辑。
- Player 不拥有 simulation state 真相，只调用 Runtime API 并展示 `getState()`。
- 动态实体渲染放在 `packages/runtime` 内部完成，Player 不直接创建怪物或攻击相关 Three.js 对象。
- Runtime 公共 API 暂不扩张；继续使用 `tick(deltaMs)`、`getState()`、`render()`。
- Reset 先由 Player dispose/recreate runtime 实现，不新增 `reset()` API。
- Player loop 使用固定步进默认值 `SIM_STEP_MS = 100`；RAF 只负责累积时间和触发固定 tick。

### 阶段 11：新增 `apps/player`

状态：已完成。

目标：创建独立 Player app，加载当前示例 `GameDefinition` 并挂载 Runtime。

验收标准：

- `apps/player` 可通过 Vite 启动。
- Player 依赖 `packages/runtime` 和 `packages/schema`，不依赖 `apps/editor`。
- 页面可以加载 sample game 并渲染基础地图。
- 不新增或修改 `game.json` schema。

### 阶段 12：Runtime 渲染动态怪物状态

状态：已完成。

目标：Runtime 根据 simulation state 渲染怪物位置和生命周期状态。

验收标准：

- `tick(deltaMs)` 后怪物位置变化可以反映到 Three.js 场景。
- dead/escaped monster 不再表现为 active 怪物。
- 动态渲染逻辑在 `packages/runtime`，不在 Player React 组件中复制 gameplay。
- runtime 测试覆盖 state 到渲染对象的关键映射或可观测摘要。

### 阶段 13：Player 控制 Play / Pause / Step / Reset

状态：已完成。

目标：Player 提供最小运行控制。

验收标准：

- Play 按固定步进推进 runtime。
- Pause 停止推进但保留当前状态。
- Step 推进一次 `SIM_STEP_MS`。
- Reset 通过销毁并重建 runtime 恢复初始状态。
- 控制逻辑不改变 Runtime gameplay 规则。

### 阶段 14：Player HUD

状态：已完成。

目标：展示当前游戏状态，让用户能理解运行结果。

验收标准：

- 显示 `status`、`base.hp`、wave progress 和 monster count。
- HUD 数据来自 `runtime.getState()`。
- HUD 不推导胜负、伤害或波次逻辑。

### 阶段 15：Player 导入本地 `game.json`

状态：已完成。

目标：Player 可以运行用户从 Editor 导出的地图。

验收标准：

- 支持本地导入 JSON 文件。
- 导入流程复用 schema 校验。
- 无效导入不替换当前正在运行的 game。
- 不引入账号、云存储、发布系统或 localStorage。

### 阶段 16：Player smoke test 与文档同步

状态：已完成。

目标：验证 Player 最小闭环并更新运行说明。

验收标准：

- `npm run typecheck`、`npm run test`、`npm run build` 通过。
- 浏览器 smoke：打开 Player，Play/Pause/Step/Reset 可用，HUD 与 Runtime state 一致。
- README 和 docs 同步记录 Player 的启动方式与边界。

## 5. 第三阶段完成状态：Editor Gameplay Configuration MVP

目标：让 Editor 不只编辑地图，也能配置一张 Tower Defense 关卡的核心玩法数据，并导出可直接在 Player 运行的 `game.json`。

已完成能力：

- Editor 可以编辑 `base.maxHp`。
- Editor 可以编辑现有 monster 的 `speed`、`maxHp` 和 `leakDamage`。
- Editor 可以新增 monster，默认使用稳定生成 ID。
- Editor 可以新增、删除和编辑 tower，包含 `slotId`、`range`、`attackIntervalMs` 和 `damage`。
- Editor 新增 tower 时使用第一个未占用 tower slot；没有空闲 slot 时禁用新增。
- Editor 的 tower slot 下拉只允许当前 slot 或未被其它 tower 占用的 slot。
- Editor 可以新增、删除和编辑 wave，包含 `startTimeMs`、`unitId`、`pathId`、`count` 和 `intervalMs`。
- Editor 新增 wave 时复用现有 monster/path，并使用 deterministic 默认值。
- Editor 仍只修改 `GameDefinition` JSON，不保存 runtime state。
- Runtime 和 Player gameplay 未改动。

第三阶段原则：

- 不修改 `game.json` schema。
- 不做 monster 删除，避免处理 wave 引用删除。
- 不做可视化选点、拖拽、路径新增/删除、复杂平衡工具或关卡发布。
- 不做 server、多人、账号、发布、AI Agent、Lua、ECS 或大型编辑器。
- Editor 可以短暂产生 invalid draft；只有 valid JSON 会进入 preview/export。

### 阶段 17：Editor gameplay state helpers

状态：已完成。

目标：为 base、monster、tower 和 wave 配置补充纯函数状态修改 helper。

验收标准：

- helper 不 mutate 输入的 `GameDefinition`。
- 新 ID 使用稳定规则并跳过已有 ID。
- tower slot 占用规则保持 schema valid。
- wave 默认值 deterministic，且引用现有 unit/path。
- editor 单测覆盖核心 helper 行为。

### 阶段 18：Editor gameplay configuration UI

状态：已完成。

目标：在 Editor 中提供最小玩法配置区。

验收标准：

- UI 可以修改 base、monster、tower 和 wave 字段。
- tower 和 wave 引用通过下拉选择已有 ID。
- App 主组件保持组合职责，地图配置和玩法配置拆入独立面板。
- Editor 不实现 runtime gameplay 逻辑。

### 阶段 19：Editor-to-Player smoke

状态：已完成。

目标：验证 Editor 导出的 JSON 可以被 Player 导入并运行。

验收标准：

- `npm run typecheck`、`npm run test`、`npm run build` 通过。
- 浏览器 smoke：Editor 修改 base/tower/wave 后 JSON valid，导出 JSON，Player 导入后 Play/Pause/Step/Reset 可用，HUD 正常。

## 6. 第四阶段完成状态：Editor Interactive Map Editing MVP

目标：让 Editor 左侧 3D 预览成为可交互地图编辑入口，首版覆盖路径点和塔位。

已完成能力：

- Editor 提供 Select、Add Path Point 和 Add Tower Slot 三个工具模式。
- 3D 预览可以显示可点击路径点 marker。
- 用户可以点击选择路径点或塔位。
- 用户可以拖拽选中的路径点或塔位，落点吸附到整数网格并 clamp 到地图范围内。
- Add Path Point 在第一个 path 末尾追加路径点。
- Add Tower Slot 在点击网格处新增塔位。
- 右侧表单、JSON 和 runtime preview 与交互编辑同步。
- Runtime gameplay 和 `game.json` schema 未改动。

第四阶段原则：

- 交互编辑只修改 `GameDefinition` JSON。
- 首版只编辑第一个 `map.paths[0]`，不做多路径管理。
- 不做障碍格、路径新增/删除、路径重命名、camera 控制、Player/Server 接入或 Runtime 公共 API 扩张。

### 阶段 20：交互地图 helper

状态：已完成。

目标：抽出 pointer 坐标、网格 clamp 和 selected object 应用 helper。

验收标准：

- pointer client 坐标可转为 normalized device coordinates。
- raycast 得到的地图点可四舍五入并 clamp 到地图范围。
- selected path point 和 tower slot 可复用已有 editor state helper 更新。
- 单测覆盖核心转换和不可变更新。

### 阶段 21：3D 预览工具与拖拽

状态：已完成。

目标：在 Editor 预览中接入 Select、Add Path Point 和 Add Tower Slot。

验收标准：

- 可以点击 3D marker 选择路径点或塔位。
- 可以拖拽选中对象到目标网格。
- 可以点击网格添加主路径点或塔位。
- Inspector 显示当前工具和选中对象。

### 阶段 22：交互编辑 smoke 与文档同步

状态：已完成。

目标：验证交互编辑闭环并更新说明。

验收标准：

- `npm run typecheck`、`npm run test`、`npm run build` 通过。
- 浏览器 smoke：Editor 中新增/拖拽路径点和塔位后 JSON valid，Export JSON 可用。
- README、项目计划和开发流程同步记录交互编辑能力与边界。

## 7. 第五阶段完成状态：Editor Playtest Preview MVP

目标：让 Editor 内部可以直接试玩当前地图，减少导出到 Player 再验证的循环。

已完成能力：

- Editor 提供 Edit / Playtest 模式切换。
- Playtest 使用进入时的 valid draft frozen snapshot。
- Playtest 提供 Play / Pause / Step / Reset / Back to Edit。
- Playtest HUD 展示 mode、status、elapsed、base hp、active monster count 和 wave progress。
- Reset 销毁并重建 runtime，回到 frozen snapshot 初始状态。
- 试玩期间表单仍可编辑 draft，但不会影响当前 run。
- Playtest 不保存 runtime state 到 `game.json`。
- Runtime gameplay、Runtime 公共 API 和 `game.json` schema 未改动。

第五阶段原则：

- Editor Playtest 只驱动 Runtime API：`tick(deltaMs)`、`render()`、`getState()`、`dispose()`。
- 不依赖 `apps/player` 代码，不把 Player React 组件搬进 Editor。
- 不做分屏同时编辑与试玩、不做一键发布、不做 server/multiplayer。

### 阶段 23：Editor playtest state helper

状态：已完成。

目标：补充 Editor 本地 fixed-step 和 playtest snapshot helper。

验收标准：

- 固定步进默认 `SIM_STEP_MS = 100`。
- helper 可消费累计时间并返回 steps 与 remainingMs。
- snapshot 使用 deep clone，试玩状态不污染 draft。

### 阶段 24：Editor Playtest runtime preview

状态：已完成。

目标：新增 Editor 内 Playtest runtime 视图。

验收标准：

- Playtest 挂载 Runtime 并读取 frozen snapshot。
- Play/Pause/Step/Reset 行为与 Player 心智一致。
- HUD 数据来自 `runtime.getState()`。
- Playtest 不允许 3D 编辑，不写入 `GameDefinition`。

### 阶段 25：Editor Playtest smoke 与文档同步

状态：已完成。

目标：验证 Editor 内试玩闭环并更新说明。

验收标准：

- `npm run typecheck`、`npm run test`、`npm run build` 通过。
- 浏览器 smoke：Editor 进入 Playtest 后 Step/Play/Pause/Reset/HUD 正常，返回 Edit 后 JSON 未混入 runtime state。
- README、项目计划和开发流程同步记录 Playtest 能力与边界。

## 8. 第一阶段历史路线图

### 阶段 1：`game.json` schema

状态：已完成。

目标：定义 Tower Defense MVP 的最小数据结构。

验收标准：

- 存在可导入的 TypeScript 类型。
- 顶层结构至少包含 `map`、`units`、`waves`、`triggers`。
- JSON 保持纯数据，不包含函数、表达式或脚本文本。
- 示例 JSON 可以通过最小校验。

### 阶段 2：Three.js runtime

状态：已完成。

目标：创建独立 runtime 包，能纯代码挂载到容器并渲染场景。

验收标准：

- Runtime 不依赖 React、Zustand 或 Editor UI。
- Runtime 可以接收 `game.json` 数据创建 Three.js scene。
- Runtime 提供清晰的初始化和销毁接口。
- Runtime 可以未来迁移到服务端逻辑包，不绑定浏览器 UI 状态。

### 阶段 3：地图加载

状态：已完成。

目标：从 `game.json.map` 加载基础地形、网格、路径和塔位。

验收标准：

- 修改 JSON 后，地图渲染随数据变化。
- 地图数据可序列化、可校验。
- 地图加载失败时能返回明确错误，不静默失败。

### 阶段 4：怪物路径移动

状态：已完成。

目标：怪物按 JSON 描述的路径移动。

验收标准：

- 路径由 JSON 中的点或节点定义。
- 移动逻辑使用固定步进或明确时间输入，避免不可控随机。
- 怪物状态可序列化，包含位置、路径进度、生命等必要字段。

### 阶段 5：防御塔自动攻击

状态：已完成。

目标：塔根据 JSON 配置自动选择范围内目标并攻击。

验收标准：

- 塔属性来自 JSON，例如射程、攻击间隔、伤害。
- 目标选择规则明确且 deterministic。
- 攻击结果只改变可序列化游戏状态。

### 阶段 6：血量系统

状态：已完成。

目标：为怪物、基地或玩家生命建立最小血量逻辑。

验收标准：

- 伤害、死亡、漏怪扣血都通过状态变更表达。
- 死亡和胜负条件不依赖渲染层判断。
- 血量变化可被 UI 或网络同步消费。

### 阶段 7：波次系统

状态：已完成。

目标：按照 JSON 描述生成多波敌人。

验收标准：

- 波次包含开始时间、怪物类型、数量、间隔等数据。
- Runtime 可根据时间推进波次。
- 波次进度可序列化，支持暂停、恢复和同步。

### 阶段 8：游戏状态管理

状态：已完成。

目标：形成最小 deterministic simulation state。

验收标准：

- Runtime 区分 definition 和 state。
- 状态推进由显式 `tick` 或等价入口触发。
- 渲染只读取状态，不拥有核心玩法逻辑。

### 阶段 9：简单地图编辑器

状态：已完成。

目标：提供最小可视化方式修改地图 JSON。

验收标准：

- Editor 只修改 JSON，不实现玩法逻辑。
- Editor 可以调用 Runtime 预览当前 JSON。
- 至少支持地图尺寸、路径点、塔位的基础编辑。

### 阶段 10：保存/加载地图

状态：已完成。

目标：支持本地保存和加载 `game.json`。

验收标准：

- 可以导入、导出 JSON 文件。
- 保存内容可被 schema 校验和 runtime 加载。
- 不引入账号、云存储或发布系统。

## 9. 分支约定

后续功能、修复和文档更新默认直接在 `main` 分支推进。只有在需要隔离高风险实验、长期并行任务或外部协作时，才额外创建短生命周期功能分支。

## 10. 风险清单

- 过早抽象：在只有一个玩法时抽象通用引擎，会拖慢 MVP 并制造错误边界。
- Runtime 与 Editor 耦合：一旦玩法逻辑进入 UI，后续多人同步和服务端模拟会变困难。
- Player 复制逻辑：如果 Player 自己计算移动、攻击、胜负或波次，会破坏 Runtime 作为玩法真相的边界。
- 非确定性逻辑：未控制随机数、时间输入或遍历顺序，会影响回放、同步和测试。
- JSON 膨胀：过早支持复杂 trigger/action 会让 AI 难以稳定生成有效内容。
- 多人同步复杂度：必须先保证状态可序列化和逻辑 deterministic，再接入 Colyseus。
- 视觉优先陷阱：漂亮编辑器不能替代可验证 runtime 行为。

## 11. 推进原则

- 每次只完成一个小功能。
- 每个功能都先定义数据，再实现 runtime 行为，最后接 UI。
- 所有 gameplay 必须来自 `game.json` 或 simulation state。
- Runtime 不能依赖 Editor。
- Player 不能复制 Runtime simulation，只能驱动 Runtime 并展示 Runtime state。
- AI 最终产物是 JSON，不是代码。
- 新增能力必须说明如何校验、如何序列化、如何同步。
