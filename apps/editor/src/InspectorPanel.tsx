import type { ReactNode } from "react";
import type { GameDefinition } from "@ai-enegine/schema";
import type { SceneSummary } from "@ai-enegine/runtime";
import type { SelectedMapObject } from "./interactive-map-editor";
import {
  getSelectedLabel,
  getUnitDisplayName
} from "./editor-shell-data";
import type { InspectorTab } from "./editor-shell-types";

interface InspectorPanelProps {
  game: GameDefinition;
  gameJson: string;
  gameplayPanel: ReactNode;
  inspectorTab: InspectorTab;
  mapPanel: ReactNode;
  previewGame: GameDefinition;
  sceneSummary: SceneSummary | null;
  selectedObject: SelectedMapObject | null;
  validationMessage: string;
  validationOk: boolean;
  onInspectorTabChange(tab: InspectorTab): void;
}

export function InspectorPanel({
  game,
  gameJson,
  gameplayPanel,
  inspectorTab,
  mapPanel,
  previewGame,
  sceneSummary,
  selectedObject,
  validationMessage,
  validationOk,
  onInspectorTabChange
}: InspectorPanelProps) {
  const selectedLabel = getSelectedLabel(selectedObject);

  return (
    <aside className="right-inspector" aria-label="Property inspector">
      <InspectorHeader game={game} selectedLabel={selectedLabel} selectedObject={selectedObject} />
      <div className="inspector-tabs" role="tablist" aria-label="Inspector tabs">
        {[
          ["properties", "属性"],
          ["gameplay", "玩法"],
          ["map", "地图"],
          ["json", "JSON"]
        ].map(([tab, label]) => (
          <button
            aria-selected={inspectorTab === tab}
            className={inspectorTab === tab ? "active" : undefined}
            key={tab}
            type="button"
            onClick={() => onInspectorTabChange(tab as InspectorTab)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="inspector-content">
        {inspectorTab === "properties" ? (
          <PropertiesPanel
            game={game}
            previewGame={previewGame}
            sceneSummary={sceneSummary}
            selectedObject={selectedObject}
            validationMessage={validationMessage}
            validationOk={validationOk}
          />
        ) : null}
        {inspectorTab === "gameplay" ? gameplayPanel : null}
        {inspectorTab === "map" ? mapPanel : null}
        {inspectorTab === "json" ? <JsonPanel gameJson={gameJson} /> : null}
      </div>
    </aside>
  );
}

function InspectorHeader({
  game,
  selectedLabel,
  selectedObject
}: {
  game: GameDefinition;
  selectedLabel: string;
  selectedObject: SelectedMapObject | null;
}) {
  const primaryUnit = game.units[0];

  return (
    <header className="inspector-object-header">
      <h2>属性检查器</h2>
      <div className="object-summary">
        <div className="object-portrait">{selectedObject?.kind === "tower-slot" ? "▣" : "U"}</div>
        <div>
          <strong>{selectedObject ? selectedLabel : getUnitDisplayName(primaryUnit)}</strong>
          <span>{selectedObject ? "地图对象" : "单位"}</span>
          <small>ID: {selectedObject ? selectedLabel.replaceAll(" ", "_") : primaryUnit?.id ?? game.map.id}</small>
        </div>
      </div>
    </header>
  );
}

function PropertiesPanel({
  game,
  previewGame,
  sceneSummary,
  selectedObject,
  validationMessage,
  validationOk
}: {
  game: GameDefinition;
  previewGame: GameDefinition;
  sceneSummary: SceneSummary | null;
  selectedObject: SelectedMapObject | null;
  validationMessage: string;
  validationOk: boolean;
}) {
  const selectedPoint = getSelectedPoint(game, selectedObject);
  const selectedSlot = getSelectedSlot(game, selectedObject);

  return (
    <section className="properties-panel" aria-labelledby="properties-heading">
      <h2 id="properties-heading">基础属性</h2>
      <div className="property-grid">
        <PropertyRow label="名称" value={selectedObject ? getSelectedLabel(selectedObject) : previewGame.map.name} />
        <PropertyRow label="地图" value={previewGame.map.name} swatch />
        <PropertyRow label="生命值" value={String(game.base.maxHp)} />
        <PropertyRow label="地图尺寸" value={`${previewGame.map.size.width} x ${previewGame.map.size.height}`} />
        <PropertyRow label="Tiles" value={String(sceneSummary?.tileCount ?? previewGame.map.tiles.length)} />
        <PropertyRow label="Paths" value={String(sceneSummary?.pathCount ?? previewGame.map.paths.length)} />
        <PropertyRow label="Tower Slots" value={String(sceneSummary?.towerSlotCount ?? previewGame.map.towerSlots.length)} />
        {selectedPoint ? <><PropertyRow label="Point X" value={String(selectedPoint.x)} /><PropertyRow label="Point Y" value={String(selectedPoint.y)} /></> : null}
        {selectedSlot ? <><PropertyRow label="Slot X" value={String(selectedSlot.x)} /><PropertyRow label="Slot Y" value={String(selectedSlot.y)} /></> : null}
        <PropertyRow label="校验状态" value={validationOk ? "JSON valid" : validationMessage} />
      </div>
      <h2>行为</h2>
      <div className="checkbox-list">
        {["可采集资源", "可通途", "可施修", "可攻击"].map((label, index) => (
          <label key={label}><input checked={index < 2} readOnly type="checkbox" /><span>{label}</span></label>
        ))}
      </div>
      <h2>事件</h2>
      <div className="event-list">
        {["On Spawn", "On Death", "On Attack", "On Idle"].map((eventName) => (
          <button disabled key={eventName} type="button"><span>F</span>{eventName}</button>
        ))}
      </div>
    </section>
  );
}

function JsonPanel({ gameJson }: { gameJson: string }) {
  return (
    <section className="json-section compact-json" aria-labelledby="json-heading">
      <h2 id="json-heading">game.json</h2>
      <textarea readOnly value={gameJson} aria-label="Current game JSON" />
    </section>
  );
}

function PropertyRow({ label, swatch = false, value }: { label: string; swatch?: boolean; value: string }) {
  return (
    <label className="property-row">
      <span>{label}</span>
      <span className="property-value">{value}{swatch ? <i aria-hidden="true" /> : null}</span>
    </label>
  );
}

function getSelectedPoint(game: GameDefinition, selected: SelectedMapObject | null) {
  if (selected?.kind !== "path-point") {
    return null;
  }

  return game.map.paths.find((path) => path.id === selected.pathId)?.points[selected.pointIndex] ?? null;
}

function getSelectedSlot(game: GameDefinition, selected: SelectedMapObject | null) {
  if (selected?.kind !== "tower-slot") {
    return null;
  }

  return game.map.towerSlots.find((slot) => slot.id === selected.slotId) ?? null;
}
