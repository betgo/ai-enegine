import type { GameDefinition } from "@ai-enegine/schema";
import { vi } from "vitest";

export const game: GameDefinition = {
  version: "0.1.0",
  base: {
    maxHp: 20
  },
  map: {
    id: "demo-map",
    name: "Demo Map",
    size: {
      width: 4,
      height: 3
    },
    tiles: [
      { x: 0, y: 0, kind: "path" },
      { x: 1, y: 0, kind: "tower-slot" },
      { x: 2, y: 1, kind: "blocked" }
    ],
    paths: [
      {
        id: "main",
        points: [
          { x: 0, y: 0 },
          { x: 3, y: 2 }
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
      id: "monster-basic",
      kind: "monster",
      speed: 2,
      maxHp: 10,
      leakDamage: 3
    }
  ],
  towers: [],
  waves: [
    {
      id: "wave-1",
      startTimeMs: 0,
      unitId: "monster-basic",
      pathId: "main",
      count: 1,
      intervalMs: 1000
    }
  ],
  triggers: []
};

export function createRendererDouble() {
  return {
    domElement: {} as HTMLElement,
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn()
  };
}

export function withTowers(towers: GameDefinition["towers"]): GameDefinition {
  return {
    ...game,
    towers
  };
}

export function withUnitsAsWave(
  units: GameDefinition["units"],
  pathId = "main"
): GameDefinition {
  return {
    ...game,
    units,
    waves: units.map((unit, index) => ({
      id: `wave-${index + 1}`,
      startTimeMs: 0,
      unitId: unit.id,
      pathId,
      count: 1,
      intervalMs: 1000
    }))
  };
}
