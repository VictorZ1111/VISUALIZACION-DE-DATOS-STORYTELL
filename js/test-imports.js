/* =====================================================
 * TEST-IMPORTS.JS — Verificación de módulos
 * 
 * Este archivo verifica que todos los imports estén correctos.
 * Para usarlo, cárgalo temporalmente en index.html:
 * <script type="module" src="js/test-imports.js"></script>
 * 
 * Si todo está bien, verás en consola: "✅ Todos los módulos OK"
 * ===================================================== */

console.log("🔍 Verificando módulos...");

// Test 1: Config
import { CONFIG, STYLES, FLAG_MAP, TEAM_REGION, TEXT_ES } from './config.js';
console.log("✅ config.js:", CONFIG);

// Test 2: Loaders
import { loadGeoJSON, loadWorldcupsJSON, loadMatchesCSV } from './loaders.js';
console.log("✅ loaders.js");

// Test 3: Data Normalize
import { parseMDYtoISO, parseTimeHHMM, flagCodeFromCSV, normalizeStageName, 
         stageTitleES, historyKeyFromStage, buildCupMatchesFromCSV, regionOfTeam } from './data-normalize.js';
console.log("✅ data-normalize.js");

// Test 4: Map Core
import { svg, gMap, gHud, projection, path, worldFeatures, countriesSelection,
         currentT, WORLD_T, leftFrame, findCountryFeature, screenToViewBox, 
         svgPointToScreen, applyTransform, computeWorldFitTransform, zoomToCenter,
         fitToLeftFrame, clearActive, setActiveCountry, initMap } from './map-core.js';
console.log("✅ map-core.js");

// Test 5: Map Overlay
import { initHudOverlay, setMascotImage, showOverlay, hideOverlay, 
         moveMascotAndPointerTo, updateHudPointerToMatchPanel } from './map-overlay.js';
console.log("✅ map-overlay.js");

// Test 6: UI Panels
import { worldcupPanel, wcTitle, historyPanel, histTitle, histText, 
         matchPanel, championPanel, setFlagImage, hideAllPanels,
         showTitleCentered, showTitleRight, showHistoryRightFromCup,
         showMatchCard, hideMatchCard, showChampionCard, hideChampionCard,
         positionChampionOverCountry } from './ui-panels.js';
console.log("✅ ui-panels.js");

// Test 7: Audio
import { requestTrack, playTrack, stopTrack, unlockAudioOnce, resetAudio } from './audio.js';
console.log("✅ audio.js");

// Test 8: Story Builder
import { buildStepsFromJSON, addInsightsStep, insightsStepEl } from './story-builder.js';
console.log("✅ story-builder.js");

// Test 9: Story Scroll
import { setWorldCupsData, initObserver, initNavigation } from './story-scroll.js';
console.log("✅ story-scroll.js");

// Test 10: Insights
import { setMatchesData as setMatchesDataInsights, tipShow, tipMove, tipHide, 
         buildGoalsSankey, renderInsightsCharts } from './insights/insights.js';
console.log("✅ insights/insights.js");

// Test 11: Charts
import { setWorldCupsData as setWorldCupsForCharts, renderChampionsBar } from './insights/chart-treemap.js';
import { renderSankeyReal } from './insights/chart-sankey.js';
import { renderNetwork } from './insights/chart-network.js';
console.log("✅ insights/chart-*.js");

console.log("✅✅✅ Todos los módulos cargaron correctamente!");
console.log("🚀 Puedes remover este script de test ahora.");
