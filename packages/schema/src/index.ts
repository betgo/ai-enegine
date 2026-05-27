import { validateTowers, validateUnits } from "./entity-validation";
import {
  collectPathIds,
  collectTowerSlotIds,
  validateMap
} from "./map-validation";
import { isRecord } from "./validation-utils";

export type {
  BaseDefinition,
  GameDefinition,
  GameMap,
  MapPoint,
  MapSize,
  MapTile,
  MonsterUnitDefinition,
  PathDefinition,
  TileKind,
  TowerDefinition,
  TowerSlotDefinition,
  TriggerDefinition,
  UnitDefinition,
  UnitKind,
  WaveDefinition
} from "./types";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateGameDefinition(value: unknown): ValidationResult {
  const errors: string[] = [];
  const pathIds = new Set<string>();
  const towerSlotIds = new Set<string>();

  if (!isRecord(value)) {
    return {
      ok: false,
      errors: ["game must be an object"]
    };
  }

  if (typeof value.version !== "string" || value.version.length === 0) {
    errors.push("version must be a non-empty string");
  }

  if (!isRecord(value.base)) {
    errors.push("base must be an object");
  } else {
    validateBase(value.base, errors);
  }

  if (!isRecord(value.map)) {
    errors.push("map must be an object");
  } else {
    validateMap(value.map, errors);
    collectPathIds(value.map.paths, pathIds);
    collectTowerSlotIds(value.map.towerSlots, towerSlotIds);
  }

  validateUnits(value.units, pathIds, errors);
  validateTowers(value.towers, towerSlotIds, errors);
  validateArrayField(value, "waves", errors);
  validateArrayField(value, "triggers", errors);

  return {
    ok: errors.length === 0,
    errors
  };
}

function validateBase(value: Record<string, unknown>, errors: string[]): void {
  if (typeof value.maxHp !== "number" || !Number.isFinite(value.maxHp) || value.maxHp <= 0) {
    errors.push("base.maxHp must be a positive number");
  }
}

function validateArrayField(
  value: Record<string, unknown>,
  fieldName: "waves" | "triggers",
  errors: string[]
): void {
  if (!Array.isArray(value[fieldName])) {
    errors.push(`${fieldName} must be an array`);
  }
}
