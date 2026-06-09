import { useEffect, useMemo, useRef, useState } from "react";
import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";
import {
  exportGameJson,
  importGameJson
} from "./browser-file";
import { EmptyEditorViewport } from "./EmptyEditorViewport";
import { EditorShell } from "./EditorShell";
import { GameplayConfigPanel } from "./GameplayConfigPanel";
import { MapConfigPanel } from "./MapConfigPanel";
import { PlaytestPreview } from "./PlaytestPreview";
import {
  getSelectedMapObjectLabel,
  type EditorTool,
  type SelectedMapObject
} from "./interactive-map-editor";
import { createPlaytestSnapshot } from "./playtest-state";
import sampleGame from "./game.sample.json";

type EditorMode = "edit" | "playtest";
type InspectorTab = "properties" | "gameplay" | "map" | "json";
type BottomTab = "assets" | "logs" | "errors";

export function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftGame, setDraftGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const [previewGame, setPreviewGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [editorTool, setEditorTool] = useState<EditorTool>("select");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("properties");
  const [bottomTab, setBottomTab] = useState<BottomTab>("assets");
  const [viewportOverlayMode, setViewportOverlayMode] = useState<"2D" | "2.5D" | "3D">("2.5D");
  const [playtestGame, setPlaytestGame] = useState<GameDefinition | null>(null);
  const [selectedObject, setSelectedObject] = useState<SelectedMapObject | null>(null);
  const validation = useMemo(() => validateGameDefinition(draftGame), [draftGame]);
  const gameJson = useMemo(() => JSON.stringify(draftGame, null, 2), [draftGame]);

  useEffect(() => {
    if (validation.ok) {
      setPreviewGame(structuredClone(draftGame));
    }
  }, [draftGame, validation.ok]);

  const validationMessage = validation.ok ? "JSON valid" : validation.errors.join(", ");
  const isPlaytestMode = editorMode === "playtest" && playtestGame !== null;
  const logs = useMemo(() => (
    [
      "[12:24:31] 地图加载完成 (耗时 1.23s)",
      `[12:24:33] 触发器编译成功 (${draftGame.triggers.length} 个触发器)`,
      `[12:24:35] 当前选择: ${getSelectedMapObjectLabel(selectedObject)}`,
      `[12:24:40] 地形: ${draftGame.map.tiles.length} 个 tile`,
      validation.ok ? "[12:24:45] 保存地图成功" : `[12:24:45] 校验失败: ${validationMessage}`,
      "[12:25:18] 测试地图已启动 (FPS: 60)"
    ]
  ), [draftGame.map.tiles.length, draftGame.triggers.length, selectedObject, validation.ok, validationMessage]);

  function enterEditMode() {
    setEditorMode("edit");
    setPlaytestGame(null);
    setSelectedObject(null);
  }

  function enterPlaytestMode() {
    if (!validation.ok) {
      return;
    }

    setSelectedObject(null);
    setPlaytestGame(createPlaytestSnapshot(draftGame));
    setEditorMode("playtest");
  }

  const preview = isPlaytestMode ? (
    <PlaytestPreview
      game={playtestGame}
      onBackToEdit={enterEditMode}
      onError={setError}
    />
  ) : (
    <EmptyEditorViewport />
  );

  return (
    <>
      <EditorShell
        bottomTab={bottomTab}
        editorMode={editorMode}
        editorTool={editorTool}
        error={error}
        game={draftGame}
        gameJson={gameJson}
        gameplayPanel={<GameplayConfigPanel game={draftGame} onChange={setDraftGame} />}
        inspectorTab={inspectorTab}
        isPlaytestMode={isPlaytestMode}
        logs={logs}
        mapPanel={<MapConfigPanel game={draftGame} onChange={setDraftGame} />}
        preview={preview}
        previewGame={previewGame}
        sceneSummary={null}
        selectedObject={selectedObject}
        validationMessage={validationMessage}
        validationOk={validation.ok}
        viewportOverlayMode={viewportOverlayMode}
        onBottomTabChange={setBottomTab}
        onEditorToolChange={setEditorTool}
        onEnterEditMode={enterEditMode}
        onEnterPlaytestMode={enterPlaytestMode}
        onExportGame={() => exportGameJson(draftGame, setError)}
        onImportGame={() => fileInputRef.current?.click()}
        onInspectorTabChange={setInspectorTab}
        onSelectObject={(nextSelectedObject) => {
          setSelectedObject(nextSelectedObject);
          setInspectorTab("properties");
        }}
        onViewportOverlayModeChange={setViewportOverlayMode}
      />
      <input
        ref={fileInputRef}
        accept="application/json,.json"
        className="hidden-file-input"
        type="file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) {
            void importGameJson(file, setDraftGame, setError);
          }
        }}
      />
    </>
  );
}
