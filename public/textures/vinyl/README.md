# Vinyl-Boden-Texturen

## Architektur

Vinyl-Klicksystem hat eine **einzige physische Strukturprägung** (Plankenfugen + Maserungs-Relief).
Alle Farbvarianten teilen dieselbe Diffuse+Normal-Basis — die Tönung kommt per Color-Tint
im Material (`MeshStandardMaterial.color`).

```
vinyl/
  _base/
    diffuse.jpg   Basisfarbe / Albedo
    normal.jpg    Normal Map (Plankenfugen, Maserung)
  README.md
```

## Aktuelle Textur

**Quelle:** [polyhaven.com/a/plank_flooring_02](https://polyhaven.com/a/plank_flooring_02) (CC0)
**Auflösung:** 2K JPG, ~5 MB total
**Verwendet:** Diffuse + Normal (Roughness/AO bewusst weggelassen — bei aktueller
Beleuchtung kein sichtbarer Mehrwert, spart Bandbreite für GitHub Pages + Mobil-Zugriff)

## Farbvarianten

Definiert in `src/data/materials.ts → floorTextures[]`. Jeder Eintrag liefert `hexFallback`,
der als Color-Tint multiplikativ auf die Diffuse-Map wirkt.

## Tiling

`BASE_FLOOR_TEXTURE.tilingX / tilingY` in `materials.ts` (default 3 = ca. 3 Plankenreihen
sichtbar pro Raumbreite, maßstabsnah bei ~5,5 m Raumtiefe).
