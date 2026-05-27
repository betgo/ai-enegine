import type { TileKind } from "./types";
import {
  isRecord,
  validateNonNegativeInteger,
  validatePositiveInteger,
  type ValidationErrors
} from "./validation-utils";

const tileKinds = new Set<TileKind>(["ground", "path", "tower-slot", "blocked"]);

export function validateMap(map: Record<string, unknown>, errors: ValidationErrors): void {
  if (typeof map.id !== "string" || map.id.length === 0) {
    errors.push("map.id must be a non-empty string");
  }

  if (typeof map.name !== "string" || map.name.length === 0) {
    errors.push("map.name must be a non-empty string");
  }

  if (!isRecord(map.size)) {
    errors.push("map.size must be an object");
  } else {
    validatePositiveInteger(map.size.width, "map.size.width", errors);
    validatePositiveInteger(map.size.height, "map.size.height", errors);
  }

  validateTiles(map.tiles, errors);
  validatePaths(map.paths, errors);
  validateTowerSlots(map.towerSlots, errors);
}

export function collectPathIds(value: unknown, pathIds: Set<string>): void {
  if (!Array.isArray(value)) {
    return;
  }

  value.forEach((path) => {
    if (isRecord(path) && typeof path.id === "string" && path.id.length > 0) {
      pathIds.add(path.id);
    }
  });
}

export function collectTowerSlotIds(value: unknown, towerSlotIds: Set<string>): void {
  if (!Array.isArray(value)) {
    return;
  }

  value.forEach((slot) => {
    if (isRecord(slot) && typeof slot.id === "string" && slot.id.length > 0) {
      towerSlotIds.add(slot.id);
    }
  });
}

function validateTiles(value: unknown, errors: ValidationErrors): void {
  if (!Array.isArray(value)) {
    errors.push("map.tiles must be an array");
    return;
  }

  value.forEach((tile, index) => {
    const path = `map.tiles[${index}]`;

    if (!isRecord(tile)) {
      errors.push(`${path} must be an object`);
      return;
    }

    validateNonNegativeInteger(tile.x, `${path}.x`, errors);
    validateNonNegativeInteger(tile.y, `${path}.y`, errors);

    if (typeof tile.kind !== "string" || !tileKinds.has(tile.kind as TileKind)) {
      errors.push(`${path}.kind must be a valid tile kind`);
    }
  });
}

function validatePaths(value: unknown, errors: ValidationErrors): void {
  if (!Array.isArray(value)) {
    errors.push("map.paths must be an array");
    return;
  }

  const seenPathIds = new Set<string>();

  value.forEach((pathDefinition, index) => {
    const path = `map.paths[${index}]`;

    if (!isRecord(pathDefinition)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (typeof pathDefinition.id !== "string" || pathDefinition.id.length === 0) {
      errors.push(`${path}.id must be a non-empty string`);
    } else if (seenPathIds.has(pathDefinition.id)) {
      errors.push(`${path}.id must be unique`);
    } else {
      seenPathIds.add(pathDefinition.id);
    }

    if (!Array.isArray(pathDefinition.points)) {
      errors.push(`${path}.points must be an array`);
      return;
    }

    if (pathDefinition.points.length < 2) {
      errors.push(`${path}.points must contain at least 2 points`);
    }

    pathDefinition.points.forEach((point, pointIndex) => {
      validatePoint(point, `${path}.points[${pointIndex}]`, errors);
    });

    if (pathDefinition.points.length >= 2 && getPathTotalLength(pathDefinition.points) <= 0) {
      errors.push(`${path} must have a positive total length`);
    }
  });
}

function validateTowerSlots(value: unknown, errors: ValidationErrors): void {
  if (!Array.isArray(value)) {
    errors.push("map.towerSlots must be an array");
    return;
  }

  const seenTowerSlotIds = new Set<string>();

  value.forEach((slot, index) => {
    const path = `map.towerSlots[${index}]`;

    if (!isRecord(slot)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (typeof slot.id !== "string" || slot.id.length === 0) {
      errors.push(`${path}.id must be a non-empty string`);
    } else if (seenTowerSlotIds.has(slot.id)) {
      errors.push(`${path}.id must be unique`);
    } else {
      seenTowerSlotIds.add(slot.id);
    }

    validateNonNegativeInteger(slot.x, `${path}.x`, errors);
    validateNonNegativeInteger(slot.y, `${path}.y`, errors);
  });
}

function validatePoint(value: unknown, path: string, errors: ValidationErrors): void {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }

  validateNonNegativeInteger(value.x, `${path}.x`, errors);
  validateNonNegativeInteger(value.y, `${path}.y`, errors);
}

function getPathTotalLength(points: unknown[]): number {
  let totalLength = 0;

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];

    if (!isRecord(start) || !isRecord(end)) {
      continue;
    }

    if (typeof start.x !== "number" || typeof start.y !== "number") {
      continue;
    }

    if (typeof end.x !== "number" || typeof end.y !== "number") {
      continue;
    }

    totalLength += Math.hypot(end.x - start.x, end.y - start.y);
  }

  return totalLength;
}
