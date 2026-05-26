import { useState } from 'react';
import {
  materialSlots,
  wallColorPalettes,
  floorTextures,
  regalWoodMaterials,
  regalBracketMaterials,
  REGAL_MAX_ROWS,
  REGAL_HEIGHT_MIN_M,
  REGAL_HEIGHT_MAX_M,
  REGAL_DEPTH_MIN_M,
  REGAL_DEPTH_MAX_M,
  REGAL_LENGTH_MIN_M,
  WAND_NORD_LENGTH_M,
  type SlotConfig,
  type Variant,
  type RegalState,
} from '../data/materials';

type Props = {
  slotColors: Record<string, string>;
  activeFloorId: string | null;
  floorRotated: boolean;
  couchVisible: boolean;
  couchX: number;
  couchZ: number;
  couchRot: number;
  couchBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  variants: Variant[];
  activeVariantId: string | null;
  regal: RegalState;
  onColorChange: (slotId: string, hex: string) => void;
  onFloorSelect: (floorId: string | null, hex: string) => void;
  onFloorRotate: () => void;
  onCouchVisibleChange: (v: boolean) => void;
  onCouchXChange: (x: number) => void;
  onCouchZChange: (z: number) => void;
  onCouchRotChange: (r: number) => void;
  onRegalRowCountChange: (n: number) => void;
  onRegalDepthChange: (d: number) => void;
  onRegalWoodChange: (id: string) => void;
  onRegalBracketChange: (id: string) => void;
  onRegalRowHeightChange: (index: number, heightM: number) => void;
  onRegalRowEdgeChange: (index: number, side: 'left' | 'right', xEdge: number) => void;
  onRegalRowReset: (index: number) => void;
  onSaveVariant: () => void;
  onLoadVariant: (id: string) => void;
  onDeleteVariant: (id: string) => void;
  onReset: () => void;
};

export function MaterialPicker({
  slotColors, activeFloorId, floorRotated,
  couchVisible, couchX, couchZ, couchRot, couchBounds,
  variants, activeVariantId,
  regal,
  onColorChange, onFloorSelect, onFloorRotate,
  onCouchVisibleChange, onCouchXChange, onCouchZChange, onCouchRotChange,
  onRegalRowCountChange, onRegalDepthChange, onRegalWoodChange, onRegalBracketChange,
  onRegalRowHeightChange, onRegalRowEdgeChange, onRegalRowReset,
  onSaveVariant, onLoadVariant, onDeleteVariant,
  onReset,
}: Props) {
  const [activeSlot, setActiveSlot] = useState<string>(materialSlots[0].slotId);
  const [couchOpen, setCouchOpen] = useState<boolean>(false);
  const [regalOpen, setRegalOpen] = useState<boolean>(false);
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

  const groups = materialSlots.reduce<Record<string, SlotConfig[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const groupOrder: SlotConfig['category'][] = ['wand', 'boden', 'decke', 'tuer', 'fenster', 'heizkoerper'];
  const groupLabels: Record<SlotConfig['category'], string> = {
    wand: 'Wände',
    boden: 'Boden',
    decke: 'Decke',
    tuer: 'Türen',
    fenster: 'Fenster',
    heizkoerper: 'Heizkörper',
  };

  const activeSlotConfig = materialSlots.find((s) => s.slotId === activeSlot)!;
  const showFloorOptions = activeSlotConfig.category === 'boden';

  return (
    <aside className="picker">
      <header className="picker-header">
        <h1>Wohnzimmer</h1>
        <button className="reset-btn" onClick={onReset}>Zurücksetzen</button>
      </header>

      <div className="variants-block">
        <div className="variants-header">
          <h3>Varianten</h3>
          <button className="variant-save-btn" onClick={onSaveVariant} title="Aktuellen Stand als Variante speichern">
            + Speichern
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="variants-empty">Noch keine gespeichert.</p>
        ) : (
          <div className="variants-list">
            {variants.map((v) => (
              <div key={v.id} className={`variant-row ${activeVariantId === v.id ? 'active' : ''}`}>
                <button
                  className="variant-load"
                  onClick={() => onLoadVariant(v.id)}
                  title="Variante laden"
                >
                  {v.name}
                </button>
                <button
                  className="variant-delete"
                  onClick={() => {
                    if (window.confirm(`Variante „${v.name}" löschen?`)) {
                      onDeleteVariant(v.id);
                    }
                  }}
                  title="Löschen"
                  aria-label={`${v.name} löschen`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="slot-list">
        {groupOrder.map((cat) => (
          <div key={cat} className="slot-group">
            <h3>{groupLabels[cat]}</h3>
            {groups[cat]?.map((slot) => (
              <button
                key={slot.slotId}
                className={`slot-row ${activeSlot === slot.slotId ? 'active' : ''}`}
                onClick={() => setActiveSlot(slot.slotId)}
              >
                <span className="swatch" style={{ background: slotColors[slot.slotId] }} />
                <span className="slot-label">{slot.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="picker-detail">
        <h2>{activeSlotConfig.label}</h2>

        <div className="hex-row">
          <input
            type="color"
            value={slotColors[activeSlot]}
            onChange={(e) => onColorChange(activeSlot, e.target.value)}
            className="hex-input"
          />
          <input
            type="text"
            value={slotColors[activeSlot].toUpperCase()}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(v)) onColorChange(activeSlot, v);
            }}
            className="hex-text"
          />
        </div>

        {showFloorOptions ? (
          <div className="palette-block">
            <div className="floor-header">
              <h4>Vinyl-Designboden</h4>
              {activeFloorId && (
                <div className="floor-actions">
                  <button
                    className={`floor-rotate-btn ${floorRotated ? 'active' : ''}`}
                    onClick={onFloorRotate}
                    title="Verlegerichtung um 90° drehen"
                  >
                    {floorRotated ? '90°' : '0°'}
                  </button>
                  <button
                    className="floor-clear-btn"
                    onClick={() => onFloorSelect(null, slotColors[activeSlot])}
                    title="Textur entfernen, nur Farbe behalten"
                  >
                    Textur aus
                  </button>
                </div>
              )}
            </div>
            <div className="floor-grid">
              {floorTextures.map((f) => (
                <button
                  key={f.id}
                  className={`floor-tile ${activeFloorId === f.id ? 'active' : ''}`}
                  style={{ background: f.hexFallback }}
                  onClick={() => onFloorSelect(f.id, f.hexFallback)}
                  title={f.name}
                >
                  <span className="floor-name">{f.name}</span>
                  <span className="floor-bright">{f.brightness}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          wallColorPalettes.map((p) => (
            <div key={p.name} className="palette-block">
              <h4>{p.name}</h4>
              <div className="color-grid">
                {p.colors.map((c) => (
                  <button
                    key={c.id}
                    className="color-swatch"
                    style={{ background: c.hex }}
                    onClick={() => onColorChange(activeSlot, c.hex)}
                    title={`${c.name}${c.code ? ` (${c.code})` : ''}`}
                  >
                    <span className="swatch-name">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="couch-block">
        <button
          className="couch-toggle"
          onClick={() => setCouchOpen((o) => !o)}
          aria-expanded={couchOpen}
        >
          <span>Couch</span>
          <span className="couch-chevron">{couchOpen ? '▾' : '▸'}</span>
        </button>
        {couchOpen && (
          <div className="couch-body">
            <label className="couch-visible-row">
              <input
                type="checkbox"
                checked={couchVisible}
                onChange={(e) => onCouchVisibleChange(e.target.checked)}
              />
              <span>Couch anzeigen</span>
            </label>
            <div className="slider-row">
              <label>Links ↔ Rechts</label>
              <input
                type="range" min={couchBounds.minX} max={couchBounds.maxX} step={0.05}
                value={couchX}
                onChange={(e) => onCouchXChange(parseFloat(e.target.value))}
              />
              <span className="slider-val">{couchX.toFixed(2)} m</span>
            </div>
            <div className="slider-row">
              <label>Wand ↔ Raum</label>
              <input
                type="range" min={couchBounds.minZ} max={couchBounds.maxZ} step={0.05}
                value={couchZ}
                onChange={(e) => onCouchZChange(parseFloat(e.target.value))}
              />
              <span className="slider-val">{couchZ.toFixed(2)} m</span>
            </div>
            <div className="slider-row">
              <label>Drehung</label>
              <input
                type="range" min={0} max={Math.PI * 2} step={Math.PI / 36}
                value={couchRot}
                onChange={(e) => onCouchRotChange(parseFloat(e.target.value))}
              />
              <span className="slider-val">{Math.round((couchRot * 180) / Math.PI)}°</span>
            </div>
          </div>
        )}
      </div>

      <div className="regal-block">
        <button
          className="couch-toggle"
          onClick={() => setRegalOpen((o) => !o)}
          aria-expanded={regalOpen}
        >
          <span>Regale (Wand Nord)</span>
          <span className="couch-chevron">{regalOpen ? '▾' : '▸'}</span>
        </button>
        {regalOpen && (
          <div className="couch-body">
            <div className="stepper-row">
              <label>Anzahl Reihen</label>
              <div className="stepper-controls">
                <button
                  className="stepper-btn"
                  onClick={() => onRegalRowCountChange(regal.rowCount - 1)}
                  disabled={regal.rowCount <= 0}
                  aria-label="Eine Reihe entfernen"
                >−</button>
                <span className="stepper-val">{regal.rowCount}</span>
                <button
                  className="stepper-btn"
                  onClick={() => onRegalRowCountChange(regal.rowCount + 1)}
                  disabled={regal.rowCount >= REGAL_MAX_ROWS}
                  aria-label="Eine Reihe hinzufügen"
                >+</button>
              </div>
            </div>

            <div className="slider-row">
              <label>Tiefe (alle)</label>
              <input
                type="range"
                min={REGAL_DEPTH_MIN_M}
                max={REGAL_DEPTH_MAX_M}
                step={0.01}
                value={regal.depthM}
                onChange={(e) => onRegalDepthChange(parseFloat(e.target.value))}
              />
              <span className="slider-val">{Math.round(regal.depthM * 100)} cm</span>
            </div>

            <div className="regal-mat-block">
              <h5>Brett-Material</h5>
              <div className="regal-mat-grid">
                {regalWoodMaterials.map((w) => (
                  <button
                    key={w.id}
                    className={`regal-mat-tile ${regal.woodMaterialId === w.id ? 'active' : ''}`}
                    style={{ background: w.hex }}
                    onClick={() => onRegalWoodChange(w.id)}
                    title={w.name}
                  >
                    <span className="regal-mat-name">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="regal-mat-block">
              <h5>Winkel-Material</h5>
              <div className="regal-mat-grid">
                {regalBracketMaterials.map((b) => (
                  <button
                    key={b.id}
                    className={`regal-mat-tile ${regal.bracketMaterialId === b.id ? 'active' : ''}`}
                    style={{ background: b.hex }}
                    onClick={() => onRegalBracketChange(b.id)}
                    title={b.name}
                  >
                    <span className="regal-mat-name">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {regal.rowCount > 0 && (
              <div className="regal-rows-block">
                <h5>Reihen</h5>
                <div className="regal-rows-list">
                  {regal.rows.slice(0, regal.rowCount).map((row, i) => {
                    const isOpen = openRowIndex === i;
                    const xLeft = row.xCenterM - row.lengthM / 2;
                    const xRight = row.xCenterM + row.lengthM / 2;
                    return (
                      <div key={i} className={`regal-row ${isOpen ? 'open' : ''}`}>
                        <button
                          className="regal-row-header"
                          onClick={() => setOpenRowIndex(isOpen ? null : i)}
                          aria-expanded={isOpen}
                        >
                          <span className="regal-row-title">Reihe {i + 1}</span>
                          <span className="regal-row-summary">
                            {Math.round(row.heightM * 100)} cm hoch · {Math.round(row.lengthM * 100)} cm lang
                          </span>
                          <span className="couch-chevron">{isOpen ? '▾' : '▸'}</span>
                        </button>
                        {isOpen && (
                          <div className="regal-row-body">
                            <div className="slider-row">
                              <label>Höhe</label>
                              <input
                                type="range"
                                min={REGAL_HEIGHT_MIN_M}
                                max={REGAL_HEIGHT_MAX_M}
                                step={0.01}
                                value={row.heightM}
                                onChange={(e) => onRegalRowHeightChange(i, parseFloat(e.target.value))}
                              />
                              <span className="slider-val">{Math.round(row.heightM * 100)} cm</span>
                            </div>
                            <div className="slider-row">
                              <label>Links-Kante</label>
                              <input
                                type="range"
                                min={0}
                                max={Math.max(0, xRight - REGAL_LENGTH_MIN_M)}
                                step={0.01}
                                value={xLeft}
                                onChange={(e) => onRegalRowEdgeChange(i, 'left', parseFloat(e.target.value))}
                              />
                              <span className="slider-val">{xLeft.toFixed(2)} m</span>
                            </div>
                            <div className="slider-row">
                              <label>Rechts-Kante</label>
                              <input
                                type="range"
                                min={Math.min(WAND_NORD_LENGTH_M, xLeft + REGAL_LENGTH_MIN_M)}
                                max={WAND_NORD_LENGTH_M}
                                step={0.01}
                                value={xRight}
                                onChange={(e) => onRegalRowEdgeChange(i, 'right', parseFloat(e.target.value))}
                              />
                              <span className="slider-val">{xRight.toFixed(2)} m</span>
                            </div>
                            <button
                              className="regal-row-reset"
                              onClick={() => onRegalRowReset(i)}
                              title="Diese Reihe auf Default-Position zurücksetzen"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
