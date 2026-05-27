export interface GameDefinition {
  version: string;
  base: BaseDefinition;
  map: GameMap;
  units: UnitDefinition[];
  towers: TowerDefinition[];
  waves: WaveDefinition[];
  triggers: TriggerDefinition[];
}

export interface BaseDefinition {
  maxHp: number;
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

export type UnitKind = "monster";

export interface MonsterUnitDefinition {
  id: string;
  kind: UnitKind;
  pathId: string;
  speed: number;
  maxHp: number;
  leakDamage: number;
}

export interface TowerDefinition {
  id: string;
  slotId: string;
  range: number;
  attackIntervalMs: number;
  damage: number;
}

export type UnitDefinition = MonsterUnitDefinition;
export type WaveDefinition = Record<string, never>;
export type TriggerDefinition = Record<string, never>;
