import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game } from "./test-helpers";

describe("createTowerDefenseRuntime game state", () => {
  it("starts as running while any active monster remains", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    expect(runtime.getState().status).toBe("running");
  });

  it("becomes victory after all waves complete and no monsters are active", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        towers: [
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 100,
            damage: 10
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(100);

    expect(runtime.getState().status).toBe("victory");
  });

  it("becomes defeat when base hp reaches zero", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        base: {
          maxHp: 3
        }
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(4000);

    expect(runtime.getState().status).toBe("defeat");
  });

  it("does not advance state after victory", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        towers: [
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 100,
            damage: 10
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(100);
    const stateAtVictory = runtime.getState();

    runtime.tick(1000);

    expect(runtime.getState()).toEqual(stateAtVictory);
  });

  it("does not advance state after defeat", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        base: {
          maxHp: 3
        }
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(4000);
    const stateAtDefeat = runtime.getState();

    runtime.tick(1000);

    expect(runtime.getState()).toEqual(stateAtDefeat);
  });

  it("does not spawn later waves after defeat in the same tick", () => {
    const gameWithDefeatBoundary = createDefeatBoundaryGame();
    const runtime = createTowerDefenseRuntime({
      game: gameWithDefeatBoundary,
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(1000);
    const state = runtime.getState();

    expect(state.status).toBe("defeat");
    expect(state.monsters.map((monster) => monster.id)).toEqual(["wave-1:0"]);
    expect(state.waves).toEqual([
      {
        id: "wave-1",
        spawnedCount: 1,
        totalCount: 1,
        completed: true
      },
      {
        id: "wave-2",
        spawnedCount: 0,
        totalCount: 1,
        completed: false
      }
    ]);
  });

  it("produces same terminal state for equivalent ticks across defeat boundary", () => {
    const gameWithDefeatBoundary = createDefeatBoundaryGame();
    const singleTickRuntime = createTowerDefenseRuntime({
      game: gameWithDefeatBoundary,
      rendererFactory: () => createRendererDouble()
    });
    const splitTickRuntime = createTowerDefenseRuntime({
      game: gameWithDefeatBoundary,
      rendererFactory: () => createRendererDouble()
    });

    singleTickRuntime.tick(1000);
    splitTickRuntime.tick(500);
    splitTickRuntime.tick(500);

    expect(splitTickRuntime.getState()).toEqual(singleTickRuntime.getState());
  });

  it("keeps definition input separate from simulation state", () => {
    const inputGame: GameDefinition = structuredClone(game);
    const originalGame = structuredClone(inputGame);
    const runtime = createTowerDefenseRuntime({
      game: inputGame,
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(500);

    expect(inputGame).toEqual(originalGame);
    expect(runtime.getState()).not.toEqual(inputGame);
  });
});

function createDefeatBoundaryGame(): GameDefinition {
  return {
    ...game,
    base: {
      maxHp: 3
    },
    map: {
      ...game.map,
      paths: [
        {
          id: "main",
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 }
          ]
        }
      ]
    },
    units: [
      {
        id: "monster-basic",
        kind: "monster",
        speed: 1,
        maxHp: 10,
        leakDamage: 3
      }
    ],
    waves: [
      {
        id: "wave-1",
        startTimeMs: 0,
        unitId: "monster-basic",
        pathId: "main",
        count: 1,
        intervalMs: 1000
      },
      {
        id: "wave-2",
        startTimeMs: 1000,
        unitId: "monster-basic",
        pathId: "main",
        count: 1,
        intervalMs: 1000
      }
    ]
  };
}
