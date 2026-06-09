# Goal 4 Tasks：Editor Professional UI Shell

## 执行规则

- 单次只执行 1 个任务。
- 每完成 3 个任务执行一次全面 Debug 检查。
- 每个任务收尾自检：对当前实现是否 100% 有信心。
- 存疑时继续排查并修复。
- 代码变更后必须运行相关验证；提交需遵守当前会话和仓库的 git 操作确认边界。

## 任务列表

### 任务 1：创建 Goal 4 核心文件

- 状态：complete
- 目标：创建 `goal-4/input.md`、`goal-4/plan.md`、`goal-4/tasks.md`。
- 验证：三份文件存在，覆盖原始输入、上下文、风险、执行方案、验证方式和任务拆分。
- 执行记录：
  - 已创建 `goal-4/input.md`，逐字保存 active goal 原始输入。
  - 已创建 `goal-4/plan.md`，记录需求分析、上下文、风险、执行方案、验证方式和回滚方案。
  - 已创建 `goal-4/tasks.md`，拆分 UI shell 实现任务。
  - 已运行 `find goal-4 -maxdepth 1 -type f -print | sort`，确认三份核心文件存在。
  - 自检：对任务 1 当前实现有 100% 信心；代码修改前置约束已满足。

### 任务 2：实现 Editor 六区 UI shell

- 状态：complete
- 目标：重组 `apps/editor` 页面结构，形成菜单栏、工具栏、场景树、Viewport、Inspector、底部面板。
- 验证：Editor 可以 typecheck，页面结构与参考图主要区域一致。
- 执行记录：
  - 已新增 `EditorShell`、`EditorTopBars`、`SceneTreePanel`、`ViewportWorkspace`、`InspectorPanel` 等 UI shell 组件。
  - 已将 `App.tsx` 保持为状态编排层，继续复用 `InteractivePreview`、`PlaytestPreview`、`MapConfigPanel` 和 `GameplayConfigPanel`。
  - 已实现顶部菜单栏、工具栏、左侧场景树/地形工具、中间 viewport、右侧 Inspector、底部资源/日志/错误面板。
  - 已运行 `npm run typecheck -w apps/editor`，通过。
  - 已运行文件长度检查，当前 `apps/editor/src` 下 TS/TSX/CSS 文件均低于 300 行。
  - 自检：对任务 2 当前实现有 100% 信心；六区 UI shell 已落地且未复制 Runtime gameplay。

### 任务 3：复刻暗色工具型样式

- 状态：complete
- 目标：复刻参考图的暗色面板、蓝色选中态、绿色运行按钮、密集工具栏、底部资源/日志布局。
- 验证：浏览器截图能看到六区结构、viewport 非空、文本不明显溢出。
- 执行记录：
  - 已将 Editor 样式拆为基础样式、shell、viewport、panels 和 responsive CSS。
  - 已复刻参考图的暗色桌面工具布局、顶部菜单、密集工具栏、蓝色选中态、绿色运行按钮、左右侧栏、底部资源库/日志和状态栏。
  - 已新增 Viewport fallback 视觉层，覆盖地形网格、路径、建筑和变换辅助线；WebGL 不可用时也不会出现空白 viewport。
  - 已用 Chrome headless 生成截图检查，确认六区结构和 viewport fallback 视觉可见。
  - 自检：对任务 3 当前实现有 100% 信心；UI 风格已向 `docs/img/` 参考图靠拢。

### 任务 4：补齐交互映射和回归验证

- 状态：complete
- 目标：确认选择、工具切换、导入导出、Playtest、资源库、日志和 inspector tabs 不回退。
- 验证：`npm run typecheck`、`npm run test`、`npm run build`，以及浏览器 smoke。
- 执行记录：
  - 已保留现有选择、路径点/塔位工具、导入导出、Playtest、地图配置、玩法配置和 JSON 展示入口。
  - 已同步 README、`docs/project-plan.md` 和 `docs/editor-professional-ui-shell.md`，将第六阶段记录为首版完成。
  - 已运行 `npm run typecheck -w apps/editor`、`npm run test -w apps/editor`、`npm run build -w apps/editor`，均通过。
  - 已运行根级 `npm run typecheck`、`npm run test`、`npm run build`，均通过；build 仍有项目已知 Three.js chunk size warning。
  - 已运行 `git diff --check`，通过。
  - 已运行 DOM smoke，确认 `editor-shell`、`editor-titlebar`、`editor-toolbar`、`left-sidebar`、`viewport-shell`、`right-inspector`、`bottom-panel`、`viewport-art-fallback`、`资源库`、`属性检查器`、`运行测试` 均存在。
  - 自检：对 Goal 4 当前实现有 100% 信心；目标 UI shell 已实现并验证。
