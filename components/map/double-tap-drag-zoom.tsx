"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const DOUBLE_TAP_WINDOW_MS = 300;
const DOUBLE_TAP_DISTANCE_PX = 40;
const HOLD_DELAY_MS = 180;
const PIXELS_PER_ZOOM_LEVEL = 100;

/** Google Maps' "tap, then quickly tap-and-hold" zoom gesture: dragging the
 *  held finger up zooms in, down zooms out, continuously, anchored on the
 *  point that was double-tapped. A quick double-tap (no hold) is left
 *  alone — Leaflet's own doubleClickZoom handler zooms in on that as usual,
 *  since this component never intervenes unless the second tap is held
 *  past HOLD_DELAY_MS. */
export function DoubleTapDragZoom() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    let lastTapTime = 0;
    let lastTapPoint: { x: number; y: number } | null = null;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let dragging = false;
    let startY = 0;
    let startZoom = 0;
    let anchor: L.LatLng | null = null;

    function clearHoldTimer() {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    }

    function endDragZoom() {
      if (!dragging) return;
      dragging = false;
      anchor = null;
      map.dragging.enable();
      container.style.touchAction = "";
    }

    function clampZoom(zoom: number) {
      return Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), zoom));
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const now = Date.now();
      const point = { x: e.clientX, y: e.clientY };
      const isSecondTap =
        lastTapPoint !== null &&
        now - lastTapTime < DOUBLE_TAP_WINDOW_MS &&
        Math.hypot(point.x - lastTapPoint.x, point.y - lastTapPoint.y) < DOUBLE_TAP_DISTANCE_PX;

      if (isSecondTap) {
        const rect = container.getBoundingClientRect();
        const containerPoint = L.point(point.x - rect.left, point.y - rect.top);
        clearHoldTimer();
        holdTimer = setTimeout(() => {
          dragging = true;
          startY = point.y;
          startZoom = map.getZoom();
          anchor = map.containerPointToLatLng(containerPoint);
          map.dragging.disable();
          container.style.touchAction = "none";
        }, HOLD_DELAY_MS);
      }

      lastTapTime = now;
      lastTapPoint = point;
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging || !anchor) return;
      e.preventDefault();
      const deltaY = startY - e.clientY;
      const nextZoom = clampZoom(startZoom + deltaY / PIXELS_PER_ZOOM_LEVEL);
      map.setZoomAround(anchor, nextZoom, { animate: false });
    }

    function onPointerUp() {
      clearHoldTimer();
      endDragZoom();
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      clearHoldTimer();
      endDragZoom();
    };
  }, [map]);

  return null;
}
