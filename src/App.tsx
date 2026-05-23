import { useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Wohnzimmer } from './components/Wohnzimmer';
import { Couch, COUCH_HALF_X, COUCH_HALF_Z } from './components/Couch';

// Boden-Bounds (aus GLB-Inspektion): X 0..5.52, Z 0..3.89.
// Couch darf nicht in die Wände schwingen — effective Halbbreite/Halbtiefe
// hängen von Y-Rotation ab (axis-aligned Bounding-Box-Projektion).
const ROOM_MIN_X = 0;
const ROOM_MAX_X = 5.52;
const ROOM_MIN_Z = 0;
const ROOM_MAX_Z = 3.89;

function couchBounds(rotY: number) {
  const cos = Math.abs(Math.cos(rotY));
  const sin = Math.abs(Math.sin(rotY));
  const effX = COUCH_HALF_X * cos + COUCH_HALF_Z * sin;
  const effZ = COUCH_HALF_X * sin + COUCH_HALF_Z * cos;
  return {
    minX: ROOM_MIN_X + effX,
    maxX: ROOM_MAX_X - effX,
    minZ: ROOM_MIN_Z + effZ,
    maxZ: ROOM_MAX_Z - effZ,
  };
}
import { MaterialPicker } from './components/MaterialPicker';
import { HelpOverlay } from './components/HelpOverlay';
import { NavControls } from './components/NavControls';
import { materialSlots, loadVariants, saveVariants, type Variant } from './data/materials';
import './App.css';

// Außen-Backdrop: Wolkenweiß → Himmelsblau → Baum-Grün, weicher Blur.
// Wird durch Glas (Erker-Fenster + Loggia-Tür) sichtbar, da Camera nur im Raum.
function createOutdoorBackdrop(): THREE.Texture {
  const w = 1024;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.00, '#F0F2EE');
  grad.addColorStop(0.30, '#C5D9E6');
  grad.addColorStop(0.50, '#9FB8C5');
  grad.addColorStop(0.62, '#88A878');
  grad.addColorStop(0.78, '#587547');
  grad.addColorStop(1.00, '#3A5238');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Wolken-Variation oben
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.4;
    const r = 80 + Math.random() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Baumkronen-Variation unten
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * w;
    const y = h * 0.55 + Math.random() * h * 0.45;
    const r = 50 + Math.random() * 110;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(35,55,28,0.45)');
    g.addColorStop(1, 'rgba(35,55,28,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Globaler Blur für unscharfe Außenwelt-Anmutung
  const blurred = document.createElement('canvas');
  blurred.width = w;
  blurred.height = h;
  const bctx = blurred.getContext('2d')!;
  bctx.filter = 'blur(10px)';
  bctx.drawImage(canvas, 0, 0);

  const tex = new THREE.CanvasTexture(blurred);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function App() {
  const defaultColors = useMemo(() => {
    const obj: Record<string, string> = {};
    materialSlots.forEach((s) => (obj[s.slotId] = s.defaultHex));
    return obj;
  }, []);

  const outdoorBackdrop = useMemo(() => createOutdoorBackdrop(), []);

  const [slotColors, setSlotColors] = useState<Record<string, string>>(defaultColors);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [floorRotated, setFloorRotated] = useState<boolean>(false);

  // Couch initial mittig an Nord-Wand (Boden X-Range 0..5.52, Z-Range 0..3.89)
  // Nord-Wand bei Z≈0, Couch-Tiefe 1,44 m → Mitte bei Z=0.72
  const [couchVisible, setCouchVisible] = useState<boolean>(true);
  const [couchX, setCouchX] = useState<number>(2.7);
  const [couchZ, setCouchZ] = useState<number>(0.72);
  const [couchRot, setCouchRotState] = useState<number>(0);

  const couchBoundsMemo = useMemo(() => couchBounds(couchRot), [couchRot]);

  const clampX = useCallback((x: number) => Math.max(couchBoundsMemo.minX, Math.min(couchBoundsMemo.maxX, x)), [couchBoundsMemo]);
  const clampZ = useCallback((z: number) => Math.max(couchBoundsMemo.minZ, Math.min(couchBoundsMemo.maxZ, z)), [couchBoundsMemo]);

  const handleCouchXChange = useCallback((x: number) => setCouchX(clampX(x)), [clampX]);
  const handleCouchZChange = useCallback((z: number) => setCouchZ(clampZ(z)), [clampZ]);

  const setCouchRot = useCallback((r: number) => {
    setCouchRotState(r);
    const b = couchBounds(r);
    setCouchX((prev) => Math.max(b.minX, Math.min(b.maxX, prev)));
    setCouchZ((prev) => Math.max(b.minZ, Math.min(b.maxZ, prev)));
  }, []);

  const [variants, setVariants] = useState<Variant[]>(() => loadVariants());
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  useEffect(() => {
    saveVariants(variants);
  }, [variants]);

  const handleSaveVariant = useCallback(() => {
    const name = window.prompt('Name für diese Variante:');
    if (!name?.trim()) return;
    const variant: Variant = {
      id: `v-${Date.now()}`,
      name: name.trim(),
      slotColors,
      activeFloorId,
      floorRotated,
      couchVisible,
      couchX,
      couchZ,
      couchRot,
    };
    setVariants((prev) => [...prev, variant]);
    setActiveVariantId(variant.id);
  }, [slotColors, activeFloorId, floorRotated, couchVisible, couchX, couchZ, couchRot]);

  const handleLoadVariant = useCallback((id: string) => {
    const v = variants.find((x) => x.id === id);
    if (!v) return;
    setSlotColors(v.slotColors);
    setActiveFloorId(v.activeFloorId);
    setFloorRotated(v.floorRotated);
    setCouchVisible(v.couchVisible ?? true);
    setCouchX(v.couchX);
    setCouchZ(v.couchZ);
    setCouchRot(v.couchRot);
    setActiveVariantId(v.id);
  }, [variants]);

  const handleDeleteVariant = useCallback((id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
    setActiveVariantId((prev) => (prev === id ? null : prev));
  }, []);

  const handleColorChange = useCallback((slotId: string, hex: string) => {
    setSlotColors((prev) => ({ ...prev, [slotId]: hex }));
  }, []);

  const handleFloorSelect = useCallback((floorId: string | null, hex: string) => {
    setActiveFloorId(floorId);
    setSlotColors((prev) => ({ ...prev, boden: hex }));
  }, []);

  const handleReset = useCallback(() => {
    setSlotColors(defaultColors);
    setActiveFloorId(null);
    setFloorRotated(false);
    setCouchVisible(true);
    setCouchX(2.7);
    setCouchZ(0.72);
    setCouchRot(0);
  }, [defaultColors]);

  const handleFloorRotate = useCallback(() => {
    setFloorRotated((r) => !r);
  }, []);

  return (
    <div className="app">
      <div className="canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [2.5, 1.65, 1.5], fov: 70 }}
          gl={{ antialias: true }}
        >
          <primitive attach="background" object={outdoorBackdrop} />

          {/* Erdgeschoss mit Bäumen davor → praktisch kein direktes Sonnenlicht.
              Dominanz auf weiches Umgebungslicht; Direct-Lights nur als sanfte
              Richtungsgeber durch Erkerfenster (SW) und Loggia (W, überdacht). */}
          <ambientLight intensity={0.63} />
          <hemisphereLight args={['#F5EFE0', '#4a4842', 0.63]} />

          {/* Diffuses Tageslicht durch Erker-Fenster (Süd-West).
              Erker-Front normal zeigt nach SW → Lichtquelle in -X, -Y, +Z. */}
          <directionalLight
            position={[-3, -7, 4]}
            target-position={[1.5, -1.5, 1]}
            intensity={0.77}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
            shadow-bias={-0.0005}
            shadow-normalBias={0.05}
            shadow-radius={8}
            color="#F4E6C8"
          />

          {/* Loggia (West, überdacht) — gedämpft, kühler, schwächer als Erker */}
          <directionalLight
            position={[-5, -1, 2.5]}
            target-position={[2, -0.8, 1]}
            intensity={0.34}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
            shadow-camera-near={0.1}
            shadow-camera-far={15}
            shadow-bias={-0.0005}
            shadow-normalBias={0.05}
            shadow-radius={8}
            color="#E8E3D4"
          />
          <Wohnzimmer
            modelPath={`${import.meta.env.BASE_URL}models/wohnzimmer.glb`}
            slotColors={slotColors}
            activeFloorId={activeFloorId}
            floorRotated={floorRotated}
          />
          {couchVisible && <Couch position={[couchX, 0, couchZ]} rotationY={couchRot} />}
          <NavControls />
        </Canvas>
        <HelpOverlay />
      </div>
      <MaterialPicker
        slotColors={slotColors}
        activeFloorId={activeFloorId}
        floorRotated={floorRotated}
        couchVisible={couchVisible}
        couchX={couchX}
        couchZ={couchZ}
        couchRot={couchRot}
        variants={variants}
        activeVariantId={activeVariantId}
        onColorChange={handleColorChange}
        onFloorSelect={handleFloorSelect}
        onFloorRotate={handleFloorRotate}
        couchBounds={couchBoundsMemo}
        onCouchVisibleChange={setCouchVisible}
        onCouchXChange={handleCouchXChange}
        onCouchZChange={handleCouchZChange}
        onCouchRotChange={setCouchRot}
        onSaveVariant={handleSaveVariant}
        onLoadVariant={handleLoadVariant}
        onDeleteVariant={handleDeleteVariant}
        onReset={handleReset}
      />
    </div>
  );
}
