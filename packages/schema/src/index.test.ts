import { describe, expect, it } from "vitest";
import { validateGameDefinition } from "./index";
import { validGame } from "./test-helpers";
import sampleGame from "../../../apps/editor/src/game.sample.json";

describe("validateGameDefinition", () => {
  it("accepts the minimal tower defense game definition", () => {
    const result = validateGameDefinition(validGame);

    expect(result.ok).toBe(true);
  });

  it("accepts the editor sample game definition", () => {
    const result = validateGameDefinition(JSON.parse(JSON.stringify(sampleGame)));

    expect(result.ok).toBe(true);
  });

  it("rejects data without a map", () => {
    const result = validateGameDefinition({
      version: "0.1.0",
      units: [],
      towers: [],
      waves: [],
      triggers: []
    });

    expect(result).toEqual({
      ok: false,
      errors: ["map must be an object"]
    });
  });

  it("accepts a valid monster unit definition", () => {
    const result = validateGameDefinition({
      ...validGame,
      map: {
        ...validGame.map,
        paths: [
          {
            id: "main-path",
            points: [
              { x: 0, y: 0 },
              { x: 7, y: 5 }
            ]
          }
        ]
      },
      units: [
        {
          id: "monster-1",
          kind: "monster",
          pathId: "main-path",
          speed: 1,
          maxHp: 10
        }
      ]
    });

    expect(result.ok).toBe(true);
  });

  it("rejects invalid monster kind", () => {
    const result = validateGameDefinition({
      ...validGame,
      units: [
        {
          id: "monster-1",
          kind: "boss",
          pathId: "main",
          speed: 1,
          maxHp: 10
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('units[0].kind must be "monster"');
  });

  it("rejects non-positive speed and maxHp", () => {
    const result = validateGameDefinition({
      ...validGame,
      units: [
        {
          id: "monster-1",
          kind: "monster",
          pathId: "main",
          speed: 0,
          maxHp: -1
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("units[0].speed must be a positive number");
    expect(result.errors).toContain("units[0].maxHp must be a positive number");
  });

  it("rejects unknown pathId", () => {
    const result = validateGameDefinition({
      ...validGame,
      units: [
        {
          id: "monster-1",
          kind: "monster",
          pathId: "unknown-path",
          speed: 1,
          maxHp: 10
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("units[0].pathId must reference an existing map.paths id");
  });

  it("rejects duplicate path ids", () => {
    const result = validateGameDefinition({
      ...validGame,
      map: {
        ...validGame.map,
        paths: [
          {
            id: "main",
            points: [
              { x: 0, y: 0 },
              { x: 7, y: 5 }
            ]
          },
          {
            id: "main",
            points: [
              { x: 1, y: 0 },
              { x: 7, y: 5 }
            ]
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("map.paths[1].id must be unique");
  });

  it("rejects duplicate unit ids", () => {
    const result = validateGameDefinition({
      ...validGame,
      units: [
        {
          id: "monster-1",
          kind: "monster",
          pathId: "main",
          speed: 1,
          maxHp: 10
        },
        {
          id: "monster-1",
          kind: "monster",
          pathId: "main",
          speed: 1,
          maxHp: 10
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("units[1].id must be unique");
  });

  it("rejects zero-length paths", () => {
    const result = validateGameDefinition({
      ...validGame,
      map: {
        ...validGame.map,
        paths: [
          {
            id: "main",
            points: [
              { x: 1, y: 1 },
              { x: 1, y: 1 }
            ]
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("map.paths[0] must have a positive total length");
  });

});
