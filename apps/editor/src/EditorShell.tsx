import { EditorTopBars } from "./EditorTopBars";
import { getResourceAssets, getSelectedLabel } from "./editor-shell-data";
import type { EditorShellProps } from "./editor-shell-types";
import { InspectorPanel } from "./InspectorPanel";
import { SceneTreePanel } from "./SceneTreePanel";
import { ViewportWorkspace } from "./ViewportWorkspace";

export function EditorShell(props: EditorShellProps) {
  const selectedLabel = getSelectedLabel(props.selectedObject);
  const assets = getResourceAssets(props.game);

  return (
    <main className="editor-shell">
      <EditorTopBars
        editorMode={props.editorMode}
        editorTool={props.editorTool}
        isPlaytestMode={props.isPlaytestMode}
        validationOk={props.validationOk}
        onEditorToolChange={props.onEditorToolChange}
        onEnterEditMode={props.onEnterEditMode}
        onEnterPlaytestMode={props.onEnterPlaytestMode}
        onExportGame={props.onExportGame}
        onImportGame={props.onImportGame}
      />
      <section className="editor-workspace">
        <SceneTreePanel
          game={props.game}
          selectedObject={props.selectedObject}
          onSelectObject={props.onSelectObject}
        />
        <ViewportWorkspace
          assets={assets}
          bottomTab={props.bottomTab}
          error={props.error}
          logs={props.logs}
          preview={props.preview}
          validationMessage={props.validationMessage}
          validationOk={props.validationOk}
          viewportOverlayMode={props.viewportOverlayMode}
          onBottomTabChange={props.onBottomTabChange}
          onViewportOverlayModeChange={props.onViewportOverlayModeChange}
        />
        <InspectorPanel
          game={props.game}
          gameJson={props.gameJson}
          gameplayPanel={props.gameplayPanel}
          inspectorTab={props.inspectorTab}
          mapPanel={props.mapPanel}
          previewGame={props.previewGame}
          sceneSummary={props.sceneSummary}
          selectedObject={props.selectedObject}
          validationMessage={props.validationMessage}
          validationOk={props.validationOk}
          onInspectorTabChange={props.onInspectorTabChange}
        />
      </section>
      <footer className="statusbar">
        <span>地图尺寸: {props.previewGame.map.size.width} x {props.previewGame.map.size.height}</span>
        <span>鼠标: -</span>
        <span>选中: {selectedLabel}</span>
        <span>网格: 64</span>
        <span>空场景</span>
        <span>FPS: 60</span>
      </footer>
    </main>
  );
}
