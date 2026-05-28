import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";

const gameDefinitionKeys = new Set([
  "version",
  "base",
  "map",
  "units",
  "towers",
  "waves",
  "triggers"
]);

export type GameJsonDownload =
  | {
    ok: true;
    fileName: string;
    contents: string;
  }
  | {
    ok: false;
    error: string;
  };

export type ImportedGameJsonResult =
  | {
    ok: true;
    game: GameDefinition;
  }
  | {
    ok: false;
    error: string;
  };

export function createGameJsonDownload(game: GameDefinition): GameJsonDownload {
  const canonicalGame = toCanonicalGameDefinition(game);
  const validation = validateGameDefinition(canonicalGame);

  if (!validation.ok) {
    return {
      ok: false,
      error: validation.errors.join(", ")
    };
  }

  return {
    ok: true,
    fileName: `${canonicalGame.map.id}.game.json`,
    contents: `${JSON.stringify(canonicalGame, null, 2)}\n`
  };
}

export function parseImportedGameJson(contents: string): ImportedGameJsonResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(contents);
  } catch {
    return {
      ok: false,
      error: "Invalid JSON file"
    };
  }

  const unknownFields = getUnknownGameDefinitionFields(parsed);
  if (unknownFields.length > 0) {
    return {
      ok: false,
      error: `unknown fields: ${unknownFields.join(", ")}`
    };
  }

  const validation = validateGameDefinition(parsed);

  if (!validation.ok) {
    return {
      ok: false,
      error: validation.errors.join(", ")
    };
  }

  return {
    ok: true,
    game: toCanonicalGameDefinition(parsed as GameDefinition)
  };
}

function getUnknownGameDefinitionFields(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.keys(value).filter((key) => !gameDefinitionKeys.has(key));
}

function toCanonicalGameDefinition(game: GameDefinition): GameDefinition {
  return {
    version: game.version,
    base: game.base,
    map: game.map,
    units: game.units,
    towers: game.towers,
    waves: game.waves,
    triggers: game.triggers
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
