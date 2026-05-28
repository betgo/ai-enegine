import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game } from "./test-helpers";

describe("createTowerDefenseRuntime waves", () => {
  it("spawns start-time-zero waves during initialization", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    expect(runtime.getState().waves).toEqual([
      {
        id: "wave-1",
        spawnedCount: 1,
        totalCount: 1,
        completed: true
      }
    ]);
    expect(runtime.getState().monsters[0]).toMatchObject({
      id: "wave-1:0",
      pathId: "main",
      hp: 10,
      leakDamage: 3,
      position: { x: 0, y: 0 },
      pathProgress: 0,
      status: "active"
    });
  });

  it("spawns later monsters and updates wave progress", () => {
    const runtime = createTowerDefenseRuntime({
      game: withWave({
        id: "wave-1",
        startTimeMs: 500,
        unitId: "monster-basic",
        pathId: "main",
        count: 2,
        intervalMs: 250
      }),
      rendererFactory: () => createRendererDouble()
    });

    expect(runtime.getState().monsters).toHaveLength(0);
    expect(runtime.getState().waves[0]).toEqual({
      id: "wave-1",
      spawnedCount: 0,
      totalCount: 2,
      completed: false
    });

    runtime.tick(500);
    expect(runtime.getState().monsters.map((monster) => monster.id)).toEqual(["wave-1:0"]);
    expect(runtime.getState().waves[0].spawnedCount).toBe(1);

    runtime.tick(250);
    expect(runtime.getState().monsters.map((monster) => monster.id)).toEqual(["wave-1:0", "wave-1:1"]);
    expect(runtime.getState().waves[0]).toEqual({
      id: "wave-1",
      spawnedCount: 2,
      totalCount: 2,
      completed: true
    });
  });

  it("produces same state for equivalent ticks across spawn and attack boundaries", () => {
    const gameWithDelayedSpawn = withWave({
      id: "wave-1",
      startTimeMs: 500,
      unitId: "monster-basic",
      pathId: "main",
      count: 1,
      intervalMs: 1000
    });
    const singleTickRuntime = createTowerDefenseRuntime({
      game: gameWithDelayedSpawn,
      rendererFactory: () => createRendererDouble()
    });
    const splitTickRuntime = createTowerDefenseRuntime({
      game: gameWithDelayedSpawn,
      rendererFactory: () => createRendererDouble()
    });

    singleTickRuntime.tick(1000);
    splitTickRuntime.tick(500);
    splitTickRuntime.tick(500);

    expect(splitTickRuntime.getState()).toEqual(singleTickRuntime.getState());
  });

  it("fails fast for invalid wave ids and references", () => {
    expect(() =>
      createTowerDefenseRuntime({
        game: {
          ...game,
          waves: [
            {
              id: "wave-1",
              startTimeMs: 500,
              unitId: "unknown-unit",
              pathId: "main",
              count: 1,
              intervalMs: 1000
            }
          ]
        },
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("wave unit not found: unknown-unit");

    expect(() =>
      createTowerDefenseRuntime({
        game: {
          ...game,
          waves: [
            {
              id: "wave-1",
              startTimeMs: 500,
              unitId: "monster-basic",
              pathId: "unknown-path",
              count: 1,
              intervalMs: 1000
            }
          ]
        },
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("wave path not found: unknown-path");

    expect(() =>
      createTowerDefenseRuntime({
        game: {
          ...game,
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
              id: "wave-1",
              startTimeMs: 500,
              unitId: "monster-basic",
              pathId: "main",
              count: 1,
              intervalMs: 1000
            }
          ]
        },
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("duplicate wave id: wave-1");
  });
});

function withWave(wave: GameDefinition["waves"][number]): GameDefinition {
  return {
    ...game,
    waves: [wave],
    towers: [
      {
        id: "tower-1",
        slotId: "slot-1",
        range: 8,
        attackIntervalMs: 500,
        damage: 2
      }
    ]
  };
}
