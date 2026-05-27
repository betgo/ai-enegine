import { describe, expect, it } from "vitest";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game } from "./test-helpers";

describe("createTowerDefenseRuntime", () => {
  it("creates a renderable scene from a game definition", () => {
    const renderer = createRendererDouble();

    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => renderer
    });

    expect(runtime.getSceneSummary()).toEqual({
      mapId: "demo-map",
      mapSize: {
        width: 4,
        height: 3
      },
      tileCount: 3,
      pathCount: 1,
      towerSlotCount: 1
    });
    expect(runtime.scene.children.length).toBeGreaterThan(0);

    runtime.dispose();
  });

  it("disposes renderer resources", () => {
    const renderer = createRendererDouble();
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => renderer
    });

    runtime.dispose();

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
  });

  it("initializes simulation state from units", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    expect(runtime.getState()).toEqual({
      elapsedMs: 0,
      monsters: [
        {
          id: "monster-1",
          pathId: "main",
          hp: 10,
          position: { x: 0, y: 0 },
          pathProgress: 0,
          reachedEnd: false
        }
      ],
      towers: []
    });
  });

  it("produces deterministic state for the same tick sequence", () => {
    const runtimeA = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });
    const runtimeB = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });
    const ticks = [100, 250, 750, 300];

    ticks.forEach((deltaMs) => {
      runtimeA.tick(deltaMs);
      runtimeB.tick(deltaMs);
    });

    expect(runtimeA.getState()).toEqual(runtimeB.getState());
  });

  it("produces the same movement result for equivalent tick totals", () => {
    const singleTickRuntime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });
    const splitTickRuntime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    singleTickRuntime.tick(1000);
    [250, 250, 250, 250].forEach((deltaMs) => {
      splitTickRuntime.tick(deltaMs);
    });

    expect(splitTickRuntime.getState()).toEqual(singleTickRuntime.getState());
  });

  it("rejects duplicate path ids before creating simulation state", () => {
    expect(() =>
      createTowerDefenseRuntime({
        game: {
          ...game,
          map: {
            ...game.map,
            paths: [
              {
                id: "main",
                points: [
                  { x: 0, y: 0 },
                  { x: 3, y: 2 }
                ]
              },
              {
                id: "main",
                points: [
                  { x: 0, y: 1 },
                  { x: 3, y: 2 }
                ]
              }
            ]
          }
        },
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("duplicate path id: main");
  });

  it("rejects duplicate unit ids before creating simulation state", () => {
    expect(() =>
      createTowerDefenseRuntime({
        game: {
          ...game,
          units: [
            ...game.units,
            {
              id: "monster-1",
              kind: "monster",
              pathId: "main",
              speed: 2,
              maxHp: 10
            }
          ]
        },
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("duplicate unit id: monster-1");
  });

  it("rejects zero-length paths before creating simulation state", () => {
    expect(() =>
      createTowerDefenseRuntime({
        game: {
          ...game,
          map: {
            ...game.map,
            paths: [
              {
                id: "main",
                points: [
                  { x: 1, y: 1 },
                  { x: 1, y: 1 }
                ]
              }
            ]
          }
        },
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("path must have a positive total length: main");
  });

  it("moves monsters across multi-segment paths with linear interpolation", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        map: {
          ...game.map,
          paths: [
            {
              id: "zigzag",
              points: [
                { x: 0, y: 0 },
                { x: 2, y: 0 },
                { x: 2, y: 2 }
              ]
            }
          ]
        },
        units: [
          {
            id: "monster-zigzag",
            kind: "monster",
            pathId: "zigzag",
            speed: 2,
            maxHp: 10
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(1500);
    const state = runtime.getState();
    const monster = state.monsters[0];

    expect(state.elapsedMs).toBe(1500);
    expect(monster.pathProgress).toBeCloseTo(3, 6);
    expect(monster.position.x).toBeCloseTo(2, 6);
    expect(monster.position.y).toBeCloseTo(1, 6);
    expect(monster.reachedEnd).toBe(false);
  });

  it("stops at the path end and keeps reachedEnd true", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(4000);
    const stateAtEnd = runtime.getState();
    const monsterAtEnd = stateAtEnd.monsters[0];

    expect(monsterAtEnd.reachedEnd).toBe(true);
    expect(monsterAtEnd.position).toEqual({ x: 3, y: 2 });

    runtime.tick(1000);
    const stateAfterExtraTick = runtime.getState();
    const monsterAfterExtraTick = stateAfterExtraTick.monsters[0];

    expect(monsterAfterExtraTick.reachedEnd).toBe(true);
    expect(monsterAfterExtraTick.position).toEqual({ x: 3, y: 2 });
    expect(monsterAfterExtraTick.pathProgress).toBe(monsterAtEnd.pathProgress);
  });

  it("returns a cloned state to prevent external mutation", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    const state = runtime.getState();
    state.elapsedMs = 9999;
    state.monsters[0].position.x = 9999;

    expect(runtime.getState()).toEqual({
      elapsedMs: 0,
      monsters: [
        {
          id: "monster-1",
          pathId: "main",
          hp: 10,
          position: { x: 0, y: 0 },
          pathProgress: 0,
          reachedEnd: false
        }
      ],
      towers: []
    });
  });

});
