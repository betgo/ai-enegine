import type { GameDefinition, MapPoint, MapSize } from "@ai-enegine/schema";
import {
  updatePathPoint,
  updateTowerSlot
} from "./editor-state";

export type EditorTool = "select" | "add-path-point" | "add-tower-slot";

export type SelectedMapObject =
  | {
      kind: "path-point";
      pathId: string;
      pointIndex: number;
    }
  | {
      kind: "tower-slot";
      slotId: string;
    };

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getNormalizedPointerPosition(
  clientX: number,
  clientY: number,
  rect: RectLike
): { x: number; y: number } {
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

  return {
    x: Object.is(x, -0) ? 0 : x,
    y: Object.is(y, -0) ? 0 : y
  };
}

export function clampGridPoint(point: MapPoint, mapSize: MapSize): MapPoint {
  return {
    x: clamp(Math.round(point.x), 0, mapSize.width - 1),
    y: clamp(Math.round(point.y), 0, mapSize.height - 1)
  };
}

export function applySelectedMapPoint(
  game: GameDefinition,
  selected: SelectedMapObject,
  point: MapPoint
): GameDefinition {
  if (selected.kind === "path-point") {
    return updatePathPoint(
      updatePathPoint(game, selected.pathId, selected.pointIndex, "x", point.x),
      selected.pathId,
      selected.pointIndex,
      "y",
      point.y
    );
  }

  return updateTowerSlot(
    updateTowerSlot(game, selected.slotId, "x", point.x),
    selected.slotId,
    "y",
    point.y
  );
}

export function getSelectedMapObjectLabel(selected: SelectedMapObject | null): string {
  if (!selected) {
    return "None";
  }

  if (selected.kind === "path-point") {
    return `${selected.pathId} point #${selected.pointIndex + 1}`;
  }

  return selected.slotId;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
