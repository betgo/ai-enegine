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
      id: "monster-1",
      kind: "monster",
      pathId: "main",
      speed: 2,
      maxHp: 10,
      leakDamage: 3
    }
  ],
  towers: [],
  waves: [],
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
