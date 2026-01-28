/* =====================================================
 * MAP-CORE.JS — SVG, proyección, path, países, zooms
 * ===================================================== */

import { CONFIG, STYLES } from './config.js';

const { width, height } = CONFIG.MAP_VIEWBOX;

// Mapeo de nombres de países a sus nombres en el GeoJSON
const COUNTRY_ALIASES = {
  "England": "United Kingdom",
  "United States of America": "United States of America"
};

// SVG principal
export const svg = d3.select("#map")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .style("width", "100%")
  .style("height", "100%");

// Capas
export const gMap = svg.append("g");
export const gHud = svg.append("g").attr("class", "hudOverlay");

// Proyección
export const projection = d3.geoNaturalEarth1()
  .scale(180)
  .translate([width / 2, height / 2]);

export const path = d3.geoPath().projection(projection);

// Estado del mapa
export let worldFeatures = [];
export let countriesSelection = null;
export let currentT = d3.zoomIdentity;
export let WORLD_T = d3.zoomIdentity;

export const leftFrame = {
  x: 40,
  y: 40,
  w: Math.floor(width * 0.58),
  h: height - 80
};

export let worldTimer = null;
export let currentCountryKey = null;
export let isCenteredOnCountry = false;
export let currentHostFeature = null;
export let currentHostName = null;
export let currentCoHostFeature = null; // Para co-anfitriones (ej: Corea-Japón 2002)

/* =====================================================
 * SETTERS
 * ===================================================== */
export function setWorldFeatures(features) {
  worldFeatures = features;
}

export function setCountriesSelection(selection) {
  countriesSelection = selection;
}

export function setCurrentT(t) {
  currentT = t;
}

export function setWorldT(t) {
  WORLD_T = t;
}

export function setWorldTimer(timer) {
  worldTimer = timer;
}

export function setCurrentCountryKey(key) {
  currentCountryKey = key;
}

export function setIsCenteredOnCountry(value) {
  isCenteredOnCountry = value;
}

export function setCurrentHostFeature(feature) {
  currentHostFeature = feature;
}

export function setCurrentHostName(name) {
  currentHostName = name;
}

export function setCurrentCoHostFeature(feature) {
  currentCoHostFeature = feature;
}

/* =====================================================
 * HELPERS
 * ===================================================== */
function safeLower(x) { return String(x || "").trim().toLowerCase(); }

export function findCountryFeature(countryName) {
  // Aplicar alias si existe
  const searchName = COUNTRY_ALIASES[countryName] || countryName;
  const lower = safeLower(searchName);
  return worldFeatures.find(d => {
    const p = d.properties || {};
    const candidates = [p.name, p.NAME, p.ADMIN, p.Country, p.NAME_EN]
      .filter(Boolean)
      .map(x => safeLower(x));
    return candidates.includes(lower);
  });
}

export function screenToViewBox(screenX, screenY) {
  const rect = svg.node().getBoundingClientRect();
  const x = (screenX - rect.left) * (width / rect.width);
  const y = (screenY - rect.top)  * (height / rect.height);
  return { x, y };
}

export function svgPointToScreen(px, py) {
  const rect = svg.node().getBoundingClientRect();
  const sx = rect.width / width;
  const sy = rect.height / height;
  return { x: rect.left + px * sx, y: rect.top + py * sy };
}

/* =====================================================
 * TRANSFORMS (zoom / fit)
 * ===================================================== */
export function applyTransform(t, duration = 900, onEnd = null) {
  currentT = t;
  const tr = gMap.transition().duration(duration).attr("transform", t.toString());
  if (onEnd) tr.on("end", onEnd);

  // Para actualizar la línea del overlay
  if (typeof window.updateHudPointerToMatchPanel === 'function') {
    setTimeout(window.updateHudPointerToMatchPanel, Math.max(30, duration * 0.2));
    setTimeout(window.updateHudPointerToMatchPanel, Math.max(60, duration * 0.6));
    setTimeout(window.updateHudPointerToMatchPanel, duration + 40);
  }
}

export function computeWorldFitTransform(padding = 0.03) {
  const fc = { type: "FeatureCollection", features: worldFeatures };
  const [[x0, y0], [x1, y1]] = path.bounds(fc);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const scale = (1 - padding) * Math.min(width / dx, height / dy);
  const tx = width / 2 - scale * cx;
  const ty = height / 2 - scale * cy;

  WORLD_T = d3.zoomIdentity.translate(tx, ty).scale(scale);
}

export function zoomToCenter(feature) {
  // Usar solo el polígono principal (territorio más grande)
  const mainFeature = getMainPolygon(feature);
  
  const [[x0, y0], [x1, y1]] = path.bounds(mainFeature);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const padding = 0.14;
  const scale = Math.min(18, (1 - padding) / Math.max(dx / width, dy / height));
  const tx = width / 2 - scale * cx;
  const ty = height / 2 - scale * cy;

  return d3.zoomIdentity.translate(tx, ty).scale(scale);
}

/* =====================================================
 * HELPER: extraer polígono principal (ignorar territorios de ultramar)
 * ===================================================== */
function getMainPolygon(feature) {
  if (!feature || !feature.geometry) return feature;
  
  const geom = feature.geometry;
  
  // Si es un polígono simple, retornar tal cual
  if (geom.type === "Polygon") {
    return feature;
  }
  
  // Si es MultiPolygon, encontrar el polígono más grande por área
  if (geom.type === "MultiPolygon") {
    let maxArea = 0;
    let mainPolygon = null;
    
    geom.coordinates.forEach(polygonCoords => {
      const tempFeature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: polygonCoords
        }
      };
      const area = d3.geoArea(tempFeature);
      if (area > maxArea) {
        maxArea = area;
        mainPolygon = polygonCoords;
      }
    });
    
    if (mainPolygon) {
      return {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: mainPolygon
        },
        properties: feature.properties
      };
    }
  }
  
  // Si es GeometryCollection, buscar el polígono/multipolígono más grande
  if (geom.type === "GeometryCollection") {
    let maxArea = 0;
    let mainGeometry = null;
    
    geom.geometries.forEach(g => {
      const tempFeature = {
        type: "Feature",
        geometry: g
      };
      const area = d3.geoArea(tempFeature);
      if (area > maxArea) {
        maxArea = area;
        mainGeometry = g;
      }
    });
    
    if (mainGeometry) {
      const result = {
        type: "Feature",
        geometry: mainGeometry,
        properties: feature.properties
      };
      // Recursión para manejar MultiPolygon dentro de GeometryCollection
      return getMainPolygon(result);
    }
  }
  
  return feature;
}

export function fitToLeftFrame(feature) {
  // Usar solo el polígono principal (territorio más grande)
  const mainFeature = getMainPolygon(feature);
  
  const [[x0, y0], [x1, y1]] = path.bounds(mainFeature);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const pad = 0.90;
  const scale = Math.min(leftFrame.w / dx, leftFrame.h / dy) * pad;

  const tx = leftFrame.x + leftFrame.w / 2 - scale * cx;
  const ty = leftFrame.y + leftFrame.h / 2 - scale * cy;

  return d3.zoomIdentity.translate(tx, ty).scale(scale);
}

export function fitTwoCountriesToLeftFrame(feature1, feature2) {
  // Usar solo los polígonos principales de cada país
  const mainFeature1 = getMainPolygon(feature1);
  const mainFeature2 = getMainPolygon(feature2);
  
  // Calcular bbox combinado de ambos países
  const [[x0a, y0a], [x1a, y1a]] = path.bounds(mainFeature1);
  const [[x0b, y0b], [x1b, y1b]] = path.bounds(mainFeature2);
  
  const x0 = Math.min(x0a, x0b);
  const y0 = Math.min(y0a, y0b);
  const x1 = Math.max(x1a, x1b);
  const y1 = Math.max(y1a, y1b);
  
  const dx = x1 - x0;
  const dy = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  // Padding más ajustado para mostrar ambos países
  const pad = 0.75;
  const scale = Math.min(leftFrame.w / dx, leftFrame.h / dy) * pad;

  // Ajustar más hacia el centro cuando son dos países
  // Agregar offset adicional hacia la derecha para compensar
  const offsetX = leftFrame.w * 0.3; // 20% del ancho hacia la derecha
  const tx = leftFrame.x + leftFrame.w / 2 - scale * cx + offsetX;
  const ty = leftFrame.y + leftFrame.h / 2 - scale * cy;

  return d3.zoomIdentity.translate(tx, ty).scale(scale);
}

/* =====================================================
 * MAPA: activar / limpiar país
 * ===================================================== */
export function clearActive() {
  if (!countriesSelection) return;
  countriesSelection
    .attr("fill", STYLES.FILL_BASE)
    .attr("stroke", STYLES.STROKE_COLOR_BASE)
    .attr("stroke-width", STYLES.STROKE_WIDTH_BASE)
    .attr("opacity", 1)
    .classed("dim", false)
    .classed("active", false);
}

export function setActiveCountry(feature) {
  countriesSelection
    .attr("opacity", 0.35)
    .classed("dim", true);

  countriesSelection.filter(d => d === feature)
    .attr("opacity", 1)
    .attr("fill", STYLES.FILL_ACTIVE)
    .attr("stroke", STYLES.STROKE_COLOR_ACTIVE)
    .attr("stroke-width", STYLES.STROKE_WIDTH_ACTIVE)
    .classed("dim", false)
    .classed("active", true)
    .raise();
}

/* =====================================================
 * INIT MAPA
 * ===================================================== */
export function initMap(geoFeatures) {
  worldFeatures = geoFeatures;

  countriesSelection = gMap.selectAll("path")
    .data(worldFeatures)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", STYLES.FILL_BASE)
    .attr("stroke", STYLES.STROKE_COLOR_BASE)
    .attr("stroke-width", STYLES.STROKE_WIDTH_BASE)
    .attr("opacity", 1);

  computeWorldFitTransform(CONFIG.WORLD_FIT_PADDING);
}
