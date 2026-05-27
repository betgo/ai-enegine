import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game } from "./test-helpers";

describe("createTowerDefenseRuntime health system", () => {
  it("escapes at path end and only applies leak damage once", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(4000);
    const stateAtEnd = runtime.getState();
    const monsterAtEnd = stateAtEnd.monsters[0];

    expect(stateAtEnd.base.hp).toBe(17);
    expect(monsterAtEnd.status).toBe("escaped");
    expect(monsterAtEnd.position).toEqual({ x: 3, y: 2 });

    runtime.tick(1000);
    const stateAfterExtraTick = runtime.getState();
    const monsterAfterExtraTick = stateAfterExtraTick.monsters[0];

    expect(stateAfterExtraTick.base.hp).toBe(17);
    expect(monsterAfterExtraTick.status).toBe("escaped");
    expect(monsterAfterExtraTick.position).toEqual({ x: 3, y: 2 });
    expect(monsterAfterExtraTick.pathProgress).toBe(monsterAtEnd.pathProgress);
  });

  it("keeps escaped monsters out of tower targeting", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        units: [
          {
            id: "monster-escape",
            kind: "monster",
            pathId: "main",
            speed: 100,
            maxHp: 10,
            leakDamage: 1
          },
          {
            id: "monster-active",
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
            range: 8,
            attackIntervalMs: 100,
            damage: 2
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(100);
    const state = runtime.getState();
    const escapedMonster = state.monsters.find((monster) => monster.id === "monster-escape");
    const activeMonster = state.monsters.find((monster) => monster.id === "monster-active");

    expect(escapedMonster?.status).toBe("escaped");
    expect(escapedMonster?.hp).toBe(10);
    expect(activeMonster?.hp).toBe(8);
  });

  it("clamps base hp to zero when escaped monsters overflow damage", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        base: {
          maxHp: 5
        },
        units: [
          {
            id: "monster-1",
            kind: "monster",
            pathId: "main",
            speed: 2,
            maxHp: 10,
            leakDamage: 4
          },
          {
            id: "monster-2",
            kind: "monster",
            pathId: "main",
            speed: 2,
            maxHp: 10,
            leakDamage: 4
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(4000);

    expect(runtime.getState().base.hp).toBe(0);
  });

  it("dead monsters no longer move, leak or get retargeted", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        units: [
          {
            id: "monster-a",
            kind: "monster",
            pathId: "main",
            speed: 2,
            maxHp: 10,
            leakDamage: 4
          },
          {
            id: "monster-b",
            kind: "monster",
            pathId: "main",
            speed: 2,
            maxHp: 10,
            leakDamage: 4
          }
        ],
        towers: [
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 8,
            attackIntervalMs: 250,
            damage: 50
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(250);
    const afterFirstHit = runtime.getState();
    const deadMonster = afterFirstHit.monsters.find((monster) => monster.id === "monster-a");
    const aliveMonster = afterFirstHit.monsters.find((monster) => monster.id === "monster-b");

    expect(deadMonster?.status).toBe("dead");
    expect(aliveMonster?.status).toBe("active");
    expect(afterFirstHit.base.hp).toBe(20);

    runtime.tick(250);
    const afterSecondHit = runtime.getState();
    const sameDeadMonster = afterSecondHit.monsters.find((monster) => monster.id === "monster-a");
    const secondDeadMonster = afterSecondHit.monsters.find((monster) => monster.id === "monster-b");

    expect(sameDeadMonster?.status).toBe("dead");
    expect(sameDeadMonster?.pathProgress).toBe(deadMonster?.pathProgress);
    expect(secondDeadMonster?.status).toBe("dead");
    expect(afterSecondHit.base.hp).toBe(20);
  });

  it("produces same state for equivalent ticks when attacks prevent leaks", () => {
    const gameWithRace: GameDefinition = {
      ...game,
      base: {
        maxHp: 5
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
        ],
        towerSlots: [
          {
            id: "slot-1",
            x: 0.5,
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
          maxHp: 1,
          leakDamage: 3
        }
      ],
      towers: [
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 1,
          attackIntervalMs: 500,
          damage: 1
        }
      ]
    };
    const singleTickRuntime = createTowerDefenseRuntime({
      game: gameWithRace,
      rendererFactory: () => createRendererDouble()
    });
    const splitTickRuntime = createTowerDefenseRuntime({
      game: gameWithRace,
      rendererFactory: () => createRendererDouble()
    });

    singleTickRuntime.tick(1000);
    splitTickRuntime.tick(500);
    splitTickRuntime.tick(500);

    expect(splitTickRuntime.getState()).toEqual(singleTickRuntime.getState());
    expect(singleTickRuntime.getState().monsters[0].status).toBe("dead");
    expect(singleTickRuntime.getState().base.hp).toBe(5);
  });
});
