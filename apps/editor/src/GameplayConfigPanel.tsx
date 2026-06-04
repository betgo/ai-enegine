import type { GameDefinition } from "@ai-enegine/schema";
import {
  addMonsterUnit,
  addTower,
  addWave,
  getAvailableTowerSlotIds,
  removeTower,
  removeWave,
  updateBaseMaxHp,
  updateMonsterUnitNumber,
  updateTowerNumber,
  updateTowerSlotId,
  updateWaveNumber,
  updateWaveReference
} from "./gameplay-editor-state";
import { NumberField } from "./NumberField";

interface GameplayConfigPanelProps {
  game: GameDefinition;
  onChange(update: (game: GameDefinition) => GameDefinition): void;
}

export function GameplayConfigPanel({ game, onChange }: GameplayConfigPanelProps) {
  const canAddTower = getAvailableTowerSlotIds(game).length > 0;
  const canAddWave = game.units.length > 0 && game.map.paths.length > 0;

  return (
    <>
      <section className="editor-section" aria-labelledby="base-heading">
        <h2 id="base-heading">Base</h2>
        <div className="field-grid">
          <NumberField
            label="Max HP"
            min={1}
            value={game.base.maxHp}
            onChange={(value) => onChange((currentGame) => updateBaseMaxHp(currentGame, value))}
          />
        </div>
      </section>

      <section className="editor-section" aria-labelledby="monsters-heading">
        <div className="section-title-row">
          <h2 id="monsters-heading">Monsters</h2>
          <button type="button" onClick={() => onChange(addMonsterUnit)}>
            Add monster
          </button>
        </div>
        <div className="item-list">
          {game.units.map((unit) => (
            <div className="gameplay-item" key={unit.id}>
              <h3>{unit.id}</h3>
              <div className="field-grid triple">
                <NumberField
                  label="Speed"
                  min={0.1}
                  value={unit.speed}
                  onChange={(value) =>
                    onChange((currentGame) => updateMonsterUnitNumber(currentGame, unit.id, "speed", value))
                  }
                />
                <NumberField
                  label="Max HP"
                  min={1}
                  value={unit.maxHp}
                  onChange={(value) =>
                    onChange((currentGame) => updateMonsterUnitNumber(currentGame, unit.id, "maxHp", value))
                  }
                />
                <NumberField
                  label="Leak Damage"
                  min={1}
                  value={unit.leakDamage}
                  onChange={(value) =>
                    onChange((currentGame) => updateMonsterUnitNumber(currentGame, unit.id, "leakDamage", value))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="editor-section" aria-labelledby="towers-heading">
        <div className="section-title-row">
          <h2 id="towers-heading">Towers</h2>
          <button disabled={!canAddTower} type="button" onClick={() => onChange(addTower)}>
            Add tower
          </button>
        </div>
        <div className="item-list">
          {game.towers.map((tower) => (
            <div className="gameplay-item" key={tower.id}>
              <div className="section-title-row">
                <h3>{tower.id}</h3>
                <button type="button" onClick={() => onChange((currentGame) => removeTower(currentGame, tower.id))}>
                  Remove
                </button>
              </div>
              <label className="select-field">
                <span>Slot</span>
                <select
                  value={tower.slotId}
                  onChange={(event) =>
                    onChange((currentGame) => updateTowerSlotId(currentGame, tower.id, event.currentTarget.value))
                  }
                >
                  {getAvailableTowerSlotIds(game, tower.id).map((slotId) => (
                    <option key={slotId} value={slotId}>
                      {slotId}
                    </option>
                  ))}
                </select>
              </label>
              <div className="field-grid triple">
                <NumberField
                  label="Range"
                  min={0.1}
                  value={tower.range}
                  onChange={(value) =>
                    onChange((currentGame) => updateTowerNumber(currentGame, tower.id, "range", value))
                  }
                />
                <NumberField
                  label="Interval"
                  min={1}
                  value={tower.attackIntervalMs}
                  onChange={(value) =>
                    onChange((currentGame) =>
                      updateTowerNumber(currentGame, tower.id, "attackIntervalMs", value)
                    )
                  }
                />
                <NumberField
                  label="Damage"
                  min={1}
                  value={tower.damage}
                  onChange={(value) =>
                    onChange((currentGame) => updateTowerNumber(currentGame, tower.id, "damage", value))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="editor-section" aria-labelledby="waves-heading">
        <div className="section-title-row">
          <h2 id="waves-heading">Waves</h2>
          <button disabled={!canAddWave} type="button" onClick={() => onChange(addWave)}>
            Add wave
          </button>
        </div>
        <div className="item-list">
          {game.waves.map((wave) => (
            <div className="gameplay-item" key={wave.id}>
              <div className="section-title-row">
                <h3>{wave.id}</h3>
                <button type="button" onClick={() => onChange((currentGame) => removeWave(currentGame, wave.id))}>
                  Remove
                </button>
              </div>
              <div className="field-grid">
                <label className="select-field">
                  <span>Monster</span>
                  <select
                    value={wave.unitId}
                    onChange={(event) =>
                      onChange((currentGame) =>
                        updateWaveReference(currentGame, wave.id, "unitId", event.currentTarget.value)
                      )
                    }
                  >
                    {game.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="select-field">
                  <span>Path</span>
                  <select
                    value={wave.pathId}
                    onChange={(event) =>
                      onChange((currentGame) =>
                        updateWaveReference(currentGame, wave.id, "pathId", event.currentTarget.value)
                      )
                    }
                  >
                    {game.map.paths.map((path) => (
                      <option key={path.id} value={path.id}>
                        {path.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="field-grid triple">
                <NumberField
                  label="Start"
                  min={0}
                  value={wave.startTimeMs}
                  onChange={(value) =>
                    onChange((currentGame) => updateWaveNumber(currentGame, wave.id, "startTimeMs", value))
                  }
                />
                <NumberField
                  label="Count"
                  min={1}
                  value={wave.count}
                  onChange={(value) =>
                    onChange((currentGame) => updateWaveNumber(currentGame, wave.id, "count", value))
                  }
                />
                <NumberField
                  label="Interval"
                  min={1}
                  value={wave.intervalMs}
                  onChange={(value) =>
                    onChange((currentGame) => updateWaveNumber(currentGame, wave.id, "intervalMs", value))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
