# Editor Professional UI Shell

## 背景与目标

当前 Editor 已完成 Tower Defense MVP 的本地创作闭环：可以编辑 `GameDefinition` 中的地图尺寸、路径点、塔位、基地血量、怪物、防御塔和波次；可以在 Three.js 预览中选择、添加和拖拽路径点/塔位；可以导入、导出 `game.json`；也可以进入 Playtest，用当前 valid draft 快照直接试玩。

下一阶段目标是把 Editor 从“预览画布 + 配置表单”升级为接近 Warcraft 3 World Editor 心智的专业工具型 UI。首版重点是建立稳定的信息架构和工作区布局，让后续对象系统、资源管理、触发器编辑和发布流程有明确承载位置。

该 UI 参考图只作为产品方向，不要求像素级还原。实现时优先保证现有编辑能力不回退，其次再提升视觉完成度。

## 参考图拆解

参考图可以拆成六个主要区域：

1. 顶部菜单栏
   - 承载全局入口：文件、编辑、视图、地图、对象、触发器、工具、窗口、帮助。
   - 首版只需要展示菜单结构，不要求实现完整桌面菜单系统。

2. 工具栏
   - 承载高频操作：保存/导出、撤销/重做、选择、移动、旋转、路径点、塔位、运行测试、发布地图、用户入口。
   - 首版应把现有 Edit / Playtest、Select、Add Path Point、Add Tower Slot、Import / Export 映射到工具栏中。

3. 场景树
   - 承载地图对象层级和快速选择。
   - 首版从当前 `GameDefinition` 派生层级：地图、路径、塔位、基地、怪物、防御塔、波次、触发器。

4. Viewport
   - 编辑态承载默认空场景网格，避免默认进入塔防地图类型。
   - Playtest 模式继续复用现有 `PlaytestPreview`，在外层增加视图模式、显示开关、缩放、小地图等 UI 壳层。

5. Inspector
   - 承载选中对象的属性编辑和玩法配置。
   - 首版需要把当前 Map / Gameplay / JSON 配置能力放入右侧 tabs，并逐步支持根据选中对象展示局部字段。

6. 底部面板
   - 承载资源库、导入入口、日志、搜索结果和错误列表。
   - 首版资源库从现有 units、towers、waves 派生；日志记录 validation、导入导出、Playtest 和 runtime error。

## 首版范围

首版采用“功能化外壳”路线：只真实编辑当前 `GameDefinition` 已支持的数据，其余参考图能力作为禁用态或只读占位。

首版必须真实可用的能力：

- 保留现有地图尺寸、路径点、塔位编辑。
- 保留现有怪物、防御塔、波次和基地血量配置。
- 保留地图尺寸、路径点、塔位等数据编辑能力；编辑态 Viewport 默认空场景，路径点/塔位画布交互作为后续阶段。
- 保留导入、导出 `game.json`。
- 保留 Edit / Playtest 切换和 Playtest 控制。
- 新增专业编辑器布局壳层：顶部菜单栏、工具栏、场景树、Viewport、Inspector、底部面板。
- 新增由现有 JSON 派生的 scene tree、resource library 和 editor log。

首版允许占位的能力：

- 撤销、重做。
- 发布地图。
- 新建文件夹和资源导入管理。
- 技能、物品、复杂行为配置。
- AI 区域和小地图精确导航。
- 2D / 2.5D / 3D 真实相机切换。

## 不做范围

首版不扩展 `game.json` schema，不新增 runtime gameplay 规则，也不改变 Runtime 公共 API。

明确不做：

- 不新增发布系统、账号、云存储、自动保存或版本历史。
- 不实现 AI Agent 生成流程。
- 不实现物品、技能、复杂行为、脚本系统或触发器图形编辑。
- 不引入 Lua、JS 脚本注入或任意代码执行。
- 不实现完整资源管理器、文件夹系统或资产市场。
- 不实现真实 2D / 3D camera 模式切换。
- 不把 Player React 组件迁入 Editor。
- 不在 Editor UI 中复制怪物移动、攻击、血量、波次或胜负逻辑。

## UI 信息架构

### 顶部菜单栏

首版菜单项固定展示：

- 文件：新建、打开、导入 JSON、导出 JSON、保存占位。
- 编辑：撤销、重做、复制、粘贴、删除，首版除可映射能力外保持禁用。
- 视图：显示网格、显示轴线、显示边界、视图模式占位。
- 地图：地图尺寸、路径点、塔位入口。
- 对象：怪物、防御塔、波次入口。
- 触发器：触发器列表占位。
- 工具：校验、运行测试入口。
- 窗口：场景树、Inspector、资源库、日志显示入口占位。
- 帮助：项目说明入口占位。

### 工具栏

首版工具按钮分组：

- 文件操作：导入 JSON、导出 JSON。
- 历史操作：撤销、重做，禁用态。
- 编辑工具：Select、Add Path Point、Add Tower Slot。
- 显示工具：网格、轴线、边界、AI 区域、视野显示开关；如暂未接入渲染层，可先作为 UI 状态。
- 测试操作：Edit / Playtest 切换、Playtest 运行入口。
- 发布入口：发布地图，禁用态。

### 场景树

场景树按当前数据派生：

- 地图根节点：显示 `game.map.name`。
- 地形：显示 map size、tiles 摘要。
- 路径：每条 `map.paths` 一个节点，路径点作为子节点。
- 塔位：每个 `map.towerSlots` 一个节点。
- 基地：显示 `base.maxHp` 摘要。
- 怪物：每个 `units` 一个节点。
- 防御塔：每个 `towers` 一个节点。
- 波次：每个 `waves` 一个节点。
- 触发器：显示 `triggers.length`，当前为空也保留入口。

可映射到现有选择模型的节点应支持点击选择。无法映射的节点可以切换 Inspector tab 或只展开查看。

### Viewport

Viewport 首版在编辑态由 UI shell 渲染空场景网格，Editor 只负责外层工具 UI；Playtest 模式再交给 Runtime 渲染当前有效 JSON。

需要展示：

- 编辑态空场景网格。
- 编辑模式工具浮层：2D / 2.5D / 3D、网格、轴线、边界、AI 区域、视野等按钮。
- 缩放显示和全屏占位。
- 小地图占位。
- Playtest 模式下显示运行 HUD 和返回编辑入口。

其中真实数据编辑仍通过 Inspector / Map / Gameplay / JSON 面板完成；Playtest 模式继续使用现有 runtime preview。

### Inspector

Inspector 使用 tabs：

- 属性：根据当前选择展示对象局部属性。
- 玩法：复用或承载现有 base、monster、tower、wave 配置。
- 地图：复用或承载现有 map size、path points、tower slots 配置。
- JSON：展示 readonly `game.json`。

属性 tab 的首版映射：

- 选中 path point：编辑 x、y。
- 选中 tower slot：编辑 x、y。
- 选中 map/root：显示 map id、name、size、tile/path/tower slot 数量。
- 选中 unit：编辑 speed、maxHp、leakDamage。
- 选中 tower：编辑 slotId、range、attackIntervalMs、damage。
- 选中 wave：编辑 startTimeMs、unitId、pathId、count、intervalMs。
- 未选中：显示项目摘要和 validation 状态。

参考图里的阵营、技能、物品、行为、事件等字段首版不真实写入 JSON，必须以禁用态或占位说明呈现。

### 底部面板

底部面板使用 tabs：

- 资源库：展示 units、towers、waves 和地图对象摘要，支持搜索和分类过滤。
- 日志：显示 validation、导入导出、Playtest、runtime error、选择对象等事件。
- 搜索结果：首版可以和资源库搜索共用结果。
- 错误列表：首版可以展示 validation errors。

资源卡片应展示 ID、类型和关键数值摘要，不要求引入真实美术资源。

## 数据映射

所有 UI 数据均从当前 `GameDefinition` 或 Runtime summary 派生。

| UI 区域 | 数据来源 | 首版行为 |
| --- | --- | --- |
| 场景树地图节点 | `game.map` | 展示 map name、size、paths、towerSlots |
| 场景树路径节点 | `game.map.paths` | 展开路径点，支持选择 path point |
| 场景树塔位节点 | `game.map.towerSlots` | 支持选择 tower slot |
| 场景树怪物节点 | `game.units` | 切换 Inspector 到玩法/属性 |
| 场景树防御塔节点 | `game.towers` | 切换 Inspector 到玩法/属性 |
| 场景树波次节点 | `game.waves` | 切换 Inspector 到玩法/属性 |
| 场景树触发器节点 | `game.triggers` | 展示数量，首版只读 |
| Viewport 摘要 | `SceneSummary` | 展示 tile/path/tower slot 数量 |
| Inspector 属性 | `selectedObject` + `GameDefinition` | 局部编辑已有字段 |
| 资源库 | `units`、`towers`、`waves`、`map` | 搜索、分类、摘要展示 |
| 日志 | Editor 本地 UI state | 追加用户操作和错误信息 |
| JSON tab | `JSON.stringify(draftGame, null, 2)` | readonly 展示 |

实现时必须保持 Runtime 与 Editor 解耦：Runtime 是玩法和渲染真相，Editor UI 只修改 JSON draft，并把 valid draft 交给 Runtime preview。

## 验收标准

首版实现完成后应满足：

- 页面布局接近参考图的六区结构，桌面宽屏下不再是单一右侧长表单。
- 顶部菜单栏、工具栏、场景树、Viewport、Inspector、底部面板均可见。
- 现有地图配置、玩法配置、导入导出和 Playtest 不回退；编辑态中间 Viewport 默认保持空场景。
- `game.json` schema 有效时 Playtest runtime 可用，无效 draft 不进入 Playtest 快照。
- 选中路径点或塔位时，场景树和 Inspector 状态一致；Viewport marker 交互作为后续阶段。
- 底部日志能展示 validation、导入导出、Playtest 和 runtime error。
- 禁用态能力不会误导用户以为已完成。
- `npm run typecheck`、`npm run test`、`npm run build` 仍作为最终验证门禁。

## 首版实现状态

当前首版已落地到 `apps/editor`：

- 已实现顶部菜单栏、工具栏、场景树、Viewport、Inspector 和底部资源/日志/错误面板。
- 已保留现有 `PlaytestPreview`、地图配置、玩法配置、导入和导出能力。
- 已增加空场景 Viewport 和 WebGL fallback 视觉层；编辑态 Viewport 显示接近参考图的网格、轴线、原点和变换辅助线，不默认展示塔防地图类型。
- 发布、AI、物品、技能、复杂行为和真实 2D/3D camera 切换仍保持禁用态或后续阶段范围。

## 后续演进

Professional UI Shell 完成后，可按以下方向继续演进：

1. Undo / Redo
   - 为 Editor draft 引入有限历史栈，支持路径点、塔位、玩法字段回退。

2. 对象级 Inspector
   - 将 MapConfigPanel 和 GameplayConfigPanel 逐步拆成对象级编辑器，降低右侧表单密度。

3. 资源管理
   - 引入资源 ID、缩略图、分类、导入记录和引用检查。

4. 触发器编辑
   - 在保持纯 JSON 的前提下设计 trigger schema，避免任意脚本。

5. 发布地图
   - 在 Player 可稳定运行导出的 JSON 后，再设计本地打包或服务端发布流程。

6. AI 生成入口
   - AI 只生成 JSON draft 或 patch，不生成运行时代码。

7. 视图和导航
   - 增强 camera 控制、小地图导航、显示开关和选择高亮。

8. 多玩法扩展
   - 在 Tower Defense MVP 稳定后，再评估是否抽象通用对象、单位、行为和资源模型。
