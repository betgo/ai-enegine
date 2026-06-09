import type { EditorTool } from "./interactive-map-editor";
import {
  menuItems,
  toolItems
} from "./editor-shell-data";
import type { EditorMode } from "./editor-shell-types";

interface EditorTopBarsProps {
  editorMode: EditorMode;
  editorTool: EditorTool;
  isPlaytestMode: boolean;
  validationOk: boolean;
  onEditorToolChange(tool: EditorTool): void;
  onEnterEditMode(): void;
  onEnterPlaytestMode(): void;
  onExportGame(): void;
  onImportGame(): void;
}

export function EditorTopBars({
  editorMode,
  editorTool,
  isPlaytestMode,
  validationOk,
  onEditorToolChange,
  onEnterEditMode,
  onEnterPlaytestMode,
  onExportGame,
  onImportGame
}: EditorTopBarsProps) {
  return (
    <>
      <header className="editor-titlebar">
        <div className="brand-mark" aria-hidden="true">W</div>
        <div className="titlebar-main">
          <strong>我的地图.w3x* - 编辑器</strong>
          <nav aria-label="Editor menu">
            {menuItems.map((item) => (
              <button className="menu-button" key={item} type="button">{item}</button>
            ))}
          </nav>
        </div>
        <div className="window-actions" aria-hidden="true">
          <span>↺</span>
          <span>−</span>
          <span>□</span>
          <span>×</span>
        </div>
      </header>
      <Toolbar
        editorMode={editorMode}
        editorTool={editorTool}
        isPlaytestMode={isPlaytestMode}
        validationOk={validationOk}
        onEditorToolChange={onEditorToolChange}
        onEnterEditMode={onEnterEditMode}
        onEnterPlaytestMode={onEnterPlaytestMode}
        onExportGame={onExportGame}
        onImportGame={onImportGame}
      />
    </>
  );
}

function Toolbar({
  editorMode,
  editorTool,
  isPlaytestMode,
  validationOk,
  onEditorToolChange,
  onEnterEditMode,
  onEnterPlaytestMode,
  onExportGame,
  onImportGame
}: EditorTopBarsProps) {
  return (
    <section className="editor-toolbar" aria-label="Editor toolbar">
      <div className="toolbar-group file-actions">
        <button className="tool-button" type="button" onClick={onImportGame}>
          <span>▣</span><small>导入</small>
        </button>
        <button className="tool-button" disabled={!validationOk} type="button" onClick={onExportGame}>
          <span>▤</span><small>导出</small>
        </button>
      </div>
      <div className="toolbar-group">
        {toolItems.map((tool) => (
          <ToolbarButton
            editorMode={editorMode}
            editorTool={editorTool}
            key={tool.id}
            tool={tool}
            onEditorToolChange={onEditorToolChange}
          />
        ))}
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-group run-actions">
        <button
          className={isPlaytestMode ? "run-button active" : "run-button"}
          disabled={!validationOk}
          type="button"
          onClick={isPlaytestMode ? onEnterEditMode : onEnterPlaytestMode}
        >
          <span>{isPlaytestMode ? "■" : "▶"}</span>
          {isPlaytestMode ? "返回编辑" : "运行测试"}
        </button>
        <button className="publish-button" disabled type="button"><span>♔</span>发布地图</button>
        <button className="creator-button" type="button"><span className="avatar">C</span>Creator</button>
      </div>
    </section>
  );
}

function ToolbarButton({
  editorMode,
  editorTool,
  tool,
  onEditorToolChange
}: {
  editorMode: EditorMode;
  editorTool: EditorTool;
  tool: (typeof toolItems)[number];
  onEditorToolChange(tool: EditorTool): void;
}) {
  const toolId = tool.id;
  const isEditorTool = isEditableTool(toolId);
  const active = isEditorTool && editorTool === toolId && editorMode === "edit";

  return (
    <button
      aria-pressed={active}
      className={active ? "tool-button active" : "tool-button"}
      disabled={tool.disabled || editorMode !== "edit"}
      type="button"
      onClick={() => {
        if (isEditorTool) {
          onEditorToolChange(toolId);
        }
      }}
    >
      <span>{tool.icon}</span>
      <small>{tool.label}</small>
    </button>
  );
}

function isEditableTool(toolId: (typeof toolItems)[number]["id"]): toolId is EditorTool {
  return toolId === "select" || toolId === "add-path-point" || toolId === "add-tower-slot";
}
