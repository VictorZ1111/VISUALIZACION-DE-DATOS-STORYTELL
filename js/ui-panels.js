/* =====================================================
 * UI-PANELS.JS — Título, historia, matchCard, championCard
 * ===================================================== */

import { FLAG_MAP, TEXT_ES } from './config.js';

// Mapeo completo de códigos de equipo a códigos de bandera
const TEAM_CODE_TO_FLAG = {
  // Códigos ISO3 a ISO2
  "DZA": "dz",  // Algeria
  "AGO": "ao",  // Angola
  "ARG": "ar",  // Argentina
  "AUS": "au",  // Australia
  "AUT": "at",  // Austria
  "BEL": "be",  // Belgium
  "BOL": "bo",  // Bolivia
  "BIH": "ba",  // Bosnia
  "BRA": "br",  // Brazil
  "BGR": "bg",  // Bulgaria
  "CMR": "cm",  // Cameroon
  "CAN": "ca",  // Canada
  "CHL": "cl",  // Chile
  "CHN": "cn",  // China
  "COL": "co",  // Colombia
  "CRI": "cr",  // Costa Rica
  "HRV": "hr",  // Croatia
  "CUB": "cu",  // Cuba
  "CZE": "cz",  // Czech Republic
  "CSK": "cz",  // Czechoslovakia
  "DNK": "dk",  // Denmark
  "IDN": "id",  // Dutch East Indies / Indonesia
  "DDR": "de",  // East Germany
  "ECU": "ec",  // Ecuador
  "EGY": "eg",  // Egypt
  "SLV": "sv",  // El Salvador
  "ENG": "gb-eng",  // England
  "FRA": "fr",  // France
  "DEU": "de",  // Germany
  "GHA": "gh",  // Ghana
  "GRC": "gr",  // Greece
  "HTI": "ht",  // Haiti
  "HND": "hn",  // Honduras
  "HUN": "hu",  // Hungary
  "ISL": "is",  // Iceland
  "IRN": "ir",  // Iran
  "IRQ": "iq",  // Iraq
  "ISR": "il",  // Israel
  "ITA": "it",  // Italy
  "CIV": "ci",  // Ivory Coast
  "JAM": "jm",  // Jamaica
  "JPN": "jp",  // Japan
  "KWT": "kw",  // Kuwait
  "MEX": "mx",  // Mexico
  "MAR": "ma",  // Morocco
  "NLD": "nl",  // Netherlands
  "NZL": "nz",  // New Zealand
  "NGA": "ng",  // Nigeria
  "PRK": "kp",  // North Korea
  "NIR": "gb-nir",  // Northern Ireland
  "NOR": "no",  // Norway
  "PAN": "pa",  // Panama
  "PRY": "py",  // Paraguay
  "PER": "pe",  // Peru
  "POL": "pl",  // Poland
  "PRT": "pt",  // Portugal
  "QAT": "qa",  // Qatar
  "IRL": "ie",  // Republic of Ireland
  "ROU": "ro",  // Romania
  "RUS": "ru",  // Russia
  "SAU": "sa",  // Saudi Arabia
  "SCO": "gb-sct",  // Scotland
  "SEN": "sn",  // Senegal
  "SRB": "rs",  // Serbia
  "SCG": "rs",  // Serbia and Montenegro
  "SVK": "sk",  // Slovakia
  "SVN": "si",  // Slovenia
  "ZAF": "za",  // South Africa
  "KOR": "kr",  // South Korea
  "SUN": "ru",  // Soviet Union
  "ESP": "es",  // Spain
  "SWE": "se",  // Sweden
  "CHE": "ch",  // Switzerland
  "TGO": "tg",  // Togo
  "TTO": "tt",  // Trinidad and Tobago
  "TUN": "tn",  // Tunisia
  "TUR": "tr",  // Turkey
  "UKR": "ua",  // Ukraine
  "ARE": "ae",  // United Arab Emirates
  "USA": "us",  // United States
  "URY": "uy",  // Uruguay
  "WAL": "gb-wls",  // Wales
  "YUG": "rs",  // Yugoslavia
  "COD": "cd"   // Zaire / Congo
};

// DOM Panels
export const worldcupPanel = document.getElementById("worldcupPanel");
export const wcTitle = document.getElementById("wcTitle");

export const historyPanel = document.getElementById("historyPanel");
export const histTitle = document.getElementById("histTitle");
export const histText = document.getElementById("histText");

export const matchPanel = document.getElementById("matchPanel");
const matchStage = document.getElementById("matchStage");
const matchMeta = document.getElementById("matchMeta");
const homeFlag = document.getElementById("homeFlag");
const awayFlag = document.getElementById("awayFlag");
const homeName = document.getElementById("homeName");
const awayName = document.getElementById("awayName");
const scoreText = document.getElementById("scoreText");
const matchStadium = document.getElementById("matchStadium");
const matchResult = document.getElementById("matchResult");

export const championPanel = document.getElementById("championPanel");
const champFlag = document.getElementById("champFlag");
const champName = document.getElementById("champName");

/* =====================================================
 * FLAGS
 * ===================================================== */
function setImgWithFallback(imgEl, primarySrc, fallbackSrc) {
  imgEl.style.opacity = "1";
  imgEl.onerror = () => {
    if (imgEl.dataset.triedFallback === "1") {
      imgEl.style.opacity = "0";
      return;
    }
    imgEl.dataset.triedFallback = "1";
    imgEl.src = fallbackSrc;
  };
  imgEl.dataset.triedFallback = "0";
  imgEl.src = primarySrc;
}

export function setFlagImage(imgEl, code2) {
  let c = String(code2 || "").trim();
  if (!c) { imgEl.style.opacity = "0"; return; }
  
  // Primero intentar con el mapeo de códigos de equipo (ISO3 -> ISO2)
  const upperCode = c.toUpperCase();
  if (TEAM_CODE_TO_FLAG[upperCode]) {
    c = TEAM_CODE_TO_FLAG[upperCode];
  } else {
    // Si no está en el mapeo, asumimos que ya es ISO2 y lo convertimos a minúsculas
    c = c.toLowerCase();
  }
  
  setImgWithFallback(imgEl, `assets/flags/${c}.png`, `assets/flgs/${c}.png`);
}

/* =====================================================
 * HIDE ALL
 * ===================================================== */
export function hideAllPanels() {
  worldcupPanel.classList.add("hidden");
  worldcupPanel.classList.remove("right");

  historyPanel.classList.add("hidden");
  historyPanel.classList.remove("right");

  matchPanel.classList.add("hidden");
  championPanel.classList.add("hidden");
}

/* =====================================================
 * TÍTULO
 * ===================================================== */
export function showTitleCentered(title, flagCode = null) {
  wcTitle.innerHTML = "";
  const span = document.createElement("span");
  span.textContent = title;
  wcTitle.appendChild(span);

  if (flagCode) {
    // Soportar múltiples banderas separadas por espacio (para co-anfitriones)
    const flags = flagCode.trim().split(/\s+/);
    flags.forEach(code => {
      if (code) {
        const img = document.createElement("img");
        img.className = "inlineFlag";
        img.alt = code;
        setFlagImage(img, code);
        wcTitle.appendChild(img);
      }
    });
  }

  worldcupPanel.classList.remove("hidden");
  worldcupPanel.classList.remove("right");
}

export function showTitleRight(title, flagCode = null) {
  wcTitle.innerHTML = "";
  const span = document.createElement("span");
  span.textContent = title;
  wcTitle.appendChild(span);

  if (flagCode) {
    // Soportar múltiples banderas separadas por espacio (para co-anfitriones)
    const flags = flagCode.trim().split(/\s+/);
    flags.forEach(code => {
      if (code) {
        const img = document.createElement("img");
        img.className = "inlineFlag";
        img.alt = code;
        setFlagImage(img, code);
        wcTitle.appendChild(img);
      }
    });
  }

  worldcupPanel.classList.remove("hidden");
  worldcupPanel.classList.add("right");
}

/* =====================================================
 * HISTORIA
 * ===================================================== */
export function showHistoryRightFromCup(cup, key) {
  const sec = (cup?.historySections || []).find(s => s.key === key)
           || (cup?.historySections || [])[0]
           || { title: "Historia", text: "" };

  histTitle.textContent = sec.title || "HISTORIA MUNDIALISTA";
  histText.textContent = sec.text || "";
  historyPanel.classList.remove("hidden");
  historyPanel.classList.add("right");
  
  // Mostrar mascota en el panel (en todas las secciones)
  const histMascot = document.getElementById("histMascot");
  
  if (cup.mascot) {
    histMascot.src = cup.mascot;
    histMascot.classList.remove("hidden");
  } else {
    histMascot.classList.add("hidden");
  }
}

/* =====================================================
 * MATCH CARD
 * ===================================================== */
export function showMatchCard(match) {
  if (!match) return;

  matchStage.textContent = match.phaseTitle || "PARTIDO";
  matchMeta.textContent = `${match.date || ""} • ${match.city || ""}`;

  setFlagImage(homeFlag, match.home.flag);
  setFlagImage(awayFlag, match.away.flag);

  homeName.textContent = match.home.name;
  awayName.textContent = match.away.name;

  scoreText.textContent = match.score || "";
  matchStadium.textContent = `ESTADIO: ${match.stadium || ""}`;
  matchResult.textContent = `RESULTADO: ${match.resultText || ""}`;

  matchPanel.classList.remove("hidden");
}

export function hideMatchCard() {
  matchPanel.classList.add("hidden");
}

/* =====================================================
 * CHAMPION CARD
 * ===================================================== */
export function showChampionCard(champ) {
  setFlagImage(champFlag, champ.flag);
  const champNameES = TEXT_ES.COUNTRIES[champ.name] || champ.name;
  champName.textContent = champNameES;
  championPanel.classList.remove("hidden");
}

export function hideChampionCard() {
  championPanel.classList.add("hidden");
}

/* =====================================================
 * CHAMPION POS (centrar card sobre país)
 * ===================================================== */
import { path, currentT, svgPointToScreen } from './map-core.js';

export function positionChampionOverCountry(feature) {
  if (!feature) return;

  const inner = championPanel.querySelector(".championInner");
  if (!inner) return;

  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const tp = currentT.apply([cx, cy]);
  const s = svgPointToScreen(tp[0], tp[1]);

  const pad = 18;
  const left = Math.max(pad, Math.min(window.innerWidth - pad, s.x));
  const top = Math.max(pad, Math.min(window.innerHeight - pad, s.y));

  inner.style.left = `${left}px`;
  inner.style.top = `${top}px`;
  inner.style.transform = "translate(-50%, -50%)";
}
