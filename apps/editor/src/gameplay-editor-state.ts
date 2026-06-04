import type {
  GameDefinition,
  MonsterUnitDefinition,
  TowerDefinition
} from "@ai-enegine/schema";

type MonsterNumberField = "speed" | "maxHp" | "leakDamage";
type TowerNumberField = "range" | "attackIntervalMs" | "damage";
type WaveNumberField = "startTimeMs" | "count" | "intervalMs";
type WaveReferenceField = "unitId" | "pathId";

export function updateBaseMaxHp(game: GameDefinition, maxHp: number): GameDefinition {
  return {
    ...game,
    base: {
      ...game.base,
      maxHp
    }
  };
}

export function addMonsterUnit(game: GameDefinition): GameDefinition {
  const unit: MonsterUnitDefinition = {
    id: getNextId("monster", game.units.map((monster) => monster.id)),
    kind: "monster",
    speed: 1,
    maxHp: 10,
    leakDamage: 5
  };

  return {
    ...game,
    units: [...game.units, unit]
  };
}

export function updateMonsterUnitNumber(
  game: GameDefinition,
  unitId: string,
  field: MonsterNumberField,
  value: number
): GameDefinition {
  return {
    ...game,
    units: game.units.map((unit) => (
      unit.id === unitId ? { ...unit, [field]: value } : unit
    ))
  };
}

export function getAvailableTowerSlotIds(
  game: GameDefinition,
  towerId?: string
): string[] {
  const currentTower = game.towers.find((tower) => tower.id === towerId);
  const occupiedSlotIds = new Set(
    game.towers
      .filter((tower) => tower.id !== towerId)
      .map((tower) => tower.slotId)
  );

  return game.map.towerSlots
    .map((slot) => slot.id)
    .filter((slotId) => slotId === currentTower?.slotId || !occupiedSlotIds.has(slotId));
}

export function addTower(game: GameDefinition): GameDefinition {
  const [slotId] = getAvailableTowerSlotIds(game);

  if (!slotId) {
    return game;
  }

  const tower: TowerDefinition = {
    id: getNextId("tower", game.towers.map((existingTower) => existingTower.id)),
    slotId,
    range: 3,
    attackIntervalMs: 1000,
    damage: 1
  };

  return {
    ...game,
    towers: [...game.towers, tower]
  };
}

export function updateTowerSlotId(
  game: GameDefinition,
  towerId: string,
  slotId: string
): GameDefinition {
  if (!getAvailableTowerSlotIds(game, towerId).includes(slotId)) {
    return game;
  }

  return {
    ...game,
    towers: game.towers.map((tower) => (
      tower.id === towerId ? { ...tower, slotId } : tower
    ))
  };
}

export function updateTowerNumber(
  game: GameDefinition,
  towerId: string,
  field: TowerNumberField,
  value: number
): GameDefinition {
  return {
    ...game,
    towers: game.towers.map((tower) => (
      tower.id === towerId ? { ...tower, [field]: value } : tower
    ))
  };
}

export function removeTower(game: GameDefinition, towerId: string): GameDefinition {
  return {
    ...game,
    towers: game.towers.filter((tower) => tower.id !== towerId)
  };
}

export function addWave(game: GameDefinition): GameDefinition {
  const unit = game.units[0];
  const path = game.map.paths[0];

  if (!unit || !path) {
    return game;
  }

  const lastStartTimeMs = game.waves.reduce(
    (maxStartTimeMs, wave) => Math.max(maxStartTimeMs, wave.startTimeMs),
    -5000
  );

  return {
    ...game,
    waves: [
      ...game.waves,
      {
        id: getNextId("wave", game.waves.map((wave) => wave.id)),
        startTimeMs: lastStartTimeMs + 5000,
        unitId: unit.id,
        pathId: path.id,
        count: 3,
        intervalMs: 1000
      }
    ]
  };
}

export function updateWaveNumber(
  game: GameDefinition,
  waveId: string,
  field: WaveNumberField,
  value: number
): GameDefinition {
  return {
    ...game,
    waves: game.waves.map((wave) => (
      wave.id === waveId ? { ...wave, [field]: value } : wave
    ))
  };
}

export function updateWaveReference(
  game: GameDefinition,
  waveId: string,
  field: WaveReferenceField,
  id: string
): GameDefinition {
  return {
    ...game,
    waves: game.waves.map((wave) => (
      wave.id === waveId ? { ...wave, [field]: id } : wave
    ))
  };
}

export function removeWave(game: GameDefinition, waveId: string): GameDefinition {
  return {
    ...game,
    waves: game.waves.filter((wave) => wave.id !== waveId)
  };
}

function getNextId(prefix: string, existingIds: string[]): string {
  const existingIdSet = new Set(existingIds);
  let index = 1;

  while (existingIdSet.has(`${prefix}-${index}`)) {
    index += 1;
  }

  return `${prefix}-${index}`;
}
