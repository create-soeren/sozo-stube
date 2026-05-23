import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

type Props = {
  position: [number, number, number];
  rotationY: number;
};

export function Couch({ position, rotationY }: Props) {
  const { scene } = useGLTF('/models/couch.glb');

  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={COUCH_SCALE}
    />
  );
}

// Scan-Bounds: 3,096 × 0,746 × 1,437 m. Echte Couch: 294 × 57 × 137 cm (B × H × T,
// Sitzhöhe 41 cm). Scan-Z-Achse offenbar überskaliert: Top-Region (~14 cm) ist
// vermutlich LiDAR-Artefakt (Reflexion / Deckenkante mit-erfasst).
// Uniform 0,95 → Sitzhöhe stimmt exakt (41 cm), Gesamthöhe wird 71 cm. Soll
// langfristig im Blender durch Vertex-Clipping korrigiert werden — bis dahin
// priorisieren wir Sitzhöhe (sichtbar als Couch-Tiefe-Verhältnis) über Gesamthöhe.
const COUCH_SCALE = 0.95;

useGLTF.preload('/models/couch.glb');
