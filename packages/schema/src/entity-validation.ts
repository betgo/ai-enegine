import {
  isRecord,
  validatePositiveNumber,
  type ValidationErrors
} from "./validation-utils";

export function validateUnits(
  value: unknown,
  errors: ValidationErrors
): Set<string> {
  const seenUnitIds = new Set<string>();

  if (!Array.isArray(value)) {
    errors.push("units must be an array");
    return seenUnitIds;
  }

  value.forEach((unit, index) => {
    const path = `units[${index}]`;

    if (!isRecord(unit)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (typeof unit.id !== "string" || unit.id.length === 0) {
      errors.push(`${path}.id must be a non-empty string`);
    } else if (seenUnitIds.has(unit.id)) {
      errors.push(`${path}.id must be unique`);
    } else {
      seenUnitIds.add(unit.id);
    }

    if (unit.kind !== "monster") {
      errors.push(`${path}.kind must be "monster"`);
    }

    validatePositiveNumber(unit.speed, `${path}.speed`, errors);
    validatePositiveNumber(unit.maxHp, `${path}.maxHp`, errors);
    validatePositiveNumber(unit.leakDamage, `${path}.leakDamage`, errors);
  });

  return seenUnitIds;
}

export function validateTowers(
  value: unknown,
  towerSlotIds: Set<string>,
  errors: ValidationErrors
): void {
  if (!Array.isArray(value)) {
    errors.push("towers must be an array");
    return;
  }

  const seenTowerIds = new Set<string>();
  const occupiedSlotIds = new Set<string>();

  value.forEach((tower, index) => {
    const path = `towers[${index}]`;

    if (!isRecord(tower)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (typeof tower.id !== "string" || tower.id.length === 0) {
      errors.push(`${path}.id must be a non-empty string`);
    } else if (seenTowerIds.has(tower.id)) {
      errors.push(`${path}.id must be unique`);
    } else {
      seenTowerIds.add(tower.id);
    }

    if (typeof tower.slotId !== "string" || tower.slotId.length === 0) {
      errors.push(`${path}.slotId must be a non-empty string`);
    } else {
      validateTowerSlotReference(tower.slotId, path, towerSlotIds, occupiedSlotIds, errors);
    }

    validatePositiveNumber(tower.range, `${path}.range`, errors);
    validatePositiveNumber(tower.attackIntervalMs, `${path}.attackIntervalMs`, errors);
    validatePositiveNumber(tower.damage, `${path}.damage`, errors);
  });
}

function validateTowerSlotReference(
  slotId: string,
  path: string,
  towerSlotIds: Set<string>,
  occupiedSlotIds: Set<string>,
  errors: ValidationErrors
): void {
  if (!towerSlotIds.has(slotId)) {
    errors.push(`${path}.slotId must reference an existing map.towerSlots id`);
  }

  if (occupiedSlotIds.has(slotId)) {
    errors.push(`${path}.slotId must be unique`);
  } else {
    occupiedSlotIds.add(slotId);
  }
}

export function validateWaves(
  value: unknown,
  unitIds: Set<string>,
  pathIds: Set<string>,
  errors: ValidationErrors
): void {
  if (!Array.isArray(value)) {
    errors.push("waves must be an array");
    return;
  }

  const seenWaveIds = new Set<string>();

  value.forEach((wave, index) => {
    const path = `waves[${index}]`;

    if (!isRecord(wave)) {
      errors.push(`${path} must be an object`);
      return;
    }

    validateWaveId(wave.id, path, seenWaveIds, errors);
    validateNonNegativeNumber(wave.startTimeMs, `${path}.startTimeMs`, errors);
    validateWaveReference(wave.unitId, `${path}.unitId`, unitIds, "units", errors);
    validateWaveReference(wave.pathId, `${path}.pathId`, pathIds, "map.paths", errors);
    validatePositiveInteger(wave.count, `${path}.count`, errors);
    validatePositiveNumber(wave.intervalMs, `${path}.intervalMs`, errors);
  });
}

function validateWaveId(
  id: unknown,
  path: string,
  seenWaveIds: Set<string>,
  errors: ValidationErrors
): void {
  if (typeof id !== "string" || id.length === 0) {
    errors.push(`${path}.id must be a non-empty string`);
  } else if (seenWaveIds.has(id)) {
    errors.push(`${path}.id must be unique`);
  } else {
    seenWaveIds.add(id);
  }
}

function validateWaveReference(
  id: unknown,
  path: string,
  knownIds: Set<string>,
  collectionName: "units" | "map.paths",
  errors: ValidationErrors
): void {
  if (typeof id !== "string" || id.length === 0) {
    errors.push(`${path} must be a non-empty string`);
  } else if (!knownIds.has(id)) {
    errors.push(`${path} must reference an existing ${collectionName} id`);
  }
}

function validateNonNegativeNumber(
  value: unknown,
  path: string,
  errors: ValidationErrors
): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    errors.push(`${path} must be a non-negative number`);
  }
}

function validatePositiveInteger(
  value: unknown,
  path: string,
  errors: ValidationErrors
): void {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    errors.push(`${path} must be a positive integer`);
  }
}
