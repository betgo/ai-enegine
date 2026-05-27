export interface GameDefinition {
  version: string;
  map: GameMap;
  units: UnitDefinition[];
  waves: WaveDefinition[];
  triggers: TriggerDefinition[];
}

export interface GameMap {
  id: string;
  name: string;
  size: MapSize;
  tiles: MapTile[];
  paths: PathDefinition[];
  towerSlots: TowerSlotDefinition[];
}

export interface MapSize {
  width: number;
  height: number;
}

export type TileKind = "ground" | "path" | "tower-slot" | "blocked";

export interface MapTile {
  x: number;
  y: number;
  kind: TileKind;
}

export interface PathDefinition {
  id: string;
  points: MapPoint[];
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface TowerSlotDefinition {
  id: string;
  x: number;
  y: number;
}

export type UnitDefinition = Record<string, never>;
export type WaveDefinition = Record<string, never>;
export type TriggerDefinition = Record<string, never>;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const tileKinds = new Set<TileKind>(["ground", "path", "tower-slot", "blocked"]);

export function validateGameDefinition(value: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      ok: false,
      errors: ["game must be an object"]
    };
  }

  if (typeof value.version !== "string" || value.version.length === 0) {
    errors.push("version must be a non-empty string");
  }

  if (!isRecord(value.map)) {
    errors.push("map must be an object");
  } else {
    validateMap(value.map, errors);
  }

  validateArrayField(value, "units", errors);
  validateArrayField(value, "waves", errors);
  validateArrayField(value, "triggers", errors);

  return {
    ok: errors.length === 0,
    errors
  };
}

function validateMap(map: Record<string, unknown>, errors: string[]): void {
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

function validateTiles(value: unknown, errors: string[]): void {
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

function validatePaths(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push("map.paths must be an array");
    return;
  }

  value.forEach((pathDefinition, index) => {
    const path = `map.paths[${index}]`;

    if (!isRecord(pathDefinition)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (typeof pathDefinition.id !== "string" || pathDefinition.id.length === 0) {
      errors.push(`${path}.id must be a non-empty string`);
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
  });
}

function validateTowerSlots(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push("map.towerSlots must be an array");
    return;
  }

  value.forEach((slot, index) => {
    const path = `map.towerSlots[${index}]`;

    if (!isRecord(slot)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (typeof slot.id !== "string" || slot.id.length === 0) {
      errors.push(`${path}.id must be a non-empty string`);
    }

    validateNonNegativeInteger(slot.x, `${path}.x`, errors);
    validateNonNegativeInteger(slot.y, `${path}.y`, errors);
  });
}

function validatePoint(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }

  validateNonNegativeInteger(value.x, `${path}.x`, errors);
  validateNonNegativeInteger(value.y, `${path}.y`, errors);
}

function validateArrayField(
  value: Record<string, unknown>,
  fieldName: "units" | "waves" | "triggers",
  errors: string[]
): void {
  if (!Array.isArray(value[fieldName])) {
    errors.push(`${fieldName} must be an array`);
  }
}

function validatePositiveInteger(value: unknown, path: string, errors: string[]): void {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    errors.push(`${path} must be a positive integer`);
  }
}

function validateNonNegativeInteger(value: unknown, path: string, errors: string[]): void {
  if (!Number.isInteger(value) || (value as number) < 0) {
    errors.push(`${path} must be a non-negative integer`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
