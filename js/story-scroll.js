/* =====================================================
 * STORY-SCROLL.JS — IntersectionObserver + navegación
 * ===================================================== */

import { CONFIG, TEXT_ES } from './config.js';
import { WORLD_T, findCountryFeature, applyTransform, clearActive, setActiveCountry, 
         zoomToCenter, fitToLeftFrame, fitTwoCountriesToLeftFrame, setCurrentCountryKey, setIsCenteredOnCountry,
         setWorldTimer, worldTimer, currentCountryKey, isCenteredOnCountry, 
         setCurrentHostFeature, currentHostFeature, countriesSelection, setCurrentCoHostFeature, currentT, path } from './map-core.js';
import { hideAllPanels, showTitleCentered, showTitleRight, showHistoryRightFromCup,
         showMatchCard, hideMatchCard, showChampionCard, hideChampionCard, positionChampionOverCountry } from './ui-panels.js';
import { requestTrack, stopTrack, unlockAudioOnce } from './audio.js';
import { hideOverlay, showOverlay, setMascotImage, moveMascotAndPointerTo } from './map-overlay.js';
import { COUNTRY_COLORS } from './config.js';

// Data global
let WORLD_CUPS = null;
let lastStepType = null; // Para detectar dirección (guarda { type, dataset })
let isMovingBackward = false;

export function setWorldCupsData(data) {
  WORLD_CUPS = data;
}

/* =====================================================
 * HELPERS
 * ===================================================== */
function keyOf(stepEl) {
  const year = stepEl.dataset.year || "";
  const country = (stepEl.dataset.country || "").trim();
  return `${country}-${year}`;
}

function getCupByYear(year) {
  if (!WORLD_CUPS) return null;
  return WORLD_CUPS.cups.find(c => String(c.year) === String(year));
}

function getNextWorldcupStep(fromStep) {
  const all = Array.from(document.querySelectorAll(".step"));
  const idx = all.indexOf(fromStep);
  for (let i = idx + 1; i < all.length; i++) {
    if (all[i].dataset.type === "worldcup") return all[i];
  }
  return null;
}

/* =====================================================
 * LOGO DEL MUNDIAL EN EL MAPA (HECHOS HISTÓRICOS)
 * ===================================================== */
function showFactsLogo(feature, cup) {
  const factsLogo = document.getElementById("factsLogo");
  if (!factsLogo) return;
  
  // Usar logo del mundial desde assets/logos/[año].png
  factsLogo.src = `assets/logos/${cup.year}.png`;
  
  // Fallback a copa1.png si no existe el logo
  factsLogo.onerror = () => {
    factsLogo.src = "assets/icons/copa1.png";
  };
  
  // Calcular centro del país en coordenadas de pantalla
  const bounds = path.bounds(feature);
  const [[x0, y0], [x1, y1]] = bounds;
  const centerX = (x0 + x1) / 2;
  const centerY = (y0 + y1) / 2;
  
  // Aplicar la transformación actual del mapa
  const [px, py] = currentT.apply([centerX, centerY]);
  
  // Ajustar un poco a la derecha
  factsLogo.style.left = `${px + 30}px`;
  factsLogo.style.top = `${py}px`;
  factsLogo.style.display = "block"; // Resetear display
  factsLogo.classList.remove("hidden");
}

function hideFactsLogo() {
  const factsLogo = document.getElementById("factsLogo");
  if (factsLogo) {
    factsLogo.classList.add("hidden");
    factsLogo.style.display = "none"; // Forzar display none
    factsLogo.src = ""; // Limpiar la fuente
  }
}

/* =====================================================
 * ESTADOS / FLUJO
 * ===================================================== */
function resetIntro() {
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }

  setCurrentCountryKey(null);
  setIsCenteredOnCountry(false);
  setCurrentHostFeature(null);

  clearActive();
  hideAllPanels();
  hideFactsLogo(); // Ocultar logo
  hideOverlay();

  stopTrack();

  applyTransform(WORLD_T, 700);
}

function showWorld(stepEl) {
  // Solo activar timer automático si vamos hacia adelante
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }

  hideAllPanels();
  hideFactsLogo(); // Ocultar logo
  clearActive();
  setIsCenteredOnCountry(false);
  hideOverlay();

  applyTransform(WORLD_T, 850, () => {
    const nextWC = getNextWorldcupStep(stepEl);
    if (!nextWC) return;

    const year = nextWC.dataset.year || "";
    const country = (nextWC.dataset.country || "").trim();
    const flag = nextWC.dataset.flag || "";
    const audioUrl = nextWC.dataset.audio || "";

    // NO mostrar título aquí, solo preparar el país
    // El título se mostrará en enterCountryCentered()

    if (audioUrl) requestTrack(audioUrl);

    const feature = findCountryFeature(country);
    if (feature) setActiveCountry(feature);

    // Solo activar timer automático si NO estamos retrocediendo
    if (!isMovingBackward) {
      const timer = setTimeout(() => {
        if (!feature) return;
        enterCountryCentered(nextWC, feature);
      }, CONFIG.WORLD_AUTO_ENTER_MS);
      
      setWorldTimer(timer);
    }
  });
}

function enterCountryCentered(worldcupStep, feature) {
  // OCULTAR LOGO INMEDIATAMENTE
  hideFactsLogo();
  
  // Cancelar timer al entrar manualmente
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }
  
  const k = keyOf(worldcupStep);
  setCurrentCountryKey(k);
  setIsCenteredOnCountry(true);

  const year = worldcupStep.dataset.year || "";
  const country = (worldcupStep.dataset.country || "").trim();
  const flag = worldcupStep.dataset.flag || "";
  const audioUrl = worldcupStep.dataset.audio || "";

  hideAllPanels();
  clearActive();
  
  if (audioUrl) requestTrack(audioUrl);
  
  // Obtener el cup para verificar si hay co-anfitrión
  const cup = getCupByYear(year);
  console.log(`🔍 enterCountryCentered - year: ${year}, country: ${country}, cup:`, cup);
  let coHostFeature = null;
  if (cup && cup.coHost) {
    console.log(`✅ Co-anfitrión detectado: ${cup.coHost}`);
    coHostFeature = findCountryFeature(cup.coHost);
    console.log(`🗺️ coHostFeature encontrado:`, coHostFeature);
  } else {
    console.log(`❌ No hay co-anfitrión para ${year}`);
  }
  
  // Activar país(es)
  if (coHostFeature) {
    // Co-anfitrión: mostrar ambos países
    const countryColor = COUNTRY_COLORS[country] || "#2a4a5e";
    const coHostColor = COUNTRY_COLORS[cup.coHost] || "#2a4a5e";
    
    countriesSelection.filter(d => d !== feature && d !== coHostFeature).attr("opacity", 0.06).classed("dim", true).classed("active", false);
    countriesSelection.filter(d => d === feature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", countryColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    countriesSelection.filter(d => d === coHostFeature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", coHostColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    
    setCurrentCoHostFeature(coHostFeature);
    applyTransform(fitTwoCountriesToLeftFrame(feature, coHostFeature), 1000);
  } else {
    // Un solo país
    setActiveCountry(feature);
    setCurrentCoHostFeature(null);
    applyTransform(zoomToCenter(feature), 1000);
  }

  // Título y banderas
  if (coHostFeature && cup) {
    const countryES = TEXT_ES.COUNTRIES[country] || country;
    const coHostES = TEXT_ES.COUNTRIES[cup.coHost] || cup.coHost;
    const coHostFlag = cup.coHost === "Japan" ? "jp" : flag;
    showTitleCentered(`MUNDIAL ${countryES.toUpperCase()}/${coHostES.toUpperCase()} ${year}`, `${flag} ${coHostFlag}`);
  } else {
    const countryES = TEXT_ES.COUNTRIES[country] || country;
    showTitleCentered(`MUNDIAL ${countryES.toUpperCase()} ${year}`, flag);
  }
}

function onWorldcup(stepEl) {
  // OCULTAR LOGO INMEDIATAMENTE ANTES DE CUALQUIER COSA
  hideFactsLogo();
  
  // Cancelar timer automático al entrar manualmente en worldcup
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }
  
  const country = (stepEl.dataset.country || "").trim();
  const feature = findCountryFeature(country);
  if (!feature) return;

  // Siempre forzar la actualización
  enterCountryCentered(stepEl, feature);
}

function onSplit(stepEl) {
  // Cancelar timer automático
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }
  
  hideFactsLogo(); // Ocultar logo si venimos de facts
  
  const year = stepEl.dataset.year || "";
  const country = (stepEl.dataset.country || "").trim();
  const flag = stepEl.dataset.flag || "";
  const audioUrl = stepEl.dataset.audio || "";

  const cup = getCupByYear(year);
  if (!cup) return;

  const feature = findCountryFeature(country);
  if (!feature) return;

  setCurrentHostFeature(feature);
  setCurrentCountryKey(keyOf(stepEl));

  hideAllPanels();
  hideOverlay();
  clearActive();

  if (audioUrl) requestTrack(audioUrl);

  // Detectar si hay co-anfitrión
  let coHostFeature = null;
  if (cup.coHost) {
    coHostFeature = findCountryFeature(cup.coHost);
  }

  // atenuar otros y resaltar activo(s) con color de bandera
  const countryColor = COUNTRY_COLORS[country] || "#2a4a5e";
  
  if (coHostFeature) {
    // Mostrar ambos países resaltados
    const coHostColor = COUNTRY_COLORS[cup.coHost] || "#2a4a5e";
    countriesSelection.filter(d => d !== feature && d !== coHostFeature).attr("opacity", 0.06).classed("dim", true).classed("active", false);
    countriesSelection.filter(d => d === feature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", countryColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    countriesSelection.filter(d => d === coHostFeature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", coHostColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    
    // Establecer co-host para que la mascota pueda moverse entre ambos países
    setCurrentCoHostFeature(coHostFeature);
  } else {
    // Un solo país anfitrión
    countriesSelection.filter(d => d !== feature).attr("opacity", 0.06).classed("dim", true).classed("active", false);
    countriesSelection.filter(d => d === feature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", countryColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    
    // Limpiar co-host
    setCurrentCoHostFeature(null);
  }

  // Zoom para mostrar el/los país(es)
  if (coHostFeature) {
    applyTransform(fitTwoCountriesToLeftFrame(feature, coHostFeature), 1000);
  } else {
    applyTransform(fitToLeftFrame(feature), 1000);
  }

  // Título y banderas
  if (coHostFeature) {
    // Co-anfitrión: mostrar ambos países y ambas banderas
    const countryES = TEXT_ES.COUNTRIES[country] || country;
    const coHostES = TEXT_ES.COUNTRIES[cup.coHost] || cup.coHost;
    const coHostFlag = cup.coHost === "Japan" ? "jp" : flag;
    showTitleRight(`MUNDIAL ${countryES.toUpperCase()}/${coHostES.toUpperCase()} ${year}`, `${flag} ${coHostFlag}`);
  } else {
    // Un solo país
    const countryES = TEXT_ES.COUNTRIES[country] || country;
    showTitleRight(`MUNDIAL ${countryES.toUpperCase()} ${year}`, flag);
  }
  
  showHistoryRightFromCup(cup, "overview");

  if (cup.mascot) setMascotImage(cup.mascot);
}

function onMatch(stepEl) {
  // Cancelar timer automático
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }
  
  hideFactsLogo(); // Ocultar logo si venimos de facts
  
  const year = stepEl.dataset.year || "";
  const idx = Number(stepEl.dataset.matchIndex || 0);

  const cup = getCupByYear(year);
  if (!cup || !cup._matches) return;

  hideAllPanels();

  const match = cup._matches[idx];
  if (!match) return;

  // Detectar país activo según ubicación del partido (para co-anfitriones)
  let activeFeature = findCountryFeature(cup.host);
  let activeCountry = cup.host;
  let activeFlag = cup.hostFlag;
  
  if (cup.coHost && match.lon != null && match.lat != null) {
    const coHostFeature = findCountryFeature(cup.coHost);
    if (coHostFeature && d3.geoContains(coHostFeature, [match.lon, match.lat])) {
      // El partido está en el co-anfitrión
      activeFeature = coHostFeature;
      activeCountry = cup.coHost;
      activeFlag = cup.coHost === "Japan" ? "jp" : cup.hostFlag;
    }
  }

  if (activeFeature) {
    setCurrentHostFeature(activeFeature);
    setCurrentCountryKey(`${activeCountry}-${year}`);
    clearActive();
    
    // Asegurar que el país activo esté visible y resaltado
    const countryColor = COUNTRY_COLORS[activeCountry] || "#2a4a5e";
    countriesSelection.filter(d => d !== activeFeature).attr("opacity", 0.06).classed("dim", true).classed("active", false);
    countriesSelection.filter(d => d === activeFeature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", countryColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    
    applyTransform(fitToLeftFrame(activeFeature), 450);
    
    // Limpiar co-host feature para que el clamp funcione solo en el país activo
    setCurrentCoHostFeature(null);
  }

  // Audio del mundial
  if (cup.audio) requestTrack(cup.audio);

  // Título con co-host si existe
  if (cup.coHost) {
    const hostNameES = TEXT_ES.COUNTRIES[cup.host] || cup.host;
    const coHostES = TEXT_ES.COUNTRIES[cup.coHost] || cup.coHost;
    const coHostFlag = cup.coHost === "Japan" ? "jp" : cup.hostFlag;
    showTitleRight(`MUNDIAL ${hostNameES.toUpperCase()}/${coHostES.toUpperCase()} ${cup.year}`, `${cup.hostFlag} ${coHostFlag}`);
  } else {
    const hostNameES = TEXT_ES.COUNTRIES[cup.host] || cup.host;
    showTitleRight(`MUNDIAL ${hostNameES.toUpperCase()} ${cup.year}`, cup.hostFlag || "");
  }

  showHistoryRightFromCup(cup, match.historyKey || "overview");
  showMatchCard(match);

  showOverlay();
  if (cup.mascot) setMascotImage(cup.mascot);

  if (match.lon != null && match.lat != null) {
    moveMascotAndPointerTo(match.lon, match.lat);
  } else {
    moveMascotAndPointerTo(); // Sin coordenadas = centro del país
  }
}

function onChampion(stepEl) {
  // Cancelar timer automático
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }
  
  hideFactsLogo(); // Ocultar logo si venimos de facts
  
  const year = stepEl.dataset.year || "";
  const cup = getCupByYear(year);
  if (!cup) return;

  hideAllPanels();
  hideOverlay();

  const feature = findCountryFeature(cup.host);
  if (feature) {
    setCurrentHostFeature(feature);
    setCurrentCountryKey(`${cup.host}-${year}`);
    clearActive();
    
    // Limpiar co-host
    setCurrentCoHostFeature(null);
    
    // Asegurar que el país esté visible y resaltado con color de bandera
    const countryColor = COUNTRY_COLORS[cup.host] || "#2a4a5e";
    countriesSelection.filter(d => d !== feature).attr("opacity", 0.06).classed("dim", true).classed("active", false);
    countriesSelection.filter(d => d === feature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", countryColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    
    applyTransform(fitToLeftFrame(feature), 450, () => positionChampionOverCountry(feature));
    setTimeout(() => positionChampionOverCountry(feature), 520);
  }

  // Audio del mundial
  if (cup.audio) requestTrack(cup.audio);

  // Título con co-host si existe
  if (cup.coHost) {
    const hostNameES = TEXT_ES.COUNTRIES[cup.host] || cup.host;
    const coHostES = TEXT_ES.COUNTRIES[cup.coHost] || cup.coHost;
    const coHostFlag = cup.coHost === "Japan" ? "jp" : cup.hostFlag;
    showTitleRight(`MUNDIAL ${hostNameES.toUpperCase()}/${coHostES.toUpperCase()} ${cup.year}`, `${cup.hostFlag} ${coHostFlag}`);
  } else {
    const hostNameES = TEXT_ES.COUNTRIES[cup.host] || cup.host;
    showTitleRight(`MUNDIAL ${hostNameES.toUpperCase()} ${cup.year}`, cup.hostFlag || "");
  }
  showHistoryRightFromCup(cup, "champion");

  if (cup.champion) showChampionCard(cup.champion);
}

function onFacts(stepEl) {
  // Cancelar timer automático
  if (worldTimer) {
    clearTimeout(worldTimer);
    setWorldTimer(null);
  }
  
  const year = stepEl.dataset.year || "";
  const cup = getCupByYear(year);
  if (!cup) return;

  hideAllPanels();
  hideOverlay();

  const feature = findCountryFeature(cup.host);
  if (feature) {
    setCurrentHostFeature(feature);
    setCurrentCountryKey(`${cup.host}-${year}`);
    clearActive();
    
    // Limpiar co-host
    setCurrentCoHostFeature(null);
    
    // Asegurar que el país esté visible y resaltado con color de bandera
    const countryColor = COUNTRY_COLORS[cup.host] || "#2a4a5e";
    countriesSelection.filter(d => d !== feature).attr("opacity", 0.06).classed("dim", true).classed("active", false);
    countriesSelection.filter(d => d === feature).attr("opacity", 1).classed("dim", false).classed("active", true)
      .attr("fill", countryColor)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", 0.35)
      .raise();
    
    applyTransform(fitToLeftFrame(feature), 450);
    
    // Mostrar logo del mundial en medio del país
    showFactsLogo(feature, cup);
  }

  // Audio del mundial
  if (cup.audio) requestTrack(cup.audio);

  // Título con co-host si existe
  if (cup.coHost) {
    const hostNameES = TEXT_ES.COUNTRIES[cup.host] || cup.host;
    const coHostES = TEXT_ES.COUNTRIES[cup.coHost] || cup.coHost;
    const coHostFlag = cup.coHost === "Japan" ? "jp" : cup.hostFlag;
    showTitleRight(`MUNDIAL ${hostNameES.toUpperCase()}/${coHostES.toUpperCase()} ${cup.year}`, `${cup.hostFlag} ${coHostFlag}`);
  } else {
    const hostNameES = TEXT_ES.COUNTRIES[cup.host] || cup.host;
    showTitleRight(`MUNDIAL ${hostNameES.toUpperCase()} ${cup.year}`, cup.hostFlag || "");
  }
  showHistoryRightFromCup(cup, "facts");
}

function onInsights(){
  hideAllPanels();
  hideOverlay();
  hideFactsLogo();
  applyTransform(WORLD_T, 850);
  stopTrack();
}

/* =====================================================
 * OBSERVER
 * ===================================================== */
function onStepEnter(stepEl) {
  const type = stepEl.dataset.type;
  
  // Detectar si estamos retrocediendo comparando con el step anterior
  // Solo comparamos tipos que indican un nuevo mundial
  if (type === 'world' || type === 'worldcup' || type === 'split') {
    const currentYear = stepEl.dataset.year || "";
    const lastYear = lastStepType?.dataset?.year;
    
    if (lastYear && currentYear && parseInt(currentYear) < parseInt(lastYear)) {
      isMovingBackward = true;
    } else if (lastStepType?.type === 'facts' && type === 'world') {
      // Si venimos de facts y vamos a world, estamos avanzando al siguiente mundial
      isMovingBackward = false;
    } else if (lastStepType?.type === 'insights' && type === 'world') {
      // Si regresamos de insights a un mundial, estamos retrocediendo
      isMovingBackward = true;
    } else {
      isMovingBackward = false;
    }
  }
  
  // Guardar referencia al step actual
  lastStepType = { type, dataset: stepEl.dataset };

  if (type === "intro") return resetIntro();
  if (type === "world") return showWorld(stepEl);
  if (type === "worldcup") return onWorldcup(stepEl);
  if (type === "split") return onSplit(stepEl);
  if (type === "match") return onMatch(stepEl);
  if (type === "champion") return onChampion(stepEl);
  if (type === "facts") return onFacts(stepEl);
  if (type === "insights-intro") {
    if (worldTimer) {
      clearTimeout(worldTimer);
      setWorldTimer(null);
    }
    hideAllPanels();
    clearActive();
    return onInsights();
  }
  if (type === "insights-chart1" || type === "insights-chart2" || type === "insights-chart3") {
    // Mantener el mapa visible mientras se muestran los gráficos
    hideAllPanels();
    clearActive();
    return;
  }
  if (type === "insights-conclusion") {
    hideAllPanels();
    clearActive();
    return;
  }
}

export function initObserver() {
  const steps = document.querySelectorAll(".step");
  let lastScrollY = window.scrollY;
  let isScrollingDown = true;

  const observer = new IntersectionObserver((entries) => {
    const currentScrollY = window.scrollY;
    isScrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    // Ordenar por posición para procesar en orden correcto
    const sorted = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const aRect = a.target.getBoundingClientRect();
        const bRect = b.target.getBoundingClientRect();
        return aRect.top - bRect.top;
      });

    // Si vamos hacia arriba, tomar el último visible (más arriba)
    // Si vamos hacia abajo, tomar el primero visible (más abajo del viewport)
    const targetEntry = isScrollingDown ? sorted[sorted.length - 1] : sorted[0];
    
    if (targetEntry) {
      onStepEnter(targetEntry.target);
    }
  }, { threshold: [0.4, 0.6] });

  steps.forEach(s => observer.observe(s));
}

/* =====================================================
 * NAVEGACIÓN (teclado + botón start)
 * ===================================================== */
export function initNavigation() {
  // Botón comenzar
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      unlockAudioOnce();
      const all = Array.from(document.querySelectorAll(".step"));
      const introIndex = all.findIndex(x => x.dataset.type === "intro");
      const next = all[introIndex + 1];
      if (next) next.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Teclas
  window.addEventListener("keydown", (e) => {
    const keysNext = ["ArrowDown", "ArrowRight", "PageDown", " "];
    const keysPrev = ["ArrowUp", "ArrowLeft", "PageUp"];
    if (!keysNext.includes(e.key) && !keysPrev.includes(e.key)) return;
    if (e.key === " ") e.preventDefault();

    const all = Array.from(document.querySelectorAll(".step"));
    const current = getCurrentStepIndex(all);

    if (keysNext.includes(e.key)) {
      // Si estamos en la última sección, volver al inicio
      if (current >= all.length - 1) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        all[Math.min(all.length - 1, current + 1)]?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      all[Math.max(0, current - 1)]?.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Resize
  window.addEventListener("resize", () => {
    const championPanel = document.getElementById("championPanel");
    if (!championPanel.classList.contains("hidden") && currentHostFeature) {
      positionChampionOverCountry(currentHostFeature);
    }
  });
}

function getCurrentStepIndex(all) {
  const midY = window.innerHeight / 2;
  let bestIdx = 0;
  let bestDist = Infinity;

  all.forEach((el, idx) => {
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const dist = Math.abs(center - midY);
    if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
  });

  return bestIdx;
}
