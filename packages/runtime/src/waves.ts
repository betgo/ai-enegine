import type { GameDefinition } from "@ai-enegine/schema";
import type { InternalMonsterState, RuntimeWaveState } from "./simulation";
import type { RuntimePathData } from "./movement";

export interface RuntimeUnitTemplate {
  id: string;
  speed: number;
  maxHp: number;
  leakDamage: number;
}

export interface InternalWaveState extends RuntimeWaveState {
  startTimeMs: number;
  unitId: string;
  pathId: string;
  intervalMs: number;
}

export interface WaveRuntimeState {
  monsters: InternalMonsterState[];
  waves: InternalWaveState[];
  unitTemplates: Map<string, RuntimeUnitTemplate>;
  pathDataById: Map<string, RuntimePathData>;
}

export function createUnitTemplates(game: GameDefinition): Map<string, RuntimeUnitTemplate> {
  const templates = new Map<string, RuntimeUnitTemplate>();

  game.units.forEach((unit) => {
    if (templates.has(unit.id)) {
      throw new Error(`duplicate unit id: ${unit.id}`);
    }

    templates.set(unit.id, {
      id: unit.id,
      speed: unit.speed,
      maxHp: unit.maxHp,
      leakDamage: unit.leakDamage
    });
  });

  return templates;
}

export function createWaveStates(
  game: GameDefinition,
  unitTemplates: Map<string, RuntimeUnitTemplate>,
  pathDataById: Map<string, RuntimePathData>
): InternalWaveState[] {
  const waveIds = new Set<string>();

  return game.waves.map((wave) => {
    validateWaveDefinition(wave.id, wave.unitId, wave.pathId, waveIds, unitTemplates, pathDataById);

    return {
      id: wave.id,
      startTimeMs: wave.startTimeMs,
      unitId: wave.unitId,
      pathId: wave.pathId,
      intervalMs: wave.intervalMs,
      spawnedCount: 0,
      totalCount: wave.count,
      completed: false
    };
  });
}

function validateWaveDefinition(
  waveId: string,
  unitId: string,
  pathId: string,
  waveIds: Set<string>,
  unitTemplates: Map<string, RuntimeUnitTemplate>,
  pathDataById: Map<string, RuntimePathData>
): void {
  if (waveIds.has(waveId)) {
    throw new Error(`duplicate wave id: ${waveId}`);
  }

  waveIds.add(waveId);

  if (!unitTemplates.has(unitId)) {
    throw new Error(`wave unit not found: ${unitId}`);
  }

  if (!pathDataById.has(pathId)) {
    throw new Error(`wave path not found: ${pathId}`);
  }
}

export function getNextWaveSpawnTimeMs(state: WaveRuntimeState, elapsedMs: number): number {
  return state.waves.reduce((nextTime, wave) => {
    if (wave.completed) {
      return nextTime;
    }

    return Math.min(nextTime, getWaveSpawnTimeMs(wave) - elapsedMs);
  }, Number.POSITIVE_INFINITY);
}

export function spawnDueMonsters(state: WaveRuntimeState, elapsedMs: number): void {
  state.waves.forEach((wave) => {
    while (!wave.completed && getWaveSpawnTimeMs(wave) <= elapsedMs) {
      spawnMonster(state, wave);
      wave.spawnedCount += 1;
      wave.completed = wave.spawnedCount >= wave.totalCount;
    }
  });
}

function spawnMonster(state: WaveRuntimeState, wave: InternalWaveState): void {
  const template = state.unitTemplates.get(wave.unitId);
  const pathData = state.pathDataById.get(wave.pathId);

  if (!template) {
    throw new Error(`wave unit not found: ${wave.unitId}`);
  }

  if (!pathData) {
    throw new Error(`wave path not found: ${wave.pathId}`);
  }

  const startPoint = pathData.points[0];
  const spawnIndex = wave.spawnedCount;

  state.monsters.push({
    id: `${wave.id}:${spawnIndex}`,
    pathId: wave.pathId,
    hp: template.maxHp,
    leakDamage: template.leakDamage,
    speed: template.speed,
    position: {
      x: startPoint.x,
      y: startPoint.y
    },
    pathProgress: 0,
    status: "active"
  });
}

function getWaveSpawnTimeMs(wave: InternalWaveState): number {
  return wave.startTimeMs + wave.spawnedCount * wave.intervalMs;
}
