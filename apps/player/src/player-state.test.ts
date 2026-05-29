import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  consumeFixedSteps,
  parsePlayerGameJson,
  SIM_STEP_MS
} from "./player-state";
import sampleGame from "./game.sample.json";

const game = sampleGame as GameDefinition;

describe("player state helpers", () => {
  it("consumes fixed simulation steps while preserving remainder", () => {
    expect(consumeFixedSteps(40, 260)).toEqual({
      steps: 3,
      remainingMs: 0
    });
    expect(consumeFixedSteps(25, 124, SIM_STEP_MS)).toEqual({
      steps: 1,
      remainingMs: 49
    });
  });

  it("parses valid game JSON for the player", () => {
    const result = parsePlayerGameJson(JSON.stringify(game));

    expect(result.ok).toBe(true);
    expect(result.ok ? result.game.map.id : null).toBe("td-demo");
  });

  it("rejects invalid JSON without returning a game", () => {
    const result = parsePlayerGameJson("{not-json");

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toContain("Invalid JSON");
  });

  it("rejects schema-invalid game JSON without returning a game", () => {
    const result = parsePlayerGameJson(JSON.stringify({
      ...game,
      map: {
        ...game.map,
        size: {
          width: 0,
          height: 7
        }
      }
    }));

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toContain("map.size.width");
  });

  it("rejects game JSON with fields outside the game definition", () => {
    const result = parsePlayerGameJson(JSON.stringify({
      ...game,
      runtimeState: {
        status: "running"
      }
    }));

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toContain("unknown fields");
  });
});
