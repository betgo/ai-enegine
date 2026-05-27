import { describe, expect, it } from "vitest";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game } from "./test-helpers";

describe("createTowerDefenseRuntime tower targeting", () => {
  it("uses deterministic targeting by pathProgress then id", () => {
    const runtime = createRuntimeWithUnits(["monster-b", "monster-a"]);

    runtime.tick(500);
    const state = runtime.getState();
    const monsterA = state.monsters.find((monster) => monster.id === "monster-a");
    const monsterB = state.monsters.find((monster) => monster.id === "monster-b");

    expect(monsterA?.hp).toBe(7);
    expect(monsterB?.hp).toBe(10);
  });

  it("uses id order independent of unit array order", () => {
    const firstRuntime = createRuntimeWithUnits(["monster-b", "monster-a"]);
    const secondRuntime = createRuntimeWithUnits(["monster-a", "monster-b"]);

    firstRuntime.tick(500);
    secondRuntime.tick(500);

    const firstTarget = firstRuntime.getState().monsters.find((monster) => monster.id === "monster-a");
    const secondTarget = secondRuntime.getState().monsters.find((monster) => monster.id === "monster-a");

    expect(firstTarget?.hp).toBe(7);
    expect(secondTarget?.hp).toBe(7);
  });

  it("does not target monsters with zero hp", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        units: [
          {
            id: "monster-a",
            kind: "monster",
            pathId: "main",
            speed: 1,
            maxHp: 1
          },
          {
            id: "monster-b",
            kind: "monster",
            pathId: "main",
            speed: 1,
            maxHp: 10
          }
        ],
        towers: [
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 250,
            damage: 3
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(500);
    const state = runtime.getState();
    const monsterA = state.monsters.find((monster) => monster.id === "monster-a");
    const monsterB = state.monsters.find((monster) => monster.id === "monster-b");

    expect(monsterA?.hp).toBe(0);
    expect(monsterB?.hp).toBe(7);
  });
});

function createRuntimeWithUnits(unitIds: string[]) {
  return createTowerDefenseRuntime({
    game: {
      ...game,
      units: unitIds.map((id) => ({
        id,
        kind: "monster",
        pathId: "main",
        speed: 1,
        maxHp: 10
      })),
      towers: [
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 8,
          attackIntervalMs: 500,
          damage: 3
        }
      ]
    },
    rendererFactory: () => createRendererDouble()
  });
}
