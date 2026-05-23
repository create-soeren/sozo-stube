import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { viewerInput } from '../viewerInput';

const EYE_HEIGHT = 1.65;
const MOVE_SPEED = 2.2;
const MOUSE_SENSITIVITY = 0.004;
const WALL_MARGIN = 0.35;

// Raum-Polygon im Viewer-Koord (glTF nach yup-export: X=Ost, Y=oben, Z=-Nord_blender)
// Bodenpolygon im XZ-Plane (Y=Höhe). CCW von oben gesehen.
// Blender-Koord → glTF: (x, y_blender, z_blender) → (x, z_blender, -y_blender)
// NW(0,0)               → (0, 0, 0)
// WEST_ENDE(0,-2.91)    → (0, 0, 2.91)
// Erker P2(0.185,-2.91) → (0.185, 0, 2.91)
// Erker P1(0.807,-4.131)→ (0.807, 0, 4.131)
// SUED_ENDE(1.66,-3.23) → (1.66, 0, 3.23)
// SE(5.52,-3.23)        → (5.52, 0, 3.23)
// NE(5.52,0)            → (5.52, 0, 0)
// Nische usw.
const ROOM_POLYGON_XZ: [number, number][] = [
  [0.0, 0.0],
  [0.0, 2.91],
  [0.111, 3.055],
  [0.529, 4.361],
  [1.66, 3.23],
  [5.52, 3.23],
  [5.52, 0.0],
  [5.44, 0.0],
  [5.44, -0.13],
  [3.68, -0.13],
  [3.68, 0.0],
];

function pointInPolygon(x: number, z: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  if (len2 === 0) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  const cx = ax + t * dx;
  const cz = az + t * dz;
  return Math.hypot(px - cx, pz - cz);
}

function isInsideRoom(x: number, z: number): boolean {
  if (!pointInPolygon(x, z, ROOM_POLYGON_XZ)) return false;
  // Mindestabstand zu allen Wand-Kanten
  for (let i = 0, j = ROOM_POLYGON_XZ.length - 1; i < ROOM_POLYGON_XZ.length; j = i++) {
    const [ax, az] = ROOM_POLYGON_XZ[j];
    const [bx, bz] = ROOM_POLYGON_XZ[i];
    if (distToSegment(x, z, ax, az, bx, bz) < WALL_MARGIN) return false;
  }
  return true;
}

export function NavControls() {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    // Startposition: Raummitte, Augenhöhe, Blick nach +X (Richtung Ost)
    camera.position.set(2.5, EYE_HEIGHT, 1.5);
    yaw.current = -Math.PI / 2; // looking toward -Z (which is Nord in our mapping, but let's start looking toward room)
    pitch.current = 0;
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    const dom = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      dom.style.cursor = 'grabbing';
    };
    const onMouseUp = () => {
      dragging.current = false;
      dom.style.cursor = 'grab';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * MOUSE_SENSITIVITY;
      pitch.current -= dy * MOUSE_SENSITIVITY;
      pitch.current = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch.current));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          viewerInput.forward = 1;
          break;
        case 'ArrowDown':
        case 'KeyS':
          viewerInput.forward = -1;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          viewerInput.right = -1;
          break;
        case 'ArrowRight':
        case 'KeyD':
          viewerInput.right = 1;
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
        case 'ArrowDown':
        case 'KeyS':
          viewerInput.forward = 0;
          break;
        case 'ArrowLeft':
        case 'KeyA':
        case 'ArrowRight':
        case 'KeyD':
          viewerInput.right = 0;
          break;
      }
    };

    // Touch: Ein-Finger-Drag = Drehen (analog Maus). preventDefault verhindert
    // dass der Browser den Viewport scrollt während der Drag im Canvas läuft.
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      dragging.current = true;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - lastMouse.current.x;
      const dy = t.clientY - lastMouse.current.y;
      lastMouse.current = { x: t.clientX, y: t.clientY };
      yaw.current -= dx * MOUSE_SENSITIVITY;
      pitch.current -= dy * MOUSE_SENSITIVITY;
      pitch.current = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch.current));
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };

    dom.style.cursor = 'grab';
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('touchstart', onTouchStart, { passive: false });
    dom.addEventListener('touchmove', onTouchMove, { passive: false });
    dom.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    if (viewerInput.forward === 0 && viewerInput.right === 0) return;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const step = MOVE_SPEED * delta;
    const dx = forward.x * viewerInput.forward * step + right.x * viewerInput.right * step;
    const dz = forward.z * viewerInput.forward * step + right.z * viewerInput.right * step;

    // Axis-separated collision: try X then Z separately so we glide along walls
    const newX = camera.position.x + dx;
    if (isInsideRoom(newX, camera.position.z)) {
      camera.position.x = newX;
    }
    const newZ = camera.position.z + dz;
    if (isInsideRoom(camera.position.x, newZ)) {
      camera.position.z = newZ;
    }
    camera.position.y = EYE_HEIGHT;
  });

  return null;
}
