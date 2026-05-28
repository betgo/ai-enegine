import { describe, expect, it } from "vitest";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  createGameJsonDownload,
  parseImportedGameJson
} from "./game-file";
import sampleGame from "./game.sample.json";

const game = sampleGame as GameDefinition;

describe("game file helpers", () => {
  it("serializes the current game definition as stable JSON", () => {
    const download = createGameJsonDownload(game);

    expect(download.ok).toBe(true);
    expect(download.ok ? download.fileName : null).toBe("td-demo.game.json");
    expect(JSON.parse(download.ok ? download.contents : "{}")).toEqual(game);
    expect(download.ok ? download.contents : "").toContain("\n  \"version\": \"0.1.0\"");
  });

  it("rejects export when the current draft is schema-invalid", () => {
    const download = createGameJsonDownload({
      ...game,
      map: {
        ...game.map,
        size: {
          width: 0,
          height: 7
        }
      }
    });

    expect(download.ok).toBe(false);
    expect(download.ok ? null : download.error).toContain("map.size.width");
  });

  it("exports only canonical game definition fields", () => {
    const download = createGameJsonDownload({
      ...game,
      runtimeState: {
        status: "running"
      },
      sceneSummary: {
        tileCount: 14
      }
    } as unknown as GameDefinition);
    const exported = JSON.parse(download.ok ? download.contents : "{}");

    expect(download.ok).toBe(true);
    expect(exported.runtimeState).toBeUndefined();
    expect(exported.sceneSummary).toBeUndefined();
    expect(exported).toEqual(game);
  });

  it("parses and validates imported game JSON", () => {
    const result = parseImportedGameJson(JSON.stringify(game));

    expect(result.ok).toBe(true);
    expect(result.ok ? result.game.map.id : null).toBe("td-demo");
  });

  it("rejects invalid JSON without returning a game definition", () => {
    const result = parseImportedGameJson("{not-json");

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toContain("Invalid JSON");
  });

  it("rejects schema-invalid game JSON without returning a game definition", () => {
    const result = parseImportedGameJson(JSON.stringify({
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

  it("rejects imported JSON with fields outside the game definition", () => {
    const result = parseImportedGameJson(JSON.stringify({
      ...game,
      runtimeState: {
        status: "running"
      },
      sceneSummary: {
        tileCount: 14
      }
    }));

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toContain("unknown fields");
  });
});
