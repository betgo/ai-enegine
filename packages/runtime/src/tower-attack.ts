import type { MapPoint, TowerDefinition, TowerSlotDefinition } from "@ai-enegine/schema";
import type { InternalMonsterState, InternalTowerState, RuntimeTowerDefinition } from "./simulation";

export function createTowerDefinitions(
  towers: TowerDefinition[],
  towerSlots: TowerSlotDefinition[]
): RuntimeTowerDefinition[] {
  const slotById = new Map<string, MapPoint>();
  const towerIds = new Set<string>();
  const occupiedSlotIds = new Set<string>();

  towerSlots.forEach((slot) => {
    if (slotById.has(slot.id)) {
      throw new Error(`duplicate tower slot id: ${slot.id}`);
    }

    slotById.set(slot.id, { x: slot.x, y: slot.y });
  });

  return towers.map((tower) => {
    if (towerIds.has(tower.id)) {
      throw new Error(`duplicate tower id: ${tower.id}`);
    }

    towerIds.add(tower.id);

    if (occupiedSlotIds.has(tower.slotId)) {
      throw new Error(`duplicate tower slotId: ${tower.slotId}`);
    }

    occupiedSlotIds.add(tower.slotId);

    const slot = slotById.get(tower.slotId);

    if (!slot) {
      throw new Error(`tower slot not found: ${tower.slotId}`);
    }

    return {
      id: tower.id,
      slotId: tower.slotId,
      position: {
        x: slot.x,
        y: slot.y
      },
      range: tower.range,
      attackIntervalMs: tower.attackIntervalMs,
      damage: tower.damage
    };
  });
}

export function updateTowerAttacks(
  towers: InternalTowerState[],
  monsters: InternalMonsterState[],
  deltaMs: number
): void {
  towers.forEach((tower) => {
    tower.cooldownRemainingMs -= deltaMs;

    while (tower.cooldownRemainingMs <= 0) {
      const target = selectTarget(tower, monsters);

      if (!target) {
        return;
      }

      target.hp = Math.max(0, target.hp - tower.damage);
      tower.cooldownRemainingMs += tower.attackIntervalMs;
    }
  });
}

function selectTarget(
  tower: InternalTowerState,
  monsters: InternalMonsterState[]
): InternalMonsterState | undefined {
  const candidates = monsters.filter(
    (monster) =>
      monster.hp > 0 &&
      !monster.reachedEnd &&
      getDistance(tower.position, monster.position) <= tower.range
  );

  candidates.sort((left, right) => {
    if (right.pathProgress !== left.pathProgress) {
      return right.pathProgress - left.pathProgress;
    }

    return compareIds(left.id, right.id);
  });

  return candidates[0];
}

function compareIds(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function getDistance(left: MapPoint, right: MapPoint): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}
