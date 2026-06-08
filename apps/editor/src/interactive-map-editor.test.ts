import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  applySelectedMapPoint,
  clampGridPoint,
  getNormalizedPointerPosition,
  type SelectedMapObject
} from "./interactive-map-editor";
import sampleGame from "./game.sample.json";

const game = sampleGame as GameDefinition;

describe("interactive map editor helpers", () => {
  it("converts pointer client coordinates to normalized device coordinates", () => {
    const rect = {
      left: 40,
      top: 20,
      width: 200,
      height: 100
    };

    expect(getNormalizedPointerPosition(140, 70, rect)).toEqual({ x: 0, y: 0 });
    expect(getNormalizedPointerPosition(40, 20, rect)).toEqual({ x: -1, y: 1 });
    expect(getNormalizedPointerPosition(240, 120, rect)).toEqual({ x: 1, y: -1 });
  });

  it("clamps rounded grid points to the map bounds", () => {
    expect(clampGridPoint({ x: -2.4, y: 9.6 }, { width: 10, height: 6 })).toEqual({ x: 0, y: 5 });
    expect(clampGridPoint({ x: 4.49, y: 2.51 }, { width: 10, height: 6 })).toEqual({ x: 4, y: 3 });
    expect(clampGridPoint({ x: 99, y: 99 }, { width: 10, height: 6 })).toEqual({ x: 9, y: 5 });
  });

  it("moves a selected path point without mutating the source game", () => {
    const selected: SelectedMapObject = {
      kind: "path-point",
      pathId: "main-path",
      pointIndex: 1
    };
    const nextGame = applySelectedMapPoint(game, selected, { x: 7, y: 5 });

    expect(nextGame.map.paths[0].points[1]).toEqual({ x: 7, y: 5 });
    expect(nextGame.map.tiles).toContainEqual({ x: 7, y: 5, kind: "path" });
    expect(game.map.paths[0].points[1]).toEqual({ x: 4, y: 3 });
  });

  it("moves a selected tower slot without mutating the source game", () => {
    const selected: SelectedMapObject = {
      kind: "tower-slot",
      slotId: "slot-a"
    };
    const nextGame = applySelectedMapPoint(game, selected, { x: 8, y: 1 });

    expect(nextGame.map.towerSlots[0]).toEqual({ id: "slot-a", x: 8, y: 1 });
    expect(nextGame.map.tiles).toContainEqual({ x: 8, y: 1, kind: "tower-slot" });
    expect(game.map.towerSlots[0]).toEqual({ id: "slot-a", x: 2, y: 2 });
  });
});
