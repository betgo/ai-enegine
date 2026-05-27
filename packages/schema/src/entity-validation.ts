import {
  isRecord,
  validatePositiveNumber,
  type ValidationErrors
} from "./validation-utils";

export function validateUnits(
  value: unknown,
  pathIds: Set<string>,
  errors: ValidationErrors
): void {
  if (!Array.isArray(value)) {
    errors.push("units must be an array");
    return;
  }

  const seenUnitIds = new Set<string>();

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

    if (typeof unit.pathId !== "string" || unit.pathId.length === 0) {
      errors.push(`${path}.pathId must be a non-empty string`);
    } else if (!pathIds.has(unit.pathId)) {
      errors.push(`${path}.pathId must reference an existing map.paths id`);
    }

    validatePositiveNumber(unit.speed, `${path}.speed`, errors);
    validatePositiveNumber(unit.maxHp, `${path}.maxHp`, errors);
    validatePositiveNumber(unit.leakDamage, `${path}.leakDamage`, errors);
  });
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
