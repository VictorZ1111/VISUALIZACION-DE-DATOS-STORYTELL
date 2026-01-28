/* =====================================================
 * MAIN.JS — Arranque: carga todo y conecta módulos
 * ===================================================== */

import { CONFIG } from './config.js';
import { loadGeoJSON, loadWorldcupsJSON, loadMatchesCSV } from './loaders.js';
import { buildCupMatchesFromCSV } from './data-normalize.js';
import { initMap } from './map-core.js';
import { initHudOverlay } from './map-overlay.js';
import { buildStepsFromJSON, addInsightsStep } from './story-builder.js';
import { initObserver, initNavigation, setWorldCupsData } from './story-scroll.js';
import { setMatchesData, setWorldCupsData as setWorldCupsForInsights, renderInsightsCharts } from './insights/insights.js';
import { setWorldCupsData as setWorldCupsForCharts } from './insights/chart-treemap.js';

/* =====================================================
 * INIT
 * ===================================================== */

// Esperar a que el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  console.log("🔵 main.js iniciando...");

  const loadVenues = () => fetch('data/venues.json').then(r => r.json());

  Promise.all([loadGeoJSON(), loadWorldcupsJSON(), loadMatchesCSV(), loadVenues()])
  .then(([geo, wc, matches, venues]) => {
    console.log("✅ Datos cargados:", { geo: geo.features.length, cups: wc.cups.length, matches: matches.length, venues: Object.keys(venues).length });

    // 1) Carga mapa
    console.log("🗺️ Iniciando mapa...");
    initMap(geo.features);

    // 2) Fusionar venues
    wc.cups.forEach(cup => {
      if (!cup.venues) cup.venues = {};
      Object.assign(cup.venues, venues);
    });

    // 3) Procesa matches
    wc.cups.forEach(cup => {
      cup._matches = buildCupMatchesFromCSV(cup, matches);
    });

    // 4) Pasa datos a módulos
    setWorldCupsData(wc);
    setWorldCupsForCharts(wc);
    setWorldCupsForInsights(wc);
    setMatchesData(matches);

    // 5) Construye steps del story
    buildStepsFromJSON(wc);

    // 6) Añade insights al final
    addInsightsStep();

    // 7) Init HUD overlay
    initHudOverlay();

    // 8) Observador de scroll
    initObserver();

    // 8) Navegación (botones + teclado)
    initNavigation();

    // 9) Renderiza gráficos (después de que DOM esté listo)
    setTimeout(() => {
      renderInsightsCharts();
    }, 100);

    console.log("✅ Aplicación inicializada correctamente");
  })
  .catch(error => {
    console.error("❌ ERROR:", error);
    alert("❌ ERROR: " + error.message);
  });
});
