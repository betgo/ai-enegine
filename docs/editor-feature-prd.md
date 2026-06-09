# Editor 功能化 PRD

## 1. 背景

Editor 已完成专业工具型 UI shell：顶部菜单栏、工具栏、场景树、编辑态空场景 Viewport、Inspector、底部资源/日志面板均已可见。当前问题是大量 UI 仍停留在展示或禁用占位，用户看到了接近 Warcraft 3 World Editor 的工作区，但实际可操作能力仍主要集中在右侧 Map / Gameplay / JSON 配置面板、导入导出和 Playtest。

本 PRD 的目标是定义下一阶段需要补齐的真实功能，让 Editor 从“好看的 UI 壳层”进入“可持续编辑、校验、试玩和导出”的产品阶段。

## 2. 产品目标

下一阶段目标：把现有 UI shell 变成 Tower Defense MVP 的专业关卡编辑器。

核心目标：

- 让用户可以围绕 `GameDefinition` 创建、选择、编辑、校验和试玩一张地图。
- 让场景树、Inspector、资源库、日志、错误列表和工具栏都承担真实工作流。
- 保持编辑态中间 Viewport 默认空场景，不默认渲染塔防地图类型。
- Playtest 模式继续作为唯一 runtime 场景预览入口。
- 不扩展 `game.json` schema，不引入发布系统、AI 生成、账号、云存储或脚本系统。

成功状态：

- 用户可以只通过专业 UI 完成一次基本关卡调整：编辑地图数据、配置玩法、查看错误、进入 Playtest、导出 JSON。
- 所有可点击按钮都有明确行为；暂未实现能力必须保持禁用态或清晰占位。
- JSON 始终是唯一可导出的作品数据，Runtime gameplay 不进入 Editor UI。

## 3. 目标用户与使用场景

目标用户：

- 内部开发者：需要快速调整 Tower Defense MVP 数据并验证 runtime 行为。
- 早期创作者：不直接手写 JSON，也能理解和修改地图、单位、防御塔、波次。
- 后续 AI 生成流程：未来可把 AI 生成的 JSON draft 放入同一套校验、预览和编辑流程。

核心场景：

1. 用户打开 Editor，看到空场景工作区和当前地图数据摘要。
2. 用户从场景树选择路径点、塔位、怪物、防御塔或波次。
3. Inspector 显示所选对象的可编辑字段，用户修改后立即更新 JSON draft。
4. 错误列表展示 schema validation 或引用错误。
5. 用户点击运行测试，Playtest 使用当前 valid draft 快照运行。
6. 用户确认玩法后导出 `game.json`，可在 Player 导入运行。

## 4. 当前能力与问题

当前已有能力：

- `GameDefinition` schema 覆盖 `map`、`units`、`towers`、`waves`、`base`、`triggers`。
- Map 配置面板可以编辑地图尺寸、路径点和塔位。
- Gameplay 配置面板可以编辑基地、怪物、防御塔和波次。
- Editor 可以导入、导出本地 JSON。
- Editor 可以进入 Playtest，运行当前 valid draft 快照。
- UI shell 已建立六区布局。

当前主要问题：

- 场景树选择未完整驱动 Inspector 的对象级编辑。
- 资源库只展示摘要，没有真实搜索、过滤、选择和跳转行为。
- 底部日志是静态示例，不反映真实用户操作。
- 错误列表未结构化展示 validation errors。
- Undo / Redo、复制、粘贴、删除、保存等菜单和工具栏能力仍是占位。
- 地图编辑能力仍分散在配置面板，缺少对象级编辑工作流。
- Viewport 工具栏的网格、轴线、边界、小地图、缩放等多数只是 UI 状态。

## 5. MVP 范围

下一阶段采用“功能补齐，不扩 schema”的范围。

MVP 必须实现：

- 对象选择模型：场景树、资源库和 Inspector 使用同一套 selected object。
- 对象级 Inspector：根据选择对象编辑当前 schema 已支持字段。
- 资源库搜索与选择：支持分类过滤、关键词搜索、点击资源后选中对应对象。
- 操作日志：记录导入、导出、选择、编辑、校验、进入 Playtest、返回编辑、runtime error。
- 错误列表：结构化展示 schema validation errors，并能辅助定位到相关 tab 或对象。
- Undo / Redo：支持当前 Editor draft 的有限历史栈。
- 删除能力：支持删除 tower、wave、可安全删除的 path point；暂不删除 monster 和 path。
- 保存状态提示：展示 draft 是否 dirty、validation 是否 valid、Playtest 使用的是哪个快照。
- Playtest 前置检查：无效 draft 禁止进入 Playtest，并把错误导向错误列表。

MVP 应保持：

- 编辑态 Viewport 默认空场景。
- Playtest 模式才挂载 Runtime canvas。
- Editor 只修改 `GameDefinition` draft。
- 导出只导出 canonical `game.json`，不包含 runtime state、UI state 或 scene summary。

## 6. 非范围

下一阶段明确不做：

- 不扩展 `game.json` schema。
- 不实现发布地图、账号、云端保存、自动保存或版本历史。
- 不实现 AI 生成、AI 修改、AI 诊断入口。
- 不实现物品、技能、科技树、复杂行为、脚本系统或触发器图形编辑。
- 不实现真实 2D / 3D camera 切换。
- 不实现可视化路径绘制、拖拽塔位、地形画刷或对象 gizmo 操作。
- 不实现多人协作、权限、锁定、冲突合并。
- 不把 Player React 组件迁入 Editor。
- 不在 Editor 中复制 Runtime gameplay 逻辑。

## 7. 功能需求

### 7.1 对象选择模型

目标：建立贯穿场景树、资源库、Inspector、状态栏和日志的统一选择状态。

可选择对象类型：

- `map-root`
- `path`
- `path-point`
- `tower-slot`
- `base`
- `unit`
- `tower`
- `wave`
- `trigger-list`

交互规则：

- 点击场景树节点后，该节点成为当前选中对象。
- 点击资源库卡片后，选中对应 unit、tower、wave 或 map object。
- Inspector 根据当前选中对象切换到属性 tab。
- 状态栏展示当前选中对象名称和 ID。
- 选择变化写入日志。
- 选中对象被删除后，选择回退到最近的父级对象；无法确定父级时回退到 `map-root`。

验收标准：

- 选择 path point 时，Inspector 显示该点坐标。
- 选择 tower slot 时，Inspector 显示该塔位坐标。
- 选择 unit、tower、wave 时，Inspector 显示对应玩法字段。
- 选择变化不修改 `GameDefinition`。

### 7.2 对象级 Inspector

目标：让 Inspector 属性 tab 成为真实编辑入口，而不是只读摘要。

字段映射：

| 对象 | 可编辑字段 | 约束 |
| --- | --- | --- |
| map-root | `map.name`、`map.size.width`、`map.size.height` | size 最小 1 |
| path | `path.id` 暂不编辑 | 首版只读 |
| path-point | `x`、`y` | 最小 0，修改后同步 `map.tiles` |
| tower-slot | `x`、`y` | 最小 0，修改后同步 `map.tiles` |
| base | `base.maxHp` | 最小 1 |
| unit | `speed`、`maxHp`、`leakDamage` | speed 最小 0.1，其余最小 1 |
| tower | `slotId`、`range`、`attackIntervalMs`、`damage` | slotId 不可与其他 tower 冲突 |
| wave | `unitId`、`pathId`、`startTimeMs`、`count`、`intervalMs` | 引用必须存在 |

交互规则：

- 字段编辑立即写入 draft。
- 写入后重新运行 schema validation。
- 若 draft invalid，Preview snapshot 不更新，错误列表展示原因。
- Inspector 不显示 schema 不支持的可写字段。
- 参考图中的技能、物品、行为、事件保持禁用态或只读占位。

验收标准：

- 通过 Inspector 修改字段后，JSON tab 立即反映变化。
- 修改 path point / tower slot 后，`map.tiles` 同步更新。
- 修改 tower slotId 时，下拉只显示当前可用 slot。

### 7.3 场景树真实行为

目标：让场景树成为对象导航入口。

功能：

- 展示当前 `GameDefinition` 派生层级。
- 支持展开和折叠 map、paths、towerSlots、units、towers、waves。
- 支持点击节点选中对象。
- 当前选中节点高亮。
- 支持搜索节点名称或 ID。

搜索规则：

- 输入关键词后过滤匹配节点。
- 父节点命中时展示其子节点。
- 子节点命中时保留父级路径。
- 搜索为空时恢复完整树。

验收标准：

- 搜索 `slot-a` 只展示 tower slot 所在路径。
- 搜索 `wave` 可以找到所有 wave 节点。
- 点击搜索结果后 Inspector 正确显示对象字段。

### 7.4 资源库搜索、过滤与选择

目标：让底部资源库从静态展示变成可导航资产面板。

资源类型：

- 地图对象：map、path、tower slot。
- 单位：`units`。
- 防御塔：`towers`。
- 波次：`waves`。

功能：

- 分类过滤：全部、地图、单位、建筑、波次。
- 关键词搜索：匹配 ID、名称、类型。
- 点击资源卡片选中对应对象。
- 资源卡片展示关键摘要，例如 HP、speed、tower damage、wave count。

占位分类：

- 特效、音效、物品、UI、脚本保留但禁用或展示空状态。

验收标准：

- 搜索 `monster` 只展示相关 unit。
- 点击 tower 资源卡后，Inspector 显示 tower 属性。
- 空分类显示明确空状态，不误导用户以为数据丢失。

### 7.5 操作日志

目标：让日志反映真实编辑过程。

日志事件：

- 导入 JSON 成功或失败。
- 导出 JSON 成功或失败。
- 选择对象。
- 编辑字段。
- validation 状态变化。
- 进入 Playtest、返回 Edit。
- Playtest runtime error。
- Undo / Redo。
- 删除对象。

日志格式：

```txt
[HH:mm:ss] 事件类型: 事件摘要
```

规则：

- 日志只保存在 Editor UI state，不写入 `game.json`。
- 日志最多保留最近 200 条。
- 错误事件同时进入错误列表。

验收标准：

- 修改 tower damage 后，日志显示字段变更摘要。
- 导入 invalid JSON 后，日志和错误列表都有对应记录。

### 7.6 错误列表

目标：把 validation errors 从单行字符串升级为可定位的错误面板。

错误来源：

- `validateGameDefinition(draftGame)`。
- 导入 JSON 解析失败。
- Playtest runtime 创建失败。
- 引用关系错误，例如 tower slotId 不存在、wave unitId/pathId 不存在。

错误字段：

- severity：`error` 或 `warning`。
- source：`schema`、`import`、`runtime`、`reference`。
- message：面向用户的错误说明。
- target：可选对象定位信息。
- action：可选跳转动作，例如打开 Map tab、Gameplay tab 或选中对象。

交互：

- 点击错误项后尝试定位到相关 tab 或对象。
- 无法定位时保留在错误列表。
- 没有错误时显示空状态。

验收标准：

- draft invalid 时 Playtest 按钮禁用。
- 点击错误列表中 path 相关错误后切换到 Map tab。
- runtime error 不写入 JSON。

### 7.7 Undo / Redo

目标：支持用户回退和重做最近编辑。

范围：

- 覆盖所有通过 Editor UI 修改 `GameDefinition` 的操作。
- 不覆盖 UI-only state，例如 tab、搜索词、日志筛选。
- 不覆盖 Playtest runtime state。

规则：

- 历史栈最多 50 步。
- 每次字段编辑产生一个历史记录。
- 连续输入可按单字段 debounce 合并为一个历史记录，MVP 可先一改一记。
- 导入 JSON 成功后作为一个历史记录。
- Undo / Redo 后重新运行 validation。

验收标准：

- 修改 base.maxHp 后点击 Undo 可恢复旧值。
- Undo 后点击 Redo 可恢复新值。
- Playtest 中禁用 Undo / Redo 或返回编辑后再操作。

### 7.8 删除与安全约束

目标：让常见对象管理操作可用，同时避免破坏引用。

MVP 可删除：

- tower：删除后释放 tower slot。
- wave：删除后不影响 unit/path。
- path point：仅当 path points 数量大于 2。
- tower slot：仅当没有 tower 引用该 slot。

MVP 不删除：

- unit：因为 wave 可能引用 unit。
- path：因为 wave 可能引用 path。
- base、map-root、trigger-list。

交互规则：

- 删除前显示确认。
- 被引用对象禁止删除，并说明原因。
- 删除后选择回退到父级对象。
- 删除写入 Undo 历史。

验收标准：

- 被 tower 引用的 tower slot 删除按钮禁用。
- 删除 wave 后 JSON valid。
- 删除 path point 到 2 个时继续删除按钮禁用。

### 7.9 Playtest 工作流

目标：让 Playtest 成为清晰的验证闭环。

规则：

- 只有 valid draft 可以进入 Playtest。
- 进入 Playtest 时创建 frozen snapshot。
- Playtest 中修改 draft 不影响当前 run。
- 返回编辑后保留 draft，清空 Playtest runtime state。
- Playtest HUD 继续来自 `runtime.getState()`。

新增提示：

- Playtest 启动时日志记录 snapshot map name 和 validation 状态。
- 若 draft 在 Playtest 期间被修改，状态栏提示“当前试玩使用旧快照”。

验收标准：

- invalid draft 时点击 Playtest 不进入 runtime，并打开错误列表。
- Playtest 中 Step 后 HUD 变化，但 JSON tab 不混入 runtime state。

### 7.10 导入、导出与 dirty 状态

目标：让文件工作流更可信。

功能：

- 导入前校验 JSON 结构。
- 导入成功替换 draft，并写入 Undo 历史。
- 导入失败保留当前 draft。
- 导出前要求 draft valid。
- 状态栏显示 `dirty`、`valid`、`playtest snapshot` 状态。

规则：

- 本地文件名不进入 `game.json`。
- 导出文件仍为 canonical JSON。
- 不做自动保存。

验收标准：

- 编辑任意字段后状态栏显示 dirty。
- 导出成功后 dirty 可清除。
- 无效导入不会破坏当前 draft。

### 7.11 Viewport 显示开关

目标：让编辑态空场景的浮层控件具备真实 UI state。

MVP 范围：

- 网格开关：控制空场景网格显示。
- 轴线开关：控制 X/Z 轴线显示。
- 边界开关：控制地图边界框显示。
- 视野、AI 区域、小地图保持占位。
- 2D / 2.5D / 3D 按钮只改变 UI 状态，不改变真实 camera。

验收标准：

- 关闭网格后空场景 grid 不显示。
- 关闭轴线后红蓝轴线不显示。
- 2D / 2.5D / 3D 切换不会影响 Playtest runtime camera。

## 8. 数据与状态设计

MVP 状态分层：

- `draftGame`：当前编辑中的 `GameDefinition`。
- `previewGame`：最近一次 valid draft 的 clone，用于 Playtest 入口。
- `selectedObject`：当前 UI 选中对象。
- `history`：Undo / Redo 历史栈，只保存 `GameDefinition`。
- `editorLog`：UI 本地日志。
- `validationIssues`：结构化错误列表。
- `viewportDisplayState`：网格、轴线、边界、视图模式等 UI-only state。
- `playtestGame`：进入 Playtest 时的 frozen snapshot。

原则：

- 只有 `draftGame` 可以被导出。
- Runtime state 永远不进入 `draftGame`。
- UI-only state 不进入 `game.json`。
- validation 结果由 `draftGame` 派生，不手动维护真假。

## 9. 信息架构调整

建议下一阶段将 Editor 内部拆成以下功能模块：

- `editor-selection`：统一选择对象类型、label、定位、父级回退。
- `editor-history`：Undo / Redo reducer 和历史栈。
- `editor-log`：日志事件类型和格式化。
- `editor-issues`：validation errors、runtime errors、reference warnings 的结构化转换。
- `editor-resources`：资源列表、分类、搜索和摘要。
- `object-inspector`：按 selected object 渲染可编辑属性。
- `viewport-display-state`：编辑态 Viewport 显示开关。

这些模块应保持纯函数优先，方便单测覆盖。

## 10. 用户故事

### Story 1：编辑 tower damage 并试玩

作为创作者，我希望从场景树选择一座防御塔，在 Inspector 修改 damage，然后进入 Playtest 验证效果。

验收：

- 场景树点击 tower 后高亮。
- Inspector 显示 damage 字段。
- 修改后 JSON tab 更新。
- Playtest 使用修改后的 valid draft。

### Story 2：修复 invalid wave 引用

作为创作者，我希望错误列表告诉我哪个 wave 引用了不存在的 unit，并能跳转到对应 wave。

验收：

- 错误列表显示 wave ID 和错误原因。
- 点击错误后选中 wave 并打开 Inspector。
- 修复 unitId 后错误消失。

### Story 3：撤销误操作

作为创作者，我希望误改地图尺寸后可以点击 Undo 恢复。

验收：

- 修改地图尺寸后 Undo 可用。
- 点击 Undo 后尺寸和 JSON 恢复。
- 点击 Redo 后尺寸再次变化。

### Story 4：通过资源库选择对象

作为创作者，我希望在资源库搜索 `tower` 并点击卡片，快速定位到对应防御塔配置。

验收：

- 搜索结果只展示匹配资源。
- 点击资源卡后 Inspector 显示对应 tower。
- 日志记录选择事件。

## 11. 验收指标

功能验收：

- 场景树、资源库、Inspector 共享同一选择状态。
- Inspector 覆盖当前 schema 中所有可编辑核心字段。
- Undo / Redo 覆盖 Map 和 Gameplay 配置。
- 错误列表可展示并定位 validation / reference / runtime 问题。
- 导入、导出、Playtest、返回编辑流程不回退。

技术验收：

- `npm run typecheck` 通过。
- `npm run test` 通过。
- `npm run build` 通过；已知 Vite chunk-size warning 不作为失败。
- 新增纯函数模块必须有单元测试。
- 浏览器 smoke 覆盖：选择对象、编辑字段、Undo / Redo、错误列表、Playtest。

体验验收：

- 禁用功能不表现为可用。
- 错误信息能指导用户修复。
- 默认编辑态中间视图保持空场景。
- 文本在桌面和窄屏布局中不明显溢出。

## 12. 分期建议

### 阶段 29：Selection 与对象级 Inspector MVP

目标：打通场景树、资源库、Inspector 的统一选择和对象编辑。

范围：

- 定义完整 selected object 类型。
- 场景树点击所有核心对象。
- Inspector 属性 tab 编辑 map、base、path point、tower slot、unit、tower、wave。
- 状态栏显示选中对象。

验收：

- 选择任意核心对象后 Inspector 展示正确字段。
- 修改字段后 JSON valid 时 Playtest 可用。
- 单测覆盖 selection label、父级回退和对象更新。

### 阶段 30：资源库、搜索与日志

目标：让底部面板承担真实导航和反馈。

范围：

- 资源分类过滤。
- 关键词搜索。
- 点击资源选中对象。
- 真实操作日志。
- 日志上限 200 条。

验收：

- 搜索和分类过滤可组合使用。
- 编辑、导入、导出、Playtest 均写入日志。
- 空分类有清晰空状态。

### 阶段 31：错误列表与 Playtest 前置检查

目标：把 validation 和 runtime 错误变成可理解、可定位的工作流。

范围：

- validation errors 结构化。
- reference warnings/errors。
- 错误项点击定位。
- invalid draft 禁止 Playtest 并打开错误列表。

验收：

- invalid draft 不进入 Playtest。
- 错误列表展示具体原因和建议入口。
- runtime error 不污染 JSON。

### 阶段 32：Undo / Redo 与安全删除

目标：补齐基础编辑安全网。

范围：

- draft 历史栈。
- Undo / Redo toolbar 可用。
- 删除 tower、wave、可安全删除的 path point 和 tower slot。
- 删除确认和引用保护。

验收：

- Undo / Redo 对 Map 和 Gameplay 编辑有效。
- 被引用对象不可删除。
- 删除操作可 Undo。

### 阶段 33：Viewport 显示开关和 smoke

目标：让编辑态空场景浮层具备真实显示控制，并完成整体验证。

范围：

- 网格、轴线、边界开关。
- 视图模式 UI state。
- 文档同步。
- 浏览器 smoke。

验收：

- 显示开关真实改变空场景可见层。
- Playtest runtime 不受编辑态显示开关影响。
- README、项目计划和 PRD 状态同步。

## 13. 风险与约束

- 功能分散风险：若继续把所有编辑能力堆进大组件，后续维护会变难；应优先抽纯函数模块。
- schema 边界风险：不要为了 UI 字段强行写入 schema 不支持的数据。
- runtime 耦合风险：Playtest 只能驱动 Runtime API，不能复制 gameplay。
- 误导用户风险：暂未实现功能必须禁用或展示空状态。
- 历史栈风险：Undo / Redo 只保存 `GameDefinition`，不要保存 DOM、Runtime 或文件句柄。

## 14. 开放问题

- 是否保留旧 `InteractivePreview` 作为后续可视化地图编辑入口，还是在空场景基础上重新设计中立对象编辑画布？
- 是否允许编辑 `map.id`、path id、unit id、tower id、wave id？若允许，需要同步引用更新策略。
- monster 删除是否进入下一阶段？若进入，需要设计 wave 引用迁移或阻止删除规则。
- 是否需要把 validation error 标准化为结构化对象，而不是字符串？
- dirty 状态以导出成功为清除点，还是以导入/打开文件基线为清除点？
