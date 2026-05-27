import { useEffect, useMemo, useRef, useState } from "react";
import { createTowerDefenseRuntime, type TowerDefenseRuntime } from "@ai-enegine/runtime";
import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";
import sampleGame from "./game.sample.json";

export function App() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<TowerDefenseRuntime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const game = sampleGame as GameDefinition;
  const validation = useMemo(() => validateGameDefinition(game), [game]);

  useEffect(() => {
    const container = viewportRef.current;

    if (!container || !validation.ok) {
      return;
    }

    const runtime = createTowerDefenseRuntime({
      game,
      container,
      width: container.clientWidth,
      height: container.clientHeight
    });

    runtime.render();
    runtimeRef.current = runtime;
    setError(null);

    return () => {
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
    };
  }, [game, validation.ok]);

  const summary = runtimeRef.current?.getSceneSummary();

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="preview-panel" ref={viewportRef} aria-label="3D tower defense runtime preview" />
        <aside className="inspector" aria-label="Runtime data">
          <h1>3D Tower Defense Runtime</h1>
          <dl>
            <div>
              <dt>Map</dt>
              <dd>{game.map.name}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>
                {game.map.size.width} x {game.map.size.height}
              </dd>
            </div>
            <div>
              <dt>Tiles</dt>
              <dd>{summary?.tileCount ?? game.map.tiles.length}</dd>
            </div>
            <div>
              <dt>Paths</dt>
              <dd>{summary?.pathCount ?? game.map.paths.length}</dd>
            </div>
            <div>
              <dt>Tower slots</dt>
              <dd>{summary?.towerSlotCount ?? game.map.towerSlots.length}</dd>
            </div>
          </dl>
          {validation.ok ? <p className="status">Loaded from game.sample.json</p> : null}
          {!validation.ok ? <p className="error">{validation.errors.join(", ")}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </aside>
      </section>
    </main>
  );
}
