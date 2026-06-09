import type { CSSProperties } from "react";
import type { GameDefinition } from "@ai-enegine/schema";
import type { SelectedMapObject } from "./interactive-map-editor";
import {
  getUnitDisplayName,
  isSelectedObject,
  terrainTools
} from "./editor-shell-data";

interface SceneTreePanelProps {
  game: GameDefinition;
  selectedObject: SelectedMapObject | null;
  onSelectObject(selectedObject: SelectedMapObject | null): void;
}

export function SceneTreePanel({ game, selectedObject, onSelectObject }: SceneTreePanelProps) {
  return (
    <aside className="left-sidebar" aria-label="Scene tree and terrain tools">
      <section className="scene-tree" aria-labelledby="scene-tree-heading">
        <h2 id="scene-tree-heading">场景树</h2>
        <label className="panel-search"><span>⌕</span><input placeholder="搜索..." type="search" /></label>
        <div className="tree-list">
          <TreeRow icon="◈" label="地图根节点" depth={0} />
          <TreeRow icon="▰" label={`地形 (${game.map.tiles.length})`} depth={1} />
          <TreeRow icon="☀" label="光照" depth={1} />
          <TreeRow icon="☁" label="天气" depth={1} />
          <TreeRow icon="♙" label="玩家" depth={1} />
          {game.units.map((unit, index) => (
            <TreeRow
              active={index === 0 && !selectedObject}
              icon="U"
              key={unit.id}
              label={`${getUnitDisplayName(unit)} x${game.waves[0]?.count ?? 1}`}
              depth={2}
              onClick={() => onSelectObject(null)}
            />
          ))}
          <PathRows game={game} selectedObject={selectedObject} onSelectObject={onSelectObject} />
          <TowerSlotRows game={game} selectedObject={selectedObject} onSelectObject={onSelectObject} />
          <TreeRow icon="B" label={`基地 HP ${game.base.maxHp}`} depth={1} />
          <TreeRow icon="T" label={`防御塔 (${game.towers.length})`} depth={1} />
          <TreeRow icon="W" label={`波次 (${game.waves.length})`} depth={1} />
          <TreeRow icon="⚙" label={`触发器 (${game.triggers.length})`} depth={1} />
          <TreeRow icon="AI" label="AI" depth={1} />
          <TreeRow icon="✦" label="装饰物" depth={1} />
        </div>
      </section>
      <TerrainPanel />
    </aside>
  );
}

function PathRows({ game, selectedObject, onSelectObject }: SceneTreePanelProps) {
  return (
    <>
      <TreeRow icon="⌁" label="路径" depth={1} />
      {game.map.paths.flatMap((path) => [
        <TreeRow icon="⌁" key={path.id} label={path.id} depth={2} />,
        ...path.points.map((_, pointIndex) => {
          const selected: SelectedMapObject = { kind: "path-point", pathId: path.id, pointIndex };

          return (
            <TreeRow
              active={isSelectedObject(selectedObject, selected)}
              icon="•"
              key={`${path.id}:${pointIndex}`}
              label={`路径点 #${pointIndex + 1}`}
              depth={3}
              onClick={() => onSelectObject(selected)}
            />
          );
        })
      ])}
    </>
  );
}

function TowerSlotRows({ game, selectedObject, onSelectObject }: SceneTreePanelProps) {
  return (
    <>
      <TreeRow icon="▣" label="塔位" depth={1} />
      {game.map.towerSlots.map((slot) => {
        const selected: SelectedMapObject = { kind: "tower-slot", slotId: slot.id };

        return (
          <TreeRow
            active={isSelectedObject(selectedObject, selected)}
            icon="▣"
            key={slot.id}
            label={slot.id}
            depth={2}
            onClick={() => onSelectObject(selected)}
          />
        );
      })}
    </>
  );
}

function TreeRow({ active = false, depth, icon, label, onClick }: {
  active?: boolean;
  depth: number;
  icon: string;
  label: string;
  onClick?(): void;
}) {
  const style = { "--tree-depth": depth } as CSSProperties;
  const content = <><span className="tree-icon">{icon}</span><span className="tree-label">{label}</span></>;

  return onClick ? (
    <button className={active ? "tree-row active" : "tree-row"} style={style} type="button" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={active ? "tree-row active" : "tree-row"} style={style}>{content}</div>
  );
}

function TerrainPanel() {
  return (
    <section className="terrain-panel" aria-labelledby="terrain-panel-heading">
      <h2 id="terrain-panel-heading">地形工具</h2>
      <div className="terrain-tool-grid">
        {terrainTools.map(([label, icon]) => (
          <button disabled key={label} type="button"><span>{icon}</span><small>{label}</small></button>
        ))}
      </div>
    </section>
  );
}
