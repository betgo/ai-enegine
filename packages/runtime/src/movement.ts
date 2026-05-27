import type { GameDefinition, MapPoint } from "@ai-enegine/schema";
import type { InternalMonsterState, InternalTowerState, RuntimeBaseState } from "./simulation";

const TIME_EPSILON_MS = 0.000001;

export interface RuntimePathData {
  id: string;
  points: MapPoint[];
  segmentLengths: number[];
  totalLength: number;
}

export function createPathDataById(game: GameDefinition): Map<string, RuntimePathData> {
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

export function moveActiveMonsters(
  base: RuntimeBaseState,
  monsters: InternalMonsterState[],
  pathDataById: Map<string, RuntimePathData>,
  deltaMs: number
): void {
  monsters.forEach((monster) => {
    if (monster.status !== "active") {
      return;
    }

    const pathData = getMonsterPath(pathDataById, monster);
    const nextProgress = monster.pathProgress + (monster.speed * deltaMs) / 1000;
    const clampedProgress = Math.min(nextProgress, pathData.totalLength);
    const nextPosition = getPointAtProgress(pathData, clampedProgress);

    monster.pathProgress = clampedProgress;
    monster.position.x = nextPosition.x;
    monster.position.y = nextPosition.y;

    if (clampedProgress >= pathData.totalLength) {
      base.hp = Math.max(0, base.hp - monster.leakDamage);
      monster.status = "escaped";
    }
  });
}

export function getNextEscapeTimeMs(
  monsters: InternalMonsterState[],
  pathDataById: Map<string, RuntimePathData>
): number {
  return monsters.reduce((nextTime, monster) => {
    if (monster.status !== "active") {
      return nextTime;
    }

    const pathData = getMonsterPath(pathDataById, monster);
    const distance = pathData.totalLength - monster.pathProgress;

    if (distance <= 0) {
      return 0;
    }

    return Math.min(nextTime, (distance / monster.speed) * 1000);
  }, Number.POSITIVE_INFINITY);
}

export function getNextReadyTowerRangeTimeMs(
  towers: InternalTowerState[],
  monsters: InternalMonsterState[],
  pathDataById: Map<string, RuntimePathData>
): number {
  return towers.reduce((nextTime, tower) => {
    if (tower.cooldownRemainingMs > 0) {
      return nextTime;
    }

    return Math.min(nextTime, getNextTowerRangeTimeMs(tower, monsters, pathDataById));
  }, Number.POSITIVE_INFINITY);
}

function getNextTowerRangeTimeMs(
  tower: InternalTowerState,
  monsters: InternalMonsterState[],
  pathDataById: Map<string, RuntimePathData>
): number {
  return monsters.reduce((nextTime, monster) => {
    if (monster.status !== "active") {
      return nextTime;
    }

    const pathData = getMonsterPath(pathDataById, monster);
    const distance = getDistanceUntilRange(pathData, monster.pathProgress, tower);

    if (!Number.isFinite(distance) || distance <= 0) {
      return nextTime;
    }

    return Math.min(nextTime, (distance / monster.speed) * 1000);
  }, Number.POSITIVE_INFINITY);
}

function getDistanceUntilRange(
  pathData: RuntimePathData,
  progress: number,
  tower: InternalTowerState
): number {
  let segmentStartProgress = 0;

  for (let index = 0; index < pathData.segmentLengths.length; index += 1) {
    const segmentLength = pathData.segmentLengths[index];
    const segmentEndProgress = segmentStartProgress + segmentLength;

    if (progress <= segmentEndProgress) {
      const distance = getSegmentRangeDistance(pathData, index, progress, tower, segmentStartProgress);
      if (Number.isFinite(distance)) {
        return distance;
      }
    }

    segmentStartProgress = segmentEndProgress;
  }

  return Number.POSITIVE_INFINITY;
}

function getSegmentRangeDistance(
  pathData: RuntimePathData,
  index: number,
  progress: number,
  tower: InternalTowerState,
  segmentStartProgress: number
): number {
  const segmentLength = pathData.segmentLengths[index];

  if (segmentLength <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  const startRatio = Math.max(0, (progress - segmentStartProgress) / segmentLength);
  const entryRatio = getRangeEntryRatio(pathData.points[index], pathData.points[index + 1], tower, startRatio);

  if (!Number.isFinite(entryRatio)) {
    return Number.POSITIVE_INFINITY;
  }

  const distance = segmentStartProgress + entryRatio * segmentLength - progress;

  return distance > TIME_EPSILON_MS ? distance : 0;
}

function getRangeEntryRatio(
  start: MapPoint,
  end: MapPoint,
  tower: InternalTowerState,
  startRatio: number
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const fx = start.x - tower.position.x;
  const fy = start.y - tower.position.y;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - tower.range * tower.range;
  const discriminant = b * b - 4 * a * c;

  if (a <= 0 || discriminant < 0) {
    return Number.POSITIVE_INFINITY;
  }

  const root = Math.sqrt(discriminant);
  const entry = (-b - root) / (2 * a);
  const exit = (-b + root) / (2 * a);
  const clampedEntry = Math.max(startRatio, entry);

  return clampedEntry <= Math.min(1, exit) ? clampedEntry : Number.POSITIVE_INFINITY;
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

    if (segmentLength > 0 && remaining <= segmentLength) {
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

function getMonsterPath(
  pathDataById: Map<string, RuntimePathData>,
  monster: InternalMonsterState
): RuntimePathData {
  const pathData = pathDataById.get(monster.pathId);

  if (!pathData) {
    throw new Error(`monster path not found: ${monster.pathId}`);
  }

  return pathData;
}

function lerp(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}
