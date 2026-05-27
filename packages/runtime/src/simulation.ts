import type { GameDefinition, MapPoint } from "@ai-enegine/schema";
import {
  createPathDataById,
  getNextEscapeTimeMs,
  getNextReadyTowerRangeTimeMs,
  moveActiveMonsters,
  type RuntimePathData
} from "./movement";
import { attackWithReadyTowers, createTowerDefinitions, updateTowerAttacks } from "./tower-attack";

const TIME_EPSILON_MS = 0.000001;

export interface RuntimeSimulationState {
  elapsedMs: number;
  base: RuntimeBaseState;
  monsters: RuntimeMonsterState[];
  towers: RuntimeTowerState[];
}

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
}

export function createTowerDefenseSimulation(game: GameDefinition): TowerDefenseSimulation {
  const pathDataById = createPathDataById(game);
  const towerDefinitions = createTowerDefinitions(game.towers, game.map.towerSlots);
  const state = createInitialSimulationState(game, pathDataById, towerDefinitions);

  return {
    tick(deltaMs) {
      if (typeof deltaMs !== "number" || !Number.isFinite(deltaMs) || deltaMs < 0) {
        throw new Error("deltaMs must be a non-negative finite number");
      }

      advanceSimulation(state, pathDataById, deltaMs);
    },
    getState() {
      return cloneSimulationState(state);
    }
  };
}

function advanceSimulation(
  state: InternalSimulationState,
  pathDataById: Map<string, RuntimePathData>,
  deltaMs: number
): void {
  let remainingMs = deltaMs;

  attackWithReadyTowers(state.towers, state.monsters);

  while (remainingMs > 0) {
    const stepMs = getNextStepMs(state, pathDataById, remainingMs);

    if (stepMs > 0) {
      state.elapsedMs += stepMs;
      moveActiveMonsters(state.base, state.monsters, pathDataById, stepMs);
      updateTowerAttacks(state.towers, state.monsters, stepMs);
      remainingMs -= stepMs;
    }

    attackWithReadyTowers(state.towers, state.monsters);

    if (stepMs <= TIME_EPSILON_MS) {
      break;
    }
  }
}

function getNextStepMs(
  state: InternalSimulationState,
  pathDataById: Map<string, RuntimePathData>,
  remainingMs: number
): number {
  return Math.min(
    remainingMs,
    getNextTowerCooldownMs(state.towers),
    getNextEscapeTimeMs(state.monsters, pathDataById),
    getNextReadyTowerRangeTimeMs(state.towers, state.monsters, pathDataById)
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
  const unitIds = new Set<string>();

  return {
    elapsedMs: 0,
    base: {
      hp: game.base.maxHp,
      maxHp: game.base.maxHp
    },
    monsters: game.units.map((unit) => {
      if (unitIds.has(unit.id)) {
        throw new Error(`duplicate unit id: ${unit.id}`);
      }

      unitIds.add(unit.id);

      const pathData = pathDataById.get(unit.pathId);

      if (!pathData) {
        throw new Error(`monster path not found: ${unit.pathId}`);
      }

      const startPoint = pathData.points[0];

      return {
        id: unit.id,
        pathId: unit.pathId,
        hp: unit.maxHp,
        leakDamage: unit.leakDamage,
        speed: unit.speed,
        position: {
          x: startPoint.x,
          y: startPoint.y
        },
        pathProgress: 0,
        status: "active"
      };
    }),
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
    }))
  };
}

function cloneSimulationState(state: InternalSimulationState): RuntimeSimulationState {
  return {
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
    }))
  };
}
