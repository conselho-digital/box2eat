"use client";

import { useRef } from "react";

const LONG_PRESS_DELAY = 500;
const MOVE_CANCEL_THRESHOLD = 10;

/** Distinguishes a tap from a press-and-hold on the same element: a normal
 *  tap fires onClick, holding past the delay fires onLongPress instead and
 *  suppresses the click that follows on release. */
export function useLongPress({
  onLongPress,
  onClick,
}: {
  onLongPress: () => void;
  onClick: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function handlePointerDown(e: React.PointerEvent) {
    startPos.current = { x: e.clientX, y: e.clientY };
    triggeredRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      onLongPress();
    }, LONG_PRESS_DELAY);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD) clearTimer();
  }

  function handleClick() {
    if (triggeredRef.current) {
      triggeredRef.current = false;
      return;
    }
    onClick();
  }

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: clearTimer,
    onPointerLeave: clearTimer,
    onPointerCancel: clearTimer,
    onClick: handleClick,
  };
}
