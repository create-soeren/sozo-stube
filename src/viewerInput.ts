// Geteilter Movement-State zwischen NavControls (R3F-Canvas) und TouchDPad
// (DOM-UI). Bewusst Module-Level Singleton — kein Re-Render bei Änderung,
// NavControls liest jeden Frame in useFrame.
export const viewerInput = {
  forward: 0, // -1, 0, 1
  right: 0,
};
