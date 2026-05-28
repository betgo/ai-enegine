import { useEffect, useMemo, useRef, useState } from "react";
import {
  createTowerDefenseRuntime,
  type SceneSummary,
  type TowerDefenseRuntime
} from "@ai-enegine/runtime";
import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";
import {
  exportGameJson,
  importGameJson
} from "./browser-file";
import {
  addPathPoint,
  addTowerSlot,
  removePathPoint,
  updateMapSize,
  updatePathPoint,
  updateTowerSlot
} from "./editor-state";
import { NumberField } from "./NumberField";
import sampleGame from "./game.sample.json";

export function App() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<TowerDefenseRuntime | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sceneSummary, setSceneSummary] = useState<SceneSummary | null>(null);
  const [draftGame, setDraftGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const [previewGame, setPreviewGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const validation = useMemo(() => validateGameDefinition(draftGame), [draftGame]);
  const gameJson = useMemo(() => JSON.stringify(draftGame, null, 2), [draftGame]);

  useEffect(() => {
    if (validation.ok) {
      setPreviewGame(structuredClone(draftGame));
    }
  }, [draftGame, validation.ok]);

  useEffect(() => {
    const container = viewportRef.current;

    if (!container) {
      setSceneSummary(null);
      return;
    }

    try {
      const runtime = createTowerDefenseRuntime({
        game: previewGame,
        container,
        width: container.clientWidth,
        height: container.clientHeight
      });

      runtime.render();
      runtimeRef.current = runtime;
      setSceneSummary(runtime.getSceneSummary());
      setError(null);

      return () => {
        runtime.dispose();
        if (runtimeRef.current === runtime) {
          runtimeRef.current = null;
        }
      };
    } catch (caughtError) {
      runtimeRef.current = null;
      setSceneSummary(null);
      setError(caughtError instanceof Error ? caughtError.message : "Runtime preview failed");
    }
  }, [previewGame]);

  const validationMessage = validation.ok ? "JSON valid" : validation.errors.join(", ");

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="preview-panel" ref={viewportRef} aria-label="3D tower defense runtime preview" />
        <aside className="inspector" aria-label="Map editor">
          <header className="inspector-header">
            <h1>Map Editor</h1>
            <p className={validation.ok ? "status" : "error"}>{validationMessage}</p>
            {error ? <p className="error">{error}</p> : null}
          </header>

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

          <section className="editor-section" aria-labelledby="map-size-heading">
            <h2 id="map-size-heading">Map Size</h2>
            <div className="field-grid">
              <NumberField
                label="Width"
                min={1}
                value={draftGame.map.size.width}
                onChange={(value) => setDraftGame((currentGame) => updateMapSize(currentGame, "width", value))}
              />
              <NumberField
                label="Height"
                min={1}
                value={draftGame.map.size.height}
                onChange={(value) => setDraftGame((currentGame) => updateMapSize(currentGame, "height", value))}
              />
            </div>
          </section>

          <section className="editor-section" aria-labelledby="path-points-heading">
            <h2 id="path-points-heading">Path Points</h2>
            {draftGame.map.paths.map((path) => (
              <div className="item-list" key={path.id}>
                <div className="section-title-row">
                  <h3>{path.id}</h3>
                  <button type="button" onClick={() => setDraftGame((currentGame) => addPathPoint(currentGame, path.id))}>
                    Add point
                  </button>
                </div>
                {path.points.map((point, pointIndex) => (
                  <div className="field-row" key={`${path.id}:${pointIndex}`}>
                    <span>#{pointIndex + 1}</span>
                    <NumberField
                      label="X"
                      min={0}
                      value={point.x}
                      onChange={(value) =>
                        setDraftGame((currentGame) => updatePathPoint(currentGame, path.id, pointIndex, "x", value))
                      }
                    />
                    <NumberField
                      label="Y"
                      min={0}
                      value={point.y}
                      onChange={(value) =>
                        setDraftGame((currentGame) => updatePathPoint(currentGame, path.id, pointIndex, "y", value))
                      }
                    />
                    <button
                      disabled={path.points.length <= 2}
                      type="button"
                      onClick={() =>
                        setDraftGame((currentGame) => removePathPoint(currentGame, path.id, pointIndex))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section className="editor-section" aria-labelledby="tower-slots-heading">
            <div className="section-title-row">
              <h2 id="tower-slots-heading">Tower Slots</h2>
              <button type="button" onClick={() => setDraftGame((currentGame) => addTowerSlot(currentGame))}>
                Add slot
              </button>
            </div>
            <div className="item-list">
              {draftGame.map.towerSlots.map((slot) => (
                <div className="field-row" key={slot.id}>
                  <span>{slot.id}</span>
                  <NumberField
                    label="X"
                    min={0}
                    value={slot.x}
                    onChange={(value) => setDraftGame((currentGame) => updateTowerSlot(currentGame, slot.id, "x", value))}
                  />
                  <NumberField
                    label="Y"
                    min={0}
                    value={slot.y}
                    onChange={(value) => setDraftGame((currentGame) => updateTowerSlot(currentGame, slot.id, "y", value))}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="editor-section json-section" aria-labelledby="json-heading">
            <h2 id="json-heading">game.json</h2>
            <textarea readOnly value={gameJson} aria-label="Current game JSON" />
          </section>
        </aside>
      </section>
    </main>
  );
}
