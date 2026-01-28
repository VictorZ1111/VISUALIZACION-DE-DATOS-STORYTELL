/* =====================================================
 * DATA-NORMALIZE.JS — Normalización de dataset
 * (fases en ES, co-host 2002, venues, fechas, etc.)
 * ===================================================== */

import { CONFIG, FLAG_MAP, TEXT_ES } from './config.js';

/* =====================================================
 * HELPERS
 * ===================================================== */
function safeLower(x) { return String(x || "").trim().toLowerCase(); }

export function parseMDYtoISO(mdy) {
  // CSV: 7/13/1930
  const s = String(mdy || "").trim();
  if (!s.includes("/")) return s;
  const [m, d, y] = s.split("/").map(x => x.trim());
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export function parseTimeHHMM(t) {
  const s = String(t || "").trim();
  if (!s) return "00:00";
  return s.length === 4 ? `0${s}` : s;
}

export function flagCodeFromCSV(code3) {
  const c = String(code3 || "").trim().toUpperCase();
  if (!c) return "";
  return FLAG_MAP[c] || c.toLowerCase();
}

/* =====================================================
 * NORMALIZACIÓN DE FASES
 * ===================================================== */
// Normaliza el Stage Name del CSV a una etiqueta estable (EN)
export function normalizeStageName(stageRaw) {
  const s = safeLower(stageRaw);

  if (!s) return "unknown";

  if (s.includes("third") && s.includes("place")) return "third-place match";
  if (s.includes("play-off") || s.includes("playoff")) return "play-off";

  // "final round" (1950) NO es "final"
  if (s.includes("final round")) return "final round";

  // Final real
  if (s === "final") return "final";

  if (s.includes("semi")) return "semi-finals";
  if (s.includes("quarter")) return "quarter-finals";
  if (s.includes("round of 16")) return "round of 16";
  if (s.includes("second group")) return "second group stage";

  if (s.includes("group")) return "group stage";

  // fallback
  return s.slice(0, 30);
}

// Título en español para la tarjeta del partido
export function stageTitleES(stageNorm) {
  return TEXT_ES.STAGES[safeLower(stageNorm)] || "PARTIDO";
}

// Qué texto del panel de "Historia" usar
export function historyKeyFromStage(stageNorm) {
  const s = safeLower(stageNorm);

  if (s === "group stage" || s === "second group stage") return "groups";
  if (s === "semi-finals" || s === "third-place match") return "semis";
  if (s === "final") return "final";

  // "final round" y etapas knockout tempranas se cuentan como overview
  return "overview";
}

/* =====================================================
 * CSV → cup._matches (robusto)
 * ===================================================== */
export function buildCupMatchesFromCSV(cup, rows) {
  const year = String(cup.year);
  const tid = `WC-${year}`;

  const filtered = rows.filter(r => String(r["Tournament Id"] || "").trim() === tid);

  let mapped = filtered.map(r => {
    const stageNorm = normalizeStageName(r["Stage Name"]);
    const dateISO = parseMDYtoISO(r["Match Date"]);
    const time = parseTimeHHMM(r["Match Time"]);

    const homeName = String(r["Home Team Name"] || "").trim();
    const awayName = String(r["Away Team Name"] || "").trim();
    const homeCode3 = String(r["Home Team Code"] || "").trim();
    const awayCode3 = String(r["Away Team Code"] || "").trim();
    
    // Traducir nombres de equipos
    const homeNameES = TEXT_ES.COUNTRIES[homeName] || homeName;
    const awayNameES = TEXT_ES.COUNTRIES[awayName] || awayName;

    const hs = Number(r["Home Team Score"] || 0);
    const as = Number(r["Away Team Score"] || 0);

    const result = safeLower(r["Result"]);
    let resultText = "Empate";
    if (result.includes("home")) resultText = `Gana ${homeNameES}`;
    else if (result.includes("away")) resultText = `Gana ${awayNameES}`;

    const stadium = String(r["Stadium Name"] || "").trim();
    const city = String(r["City Name"] || "").trim();

    // lat/lon desde JSON venues
    let lat = null, lon = null;

    if (cup.venues && stadium && cup.venues[stadium]) {
      lat = cup.venues[stadium].lat;
      lon = cup.venues[stadium].lon;
    } else if (cup.venues && cup.venues[CONFIG.DEFAULT_VENUE_KEY]) {
      lat = cup.venues[CONFIG.DEFAULT_VENUE_KEY].lat;
      lon = cup.venues[CONFIG.DEFAULT_VENUE_KEY].lon;
    } else if (cup.venues) {
      // si no hay Default Venue, toma el primer venue disponible
      const firstKey = Object.keys(cup.venues)[0];
      if (firstKey) {
        lat = cup.venues[firstKey].lat;
        lon = cup.venues[firstKey].lon;
      }
    }

    return {
      stageNorm,
      historyKey: historyKeyFromStage(stageNorm),
      phaseTitle: stageTitleES(stageNorm),

      date: dateISO,
      time,

      city,
      stadium,

      home: { name: homeNameES, flag: flagCodeFromCSV(homeCode3) },
      away: { name: awayNameES, flag: flagCodeFromCSV(awayCode3) },

      score: `${hs} - ${as}`,
      resultText,

      lat,
      lon
    };
  });

  // ordenar por fecha/hora real
  mapped.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  // marcar partido inaugural: el primero del mundial
  if (CONFIG.MARK_OPENING_MATCH && mapped.length) {
    mapped[0].phaseTitle = "PARTIDO INAUGURAL";
  }

  // luego ordenar por phaseOrder (si existe) y por fecha/hora
  const order = (cup.phaseOrder || []).map(x => safeLower(x));
  const idxOf = (stageNorm) => {
    const i = order.indexOf(safeLower(stageNorm));
    return i === -1 ? 999 : i;
  };

  mapped.sort((a, b) => {
    const pa = idxOf(a.stageNorm);
    const pb = idxOf(b.stageNorm);
    if (pa !== pb) return pa - pb;
    return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
  });

  return mapped;
}

/* =====================================================
 * REGIONES (para filtros de insights)
 * ===================================================== */
import { TEAM_REGION } from './config.js';

export function regionOfTeam(name){
  const key = String(name||"").trim();
  return TEAM_REGION[key] || "UNKNOWN";
}
