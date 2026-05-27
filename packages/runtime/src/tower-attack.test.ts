import { describe, expect, it } from "vitest";
import { validateGameDefinition } from "@ai-enegine/schema";
import sampleGame from "../../../apps/editor/src/game.sample.json";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game, withTowers } from "./test-helpers";

describe("createTowerDefenseRuntime tower attacks", () => {
  it("initializes tower simulation state", () => {
    const runtime = createTowerDefenseRuntime({
      game: withTowers([
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 3,
          attackIntervalMs: 1000,
          damage: 2
        }
      ]),
      rendererFactory: () => createRendererDouble()
    });

    expect(runtime.getState().towers).toEqual([
      {
        id: "tower-1",
        slotId: "slot-1",
        cooldownRemainingMs: 1000
      }
    ]);
  });

  it("does not damage monsters outside tower range", () => {
    const runtime = createTowerDefenseRuntime({
      game: withTowers([
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 0.5,
          attackIntervalMs: 1000,
          damage: 3
        }
      ]),
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(1000);

    expect(runtime.getState().monsters[0].hp).toBe(10);
  });

  it("applies damage once full attack interval has elapsed", () => {
    const runtime = createTowerDefenseRuntime({
      game: withTowers([
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 8,
          attackIntervalMs: 500,
          damage: 2
        }
      ]),
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(250);
    expect(runtime.getState().monsters[0].hp).toBe(10);

    runtime.tick(250);
    expect(runtime.getState().monsters[0].hp).toBe(8);
  });

  it("keeps cooldown timing while no target is in range", () => {
    const delayedTargetRuntime = createTowerDefenseRuntime({
      game: {
        ...game,
        map: {
          ...game.map,
          paths: [
            {
              id: "main",
              points: [
                { x: 0, y: 0 },
                { x: 2, y: 0 }
              ]
            }
          ],
          towerSlots: [
            {
              id: "slot-1",
              x: 1,
              y: 0
            }
          ]
        },
        units: [
          {
            id: "monster-1",
            kind: "monster",
            pathId: "main",
            speed: 1,
            maxHp: 10,
            leakDamage: 1
          }
        ],
        towers: [
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 0.25,
            attackIntervalMs: 1000,
            damage: 2
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    delayedTargetRuntime.tick(500);
    delayedTargetRuntime.tick(250);
    expect(delayedTargetRuntime.getState().monsters[0].hp).toBe(10);

    delayedTargetRuntime.tick(250);
    expect(delayedTargetRuntime.getState().monsters[0].hp).toBe(8);
  });

  it("produces same hp and cooldown for equivalent time partitioning", () => {
    const gameWithTower = withTowers([
      {
        id: "tower-1",
        slotId: "slot-1",
        range: 8,
        attackIntervalMs: 500,
        damage: 2
      }
    ]);
    const singleTickRuntime = createTowerDefenseRuntime({
      game: gameWithTower,
      rendererFactory: () => createRendererDouble()
    });
    const splitTickRuntime = createTowerDefenseRuntime({
      game: gameWithTower,
      rendererFactory: () => createRendererDouble()
    });

    singleTickRuntime.tick(1000);
    [250, 250, 250, 250].forEach((deltaMs) => {
      splitTickRuntime.tick(deltaMs);
    });

    expect(splitTickRuntime.getState()).toEqual(singleTickRuntime.getState());
  });

  it("clamps monster hp at zero", () => {
    const runtime = createTowerDefenseRuntime({
      game: withTowers([
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 8,
          attackIntervalMs: 250,
          damage: 20
        }
      ]),
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(500);

    const state = runtime.getState();
    expect(state.monsters[0].hp).toBe(0);
    expect(state.monsters[0].status).toBe("dead");
    expect(state.base.hp).toBe(20);
  });

  it("returns cloned tower state to prevent external mutation", () => {
    const runtime = createTowerDefenseRuntime({
      game: withTowers([
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 8,
          attackIntervalMs: 1000,
          damage: 2
        }
      ]),
      rendererFactory: () => createRendererDouble()
    });

    const state = runtime.getState();
    state.towers[0].cooldownRemainingMs = 999;

    expect(runtime.getState().towers[0].cooldownRemainingMs).toBe(1000);
  });

  it("fails fast for duplicate tower id / slotId and unknown slotId", () => {
    expect(() =>
      createTowerDefenseRuntime({
        game: withTowers([
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 1000,
            damage: 2
          },
          {
            id: "tower-1",
            slotId: "slot-2",
            range: 8,
            attackIntervalMs: 1000,
            damage: 2
          }
        ]),
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("duplicate tower id: tower-1");

    expect(() =>
      createTowerDefenseRuntime({
        game: withTowers([
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 1000,
            damage: 2
          },
          {
            id: "tower-2",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 1000,
            damage: 2
          }
        ]),
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("duplicate tower slotId: slot-1");

    expect(() =>
      createTowerDefenseRuntime({
        game: withTowers([
          {
            id: "tower-1",
            slotId: "unknown-slot",
            range: 8,
            attackIntervalMs: 1000,
            damage: 2
          }
        ]),
        rendererFactory: () => createRendererDouble()
      })
    ).toThrow("tower slot not found: unknown-slot");
  });

  it("accepts sample game schema and initializes runtime", () => {
    const sample = JSON.parse(JSON.stringify(sampleGame));
    const validation = validateGameDefinition(sample);

    expect(validation.ok).toBe(true);

    const runtime = createTowerDefenseRuntime({
      game: sample,
      rendererFactory: () => createRendererDouble()
    });

    expect(runtime.getSceneSummary().mapId).toBe("td-demo");
    expect(runtime.getState().monsters.length).toBeGreaterThanOrEqual(1);
  });
});
