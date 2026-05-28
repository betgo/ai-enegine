import type { GameDefinition, MapPoint } from "@ai-enegine/schema";
import {
  createPathDataById,
  getNextEscapeTimeMs,
  getNextReadyTowerRangeTimeMs,
  moveActiveMonsters,
  type RuntimePathData
} from "./movement";
import {
  advanceTowerCooldowns,
  attackWithReadyTowers,
  createTowerDefinitions
} from "./tower-attack";
import {
  createUnitTemplates,
  createWaveStates,
  getNextWaveSpawnTimeMs,
  spawnDueMonsters,
  type InternalWaveState,
  type RuntimeUnitTemplate
} from "./waves";

const TIME_EPSILON_MS = 0.000001;

export interface RuntimeSimulationState {
  status: RuntimeGameStatus;
  elapsedMs: number;
  base: RuntimeBaseState;
  monsters: RuntimeMonsterState[];
  towers: RuntimeTowerState[];
  waves: RuntimeWaveState[];
}

export type RuntimeGameStatus = "running" | "victory" | "defeat";

export interface RuntimeBaseState {
  hp: number;
  maxHp: number;
}

export type RuntimeMonsterStatus = "active" | "dead" | "escaped";

export interface RuntimeMonsterState {
  id: string;
  pathId: string;
  hp: number;
  leakDamage: number;
  position: MapPoint;
  pathProgress: number;
  status: RuntimeMonsterStatus;
}

export interface RuntimeTowerState {
  id: string;
  slotId: string;
  cooldownRemainingMs: number;
}

export interface RuntimeWaveState {
  id: string;
  spawnedCount: number;
  totalCount: number;
  completed: boolean;
}

export interface TowerDefenseSimulation {
  tick(deltaMs: number): void;
  getState(): RuntimeSimulationState;
}

export interface RuntimeTowerDefinition {
  id: string;
  slotId: string;
  position: MapPoint;
  range: number;
  attackIntervalMs: number;
  damage: number;
}

export interface InternalMonsterState extends RuntimeMonsterState {
  speed: number;
}

export interface InternalTowerState extends RuntimeTowerState {
  range: number;
  attackIntervalMs: number;
  damage: number;
  position: MapPoint;
}

interface InternalSimulationState {
  elapsedMs: number;
  base: RuntimeBaseState;
  monsters: InternalMonsterState[];
  towers: InternalTowerState[];
  waves: InternalWaveState[];
  unitTemplates: Map<string, RuntimeUnitTemplate>;
  pathDataById: Map<string, RuntimePathData>;
}

export function createTowerDefenseSimulation(game: GameDefinition): TowerDefenseSimulation {
  const pathDataById = createPathDataById(game);
  const towerDefinitions = createTowerDefinitions(game.towers, game.map.towerSlots);
  const state = createInitialSimulationState(game, pathDataById, towerDefinitions);
  spawnDueMonsters(state, state.elapsedMs);

  return {
    tick(deltaMs) {
      if (typeof deltaMs !== "number" || !Number.isFinite(deltaMs) || deltaMs < 0) {
        throw new Error("deltaMs must be a non-negative finite number");
      }

      if (getGameStatus(state) !== "running") {
        return;
      }

      advanceSimulation(state, deltaMs);
    },
    getState() {
      return cloneSimulationState(state);
    }
  };
}

function advanceSimulation(
  state: InternalSimulationState,
  deltaMs: number
): void {
  let remainingMs = deltaMs;

  attackWithReadyTowers(state.towers, state.monsters);
  if (getGameStatus(state) !== "running") {
    return;
  }

  while (remainingMs > 0) {
    const stepMs = getNextStepMs(state, remainingMs);

    if (stepMs > 0) {
      state.elapsedMs += stepMs;
      moveActiveMonsters(state.base, state.monsters, state.pathDataById, stepMs);
      advanceTowerCooldowns(state.towers, stepMs);
      remainingMs -= stepMs;
    }

    if (getGameStatus(state) !== "running") {
      break;
    }

    spawnDueMonsters(state, state.elapsedMs);
    attackWithReadyTowers(state.towers, state.monsters);

    if (getGameStatus(state) !== "running") {
      break;
    }

    if (stepMs <= TIME_EPSILON_MS) {
      break;
    }
  }
}

function getNextStepMs(
  state: InternalSimulationState,
  remainingMs: number
): number {
  return Math.min(
    remainingMs,
    getNextTowerCooldownMs(state.towers),
    getNextEscapeTimeMs(state.monsters, state.pathDataById),
    getNextReadyTowerRangeTimeMs(state.towers, state.monsters, state.pathDataById),
    getNextWaveSpawnTimeMs(state, state.elapsedMs)
  );
}

function getNextTowerCooldownMs(towers: InternalTowerState[]): number {
  return towers.reduce((nextTime, tower) => {
    if (tower.cooldownRemainingMs <= 0) {
      return nextTime;
    }

    return Math.min(nextTime, tower.cooldownRemainingMs);
  }, Number.POSITIVE_INFINITY);
}

function createInitialSimulationState(
  game: GameDefinition,
  pathDataById: Map<string, RuntimePathData>,
  towers: RuntimeTowerDefinition[]
): InternalSimulationState {
  const unitTemplates = createUnitTemplates(game);

  return {
    elapsedMs: 0,
    base: {
      hp: game.base.maxHp,
      maxHp: game.base.maxHp
    },
    monsters: [],
    towers: towers.map((tower) => ({
      id: tower.id,
      slotId: tower.slotId,
      cooldownRemainingMs: tower.attackIntervalMs,
      range: tower.range,
      attackIntervalMs: tower.attackIntervalMs,
      damage: tower.damage,
      position: {
        x: tower.position.x,
        y: tower.position.y
      }
    })),
    waves: createWaveStates(game, unitTemplates, pathDataById),
    unitTemplates,
    pathDataById
  };
}

function cloneSimulationState(state: InternalSimulationState): RuntimeSimulationState {
  return {
    status: getGameStatus(state),
    elapsedMs: state.elapsedMs,
    base: {
      hp: state.base.hp,
      maxHp: state.base.maxHp
    },
    monsters: state.monsters.map((monster) => ({
      id: monster.id,
      pathId: monster.pathId,
      hp: monster.hp,
      leakDamage: monster.leakDamage,
      position: {
        x: monster.position.x,
        y: monster.position.y
      },
      pathProgress: monster.pathProgress,
      status: monster.status
    })),
    towers: state.towers.map((tower) => ({
      id: tower.id,
      slotId: tower.slotId,
      cooldownRemainingMs: tower.cooldownRemainingMs
    })),
    waves: state.waves.map((wave) => ({
      id: wave.id,
      spawnedCount: wave.spawnedCount,
      totalCount: wave.totalCount,
      completed: wave.completed
    }))
  };
}

function getGameStatus(state: InternalSimulationState): RuntimeGameStatus {
  if (state.base.hp <= 0) {
    return "defeat";
  }

  const allWavesCompleted = state.waves.every((wave) => wave.completed);
  const hasActiveMonster = state.monsters.some((monster) => monster.status === "active");

  return allWavesCompleted && !hasActiveMonster ? "victory" : "running";
}
