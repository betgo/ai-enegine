import { useEffect, useMemo, useRef, useState } from "react";
import type { SceneSummary } from "@ai-enegine/runtime";
import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";
import {
  exportGameJson,
  importGameJson
} from "./browser-file";
import { GameplayConfigPanel } from "./GameplayConfigPanel";
import { InteractivePreview } from "./InteractivePreview";
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

const editorTools: Array<{ id: EditorTool; label: string }> = [
  { id: "select", label: "Select" },
  { id: "add-path-point", label: "Add Path Point" },
  { id: "add-tower-slot", label: "Add Tower Slot" }
];

export function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sceneSummary, setSceneSummary] = useState<SceneSummary | null>(null);
  const [draftGame, setDraftGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const [previewGame, setPreviewGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [editorTool, setEditorTool] = useState<EditorTool>("select");
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
  const selectedLabel = getSelectedMapObjectLabel(selectedObject);
  const isPlaytestMode = editorMode === "playtest" && playtestGame !== null;

  function enterEditMode() {
    setEditorMode("edit");
    setPlaytestGame(null);
  }

  function enterPlaytestMode() {
    if (!validation.ok) {
      return;
    }

    setSelectedObject(null);
    setPlaytestGame(createPlaytestSnapshot(draftGame));
    setEditorMode("playtest");
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        {isPlaytestMode ? (
          <PlaytestPreview
            game={playtestGame}
            onBackToEdit={enterEditMode}
            onError={setError}
          />
        ) : (
          <InteractivePreview
            game={previewGame}
            onChange={setDraftGame}
            onError={setError}
            onSceneSummaryChange={setSceneSummary}
            onSelectedObjectChange={setSelectedObject}
            selectedObject={selectedObject}
            tool={editorTool}
          />
        )}
        <aside className="inspector" aria-label="Map editor">
          <header className="inspector-header">
            <h1>Map Editor</h1>
            <p className={validation.ok ? "status" : "error"}>{validationMessage}</p>
            {error ? <p className="error">{error}</p> : null}
          </header>

          <section className="editor-section" aria-labelledby="tools-heading">
            <h2 id="tools-heading">Tools</h2>
            <div className="mode-row" role="group" aria-label="Editor mode">
              <button
                aria-pressed={editorMode === "edit"}
                className={editorMode === "edit" ? "active-tool" : undefined}
                type="button"
                onClick={enterEditMode}
              >
                Edit
              </button>
              <button
                aria-pressed={editorMode === "playtest"}
                className={editorMode === "playtest" ? "active-tool" : undefined}
                disabled={!validation.ok}
                type="button"
                onClick={enterPlaytestMode}
              >
                Playtest
              </button>
            </div>
            <div className="tool-row" role="group" aria-label="Editor tools">
              {editorTools.map((tool) => (
                <button
                  aria-pressed={editorTool === tool.id}
                  className={editorTool === tool.id ? "active-tool" : undefined}
                  disabled={editorMode !== "edit"}
                  key={tool.id}
                  type="button"
                  onClick={() => setEditorTool(tool.id)}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <dl>
              <div>
                <dt>Mode</dt>
                <dd>{editorMode}</dd>
              </div>
              <div>
                <dt>Selected</dt>
                <dd>{selectedLabel}</dd>
              </div>
              {playtestGame ? (
                <div>
                  <dt>Playtest source</dt>
                  <dd>{playtestGame.map.name}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="editor-section" aria-labelledby="file-actions-heading">
            <h2 id="file-actions-heading">File</h2>
            <div className="action-row">
              <button disabled={!validation.ok} type="button" onClick={() => exportGameJson(draftGame, setError)}>
                Export JSON
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                Import JSON
              </button>
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
            </div>
          </section>

          <section className="editor-section" aria-labelledby="map-summary-heading">
            <h2 id="map-summary-heading">Runtime</h2>
            <dl>
              <div>
                <dt>Map</dt>
                <dd>{previewGame.map.name}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>
                  {previewGame.map.size.width} x {previewGame.map.size.height}
                </dd>
              </div>
              <div>
                <dt>Tiles</dt>
                <dd>{sceneSummary?.tileCount ?? previewGame.map.tiles.length}</dd>
              </div>
              <div>
                <dt>Paths</dt>
                <dd>{sceneSummary?.pathCount ?? previewGame.map.paths.length}</dd>
              </div>
              <div>
                <dt>Tower slots</dt>
                <dd>{sceneSummary?.towerSlotCount ?? previewGame.map.towerSlots.length}</dd>
              </div>
            </dl>
          </section>

          <MapConfigPanel game={draftGame} onChange={setDraftGame} />
          <GameplayConfigPanel game={draftGame} onChange={setDraftGame} />

          <section className="editor-section json-section" aria-labelledby="json-heading">
            <h2 id="json-heading">game.json</h2>
            <textarea readOnly value={gameJson} aria-label="Current game JSON" />
          </section>
        </aside>
      </section>
    </main>
  );
}
