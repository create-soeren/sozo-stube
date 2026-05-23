import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

type Props = {
  position: [number, number, number];
  rotationY: number;
};

export function Couch({ position, rotationY }: Props) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/couch.glb`);

  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Scan-Seiten sind wellig (LiDAR-Streumesh). Vertices in den äußersten
      // 20% der Breite (±X) auf die Maximalkante snappen → vollständig
      // glatte vertikale Couch-Seiten. Bei 10% blieben Wellen-Reste sichtbar.
      const geom = mesh.geometry as THREE.BufferGeometry;
      const pos = geom.attributes.position;
      if (!geom.boundingBox) geom.computeBoundingBox();
      const bb = geom.boundingBox!;
      const maxX = bb.max.x;
      const minX = bb.min.x;
      const threshold = 0.80;
      let modified = false;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        if (x > maxX * threshold && x !== maxX) {
          pos.setX(i, maxX);
          modified = true;
        } else if (x < minX * threshold && x !== minX) {
          pos.setX(i, minX);
          modified = true;
        }
      }
      if (modified) {
        pos.needsUpdate = true;
        geom.computeBoundingBox();
        geom.computeBoundingSphere();
        geom.computeVertexNormals();
      }
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

// Scan-Bounds: 3,096 × 0,746 × 1,437 m. Echte Couch: 294 × 57 × 137 cm.
// Non-uniform Skalierung priorisiert exakte Außenmaße (Sitzhöhe wird dabei
// proportional und ist irrelevant). Höhen-Faktor 0,764 verdichtet auch das
// vermutete LiDAR-Top-Artefakt mit.
const COUCH_SCALE: [number, number, number] = [0.950, 0.764, 0.954];
export const COUCH_HALF_X = (3.096 * COUCH_SCALE[0]) / 2; // 1,47 m
export const COUCH_HALF_Z = (1.437 * COUCH_SCALE[2]) / 2; // 0,685 m

useGLTF.preload(`${import.meta.env.BASE_URL}models/couch.glb`);
