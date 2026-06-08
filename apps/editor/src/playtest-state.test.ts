import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  consumeFixedSteps,
  createPlaytestSnapshot,
  SIM_STEP_MS
} from "./playtest-state";
import sampleGame from "./game.sample.json";

const game = sampleGame as GameDefinition;

describe("editor playtest state helpers", () => {
  it("consumes fixed simulation steps while preserving leftover time", () => {
    expect(consumeFixedSteps(40, 260)).toEqual({
      steps: 3,
      remainingMs: 0
    });
    expect(consumeFixedSteps(25, 124, SIM_STEP_MS)).toEqual({
      steps: 1,
      remainingMs: 49
    });
  });

  it("supports custom step sizes", () => {
    expect(consumeFixedSteps(5, 45, 20)).toEqual({
      steps: 2,
      remainingMs: 10
    });
  });

  it("creates a deep cloned playtest snapshot", () => {
    const snapshot = createPlaytestSnapshot(game);

    snapshot.map.paths[0].points[0].x = 99;
    snapshot.base.maxHp = 1;

    expect(game.map.paths[0].points[0]).toEqual({ x: 0, y: 3 });
    expect(game.base.maxHp).toBe(30);
  });
});
