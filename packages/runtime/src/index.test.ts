import { describe, expect, it, vi } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import { createTowerDefenseRuntime } from "./index";

const game: GameDefinition = {
  version: "0.1.0",
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
  units: [],
  waves: [],
  triggers: []
};

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
});

function createRendererDouble() {
  return {
    domElement: {} as HTMLElement,
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn()
  };
}
