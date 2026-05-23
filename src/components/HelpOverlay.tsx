import { useState } from 'react';

export function HelpOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="help-trigger"
        onClick={() => setOpen(true)}
        aria-label="Hilfe öffnen"
      >
        ?
      </button>

      {open && (
        <div className="help-backdrop" onClick={() => setOpen(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <header className="help-header">
              <h2>Bedienung</h2>
              <button className="help-close" onClick={() => setOpen(false)} aria-label="Schließen">
                ×
              </button>
            </header>

            <section className="help-section">
              <h3>Navigation im Raum</h3>
              <table className="help-table">
                <tbody>
                  <tr>
                    <td>Pfeiltasten / WASD</td>
                    <td>Bewegen (Augenhöhe 1,65 m)</td>
                  </tr>
                  <tr>
                    <td>Linksklick + Ziehen</td>
                    <td>Umsehen (Yaw + Pitch)</td>
                  </tr>
                </tbody>
              </table>
              <p className="help-hint">Kollision mit Wänden ist aktiv — du bleibst immer im Raum. Verlaufen? Seite neu laden (Cmd+R) — Kamera startet wieder in der Raummitte.</p>
            </section>

            <section className="help-section">
              <h3>Farben und Böden ändern</h3>
              <ol className="help-steps">
                <li>
                  <strong>Slot wählen</strong> in der oberen Hälfte der Sidebar — z.B. "Wand C (links, mit Fenster)". Der Slot wird hervorgehoben.
                </li>
                <li>
                  <strong>Farbe oder Boden auswählen</strong> im Detail-Bereich darunter:
                  <ul>
                    <li>Hex-Picker (kleines Farb-Quadrat): öffnet macOS-Farbwähler</li>
                    <li>Hex-Text: manuell <code>#xxxxxx</code> eingeben</li>
                    <li>Paletten-Buttons: ein Klick wendet die Farbe an</li>
                  </ul>
                </li>
                <li>
                  Bei <strong>Boden</strong>: statt Wandfarben erscheinen die Vinyl-Optionen (sehr-hell bis sehr-dunkel).
                </li>
                <li>
                  Änderung ist sofort im 3D-Bild sichtbar.
                </li>
              </ol>
              <p className="help-hint">
                <strong>Zurücksetzen</strong> oben rechts in der Sidebar setzt alle Slots auf Default-Farben.
              </p>
            </section>

            <section className="help-section">
              <h3>Wand-Schema</h3>
              <table className="help-table">
                <tbody>
                  <tr><td>Wand A</td><td>rechte lange Wand (Außenwand)</td></tr>
                  <tr><td>Wand B</td><td>kurze Wand mit Eingangstür vom Flur</td></tr>
                  <tr><td>Wand C</td><td>linke lange Wand (mit Sprossen-Fenster oben)</td></tr>
                  <tr><td>Wand D</td><td>kurze Wand zur Loggia (mit Glas-Tür)</td></tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
