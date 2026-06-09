import type { ReactNode } from "react";
import type { GameDefinition } from "@ai-enegine/schema";
import type { SceneSummary } from "@ai-enegine/runtime";
import type {
  EditorTool,
  SelectedMapObject
} from "./interactive-map-editor";

export type EditorMode = "edit" | "playtest";
export type InspectorTab = "properties" | "gameplay" | "map" | "json";
export type BottomTab = "assets" | "logs" | "errors";
export type ViewportMode = "2D" | "2.5D" | "3D";

export interface ResourceAsset {
  id: string;
  icon: string;
  name: string;
}

export interface EditorShellProps {
  bottomTab: BottomTab;
  editorMode: EditorMode;
  editorTool: EditorTool;
  error: string | null;
  game: GameDefinition;
  gameJson: string;
  inspectorTab: InspectorTab;
  isPlaytestMode: boolean;
  logs: string[];
  preview: ReactNode;
  previewGame: GameDefinition;
  sceneSummary: SceneSummary | null;
  selectedObject: SelectedMapObject | null;
  validationMessage: string;
  validationOk: boolean;
  viewportOverlayMode: ViewportMode;
  onBottomTabChange(tab: BottomTab): void;
  onEditorToolChange(tool: EditorTool): void;
  onEnterEditMode(): void;
  onEnterPlaytestMode(): void;
  onExportGame(): void;
  onImportGame(): void;
  onInspectorTabChange(tab: InspectorTab): void;
  onSelectObject(selectedObject: SelectedMapObject | null): void;
  onViewportOverlayModeChange(mode: ViewportMode): void;
  mapPanel: ReactNode;
  gameplayPanel: ReactNode;
}
