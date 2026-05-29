import { describe, expect, it } from "vitest";
import { createTowerDefenseRuntime } from "./index";
import { createRendererDouble, game } from "./test-helpers";

describe("runtime dynamic entities", () => {
  it("renders active monsters from simulation state", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    runtime.render();

    const monster = runtime.scene.getObjectByName("monster:wave-1:0");
    expect(monster?.position.x).toBeCloseTo(0, 6);
    expect(monster?.position.z).toBeCloseTo(0, 6);
  });

  it("updates monster position after ticks before rendering", () => {
    const runtime = createTowerDefenseRuntime({
      game,
      rendererFactory: () => createRendererDouble()
    });

    runtime.tick(1000);
    runtime.render();

    const monsterState = runtime.getState().monsters[0];
    const monster = runtime.scene.getObjectByName("monster:wave-1:0");
    expect(monster?.position.x).toBeCloseTo(monsterState.position.x, 6);
    expect(monster?.position.z).toBeCloseTo(monsterState.position.y, 6);
  });

  it("removes monster render objects when monsters are no longer active", () => {
    const runtime = createTowerDefenseRuntime({
      game: {
        ...game,
        towers: [
          {
            id: "tower-1",
            slotId: "slot-1",
            range: 10,
            attackIntervalMs: 100,
            damage: 10
          }
        ]
      },
      rendererFactory: () => createRendererDouble()
    });

    runtime.render();
    expect(runtime.scene.getObjectByName("monster:wave-1:0")).toBeDefined();

    runtime.tick(100);
    runtime.render();

    expect(runtime.getState().monsters[0].status).toBe("dead");
    expect(runtime.scene.getObjectByName("monster:wave-1:0")).toBeUndefined();
  });
});
