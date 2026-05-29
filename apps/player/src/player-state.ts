import { validateGameDefinition, type GameDefinition } from "@ai-enegine/schema";

export const SIM_STEP_MS = 100;

const gameDefinitionKeys = new Set([
  "version",
  "base",
  "map",
  "units",
  "towers",
  "waves",
  "triggers"
]);

export interface StepAccumulatorResult {
  steps: number;
  remainingMs: number;
}

export type ImportedPlayerGameResult =
  | {
    ok: true;
    game: GameDefinition;
  }
  | {
    ok: false;
    error: string;
  };

export function consumeFixedSteps(
  accumulatedMs: number,
  deltaMs: number,
  stepMs = SIM_STEP_MS
): StepAccumulatorResult {
  const totalMs = accumulatedMs + deltaMs;

  return {
    steps: Math.floor(totalMs / stepMs),
    remainingMs: totalMs % stepMs
  };
}

export function parsePlayerGameJson(contents: string): ImportedPlayerGameResult {
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
    game: structuredClone(parsed as GameDefinition)
  };
}

function getUnknownGameDefinitionFields(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.keys(value).filter((key) => !gameDefinitionKeys.has(key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
