import type {
  GameDefinition,
  MonsterUnitDefinition,
  TowerDefinition,
  WaveDefinition
} from "@ai-enegine/schema";
import type {
  EditorTool,
  SelectedMapObject
} from "./interactive-map-editor";
import type { ResourceAsset } from "./editor-shell-types";

export const menuItems = ["文件", "编辑", "视图", "地图", "对象", "触发器", "工具", "窗口", "帮助"];

export const toolItems: Array<{
  id: EditorTool | "undo" | "redo" | "move" | "rotate" | "terrain" | "ai";
  label: string;
  icon: string;
  disabled?: boolean;
}> = [
  { id: "undo", label: "撤销", icon: "↶", disabled: true },
  { id: "redo", label: "重做", icon: "↷", disabled: true },
  { id: "select", label: "选择", icon: "➤" },
  { id: "move", label: "移动", icon: "✥", disabled: true },
  { id: "rotate", label: "旋转", icon: "⟳", disabled: true },
  { id: "terrain", label: "地形", icon: "▰", disabled: true },
  { id: "add-path-point", label: "路径", icon: "⌁", disabled: true },
  { id: "add-tower-slot", label: "塔位", icon: "▣", disabled: true },
  { id: "ai", label: "AI", icon: "◌", disabled: true }
];

export const terrainTools = [
  ["平滑", "▰"],
  ["抬高", "▱"],
  ["降低", "▰"],
  ["平坦化", "▱"],
  ["纹理", "◈"],
  ["杂雕", "◇"],
  ["填充", "⬚"],
  ["清除", "⬚"]
];

export const assetCategories = ["全部资源", "地形", "单位", "建筑", "特效", "音效", "物品", "UI", "脚本"];

export function getResourceAssets(game: GameDefinition): ResourceAsset[] {
  const unitAssets = game.units.map((unit) => ({
    id: unit.id,
    icon: "U",
    name: getUnitDisplayName(unit)
  }));
  const towerAssets = game.towers.map((tower) => ({
    id: tower.id,
    icon: "T",
    name: getTowerDisplayName(tower)
  }));
  const waveAssets = game.waves.map((wave) => ({
    id: wave.id,
    icon: "W",
    name: getWaveDisplayName(wave)
  }));
  const fallbackAssets: ResourceAsset[] = [
    { id: "hum_footman", icon: "F", name: "步兵" },
    { id: "hum_knight", icon: "K", name: "骑士" },
    { id: "hum_priest", icon: "P", name: "牧师" },
    { id: "hum_musketeer", icon: "M", name: "火枪手" },
    { id: "hero_mage", icon: "H", name: "英雄-大法师" }
  ];

  return [...unitAssets, ...towerAssets, ...waveAssets, ...fallbackAssets].slice(0, 10);
}

export function getSelectedLabel(selected: SelectedMapObject | null): string {
  if (!selected) {
    return "无";
  }

  if (selected.kind === "path-point") {
    return `${selected.pathId} #${selected.pointIndex + 1}`;
  }

  return selected.slotId;
}

export function isSelectedObject(left: SelectedMapObject | null, right: SelectedMapObject): boolean {
  if (!left || left.kind !== right.kind) {
    return false;
  }

  if (left.kind === "path-point" && right.kind === "path-point") {
    return left.pathId === right.pathId && left.pointIndex === right.pointIndex;
  }

  return left.kind === "tower-slot" && right.kind === "tower-slot" && left.slotId === right.slotId;
}

export function getUnitDisplayName(unit: MonsterUnitDefinition | undefined): string {
  if (!unit) {
    return "农民";
  }

  return unit.id === "monster-basic" ? "农民" : unit.id;
}

function getTowerDisplayName(tower: TowerDefinition): string {
  return tower.id === "tower-1" ? "哨塔" : tower.id;
}

function getWaveDisplayName(wave: WaveDefinition): string {
  return wave.id === "wave-1" ? "第一波" : wave.id;
}
