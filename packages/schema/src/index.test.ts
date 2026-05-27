import { describe, expect, it } from "vitest";
import { validateGameDefinition, type GameDefinition } from "./index";

const validGame: GameDefinition = {
  version: "0.1.0",
  map: {
    id: "demo-map",
    name: "Demo Map",
    size: {
      width: 8,
      height: 6
    },
    tiles: [
      {
        x: 0,
        y: 0,
        kind: "path"
      },
      {
        x: 1,
        y: 0,
        kind: "tower-slot"
      }
    ],
    paths: [
      {
        id: "main",
        points: [
          { x: 0, y: 0 },
          { x: 7, y: 5 }
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

describe("validateGameDefinition", () => {
  it("accepts the minimal tower defense game definition", () => {
    const result = validateGameDefinition(validGame);

    expect(result.ok).toBe(true);
  });

  it("rejects data without a map", () => {
    const result = validateGameDefinition({
      version: "0.1.0",
      units: [],
      waves: [],
      triggers: []
    });

    expect(result).toEqual({
      ok: false,
      errors: ["map must be an object"]
    });
  });
});
