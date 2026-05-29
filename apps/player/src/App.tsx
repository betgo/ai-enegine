import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTowerDefenseRuntime,
  type RuntimeSimulationState,
  type TowerDefenseRuntime
} from "@ai-enegine/runtime";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  consumeFixedSteps,
  parsePlayerGameJson,
  SIM_STEP_MS
} from "./player-state";
import sampleGame from "./game.sample.json";

type RunMode = "playing" | "paused";

export function App() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<TowerDefenseRuntime | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const [game, setGame] = useState<GameDefinition>(() => structuredClone(sampleGame as GameDefinition));
  const [runMode, setRunMode] = useState<RunMode>("paused");
  const [runtimeKey, setRuntimeKey] = useState(0);
  const [state, setState] = useState<RuntimeSimulationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncState = useCallback(() => {
    const runtime = runtimeRef.current;

    if (!runtime) {
      setState(null);
      return;
    }

    runtime.render();
    setState(runtime.getState());
  }, []);

  const resetRuntime = useCallback(() => {
    setRunMode("paused");
    accumulatedMsRef.current = 0;
    lastFrameTimeRef.current = null;
    setRuntimeKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    const container = viewportRef.current;

    if (!container) {
      setState(null);
      return;
    }

    try {
      const runtime = createTowerDefenseRuntime({
        game,
        container,
        width: container.clientWidth,
        height: container.clientHeight
      });

      runtimeRef.current = runtime;
      runtime.render();
      setState(runtime.getState());
      setError(null);

      return () => {
        runtime.dispose();
        if (runtimeRef.current === runtime) {
          runtimeRef.current = null;
        }
      };
    } catch (caughtError) {
      runtimeRef.current = null;
      setState(null);
      setError(caughtError instanceof Error ? caughtError.message : "Player runtime failed");
    }
  }, [game, runtimeKey]);

  useEffect(() => {
    if (runMode !== "playing") {
      lastFrameTimeRef.current = null;
      return;
    }

    const onFrame = (timestamp: number) => {
      const runtime = runtimeRef.current;
      const lastTimestamp = lastFrameTimeRef.current ?? timestamp;
      const deltaMs = timestamp - lastTimestamp;
      const stepResult = consumeFixedSteps(accumulatedMsRef.current, deltaMs);

      lastFrameTimeRef.current = timestamp;
      accumulatedMsRef.current = stepResult.remainingMs;

      if (runtime) {
        for (let index = 0; index < stepResult.steps; index += 1) {
          runtime.tick(SIM_STEP_MS);
        }

        runtime.render();
        const nextState = runtime.getState();
        setState(nextState);

        if (nextState.status !== "running") {
          setRunMode("paused");
          return;
        }
      }

      frameRef.current = window.requestAnimationFrame(onFrame);
    };

    frameRef.current = window.requestAnimationFrame(onFrame);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [runMode]);

  const stepOnce = () => {
    runtimeRef.current?.tick(SIM_STEP_MS);
    syncState();
  };

  const importGame = async (file: File) => {
    const result = parsePlayerGameJson(await file.text());

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setGame(structuredClone(result.game));
    setRunMode("paused");
    accumulatedMsRef.current = 0;
    lastFrameTimeRef.current = null;
    setRuntimeKey((currentKey) => currentKey + 1);
    setError(null);
  };

  const activeMonsterCount = state?.monsters.filter((monster) => monster.status === "active").length ?? 0;
  const waveSummary = state?.waves
    .map((wave) => `${wave.id}: ${wave.spawnedCount}/${wave.totalCount}`)
    .join(", ") ?? "No waves";

  return (
    <main className="player-shell">
      <section className="viewport" ref={viewportRef} aria-label="Playable tower defense runtime" />
      <aside className="hud" aria-label="Runtime controls and state">
        <header>
          <p className="eyebrow">Playable Runtime</p>
          <h1>{game.map.name}</h1>
          <p className={state?.status === "running" ? "status" : "terminal-status"}>
            {state?.status ?? "loading"}
          </p>
          {error ? <p className="error">{error}</p> : null}
        </header>

        <section className="panel" aria-labelledby="controls-heading">
          <h2 id="controls-heading">Controls</h2>
          <div className="control-grid">
            <button type="button" disabled={state?.status !== "running"} onClick={() => setRunMode("playing")}>
              Play
            </button>
            <button type="button" onClick={() => setRunMode("paused")}>
              Pause
            </button>
            <button type="button" disabled={state?.status !== "running"} onClick={stepOnce}>
              Step
            </button>
            <button type="button" onClick={resetRuntime}>
              Reset
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
                  void importGame(file);
                }
              }}
            />
          </div>
        </section>

        <section className="panel" aria-labelledby="hud-heading">
          <h2 id="hud-heading">HUD</h2>
          <dl>
            <div>
              <dt>Mode</dt>
              <dd>{runMode}</dd>
            </div>
            <div>
              <dt>Elapsed</dt>
              <dd>{state?.elapsedMs ?? 0}ms</dd>
            </div>
            <div>
              <dt>Base HP</dt>
              <dd>
                {state?.base.hp ?? "-"} / {state?.base.maxHp ?? "-"}
              </dd>
            </div>
            <div>
              <dt>Active Monsters</dt>
              <dd>{activeMonsterCount}</dd>
            </div>
            <div>
              <dt>Waves</dt>
              <dd>{waveSummary}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </main>
  );
}
