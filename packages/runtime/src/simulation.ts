import type { GameDefinition, MapPoint } from "@ai-enegine/schema";

export interface RuntimeSimulationState {
  elapsedMs: number;
  monsters: RuntimeMonsterState[];
}

export interface RuntimeMonsterState {
  id: string;
  pathId: string;
  hp: number;
  position: MapPoint;
  pathProgress: number;
  reachedEnd: boolean;
}

export interface TowerDefenseSimulation {
  tick(deltaMs: number): void;
  getState(): RuntimeSimulationState;
}

interface RuntimePathData {
  id: string;
  points: MapPoint[];
  segmentLengths: number[];
  totalLength: number;
}

interface InternalMonsterState extends RuntimeMonsterState {
  speed: number;
}

interface InternalSimulationState {
  elapsedMs: number;
  monsters: InternalMonsterState[];
}

export function createTowerDefenseSimulation(game: GameDefinition): TowerDefenseSimulation {
  const pathDataById = createPathDataById(game);
  const state = createInitialSimulationState(game, pathDataById);

  return {
    tick(deltaMs) {
      if (typeof deltaMs !== "number" || !Number.isFinite(deltaMs) || deltaMs < 0) {
        throw new Error("deltaMs must be a non-negative finite number");
      }

      state.elapsedMs += deltaMs;

      state.monsters.forEach((monster) => {
        if (monster.reachedEnd) {
          return;
        }

        const pathData = pathDataById.get(monster.pathId);

        if (!pathData) {
          throw new Error(`monster path not found: ${monster.pathId}`);
        }

        const nextProgress = monster.pathProgress + (monster.speed * deltaMs) / 1000;
        const clampedProgress = Math.min(nextProgress, pathData.totalLength);
        const nextPosition = getPointAtProgress(pathData, clampedProgress);

        monster.pathProgress = clampedProgress;
        monster.position.x = nextPosition.x;
        monster.position.y = nextPosition.y;
        monster.reachedEnd = clampedProgress >= pathData.totalLength;
      });
    },
    getState() {
      return cloneSimulationState(state);
    }
  };
}

function createPathDataById(game: GameDefinition): Map<string, RuntimePathData> {
  const pathDataById = new Map<string, RuntimePathData>();

  game.map.paths.forEach((path) => {
    if (pathDataById.has(path.id)) {
      throw new Error(`duplicate path id: ${path.id}`);
    }

    const segmentLengths: number[] = [];
    let totalLength = 0;

    for (let index = 0; index < path.points.length - 1; index += 1) {
      const start = path.points[index];
      const end = path.points[index + 1];
      const length = Math.hypot(end.x - start.x, end.y - start.y);

      segmentLengths.push(length);
      totalLength += length;
    }

    if (totalLength <= 0) {
      throw new Error(`path must have a positive total length: ${path.id}`);
    }

    pathDataById.set(path.id, {
      id: path.id,
      points: path.points.map((point) => ({ x: point.x, y: point.y })),
      segmentLengths,
      totalLength
    });
  });

  return pathDataById;
}

function createInitialSimulationState(
  game: GameDefinition,
  pathDataById: Map<string, RuntimePathData>
): InternalSimulationState {
  const unitIds = new Set<string>();

  return {
    elapsedMs: 0,
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
        speed: unit.speed,
        position: {
          x: startPoint.x,
          y: startPoint.y
        },
        pathProgress: 0,
        reachedEnd: false
      };
    })
  };
}

function getPointAtProgress(pathData: RuntimePathData, progress: number): MapPoint {
  if (progress <= 0) {
    return { x: pathData.points[0].x, y: pathData.points[0].y };
  }

  if (progress >= pathData.totalLength) {
    const endPoint = pathData.points[pathData.points.length - 1];
    return { x: endPoint.x, y: endPoint.y };
  }

  let remaining = progress;

  for (let index = 0; index < pathData.segmentLengths.length; index += 1) {
    const segmentLength = pathData.segmentLengths[index];
    const start = pathData.points[index];
    const end = pathData.points[index + 1];

    if (segmentLength <= 0) {
      continue;
    }

    if (remaining <= segmentLength) {
      const ratio = remaining / segmentLength;

      return {
        x: lerp(start.x, end.x, ratio),
        y: lerp(start.y, end.y, ratio)
      };
    }

    remaining -= segmentLength;
  }

  const fallback = pathData.points[pathData.points.length - 1];

  return { x: fallback.x, y: fallback.y };
}

function lerp(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

function cloneSimulationState(state: InternalSimulationState): RuntimeSimulationState {
  return {
    elapsedMs: state.elapsedMs,
    monsters: state.monsters.map((monster) => ({
      id: monster.id,
      pathId: monster.pathId,
      hp: monster.hp,
      position: {
        x: monster.position.x,
        y: monster.position.y
      },
      pathProgress: monster.pathProgress,
      reachedEnd: monster.reachedEnd
    }))
  };
}
