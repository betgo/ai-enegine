# Goal 1 Tasks：完成项目中 MVP 目标

## 执行规则

- 单次只执行 1 个任务。
- 每个任务完成后自检：对当前实现是否 100% 有信心。
- 存疑时继续排查并修复。
- 每完成 3 个任务执行一次全面 Debug 检查。
- 如有代码变更，任务确认无误后按项目规范提交。
- 更新本文件，记录完成状态与执行内容。

## 任务列表

### 任务 1：创建 Goal Mode 核心文件

- 状态：complete
- 目标：创建 `goal-1/input.md`、`goal-1/plan.md`、`goal-1/tasks.md`。
- 验证：三份文件存在，内容覆盖原始输入、执行方案、任务拆分。
- 执行记录：
  - 已创建 `goal-1/input.md`，逐字保存用户目标：完成项目中 mvp 目标。
  - 已创建 `goal-1/plan.md`，记录需求分析、上下文、风险、执行方案、验证方式和回滚方案。
  - 已创建 `goal-1/tasks.md`，拆分为 monorepo 初始化、schema、runtime、editor preview、项目验证等最小任务。
  - 已运行 `find goal-1 -maxdepth 1 -type f -print | sort`，确认三份核心文件存在。
  - 自检：对任务 1 当前实现有 100% 信心；文件存在且满足 Goal Mode 前置门禁。

### 任务 2：初始化 monorepo 基础配置

- 状态：complete
- 目标：创建根 `package.json`、`tsconfig.base.json`、workspace 目录骨架。
- 验证：`npm install` 可完成，workspace 配置可被 npm 识别。
- 执行记录：
  - 已创建根 `package.json`，配置 npm workspaces：`apps/*` 与 `packages/*`。
  - 已创建根 `tsconfig.base.json`，启用严格 TypeScript 基础配置。
  - 已创建 `.gitignore`，忽略 `node_modules/`、`dist/`、`coverage/`、`.vite/` 等产物。
  - 已创建 `apps/editor`、`apps/server`、`packages/runtime`、`packages/schema`、`packages/shared` 目录。
  - 已为 5 个 workspace 创建最小 `package.json`，确保 npm 可识别。
  - 已运行 `npm install`，生成 `package-lock.json` 并安装根 devDependencies。
  - 已运行 `npm query .workspace`，确认 5 个 workspace 被识别。
  - 已运行 `npm run typecheck`、`npm run test`、`npm run build`；当前 workspace 尚无具体脚本，根脚本通过 `--if-present` 成功完成。
  - 自检：对任务 2 当前实现有 100% 信心；monorepo 基础配置和 workspace 识别均有命令证据。

### 任务 3：创建 schema package

- 状态：complete
- 目标：定义 `GameDefinition`、地图 tile/path/tower slot 的最小类型与 `validateGameDefinition`。
- 验证：新增 schema 测试先失败再通过；`npm run test -w packages/schema` 通过。
- 执行记录：
  - 已在 `packages/schema/package.json` 添加 `build`、`typecheck`、`test` 脚本和导出入口。
  - 已创建 `packages/schema/tsconfig.json`。
  - 已先写 `packages/schema/src/index.test.ts`，覆盖接受最小 Tower Defense definition 与拒绝缺少 `map` 的输入。
  - 已第一次运行 `npm run test -w packages/schema`，确认 RED：测试因 `./index` 不存在失败。
  - 已添加最小类型 stub 后再次运行 `npm run test -w packages/schema`，确认 RED：2 个行为断言失败，原因是 `validateGameDefinition` 尚未实现。
  - 已实现 `GameDefinition`、`GameMap`、tile/path/tower slot 类型和 `validateGameDefinition` 最小校验。
  - 已运行 `npm run test -w packages/schema`，结果 1 个 test file、2 个 tests 通过。
  - 已运行 `npm run typecheck -w packages/schema`，退出码 0。
  - 已运行 `npm run build -w packages/schema`，退出码 0。
  - 自检：对任务 3 当前实现有 100% 信心；TDD 红绿链路、类型检查和构建均有命令证据。

### Debug 检查 A：前三个任务后全面检查

- 状态：complete
- 检查项：目录结构、依赖关系、类型边界、测试状态、文档同步。
- 执行记录：
  - 已运行 `find packages/schema -maxdepth 3 -type f -print | sort`，确认 schema 源码、测试、配置与构建产物位置。
  - 已运行 `rg -n "react|zustand|@ai-enegine/editor|apps/editor|eval|Function\\(" packages/schema packages/runtime apps/editor apps/server`，未发现 schema/runtime 对 React、Zustand、Editor 或任意代码执行的依赖；唯一匹配是 `apps/editor/package.json` 包名。
  - 已运行项目级 `npm run typecheck`，退出码 0。
  - 已运行项目级 `npm run test`，schema 1 个 test file、2 个 tests 通过。
  - 已运行项目级 `npm run build`，退出码 0。
  - 已运行 `git status --short --ignored packages/schema`，确认 `packages/schema/dist/` 与 workspace `node_modules/` 被忽略。
  - 自检：前三个任务后的结构、依赖边界、测试状态和文档同步均有证据；可以进入 runtime package。

### 任务 4：创建 runtime package

- 状态：complete
- 目标：实现独立 Three.js runtime，支持读取 `GameDefinition` 渲染基础地图。
- 验证：runtime 测试覆盖场景创建和 dispose；`npm run test -w packages/runtime` 通过。
- 执行记录：
  - 已在 `packages/runtime/package.json` 添加 `build`、`typecheck`、`test` 脚本、`three` 依赖、`@ai-enegine/schema` 依赖与 `@types/three` 类型依赖。
  - 已创建 `packages/runtime/tsconfig.json`，启用 DOM lib 以支持容器和 renderer 类型。
  - 已先写 `packages/runtime/src/index.test.ts`，覆盖从 `GameDefinition` 创建可渲染场景摘要，以及 `dispose()` 释放 renderer。
  - 已运行 `npm install` 与 `npm install -w packages/runtime -D @types/three`，更新 lockfile 和 workspace 依赖。
  - 已第一次运行 `npm run test -w packages/runtime`，确认 RED：测试因 `./index` 不存在失败。
  - 已添加最小 runtime stub 后再次运行 `npm run test -w packages/runtime`，先发现测试替身依赖 `document` 的环境问题并修正为纯对象替身。
  - 已第三次运行 `npm run test -w packages/runtime`，确认 RED：场景摘要行为断言失败，证明测试覆盖目标行为。
  - 已实现 `createTowerDefenseRuntime`，读取 `GameDefinition` 创建 Three.js `Scene`、`PerspectiveCamera`、网格、tile mesh、路径线和塔位标记。
  - Runtime 暴露 `getSceneSummary()`、`render()`、`dispose()`，并支持注入 `rendererFactory`，方便测试和未来预览挂载。
  - 已运行 `npm run test -w packages/runtime`，结果 1 个 test file、2 个 tests 通过。
  - 已运行 `npm run typecheck -w packages/runtime`，退出码 0。
  - 已运行 `npm run build -w packages/runtime`，退出码 0。
  - 已运行 `rg -n "react|zustand|@ai-enegine/editor|apps/editor|eval|Function\\(" packages/runtime/src packages/runtime/package.json`，无匹配，确认 runtime 未依赖 React、Zustand、Editor 或任意代码执行。
  - 已运行项目级 `npm run typecheck`、`npm run test`、`npm run build`，均退出码 0；项目级测试中 runtime 2 tests、schema 2 tests 通过。
  - 自检：对任务 4 当前实现有 100% 信心；runtime 独立性、Three.js 基础地图渲染能力和 dispose 行为均有验证证据。

### 任务 5：创建 editor preview app

- 状态：complete
- 目标：创建 Vite React app，加载 `game.sample.json` 并挂载 runtime。
- 验证：`npm run build -w apps/editor` 通过。
- 执行记录：
  - 已在 `apps/editor/package.json` 添加 `dev`、`build`、`typecheck` 脚本，以及 React、React DOM、Vite、`@vitejs/plugin-react`、schema/runtime workspace 依赖。
  - 已创建 `apps/editor/index.html`、`apps/editor/tsconfig.json`、`apps/editor/vite.config.ts`。
  - 已创建 `apps/editor/src/game.sample.json`，保持纯 JSON，并包含地图尺寸、路径 tile、塔位 tile、路径点和 tower slots。
  - 已创建 `apps/editor/src/App.tsx`，React 仅负责容器挂载、校验状态展示和调用 `createTowerDefenseRuntime`；玩法渲染逻辑仍在 runtime。
  - 已创建 `apps/editor/src/main.tsx` 与 `apps/editor/src/styles.css`。
  - 已运行 `npm install` 安装 editor 依赖；后续为 Vite config 类型补充 `@types/node`。
  - 已运行 `npm run typecheck -w apps/editor`，退出码 0。
  - 已运行 `npm run build -w apps/editor`，退出码 0；Vite 构建成功，提示 Three.js chunk 超过 500 kB，当前作为 3D MVP 预览的已知体积提示记录。
  - 已将根 `build`、`typecheck`、`test` 脚本调整为 schema -> runtime -> editor 的显式顺序，避免干净环境下 workspace 顺序不稳定。
  - 已为 editor Vite/TS 配置本地源码 alias，使 preview 直接消费 `packages/runtime/src` 与 `packages/schema/src`。
  - 已运行项目级 `npm run typecheck`，退出码 0。
  - 已运行项目级 `npm run test`，schema 2 tests、runtime 2 tests 均通过。
  - 已运行项目级 `npm run build`，退出码 0；Vite 仍有 chunk size warning。
  - 已运行 `npm run dev -w apps/editor`，dev server 启动于 `http://127.0.0.1:5173/`。
  - 已用浏览器打开本地预览，确认页面标题为 `AI Enegine Editor Preview`，显示 `3D Tower Defense Runtime`、`Runtime Demo`、尺寸 `10 x 7`、Tiles `14`、Paths `1`、Tower slots `3`、状态 `Loaded from game.sample.json`。
  - 已用浏览器截图确认 canvas 非空，能看到网格、路径、塔位标记和 inspector。
  - 浏览器日志无 error；仅有 Vite debug 连接日志和 React DevTools info。
  - 已结束本轮启动的 5173 Vite dev server，并确认 `lsof -ti tcp:5173` 无输出。
  - 自检：对任务 5 当前实现有 100% 信心；editor preview 可以加载 JSON 并调用 runtime 渲染基础地图。

### 任务 6：项目级验证与文档同步

- 状态：pending
- 目标：运行全量 typecheck/test/build，更新 README 或 docs 中的 MVP 启动说明。
- 验证：`npm run typecheck`、`npm run test`、`npm run build` 完成；若无法运行 dev server，记录原因。
- 执行记录：
  - 待记录。

### Debug 检查 B：全部 MVP 基座后最终检查

- 状态：pending
- 检查项：C 端预览体验、代码质量、Runtime/Editor 解耦、JSON 可序列化、安全边界。
- 执行记录：
  - 待记录。
