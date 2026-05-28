import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  addPathPoint,
  addTowerSlot,
  removePathPoint,
  updateMapSize,
  updatePathPoint,
  updateTowerSlot
} from "./editor-state";
import sampleGame from "./game.sample.json";

const game = sampleGame as GameDefinition;

describe("editor state helpers", () => {
  it("updates map size without mutating the source game definition", () => {
    const nextGame = updateMapSize(game, "width", 12);

    expect(nextGame.map.size.width).toBe(12);
    expect(nextGame.map.size.height).toBe(game.map.size.height);
    expect(game.map.size.width).toBe(10);
  });

  it("updates a path point without mutating other points", () => {
    const nextGame = updatePathPoint(game, "main-path", 1, "y", 4);

    expect(nextGame.map.paths[0].points[1]).toEqual({ x: 4, y: 4 });
    expect(nextGame.map.tiles).toContainEqual({ x: 4, y: 4, kind: "path" });
    expect(nextGame.map.paths[0].points[0]).toEqual(game.map.paths[0].points[0]);
    expect(game.map.paths[0].points[1]).toEqual({ x: 4, y: 3 });
  });

  it("updates a tower slot without mutating the source game definition", () => {
    const nextGame = updateTowerSlot(game, "slot-b", "x", 6);

    expect(nextGame.map.towerSlots[1]).toEqual({ id: "slot-b", x: 6, y: 2 });
    expect(nextGame.map.tiles).toContainEqual({ x: 6, y: 2, kind: "tower-slot" });
    expect(game.map.towerSlots[1]).toEqual({ id: "slot-b", x: 5, y: 2 });
  });

  it("adds and removes editable path points while keeping at least two points", () => {
    const withPoint = addPathPoint(game, "main-path");
    const trimmed = [2, 2, 2].reduce(
      (currentGame, pointIndex) => removePathPoint(currentGame, "main-path", pointIndex),
      withPoint
    );

    expect(withPoint.map.paths[0].points).toHaveLength(game.map.paths[0].points.length + 1);
    expect(trimmed.map.paths[0].points).toHaveLength(2);
    expect(removePathPoint(trimmed, "main-path", 1).map.paths[0].points).toHaveLength(2);
  });

  it("adds a tower slot with a stable generated id and derived tile", () => {
    const nextGame = addTowerSlot(game);
    const newSlot = nextGame.map.towerSlots.at(-1);

    expect(newSlot).toEqual({ id: "slot-4", x: 0, y: 0 });
    expect(nextGame.map.tiles).toContainEqual({ x: 0, y: 0, kind: "tower-slot" });
  });

  it("deduplicates derived tiles with tower slots taking priority", () => {
    const nextGame = updateTowerSlot(game, "slot-a", "y", 3);

    expect(nextGame.map.tiles.filter((tile) => tile.x === 2 && tile.y === 3)).toEqual([
      { x: 2, y: 3, kind: "tower-slot" }
    ]);
  });

  it("preserves derived tiles for every path when editing one path", () => {
    const gameWithTwoPaths: GameDefinition = {
      ...game,
      map: {
        ...game.map,
        paths: [
          ...game.map.paths,
          {
            id: "side-path",
            points: [
              { x: 0, y: 0 },
              { x: 2, y: 0 }
            ]
          }
        ]
      }
    };
    const nextGame = updatePathPoint(gameWithTwoPaths, "main-path", 1, "y", 4);

    expect(nextGame.map.tiles).toContainEqual({ x: 0, y: 0, kind: "path" });
    expect(nextGame.map.tiles).toContainEqual({ x: 1, y: 0, kind: "path" });
    expect(nextGame.map.tiles).toContainEqual({ x: 2, y: 0, kind: "path" });
  });
});
