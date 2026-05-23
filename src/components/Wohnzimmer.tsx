import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { BASE_FLOOR_TEXTURE } from '../data/materials';

// Prozedurale Klicksystem-Vinyl-Textur.
// Layout: 2 horizontale Reihen × 5 Planken — Reihe 2 halb versetzt (klassisches
// Klick-Verlegemuster). Basis hell (mean ~0,92) damit Tint sauber wirkt.
// Intensitäten bewusst dezent (Fugen ~0,18, Maserung ~0,07) — entspricht
// dezenter, moderner Vinyl-Optik statt aufdringlicher Holzimitation.
function createPlankDiffuse(): THREE.Texture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Mean ~0,95, Range ~0,86..0,96 — Tint dominiert, dunkle Farben bleiben rein
  const baseLight = 245;
  ctx.fillStyle = `rgb(${baseLight},${baseLight},${baseLight})`;
  ctx.fillRect(0, 0, size, size);

  const rows = 2;
  const cols = 5;
  const rowH = size / rows;
  const colW = size / cols;
  // Neutrales Schwarz statt warmes Braun — verfälscht Tint nicht
  const fugenAlpha = 0.10;
  const grainAlphaMax = 0.04;

  for (let row = 0; row < rows; row++) {
    const offset = (row % 2) * (colW / 2);
    const y = row * rowH;

    for (let col = -1; col <= cols; col++) {
      const x = col * colW + offset;

      // Maserung: 4 leicht wellige vertikale Linien pro Planke
      for (let g = 0; g < 4; g++) {
        const gx = x + colW * (0.15 + g * 0.2);
        const alpha = grainAlphaMax * (0.5 + Math.random() * 0.5);
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 0.6 + Math.random() * 0.8;
        ctx.beginPath();
        const segs = 12;
        for (let s = 0; s <= segs; s++) {
          const sx = gx + (Math.random() - 0.5) * 3;
          const sy = y + (s / segs) * rowH;
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(0, 0, 0, ${fugenAlpha})`;
      ctx.fillRect(x + colW - 1, y, 2, rowH);
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${fugenAlpha})`;
    ctx.fillRect(0, y + rowH - 1, size, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

// AO-Map: nur die Fugen als dunkle Linien, sonst weiß.
// Macht die Plankenfugen unter diffuser Beleuchtung deutlich sichtbar,
// ohne Tint-Farbe zu verfälschen. -30% gegenüber maximalem AO.
function createPlankAO(): THREE.Texture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  const rows = 2;
  const cols = 5;
  const rowH = size / rows;
  const colW = size / cols;
  const aoAlpha = 0.343; // 0,7 × 0,7 = 0,49 → weitere -30% = 0,343

  for (let row = 0; row < rows; row++) {
    const offset = (row % 2) * (colW / 2);
    const y = row * rowH;

    for (let col = -1; col <= cols; col++) {
      const x = col * colW + offset;
      // Soft gradient an Fuge für realistischen Edge-Darkening
      const grad = ctx.createLinearGradient(x + colW - 3, 0, x + colW + 3, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, `rgba(0,0,0,${aoAlpha})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + colW - 3, y, 6, rowH);
    }

    const gradH = ctx.createLinearGradient(0, y + rowH - 3, 0, y + rowH + 3);
    gradH.addColorStop(0, 'rgba(0,0,0,0)');
    gradH.addColorStop(0.5, `rgba(0,0,0,${aoAlpha})`);
    gradH.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradH;
    ctx.fillRect(0, y + rowH - 3, size, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

type Props = {
  modelPath: string;
  slotColors: Record<string, string>;
  activeFloorId: string | null;
  floorRotated: boolean;
};

const GLASS_SLOTS = new Set(['fenster_glas', 'tuer_loggia_glas']);
const FLOOR_SLOT = 'boden';

export function Wohnzimmer({ modelPath, slotColors, activeFloorId, floorRotated }: Props) {
  const { scene } = useGLTF(modelPath);

  const floorDiffuse = useMemo(() => createPlankDiffuse(), []);
  const floorAO = useMemo(() => createPlankAO(), []);

  useMemo(() => {
    [floorDiffuse, floorAO].forEach((tex) => {
      tex.repeat.set(BASE_FLOOR_TEXTURE.tilingX, BASE_FLOOR_TEXTURE.tilingY);
      tex.center.set(0.5, 0.5);
    });
  }, [floorDiffuse, floorAO]);


  const cloned = useMemo(() => {
    const clonedScene = scene.clone(true);
    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // GLB-Export aus Blender enthält keine UV-Koordinaten (nur POSITION + NORMAL).
      // UVs werden für den Boden in einem separaten Effekt aus Welt-X/Y generiert
      // (auch um Rotation des Plankenmusters per UV-Swap unterstützen zu können).

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => m.clone());
      } else if (mesh.material) {
        mesh.material = (mesh.material as THREE.Material).clone();
      }
      const applyGlass = (mat: THREE.Material) => {
        if (!('name' in mat) || !GLASS_SLOTS.has(mat.name)) return;
        const std = mat as THREE.MeshStandardMaterial;
        std.transparent = true;
        std.opacity = 0.18;
        std.roughness = 0.05;
        std.metalness = 0;
        std.depthWrite = false;
        std.side = THREE.DoubleSide;
        std.needsUpdate = true;
        mesh.castShadow = false;
      };
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(applyGlass);
      } else if (mesh.material) {
        applyGlass(mesh.material as THREE.Material);
      }
    });
    return clonedScene;
  }, [scene]);

  // UVs für Boden-Mesh aus Welt-Position generieren. Bei floorRotated=true
  // werden X und Y getauscht → Planken laufen quer statt längs.
  // Welt-Meter direkt als UV (repeat steuert Wiederholung pro Meter).
  useEffect(() => {
    cloned.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const matName = Array.isArray(mesh.material)
        ? (mesh.material[0] as THREE.Material & { name?: string }).name
        : (mesh.material as THREE.Material & { name?: string })?.name;
      if (matName !== FLOOR_SLOT) return;
      const geom = mesh.geometry as THREE.BufferGeometry;
      const pos = geom.attributes.position;
      if (!pos) return;
      const uvs = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uvs[i * 2] = floorRotated ? y : x;
        uvs[i * 2 + 1] = floorRotated ? x : y;
      }
      const uvAttr = new THREE.BufferAttribute(uvs, 2);
      geom.setAttribute('uv', uvAttr);
      geom.setAttribute('uv2', uvAttr);
    });
  }, [cloned, floorRotated]);

  useEffect(() => {
    cloned.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const updateMat = (mat: THREE.Material) => {
        if (!('name' in mat)) return;
        const std = mat as THREE.MeshStandardMaterial;
        const hex = slotColors[mat.name];

        if (mat.name === FLOOR_SLOT) {
          if (activeFloorId) {
            std.map = floorDiffuse;
            std.aoMap = floorAO;
            std.normalMap = null;
            std.aoMapIntensity = 1.4;
            std.color.set(hex ?? '#FFFFFF');
            std.roughness = 0.6;
            std.metalness = 0;
          } else {
            std.map = null;
            std.aoMap = null;
            if (hex && std.color) std.color.set(hex);
          }
          std.needsUpdate = true;
          return;
        }

        if (hex && std.color) {
          std.color.set(hex);
          std.needsUpdate = true;
        }
      };
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(updateMat);
      } else if (mesh.material) {
        updateMat(mesh.material as THREE.Material);
      }
    });
  }, [cloned, slotColors, activeFloorId, floorDiffuse, floorAO]);

  return <primitive object={cloned} />;
}

useGLTF.preload('/models/wohnzimmer.glb');
