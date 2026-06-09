# Goal 4 Plan：复刻 docs/img 中的 Editor Professional UI

## 1. 需求分析

本 Goal 要执行 `docs/editor-professional-ui-shell.md` 的 UI shell 计划，并以 `docs/img/` 中两张参考图为视觉目标，把 `apps/editor` 从“Viewport + 右侧长表单”升级为专业工具型编辑器界面。

完成状态必须由当前代码、浏览器渲染和验证命令共同证明，不能只停留在文档或静态结构。

## 2. 上下文梳理

- 当前 Editor 基于 Vite + React + TypeScript。
- `apps/editor/src/App.tsx` 持有 draft/preview/playtest/tool/selection/validation 等核心状态。
- `InteractivePreview` 与 `PlaytestPreview` 负责 Runtime 挂载和渲染，不能把 gameplay 逻辑搬进 UI shell。
- `MapConfigPanel` 和 `GameplayConfigPanel` 已提供现有 schema 字段编辑能力。
- 参考图目标是暗色、密集、桌面工具型布局：顶部菜单栏、工具栏、左侧场景树/地形工具、中间 viewport、右侧 inspector、底部资源库/日志。

## 3. 风险评估

| 风险 | 影响 | 控制方式 |
| --- | --- | --- |
| UI 壳层破坏现有编辑能力 | Editor 闭环回退 | 保留现有状态和 panel 组件，先重组布局再增强 |
| 复制 gameplay 到 UI | Runtime/Editor 边界被破坏 | UI 只修改 `GameDefinition`，Runtime 仍是玩法真相 |
| 参考图能力被误写为已完成 | 用户误解产品状态 | 发布、AI、物品、技能等保持禁用态或占位 |
| 样式过重导致移动端不可用 | 小屏无法验收 | 桌面优先，同时做纵向 fallback |
| 单文件膨胀过大 | 后续维护困难 | 拆分 UI shell 组件和 helper |

## 4. 执行方案

1. 建立 Goal Mode 文件基线。
2. 从参考图提炼样式 token、布局比例和区域职责。
3. 新增 editor UI shell 组件，保持 `App.tsx` 作为状态编排层。
4. 重写 Editor CSS 为六区专业编辑器布局，保留现有表单和 runtime preview。
5. 增加 scene tree、resource library、log panel、viewport overlay 和 inspector tabs。
6. 运行 typecheck/test/build，并用浏览器 smoke 和截图检查视觉结构。

## 5. 验证方式

- 定向验证：`npm run typecheck -w apps/editor`、`npm run test -w apps/editor`、`npm run build -w apps/editor`。
- 根级验证：`npm run typecheck`、`npm run test`、`npm run build`。
- 浏览器 smoke：启动 `npm run dev -w apps/editor`，确认六区结构可见，viewport 非空，选择/工具/导入导出/Playtest 入口仍可用。
- 视觉检查：用浏览器截图对照 `docs/img/`，确认暗色密集布局、左右侧栏、底部面板、蓝色选中态和绿色运行按钮方向一致。

## 6. 回滚方案

- 不使用 `git reset --hard` 或破坏性命令。
- 若 UI 重组导致 Runtime preview 失效，先恢复 `InteractivePreview` 挂载路径，再逐块恢复壳层。
- 若某个对象级 inspector 改动影响现有 schema validity，退回到复用 `MapConfigPanel` / `GameplayConfigPanel`。
- 若验证失败，先定位是否为类型、测试、构建或渲染问题，再做最小修复。

## 7. 当前执行状态

- 状态：进行中。
- 当前任务：创建 Goal 4 核心文件并开始 Editor UI shell 实现。
- 下一任务：新增 UI shell 组件与样式。
