/* =====================================================
 * LOADERS.JS — Carga de datos (GeoJSON, JSON, CSV)
 * ===================================================== */

export async function loadGeoJSON() {
  const candidates = [
    "geo/MEDIAR-MAPA.json",
    "geo/BAJAR-MAPA.json",
    "data/geo/MEDIAR-MAPA.json",
    "data/geo/BAJAR-MAPA.json"
  ];

  const tryNext = async (i) => {
    if (i >= candidates.length) throw new Error("No se encontró el GeoJSON del mapa.");
    try {
      return await d3.json(candidates[i]);
    } catch {
      return tryNext(i + 1);
    }
  };

  return tryNext(0);
}

export async function loadWorldcupsJSON() {
  const candidates = ["data/worldcups.json", "worldcups.json"];
  const tryNext = async (i) => {
    if (i >= candidates.length) throw new Error("No se encontró data/worldcups.json");
    try {
      return await d3.json(candidates[i]);
    } catch {
      return tryNext(i + 1);
    }
  };
  return tryNext(0);
}

export async function loadMatchesCSV() {
  const candidates = ["data/worldcup_matches_1930_2022.csv", "worldcup_matches_1930_2022.csv"];
  const tryNext = async (i) => {
    if (i >= candidates.length) throw new Error("No se encontró el CSV de partidos");
    try {
      return await d3.csv(candidates[i]);
    } catch {
      return tryNext(i + 1);
    }
  };
  return tryNext(0);
}
