import React, { useEffect, useRef, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export function VirtualJoystick({ onMove }: VirtualJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const activePointerId = useRef<number | null>(null);
  const maxRadius = 44;

  useEffect(() => {
    const resetJoystick = () => {
      if (activePointerId.current !== null) {
        activePointerId.current = null;
        setKnobPos({ x: 0, y: 0 });
        setActive(false);
        onMove(0, 0);
      }
    };
    const onVisibility = () => {
      if (document.hidden) resetJoystick();
    };
    window.addEventListener('blur', resetJoystick);
    window.addEventListener('pointercancel', resetJoystick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', resetJoystick);
      window.removeEventListener('pointercancel', resetJoystick);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onMove]);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnobPos({ x: dx, y: dy });
    const normX = dx / maxRadius;
    const normY = dy / maxRadius;
    if (Math.hypot(normX, normY) < 0.08) {
      onMove(0, 0);
    } else {
      onMove(normX, normY);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    activePointerId.current = e.pointerId;
    setActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.stopPropagation();
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.stopPropagation();
    activePointerId.current = null;
    setKnobPos({ x: 0, y: 0 });
    setActive(false);
    onMove(0, 0);
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center touch-none select-none cursor-pointer shadow-xl transition-colors ${
        active
          ? 'border-amber-300/80 bg-slate-900/85'
          : 'border-amber-300/45 bg-slate-900/70'
      }`}
      aria-label="Kayu Riadah Pergerakan"
    >
      <div className="w-20 h-20 rounded-full border border-white/15 pointer-events-none" />
      <div className="w-2 h-2 rounded-full bg-white/25 pointer-events-none" />
      <div
        className={`absolute w-12 h-12 rounded-full border-2 border-white/85 shadow-lg pointer-events-none ${
          active ? 'bg-amber-300 scale-105' : 'bg-amber-400/85'
        }`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      />
    </div>
  );
}
