import { viewerInput } from '../viewerInput';

type Dir = 'forward' | 'back' | 'left' | 'right';

function set(dir: Dir, active: boolean) {
  if (dir === 'forward') viewerInput.forward = active ? 1 : 0;
  else if (dir === 'back') viewerInput.forward = active ? -1 : 0;
  else if (dir === 'left') viewerInput.right = active ? -1 : 0;
  else viewerInput.right = active ? 1 : 0;
}

function dpadButton(dir: Dir, label: string, className: string) {
  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    set(dir, true);
  };
  const stop = (e: React.PointerEvent) => {
    e.preventDefault();
    set(dir, false);
  };
  return (
    <button
      key={dir}
      className={`dpad-btn ${className}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      aria-label={dir}
    >
      {label}
    </button>
  );
}

export function TouchDPad() {
  return (
    <div className="touch-dpad" aria-label="Bewegungssteuerung">
      {dpadButton('forward', '▲', 'dpad-up')}
      {dpadButton('left', '◀', 'dpad-left')}
      {dpadButton('back', '▼', 'dpad-down')}
      {dpadButton('right', '▶', 'dpad-right')}
    </div>
  );
}
