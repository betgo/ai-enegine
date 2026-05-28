import { describe, expect, it } from "vitest";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game, withUnitsAsWave } from "./test-helpers";

describe("createTowerDefenseRuntime tower targeting", () => {
  it("uses deterministic targeting by pathProgress then id", () => {
    const runtime = createRuntimeWithUnits(["monster-b", "monster-a"]);

    runtime.tick(500);
    const state = runtime.getState();
    const monsterA = state.monsters.find((monster) => monster.id === "wave-a:0");
    const monsterB = state.monsters.find((monster) => monster.id === "wave-b:0");

    expect(monsterA?.hp).toBe(7);
    expect(monsterB?.hp).toBe(10);
  });

  it("uses id order independent of unit array order", () => {
    const firstRuntime = createRuntimeWithUnits(["monster-b", "monster-a"]);
    const secondRuntime = createRuntimeWithUnits(["monster-a", "monster-b"]);

    firstRuntime.tick(500);
    secondRuntime.tick(500);

    const firstTarget = firstRuntime.getState().monsters.find((monster) => monster.id === "wave-a:0");
    const secondTarget = secondRuntime.getState().monsters.find((monster) => monster.id === "wave-a:0");

    expect(firstTarget?.hp).toBe(7);
    expect(secondTarget?.hp).toBe(7);
  });

  it("does not target monsters with zero hp", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...withUnitsAsWave([
          {
            id: "monster-a",
            kind: "monster",
            speed: 1,
            maxHp: 1,
            leakDamage: 1
          },
          {
            id: "monster-b",
            kind: "monster",
            speed: 1,
            maxHp: 10,
            leakDamage: 1
          }
        ]),
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
    const monsterA = state.monsters.find((monster) => monster.id === "wave-1:0");
    const monsterB = state.monsters.find((monster) => monster.id === "wave-2:0");

    expect(monsterA?.hp).toBe(0);
    expect(monsterA?.status).toBe("dead");
    expect(monsterB?.hp).toBe(7);
  });
});

function createRuntimeWithUnits(unitIds: string[]) {
  const units = unitIds.map((id) => ({
    id,
    kind: "monster" as const,
    speed: 1,
    maxHp: 10,
    leakDamage: 1
  }));

  return createTowerDefenseRuntime({
    game: {
      ...withUnitsAsWave(units),
      waves: units.map((unit) => ({
        id: unit.id === "monster-a" ? "wave-a" : "wave-b",
        startTimeMs: 0,
        unitId: unit.id,
        pathId: "main",
        count: 1,
        intervalMs: 1000
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
