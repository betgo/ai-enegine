import type {
  GameDefinition,
  MapPoint,
  MapTile,
  MapSize,
  TowerSlotDefinition
} from "@ai-enegine/schema";

type Axis = "x" | "y";

export function updateMapSize(
  game: GameDefinition,
  axis: keyof MapSize,
  value: number
): GameDefinition {
  return syncMapTiles({
    ...game,
    map: {
      ...game.map,
      size: {
        ...game.map.size,
        [axis]: value
      }
    }
  });
}

export function updatePathPoint(
  game: GameDefinition,
  pathId: string,
  pointIndex: number,
  axis: Axis,
  value: number
): GameDefinition {
  return syncMapTiles({
    ...game,
    map: {
      ...game.map,
      paths: game.map.paths.map((path) => {
        if (path.id !== pathId) {
          return path;
        }

        return {
          ...path,
          points: updatePointAt(path.points, pointIndex, axis, value)
        };
      })
    }
  });
}

export function updateTowerSlot(
  game: GameDefinition,
  slotId: string,
  axis: Axis,
  value: number
): GameDefinition {
  return syncMapTiles({
    ...game,
    map: {
      ...game.map,
      towerSlots: game.map.towerSlots.map((slot) => updateSlot(slot, slotId, axis, value))
    }
  });
}

export function addPathPoint(game: GameDefinition, pathId: string): GameDefinition {
  const path = game.map.paths.find((candidate) => candidate.id === pathId);

  return addPathPointAt(game, pathId, getNextPathPoint(path?.points ?? []));
}

export function addPathPointAt(
  game: GameDefinition,
  pathId: string,
  point: MapPoint
): GameDefinition {
  return syncMapTiles({
    ...game,
    map: {
      ...game.map,
      paths: game.map.paths.map((path) => (
        path.id === pathId
          ? { ...path, points: [...path.points, point] }
          : path
      ))
    }
  });
}

export function removePathPoint(
  game: GameDefinition,
  pathId: string,
  pointIndex: number
): GameDefinition {
  return syncMapTiles({
    ...game,
    map: {
      ...game.map,
      paths: game.map.paths.map((path) => {
        if (path.id !== pathId || path.points.length <= 2) {
          return path;
        }

        return {
          ...path,
          points: path.points.filter((_, index) => index !== pointIndex)
        };
      })
    }
  });
}

export function addTowerSlot(game: GameDefinition): GameDefinition {
  return addTowerSlotAt(game, { x: 0, y: 0 });
}

export function addTowerSlotAt(game: GameDefinition, point: MapPoint): GameDefinition {
  const slot: TowerSlotDefinition = {
    id: `slot-${game.map.towerSlots.length + 1}`,
    x: point.x,
    y: point.y
  };

  return syncMapTiles({
    ...game,
    map: {
      ...game.map,
      towerSlots: [...game.map.towerSlots, slot]
    }
  });
}

function updatePointAt(
  points: MapPoint[],
  pointIndex: number,
  axis: Axis,
  value: number
): MapPoint[] {
  return points.map((point, index) => (
    index === pointIndex
      ? { ...point, [axis]: value }
      : point
  ));
}

function updateSlot(
  slot: TowerSlotDefinition,
  slotId: string,
  axis: Axis,
  value: number
): TowerSlotDefinition {
  return slot.id === slotId ? { ...slot, [axis]: value } : slot;
}

function syncMapTiles(game: GameDefinition): GameDefinition {
  const blockedTiles = game.map.tiles.filter((tile) => tile.kind === "blocked");
  const tilesByPosition = new Map<string, MapTile>();

  [
    ...blockedTiles,
    ...game.map.paths.flatMap((path) => derivePathTiles(path.points)),
    ...game.map.towerSlots.map((slot) => ({
      x: slot.x,
      y: slot.y,
      kind: "tower-slot" as const
    }))
  ].forEach((tile) => {
    tilesByPosition.set(`${tile.x}:${tile.y}`, tile);
  });

  return {
    ...game,
    map: {
      ...game.map,
      tiles: [...tilesByPosition.values()]
    }
  };
}

function derivePathTiles(points: MapPoint[]): MapTile[] {
  const tiles = new Map<string, MapTile>();

  for (let index = 0; index < points.length - 1; index += 1) {
    getLineTiles(points[index], points[index + 1]).forEach((tile) => {
      tiles.set(`${tile.x}:${tile.y}`, tile);
    });
  }

  return [...tiles.values()];
}

function getNextPathPoint(points: MapPoint[]): MapPoint {
  const lastPoint = points[points.length - 1] ?? { x: 0, y: 0 };

  return {
    x: lastPoint.x + 1,
    y: lastPoint.y
  };
}

function getLineTiles(start: MapPoint, end: MapPoint): MapTile[] {
  const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));

  if (steps === 0) {
    return [{ x: start.x, y: start.y, kind: "path" }];
  }

  return Array.from({ length: steps + 1 }, (_, index) => ({
    x: Math.round(start.x + ((end.x - start.x) * index) / steps),
    y: Math.round(start.y + ((end.y - start.y) * index) / steps),
    kind: "path"
  }));
}
