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
    />
  );
}

useGLTF.preload('/models/couch.glb');
