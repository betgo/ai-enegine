# 架构原则

## 1. Monorepo 结构

项目使用 monorepo。目标结构如下：

```txt
apps/
  editor/
  server/

packages/
  runtime/
  schema/
  shared/
```

职责边界：

- `apps/editor`：浏览器编辑器和预览界面。只负责用户交互、JSON 修改和调用 Runtime 预览。
- `apps/server`：未来承载 Colyseus 房间、同步协议和持久化入口。第一阶段可以暂不实现。
- `packages/runtime`：Tower Defense runtime。负责读取 definition、推进 simulation、输出可渲染状态。
- `packages/schema`：`game.json` 类型、版本、校验规则和示例数据。
- `packages/shared`：跨端共享的极少量工具或常量。没有明确复用前不要加入内容。

## 2. 依赖方向

允许的依赖方向：

```txt
apps/editor  -> packages/runtime
apps/editor  -> packages/schema
apps/editor  -> packages/shared

apps/server  -> packages/runtime
apps/server  -> packages/schema
apps/server  -> packages/shared

packages/runtime -> packages/schema
packages/runtime -> packages/shared
```

禁止的依赖方向：

```txt
packages/runtime -> apps/editor
packages/runtime -> React
packages/runtime -> Zustand
packages/runtime -> DOM-specific UI state
packages/schema  -> packages/runtime
packages/shared  -> app-specific code
```

Runtime 可以有 Three.js 渲染适配层，但核心 simulation 必须与 React UI 解耦。随着项目推进，如渲染和模拟开始互相干扰，应优先拆分 runtime 内部模块，而不是把逻辑迁入 Editor。

## 3. `game.json` 原则

`game.json` 是玩法定义，不是脚本容器。

必须满足：

- 纯 JSON，可被 `JSON.stringify` 和 `JSON.parse` 完整处理。
- 可校验，有明确版本号和 schema。
- AI 易生成，字段命名稳定，嵌套层级克制。
- 可多人同步，不能包含本地闭包、函数引用、DOM 引用或类实例。
- 不允许任意脚本、表达式字符串、动态 import 或 eval 类能力。
- 数据结构优先描述 Tower Defense MVP，不提前承诺通用游戏类型。

推荐顶层结构：

```json
{
  "version": "0.1.0",
  "map": {},
  "units": [],
  "waves": [],
  "triggers": []
}
```

设计规则：

- `definition` 描述静态配置，例如地图、单位类型、塔类型和波次。
- `state` 描述运行时状态，例如当前时间、怪物位置、生命值和波次进度。
- `definition` 与 `state` 必须分离，避免保存地图时混入当前对局状态。
- trigger/action 只能使用枚举和参数对象，不能使用脚本文本。

## 4. Runtime 原则

Runtime 是项目的核心资产，必须独立于 Editor。

必须满足：

- 能通过纯 TypeScript API 创建和运行。
- 不依赖 React 组件生命周期。
- 不依赖 Zustand store。
- 不把核心玩法状态藏在 Three.js object 上。
- 支持 deterministic logic：相同输入、相同 tick 序列产生相同状态。
- 所有游戏逻辑状态可序列化。
- 可未来运行在服务器，用于权威模拟或校验。

Runtime 内部建议分层：

- `definition loading`：读取并校验 `game.json`。
- `simulation`：推进怪物、塔、血量、波次和胜负状态。
- `render adapter`：把 simulation state 映射到 Three.js 对象。

第一阶段不需要完整抽象这些层，但新增代码时必须保持这个方向，避免 Editor 或 Three.js 渲染对象拥有玩法真相。

## 5. Editor 原则

Editor 是 JSON 编辑工具，不是游戏逻辑宿主。

必须满足：

- 只修改 `game.json` definition。
- 调用 Runtime 进行预览。
- 不复制 Runtime 的怪物移动、攻击、波次或胜负逻辑。
- UI state 只保存面板状态、选中对象、临时输入等编辑体验信息。
- 保存和加载只处理 JSON，不保存不可序列化对象。

Editor 的每个功能都应能回答：

- 它修改了 `game.json` 的哪个字段？
- Runtime 如何消费这个字段？
- 字段如何被校验？
- 字段是否适合未来 AI 生成？

## 6. 多人同步准备原则

第一阶段不实现完整联机，但每个 runtime 决策都要为联机保留可能性。

要求：

- 状态变更集中在 simulation tick 中。
- 避免使用 `Math.random()` 直接影响游戏结果；需要随机时使用可注入 seed。
- 避免依赖真实帧率决定 gameplay 结果。
- 对象 ID 必须稳定，不能依赖数组下标作为长期身份。
- 网络层未来同步 state diff 或 command 时，不需要理解 Editor UI。

## 7. AI 生成准备原则

AI 未来生成的是 JSON，不是代码。

要求：

- 字段语义清晰，避免高度隐式规则。
- 枚举值稳定，避免同义词扩散。
- 错误信息面向修复，指出字段路径和原因。
- 示例数据保持小而完整。
- 不为假想未来玩法提前设计复杂 DSL。
