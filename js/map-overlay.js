/* =====================================================
 * MAP-OVERLAY.JS — Mascota + línea apuntador + helpers
 * ===================================================== */

import { CONFIG } from './config.js';
import { gHud, projection, currentT, currentHostFeature, currentCoHostFeature, path, screenToViewBox } from './map-core.js';

// Elementos del overlay
let markerCircle = null;
let pointerLine = null;
let mascotImg = null;

let lastHudPoint = null;
let lastMascotAnchor = null;

/* =====================================================
 * INIT OVERLAY
 * ===================================================== */
export function initHudOverlay() {
  pointerLine = gHud.append("line")
    .attr("stroke", "rgb(255, 255, 255)")
    .attr("stroke-width", 1.3)
    .attr("opacity", 0);

  markerCircle = gHud.append("circle")
    .attr("r", 4.5)
    .attr("fill", "rgba(255,102,0,0.95)")
    .attr("stroke", "rgba(255,255,255,0.65)")
    .attr("stroke-width", 1)
    .attr("opacity", 0)
    .style("pointer-events", "none");

  mascotImg = gHud.append("image")
    .attr("href", "")
    .attr("width", CONFIG.MASCOT_SIZE)
    .attr("height", CONFIG.MASCOT_SIZE)
    .attr("opacity", 0);

  mascotImg.attr("data-mascot-size", CONFIG.MASCOT_SIZE);
}

export function setMascotImage(url) {
  if (!mascotImg) return;
  mascotImg.attr("href", url || "");
  mascotImg.attr("width", CONFIG.MASCOT_SIZE).attr("height", CONFIG.MASCOT_SIZE);
  mascotImg.attr("data-mascot-size", CONFIG.MASCOT_SIZE);
}

export function showOverlay() {
  markerCircle.attr("opacity", 0);
  pointerLine.attr("opacity", 1);
  mascotImg.attr("opacity", 1);
}

export function hideOverlay() {
  markerCircle.attr("opacity", 0);
  pointerLine.attr("opacity", 0);
  mascotImg.attr("opacity", 0);
  lastHudPoint = null;
  lastMascotAnchor = null;
}

export function moveMascotAndPointerTo(lon, lat) {
  if (!currentHostFeature) return;

  // Si no hay coordenadas, centrar en el país
  if (lon == null || lat == null) {
    const centroid = path.centroid(currentHostFeature);
    const size = Number(mascotImg.attr("data-mascot-size")) || CONFIG.MASCOT_SIZE;
    const mx = centroid[0] - (size / 2);
    const my = centroid[1] - (size / 2);
    mascotImg.attr("x", mx).attr("y", my);
    lastMascotAnchor = { x: mx + (size * 0.50), y: my + (size * 0.92) };
    updateHudPointerToMatchPanel();
    return;
  }

  const p = projection([lon, lat]);
  if (!p) return;

  const tp = currentT.apply(p);
  const size = Number(mascotImg.attr("data-mascot-size")) || CONFIG.MASCOT_SIZE;

  let mx = tp[0] - (size / 2);
  let my = tp[1] - size - 15;

  // CLAMP: mantener mascota dentro del bbox del país (o países si hay co-anfitrión)
  let minX, minY, maxX, maxY;
  
  if (currentCoHostFeature) {
    // Co-anfitrión: calcular bbox combinado de ambos países
    const [[bx0, by0], [bx1, by1]] = path.bounds(currentHostFeature);
    const [[cx0, cy0], [cx1, cy1]] = path.bounds(currentCoHostFeature);
    
    const t0 = currentT.apply([bx0, by0]);
    const t1 = currentT.apply([bx1, by1]);
    const t2 = currentT.apply([cx0, cy0]);
    const t3 = currentT.apply([cx1, cy1]);
    
    const margin = 30;
    minX = Math.min(t0[0], t1[0], t2[0], t3[0]) + margin;
    minY = Math.min(t0[1], t1[1], t2[1], t3[1]) + margin;
    maxX = Math.max(t0[0], t1[0], t2[0], t3[0]) - size - margin;
    maxY = Math.max(t0[1], t1[1], t2[1], t3[1]) - size - margin;
  } else {
    // Un solo país anfitrión
    const [[bx0, by0], [bx1, by1]] = path.bounds(currentHostFeature);
    const t0 = currentT.apply([bx0, by0]);
    const t1 = currentT.apply([bx1, by1]);
    
    const margin = 30;
    minX = Math.min(t0[0], t1[0]) + margin;
    minY = Math.min(t0[1], t1[1]) + margin;
    maxX = Math.max(t0[0], t1[0]) - size - margin;
    maxY = Math.max(t0[1], t1[1]) - size - margin;
  }

  mx = Math.max(minX, Math.min(mx, maxX));
  my = Math.max(minY, Math.min(my, maxY));

  mascotImg.attr("x", mx).attr("y", my);
  lastMascotAnchor = { x: mx + (size * 0.50), y: my + (size * 0.92) };
  updateHudPointerToMatchPanel();
}

export function updateHudPointerToMatchPanel() {
  const matchPanel = document.getElementById("matchPanel");
  if (!pointerLine || !matchPanel) return;
  if (matchPanel.classList.contains("hidden") || !lastMascotAnchor) {
    pointerLine.attr("opacity", 0);
    return;
  }

  const pr = matchPanel.getBoundingClientRect();
  const targetScreenX = pr.left + 14;
  const targetScreenY = pr.top + pr.height * 0.50;

  const t = screenToViewBox(targetScreenX, targetScreenY);

  pointerLine
    .attr("opacity", 1)
    .attr("x1", lastMascotAnchor.x).attr("y1", lastMascotAnchor.y)
    .attr("x2", t.x).attr("y2", t.y);
}

// Exponer globalmente para que map-core pueda llamarla
window.updateHudPointerToMatchPanel = updateHudPointerToMatchPanel;
