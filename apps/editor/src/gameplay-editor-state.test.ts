import { describe, expect, it } from "vitest";
import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";
import {
  addMonsterUnit,
  addTower,
  addWave,
  getAvailableTowerSlotIds,
  removeTower,
  removeWave,
  updateBaseMaxHp,
  updateMonsterUnitNumber,
  updateTowerNumber,
  updateTowerSlotId,
  updateWaveNumber,
  updateWaveReference
} from "./gameplay-editor-state";
import sampleGame from "./game.sample.json";

const game = sampleGame as GameDefinition;

function expectValidGame(gameDefinition: GameDefinition): void {
  expect(validateGameDefinition(gameDefinition)).toEqual({ ok: true, errors: [] });
}

describe("gameplay editor state helpers", () => {
  it("updates base hp without mutating the source game definition", () => {
    const nextGame = updateBaseMaxHp(game, 45);

    expect(nextGame.base.maxHp).toBe(45);
    expect(game.base.maxHp).toBe(30);
    expectValidGame(nextGame);
  });

  it("adds and updates monsters with stable data", () => {
    const withMonster = addMonsterUnit({
      ...game,
      units: [...game.units, { id: "monster-1", kind: "monster", speed: 2, maxHp: 20, leakDamage: 7 }]
    });
    const fasterGame = updateMonsterUnitNumber(game, "monster-basic", "speed", 1.5);
    const tougherGame = updateMonsterUnitNumber(fasterGame, "monster-basic", "maxHp", 15);
    const nextGame = updateMonsterUnitNumber(tougherGame, "monster-basic", "leakDamage", 8);

    expect(withMonster.units.at(-1)).toEqual({
      id: "monster-2",
      kind: "monster",
      speed: 1,
      maxHp: 10,
      leakDamage: 5
    });
    expect(nextGame.units[0]).toEqual({
      id: "monster-basic",
      kind: "monster",
      speed: 1.5,
      maxHp: 15,
      leakDamage: 8
    });
    expect(game.units[0].speed).toBe(1);
    expectValidGame(withMonster);
    expectValidGame(nextGame);
  });

  it("adds, edits, and removes towers while keeping slots unique", () => {
    const withTower = addTower(game);
    const fullGame: GameDefinition = {
      ...game,
      towers: game.map.towerSlots.map((slot, index) => ({
        id: `tower-${index + 1}`,
        slotId: slot.id,
        range: 3,
        attackIntervalMs: 1000,
        damage: 1
      }))
    };
    const movedTower = updateTowerSlotId(withTower, "tower-1", "slot-c");
    const editedTower = updateTowerNumber(
      updateTowerNumber(updateTowerNumber(movedTower, "tower-1", "range", 4), "tower-1", "attackIntervalMs", 750),
      "tower-1",
      "damage",
      3
    );

    expect(withTower.towers.at(-1)).toEqual({
      id: "tower-2",
      slotId: "slot-b",
      range: 3,
      attackIntervalMs: 1000,
      damage: 1
    });
    expect(addTower(fullGame).towers).toEqual(fullGame.towers);
    expect(getAvailableTowerSlotIds(fullGame)).toEqual([]);
    expect(getAvailableTowerSlotIds(withTower, "tower-1")).toEqual(["slot-a", "slot-c"]);
    expect(editedTower.towers[0]).toEqual({
      id: "tower-1",
      slotId: "slot-c",
      range: 4,
      attackIntervalMs: 750,
      damage: 3
    });
    expect(removeTower(withTower, "tower-1").towers).toEqual([
      { id: "tower-2", slotId: "slot-b", range: 3, attackIntervalMs: 1000, damage: 1 }
    ]);
    expectValidGame(editedTower);
  });

  it("adds, edits, and removes waves with valid references", () => {
    const withWave = addWave(game);
    const gameWithPath: GameDefinition = {
      ...game,
      map: {
        ...game.map,
        paths: [...game.map.paths, { id: "side-path", points: [{ x: 0, y: 0 }, { x: 2, y: 0 }] }]
      }
    };
    const updatedNumbers = updateWaveNumber(
      updateWaveNumber(updateWaveNumber(gameWithPath, "wave-1", "startTimeMs", 2000), "wave-1", "count", 5),
      "wave-1",
      "intervalMs",
      500
    );
    const nextGame = updateWaveReference(updatedNumbers, "wave-1", "pathId", "side-path");

    expect(withWave.waves.at(-1)).toEqual({
      id: "wave-2",
      startTimeMs: 5000,
      unitId: "monster-basic",
      pathId: "main-path",
      count: 3,
      intervalMs: 1000
    });
    expect(addWave({ ...game, units: [] }).waves).toEqual(game.waves);
    expect(addWave({ ...game, map: { ...game.map, paths: [] } }).waves).toEqual(game.waves);
    expect(nextGame.waves[0]).toEqual({
      id: "wave-1",
      startTimeMs: 2000,
      unitId: "monster-basic",
      pathId: "side-path",
      count: 5,
      intervalMs: 500
    });
    expect(removeWave(withWave, "wave-1").waves).toEqual([
      { id: "wave-2", startTimeMs: 5000, unitId: "monster-basic", pathId: "main-path", count: 3, intervalMs: 1000 }
    ]);
    expectValidGame(nextGame);
  });
});
