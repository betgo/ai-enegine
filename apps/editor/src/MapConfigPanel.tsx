import type { GameDefinition } from "@ai-enegine/schema";
import {
  addPathPoint,
  addTowerSlot,
  removePathPoint,
  updateMapSize,
  updatePathPoint,
  updateTowerSlot
} from "./editor-state";
import { NumberField } from "./NumberField";

interface MapConfigPanelProps {
  game: GameDefinition;
  onChange(update: (game: GameDefinition) => GameDefinition): void;
}

export function MapConfigPanel({ game, onChange }: MapConfigPanelProps) {
  return (
    <>
      <section className="editor-section" aria-labelledby="map-size-heading">
        <h2 id="map-size-heading">Map Size</h2>
        <div className="field-grid">
          <NumberField
            label="Width"
            min={1}
            value={game.map.size.width}
            onChange={(value) => onChange((currentGame) => updateMapSize(currentGame, "width", value))}
          />
          <NumberField
            label="Height"
            min={1}
            value={game.map.size.height}
            onChange={(value) => onChange((currentGame) => updateMapSize(currentGame, "height", value))}
          />
        </div>
      </section>

      <section className="editor-section" aria-labelledby="path-points-heading">
        <h2 id="path-points-heading">Path Points</h2>
        {game.map.paths.map((path) => (
          <div className="item-list" key={path.id}>
            <div className="section-title-row">
              <h3>{path.id}</h3>
              <button type="button" onClick={() => onChange((currentGame) => addPathPoint(currentGame, path.id))}>
                Add point
              </button>
            </div>
            {path.points.map((point, pointIndex) => (
              <div className="field-row" key={`${path.id}:${pointIndex}`}>
                <span>#{pointIndex + 1}</span>
                <NumberField
                  label="X"
                  min={0}
                  value={point.x}
                  onChange={(value) =>
                    onChange((currentGame) => updatePathPoint(currentGame, path.id, pointIndex, "x", value))
                  }
                />
                <NumberField
                  label="Y"
                  min={0}
                  value={point.y}
                  onChange={(value) =>
                    onChange((currentGame) => updatePathPoint(currentGame, path.id, pointIndex, "y", value))
                  }
                />
                <button
                  disabled={path.points.length <= 2}
                  type="button"
                  onClick={() => onChange((currentGame) => removePathPoint(currentGame, path.id, pointIndex))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="editor-section" aria-labelledby="tower-slots-heading">
        <div className="section-title-row">
          <h2 id="tower-slots-heading">Tower Slots</h2>
          <button type="button" onClick={() => onChange(addTowerSlot)}>
            Add slot
          </button>
        </div>
        <div className="item-list">
          {game.map.towerSlots.map((slot) => (
            <div className="field-row" key={slot.id}>
              <span>{slot.id}</span>
              <NumberField
                label="X"
                min={0}
                value={slot.x}
                onChange={(value) => onChange((currentGame) => updateTowerSlot(currentGame, slot.id, "x", value))}
              />
              <NumberField
                label="Y"
                min={0}
                value={slot.y}
                onChange={(value) => onChange((currentGame) => updateTowerSlot(currentGame, slot.id, "y", value))}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
