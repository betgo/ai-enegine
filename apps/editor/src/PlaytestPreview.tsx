import { useCallback, useEffect, useRef, useState } from "react";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  createTowerDefenseRuntime,
  type RuntimeSimulationState,
  type TowerDefenseRuntime
} from "@ai-enegine/runtime";
import {
  consumeFixedSteps,
  SIM_STEP_MS
} from "./playtest-state";

type RunMode = "playing" | "paused";

interface PlaytestPreviewProps {
  game: GameDefinition;
  onBackToEdit(): void;
  onError(error: string | null): void;
}

export function PlaytestPreview({ game, onBackToEdit, onError }: PlaytestPreviewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<TowerDefenseRuntime | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const [runMode, setRunMode] = useState<RunMode>("paused");
  const [runtimeKey, setRuntimeKey] = useState(0);
  const [state, setState] = useState<RuntimeSimulationState | null>(null);

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
      onError(null);

      return () => {
        runtime.dispose();
        if (runtimeRef.current === runtime) {
          runtimeRef.current = null;
        }
      };
    } catch (caughtError) {
      runtimeRef.current = null;
      setState(null);
      onError(caughtError instanceof Error ? caughtError.message : "Playtest runtime failed");
    }
  }, [game, onError, runtimeKey]);

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

  const activeMonsterCount = state?.monsters.filter((monster) => monster.status === "active").length ?? 0;
  const elapsedMs = Math.round(state?.elapsedMs ?? 0);
  const waveSummary = state?.waves
    .map((wave) => `${wave.id}: ${wave.spawnedCount}/${wave.totalCount}`)
    .join(", ") ?? "No waves";

  return (
    <section className="playtest-preview-shell" aria-label="Editor playtest">
      <div className="preview-panel" ref={viewportRef} aria-label="Editor playtest runtime" />
      <aside className="playtest-panel" aria-label="Editor playtest controls and state">
        <section className="editor-section" aria-labelledby="playtest-controls-heading">
          <h2 id="playtest-controls-heading">Playtest Controls</h2>
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
            <button type="button" onClick={onBackToEdit}>
              Back to Edit
            </button>
          </div>
        </section>

        <section className="editor-section" aria-labelledby="playtest-hud-heading">
          <h2 id="playtest-hud-heading">Playtest HUD</h2>
          <dl>
            <div>
              <dt>Mode</dt>
              <dd>{runMode}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{state?.status ?? "loading"}</dd>
            </div>
            <div>
              <dt>Elapsed</dt>
              <dd>{elapsedMs}ms</dd>
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
    </section>
  );
}
