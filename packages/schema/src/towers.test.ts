import { describe, expect, it } from "vitest";
import { validateGameDefinition } from "./index";
import { validGame } from "./test-helpers";

describe("validateGameDefinition towers", () => {
  it("accepts valid towers definition", () => {
    const result = validateGameDefinition({
      ...validGame,
      towers: [
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 3,
          attackIntervalMs: 500,
          damage: 2
        }
      ]
    });

    expect(result.ok).toBe(true);
  });

  it("rejects when towers is missing", () => {
    const { towers: _ignored, ...gameWithoutTowers } = validGame;
    const result = validateGameDefinition(gameWithoutTowers);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("towers must be an array");
  });

  it("rejects unknown tower slotId", () => {
    const result = validateGameDefinition({
      ...validGame,
      towers: [
        {
          id: "tower-1",
          slotId: "missing-slot",
          range: 3,
          attackIntervalMs: 500,
          damage: 2
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("towers[0].slotId must reference an existing map.towerSlots id");
  });

  it("rejects duplicate tower ids", () => {
    const result = validateGameDefinition({
      ...validGame,
      towers: [
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 3,
          attackIntervalMs: 500,
          damage: 2
        },
        {
          id: "tower-1",
          slotId: "slot-2",
          range: 3,
          attackIntervalMs: 500,
          damage: 2
        }
      ],
      map: {
        ...validGame.map,
        towerSlots: [
          ...validGame.map.towerSlots,
          {
            id: "slot-2",
            x: 2,
            y: 0
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("towers[1].id must be unique");
  });

  it("rejects duplicate occupied tower slots", () => {
    const result = validateGameDefinition({
      ...validGame,
      towers: [
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 3,
          attackIntervalMs: 500,
          damage: 2
        },
        {
          id: "tower-2",
          slotId: "slot-1",
          range: 4,
          attackIntervalMs: 400,
          damage: 1
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("towers[1].slotId must be unique");
  });

  it("rejects non-positive tower stats", () => {
    const result = validateGameDefinition({
      ...validGame,
      towers: [
        {
          id: "tower-1",
          slotId: "slot-1",
          range: 0,
          attackIntervalMs: -1,
          damage: 0
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("towers[0].range must be a positive number");
    expect(result.errors).toContain("towers[0].attackIntervalMs must be a positive number");
    expect(result.errors).toContain("towers[0].damage must be a positive number");
  });

  it("rejects duplicate tower slot ids", () => {
    const result = validateGameDefinition({
      ...validGame,
      map: {
        ...validGame.map,
        towerSlots: [
          ...validGame.map.towerSlots,
          {
            id: "slot-1",
            x: 3,
            y: 3
          }
        ]
      },
      towers: []
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("map.towerSlots[1].id must be unique");
  });
});
