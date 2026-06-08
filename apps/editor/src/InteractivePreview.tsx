import { useEffect, useRef } from "react";
import type { GameDefinition } from "@ai-enegine/schema";
import {
  createTowerDefenseRuntime,
  type SceneSummary,
  type TowerDefenseRuntime
} from "@ai-enegine/runtime";
import {
  Plane,
  Raycaster,
  Vector2,
  Vector3
} from "three";
import {
  addPathPointAt,
  addTowerSlotAt
} from "./editor-state";
import {
  applySelectedMapPoint,
  clampGridPoint,
  getNormalizedPointerPosition,
  type EditorTool,
  type SelectedMapObject
} from "./interactive-map-editor";
import {
  createEditorMarkers,
  type EditorMarker
} from "./interactive-preview-markers";

interface InteractivePreviewProps {
  game: GameDefinition;
  selectedObject: SelectedMapObject | null;
  tool: EditorTool;
  onChange(update: (game: GameDefinition) => GameDefinition): void;
  onError(error: string | null): void;
  onSceneSummaryChange(summary: SceneSummary | null): void;
  onSelectedObjectChange(selectedObject: SelectedMapObject | null): void;
}

export function InteractivePreview({
  game,
  selectedObject,
  tool,
  onChange,
  onError,
  onSceneSummaryChange,
  onSelectedObjectChange
}: InteractivePreviewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<TowerDefenseRuntime | null>(null);
  const markersRef = useRef<EditorMarker[]>([]);
  const dragRef = useRef<{ selected: SelectedMapObject } | null>(null);

  useEffect(() => {
    const container = viewportRef.current;

    if (!container) {
      onSceneSummaryChange(null);
      return;
    }

    try {
      const runtime = createTowerDefenseRuntime({
        game,
        container,
        width: container.clientWidth,
        height: container.clientHeight
      });

      markersRef.current = createEditorMarkers(runtime, game, selectedObject);
      runtime.render();
      runtimeRef.current = runtime;
      onSceneSummaryChange(runtime.getSceneSummary());
      onError(null);

      return () => {
        markersRef.current = [];
        runtime.dispose();
        if (runtimeRef.current === runtime) {
          runtimeRef.current = null;
        }
      };
    } catch (caughtError) {
      runtimeRef.current = null;
      onSceneSummaryChange(null);
      onError(caughtError instanceof Error ? caughtError.message : "Runtime preview failed");
    }
  }, [game, onError, onSceneSummaryChange, selectedObject]);

  function getPickedGridPoint(event: React.PointerEvent<HTMLElement>) {
    const runtime = runtimeRef.current;

    if (!runtime) {
      return null;
    }

    const rect = runtime.renderer.domElement.getBoundingClientRect();
    const pointer = getNormalizedPointerPosition(event.clientX, event.clientY, rect);
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 1, 0), 0);
    const hit = new Vector3();

    raycaster.setFromCamera(new Vector2(pointer.x, pointer.y), runtime.camera);

    if (!raycaster.ray.intersectPlane(plane, hit)) {
      return null;
    }

    return clampGridPoint({ x: hit.x, y: hit.z }, game.map.size);
  }

  function pickSelectedObject(event: React.PointerEvent<HTMLElement>): SelectedMapObject | null {
    const runtime = runtimeRef.current;

    if (!runtime) {
      return null;
    }

    const rect = runtime.renderer.domElement.getBoundingClientRect();
    const pointer = getNormalizedPointerPosition(event.clientX, event.clientY, rect);
    const raycaster = new Raycaster();
    const markers = markersRef.current;

    raycaster.setFromCamera(new Vector2(pointer.x, pointer.y), runtime.camera);

    const [hit] = raycaster.intersectObjects(markers.map((marker) => marker.object), false);

    if (!hit) {
      return null;
    }

    return markers.find((marker) => marker.object === hit.object)?.selected ?? null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const gridPoint = getPickedGridPoint(event);

    if (!gridPoint) {
      return;
    }

    if (tool === "add-path-point") {
      const mainPath = game.map.paths[0];

      if (!mainPath) {
        return;
      }

      onChange((currentGame) => addPathPointAt(currentGame, mainPath.id, gridPoint));
      onSelectedObjectChange({
        kind: "path-point",
        pathId: mainPath.id,
        pointIndex: mainPath.points.length
      });
      return;
    }

    if (tool === "add-tower-slot") {
      const slotId = `slot-${game.map.towerSlots.length + 1}`;

      onChange((currentGame) => addTowerSlotAt(currentGame, gridPoint));
      onSelectedObjectChange({
        kind: "tower-slot",
        slotId
      });
      return;
    }

    const pickedObject = pickSelectedObject(event);

    onSelectedObjectChange(pickedObject);

    if (pickedObject) {
      dragRef.current = { selected: pickedObject };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    const gridPoint = getPickedGridPoint(event);

    if (!gridPoint) {
      return;
    }

    onChange((currentGame) => applySelectedMapPoint(currentGame, drag.selected, gridPoint));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      className="preview-panel"
      ref={viewportRef}
      aria-label="3D tower defense runtime preview"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
