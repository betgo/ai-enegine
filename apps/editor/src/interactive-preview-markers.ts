import type { GameDefinition } from "@ai-enegine/schema";
import type { TowerDefenseRuntime } from "@ai-enegine/runtime";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D
} from "three";
import type { SelectedMapObject } from "./interactive-map-editor";

export interface EditorMarker {
  object: Object3D;
  selected: SelectedMapObject;
}

export function createEditorMarkers(
  runtime: TowerDefenseRuntime,
  game: GameDefinition,
  selectedObject: SelectedMapObject | null
): EditorMarker[] {
  return [
    ...createPathPointMarkers(runtime, game, selectedObject),
    ...createTowerSlotMarkers(runtime, game, selectedObject)
  ];
}

function createPathPointMarkers(
  runtime: TowerDefenseRuntime,
  game: GameDefinition,
  selectedObject: SelectedMapObject | null
): EditorMarker[] {
  return game.map.paths.flatMap((path) =>
    path.points.map((point, pointIndex) => {
      const selected: SelectedMapObject = {
        kind: "path-point",
        pathId: path.id,
        pointIndex
      };
      const marker = new Mesh(
        new BoxGeometry(0.56, 0.34, 0.56),
        new MeshBasicMaterial({
          color: isSameSelection(selectedObject, selected) ? 0x4ade80 : 0xffd166
        })
      );

      marker.name = `editor:path-point:${path.id}:${pointIndex}`;
      marker.position.set(point.x, 0.42, point.y);
      runtime.scene.add(marker);

      return {
        object: marker,
        selected
      };
    })
  );
}

function createTowerSlotMarkers(
  runtime: TowerDefenseRuntime,
  game: GameDefinition,
  selectedObject: SelectedMapObject | null
): EditorMarker[] {
  return game.map.towerSlots.flatMap((slot) => {
    const marker = runtime.scene.getObjectByName(`tower-slot:${slot.id}`);

    if (!marker) {
      return [];
    }

    const selected: SelectedMapObject = {
      kind: "tower-slot",
      slotId: slot.id
    };
    const hitbox = new Mesh(
      new BoxGeometry(0.82, 0.3, 0.82),
      new MeshBasicMaterial({
        color: 0xffffff,
        depthWrite: false,
        opacity: 0.01,
        transparent: true
      })
    );

    hitbox.name = `editor:tower-slot-hitbox:${slot.id}`;
    hitbox.position.set(slot.x, 0.28, slot.y);
    runtime.scene.add(hitbox);

    marker.traverse((child) => {
      const mesh = child as Mesh;

      if ("material" in mesh && mesh.material instanceof MeshBasicMaterial) {
        mesh.material.color.setHex(isSameSelection(selectedObject, selected) ? 0x4ade80 : 0x6c63ff);
      }
    });

    return [{
      object: hitbox,
      selected
    }];
  });
}

function isSameSelection(left: SelectedMapObject | null, right: SelectedMapObject): boolean {
  if (!left || left.kind !== right.kind) {
    return false;
  }

  if (left.kind === "path-point" && right.kind === "path-point") {
    return left.pathId === right.pathId && left.pointIndex === right.pointIndex;
  }

  if (left.kind === "tower-slot" && right.kind === "tower-slot") {
    return left.slotId === right.slotId;
  }

  return false;
}
