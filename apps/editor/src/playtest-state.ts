import type { GameDefinition } from "@ai-enegine/schema";

export const SIM_STEP_MS = 100;

export interface StepAccumulatorResult {
  steps: number;
  remainingMs: number;
}

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

export function createPlaytestSnapshot(game: GameDefinition): GameDefinition {
  return structuredClone(game);
}
