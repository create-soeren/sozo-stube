import { useMemo } from 'react';
import {
  regalWoodMaterials,
  regalBracketMaterials,
  type RegalState,
  type RegalRow,
  type RegalBracketMaterial,
} from '../data/materials';

// Wand-Kontur Wand Nord: 2 Vorsprünge ragen 13 cm in den Raum.
// Bretter sollen der Kontur folgen — in Hauptlinien-Bereichen an der
// Hauptwand anliegen, über Vorsprüngen auf der Vorsprung-Front sitzen.
// Werden also pro Reihe in 1..n Segmente zerlegt.
const VORSPRUENGE: ReadonlyArray<{ x0: number; x1: number }> = [
  { x0: 3.710, x1: 4.185 }, // Vorsprung B (mittig)
  { x0: 5.045, x1: 5.510 }, // Vorsprung A (ostseitig)
];
const WALL_Z_FLAT = 0.010;     // Hauptlinie (Z=0) + 1 cm Anti-Z-Fight
const WALL_Z_VORSPRUNG = 0.140; // Vorsprung-Front (Z=0,13) + 1 cm Anti-Z-Fight

const BRETT_THICKNESS = 0.02;
const BRACKET_VERTICAL_M = 0.15;
const BRACKET_HORIZONTAL_M = 0.18;
const BRACKET_WIDTH_M = 0.04;
const BRACKET_THICKNESS_M = 0.005;
const MAX_BRACKET_SPACING_M = 0.9;
const BRACKET_EDGE_INSET_M = 0.05;
const MIN_SEGMENT_LENGTH_M = 0.05;
const SHORT_SEGMENT_THRESHOLD_M = 0.30;

type Segment = { x0: number; x1: number; backZ: number };

function splitBrettByContour(xLeft: number, xRight: number): Segment[] {
  const breakSet = new Set<number>([xLeft, xRight]);
  for (const v of VORSPRUENGE) {
    if (v.x0 > xLeft && v.x0 < xRight) breakSet.add(v.x0);
    if (v.x1 > xLeft && v.x1 < xRight) breakSet.add(v.x1);
  }
  const sorted = [...breakSet].sort((a, b) => a - b);
  const segments: Segment[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const x0 = sorted[i];
    const x1 = sorted[i + 1];
    if (x1 - x0 < MIN_SEGMENT_LENGTH_M) continue;
    const xMid = (x0 + x1) / 2;
    let z = WALL_Z_FLAT;
    for (const v of VORSPRUENGE) {
      if (xMid > v.x0 && xMid < v.x1) {
        z = WALL_Z_VORSPRUNG;
        break;
      }
    }
    segments.push({ x0, x1, backZ: z });
  }
  return segments;
}

type Props = {
  state: RegalState;
};

export function Regal({ state }: Props) {
  const woodHex = useMemo(() => {
    const wood = regalWoodMaterials.find((w) => w.id === state.woodMaterialId);
    return wood?.hex ?? '#B68B5A';
  }, [state.woodMaterialId]);

  const bracketMat = useMemo<RegalBracketMaterial>(
    () =>
      regalBracketMaterials.find((b) => b.id === state.bracketMaterialId) ??
      regalBracketMaterials[0],
    [state.bracketMaterialId]
  );

  if (state.rowCount === 0) return null;
  const visibleRows = state.rows.slice(0, state.rowCount);

  return (
    <group>
      {visibleRows.map((row, i) => (
        <BrettRow
          key={i}
          row={row}
          depthM={state.depthM}
          woodHex={woodHex}
          bracketMat={bracketMat}
        />
      ))}
    </group>
  );
}

function BrettRow({
  row,
  depthM,
  woodHex,
  bracketMat,
}: {
  row: RegalRow;
  depthM: number;
  woodHex: string;
  bracketMat: RegalBracketMaterial;
}) {
  const halfLen = row.lengthM / 2;
  const xLeft = row.xCenterM - halfLen;
  const xRight = row.xCenterM + halfLen;
  const segments = useMemo(() => splitBrettByContour(xLeft, xRight), [xLeft, xRight]);

  return (
    <>
      {segments.map((seg, i) => (
        <BrettSegment
          key={i}
          x0={seg.x0}
          x1={seg.x1}
          backZ={seg.backZ}
          heightM={row.heightM}
          depthM={depthM}
          woodHex={woodHex}
          bracketMat={bracketMat}
        />
      ))}
    </>
  );
}

function BrettSegment({
  x0,
  x1,
  backZ,
  heightM,
  depthM,
  woodHex,
  bracketMat,
}: {
  x0: number;
  x1: number;
  backZ: number;
  heightM: number;
  depthM: number;
  woodHex: string;
  bracketMat: RegalBracketMaterial;
}) {
  const segLength = x1 - x0;
  const brettBottomY = heightM - BRETT_THICKNESS;
  const brettCenterY = heightM - BRETT_THICKNESS / 2;
  const brettCenterX = (x0 + x1) / 2;
  const brettCenterZ = backZ + depthM / 2;

  // Winkel-Positionen — bei kurzen Segmenten nur 1 in der Mitte
  const bracketXs: number[] = [];
  if (segLength < SHORT_SEGMENT_THRESHOLD_M) {
    bracketXs.push(brettCenterX);
  } else {
    const inset = Math.min(BRACKET_EDGE_INSET_M, segLength / 4);
    const eff = segLength - 2 * inset;
    const num = Math.max(2, Math.ceil(segLength / MAX_BRACKET_SPACING_M));
    for (let i = 0; i < num; i++) {
      const t = num === 1 ? 0.5 : i / (num - 1);
      bracketXs.push(x0 + inset + t * eff);
    }
  }

  return (
    <>
      <mesh position={[brettCenterX, brettCenterY, brettCenterZ]} castShadow receiveShadow>
        <boxGeometry args={[segLength, BRETT_THICKNESS, depthM]} />
        <meshStandardMaterial color={woodHex} roughness={0.7} metalness={0.0} />
      </mesh>
      {bracketXs.map((x, i) => (
        <Winkel
          key={i}
          x={x}
          backZ={backZ}
          brettBottomY={brettBottomY}
          bracketMat={bracketMat}
        />
      ))}
    </>
  );
}

function Winkel({
  x,
  backZ,
  brettBottomY,
  bracketMat,
}: {
  x: number;
  backZ: number;
  brettBottomY: number;
  bracketMat: RegalBracketMaterial;
}) {
  const isMetal = bracketMat.type === 'metall';
  const metalness = isMetal ? bracketMat.metalness ?? 0.6 : 0.0;
  const roughness = isMetal ? bracketMat.roughness ?? 0.5 : 0.75;

  const vertY = brettBottomY - BRACKET_VERTICAL_M / 2;
  const vertZ = backZ + BRACKET_THICKNESS_M / 2;
  const horizY = brettBottomY - BRACKET_THICKNESS_M / 2;
  const horizZ = backZ + BRACKET_HORIZONTAL_M / 2;

  return (
    <>
      <mesh position={[x, vertY, vertZ]} castShadow>
        <boxGeometry args={[BRACKET_WIDTH_M, BRACKET_VERTICAL_M, BRACKET_THICKNESS_M]} />
        <meshStandardMaterial
          color={bracketMat.hex}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
      <mesh position={[x, horizY, horizZ]} castShadow>
        <boxGeometry args={[BRACKET_WIDTH_M, BRACKET_THICKNESS_M, BRACKET_HORIZONTAL_M]} />
        <meshStandardMaterial
          color={bracketMat.hex}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
    </>
  );
}
