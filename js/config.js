// js/config.js
export const CONFIG = {
  MAP_VIEWBOX: { width: 1000, height: 600 },
  WORLD_FIT_PADDING: -0.35,
  WORLD_AUTO_ENTER_MS: 1000,
  AUDIO_TARGET_VOL: 0.75,
  MASCOT_SIZE: 60,
  DEFAULT_VENUE_KEY: "Default Venue",
  MARK_OPENING_MATCH: true,
  INSIGHTS: { TOP_CHAMPIONS: 20, NETWORK_TOP_TEAMS: 28 }
};

export const STYLES = {
  STROKE_COLOR_BASE: "rgba(255, 140, 0, 0.35)",
  STROKE_COLOR_ACTIVE: "rgb(255, 255, 255)",
  STROKE_WIDTH_BASE: 0.35,
  STROKE_WIDTH_ACTIVE: 0.25,
  FILL_BASE: "#1a1f2b",
  FILL_ACTIVE: "#2a2f3b"
};

export const FLAG_MAP = {
  // 1930 (CSV)
  URY: "uy", ARG: "ar", FRA: "fr", MEX: "mx", PER: "pe", ROU: "ro", YUG: "yu",
  BRA: "br", USA: "us", BEL: "be", BOL: "bo", PRY: "py", CHL: "cl",

  // variantes históricas
  URU: "uy", ROM: "ro", PAR: "py", CHI: "cl",

  // Alemania
  FRG: "de", GER: "de", GDR: "de",

  // URSS / Rusia
  URS: "ru", RUS: "ru",

  // Checoslovaquia / Chequia
  TCH: "cz", CZE: "cz", SVK: "sk",

  // Yugoslavia / Serbia
  SCG: "rs", SRB: "rs",

  // Países Bajos
  NED: "nl", HOL: "nl",

  // Corea
  KOR: "kr", PRK: "kp",

  // Costa de Marfil
  CIV: "ci",

  // Inglaterra
  ENG: "gb"
};

export const TEAM_REGION = {
  // Campeones típicos / nombres del JSON
  "Uruguay": "SOUTH_AMERICA",
  "Argentina": "SOUTH_AMERICA",
  "Brazil": "SOUTH_AMERICA",

  "Italy": "EUROPE",
  "Germany": "EUROPE",
  "England": "EUROPE",
  "France": "EUROPE",
  "Spain": "EUROPE",

  // Otros equipos europeos
  "Netherlands": "EUROPE",
  "Portugal": "EUROPE",
  "Croatia": "EUROPE",
  "Belgium": "EUROPE",
  "Sweden": "EUROPE",

  "United States": "NORTH_AMERICA",
  "Mexico": "NORTH_AMERICA",

  "Japan": "ASIA",
  "South Korea": "ASIA",
  "Korea Republic": "ASIA",

  "Morocco": "AFRICA",
  "Nigeria": "AFRICA",

  "Australia": "OCEANIA"
};

export const TEXT_ES = {
  // Textos en español para la interfaz
  INTRO_TITLE: "TRAYECTORIA DE LOS MUNDIALES",
  START_BTN: "¡ PITAZO INICIAL !",
  CHAMPION_TITLE: "¡CAMPEONES!",
  
  // Fases del mundial en español
  STAGES: {
    "group stage": "FASE DE GRUPOS",
    "second group stage": "SEGUNDA FASE DE GRUPOS",
    "round of 16": "OCTAVOS DE FINAL",
    "quarter-finals": "CUARTOS DE FINAL",
    "semi-finals": "SEMIFINALES",
    "third-place match": "TERCER PUESTO",
    "final": "FINAL",
    "final round": "RONDA FINAL",
    "play-off": "PLAY-OFF",
    "unknown": "PARTIDO",
    // Abreviaturas
    "Group": "Grupos",
    "R16": "Octavos",
    "QF": "Cuartos",
    "SF": "Semifinales",
    "3rd": "3er Puesto",
    "Final": "Final",
    "Final Round": "Ronda Final",
    "2nd Group": "2da Fase"
  },
  
  // Traducción de países
  COUNTRIES: {
    "Argentina": "Argentina",
    "Brazil": "Brasil",
    "Uruguay": "Uruguay",
    "Chile": "Chile",
    "Paraguay": "Paraguay",
    "Peru": "Perú",
    "Colombia": "Colombia",
    "Ecuador": "Ecuador",
    "Venezuela": "Venezuela",
    "Bolivia": "Bolivia",
    
    "Germany": "Alemania",
    "Italy": "Italia",
    "France": "Francia",
    "Spain": "España",
    "England": "Inglaterra",
    "Netherlands": "Países Bajos",
    "Portugal": "Portugal",
    "Belgium": "Bélgica",
    "Croatia": "Croacia",
    "Sweden": "Suecia",
    "Switzerland": "Suiza",
    "Poland": "Polonia",
    "Austria": "Austria",
    "Czech Republic": "República Checa",
    "Czechoslovakia": "Checoslovaquia",
    "Hungary": "Hungría",
    "Romania": "Rumania",
    "Bulgaria": "Bulgaria",
    "Yugoslavia": "Yugoslavia",
    "Soviet Union": "Unión Soviética",
    "Russia": "Rusia",
    "Ukraine": "Ucrania",
    "Denmark": "Dinamarca",
    "Norway": "Noruega",
    "Turkey": "Turquía",
    "Greece": "Grecia",
    "Scotland": "Escocia",
    "Wales": "Gales",
    "Northern Ireland": "Irlanda del Norte",
    "Republic of Ireland": "República de Irlanda",
    "Serbia": "Serbia",
    "Slovenia": "Eslovenia",
    
    "United States": "Estados Unidos",
    "United States of America": "Estados Unidos",
    "United Kingdom": "Reino Unido",
    "Mexico": "México",
    "Costa Rica": "Costa Rica",
    "Honduras": "Honduras",
    "Canada": "Canadá",
    "Jamaica": "Jamaica",
    "Trinidad and Tobago": "Trinidad y Tobago",
    "Cuba": "Cuba",
    "Haiti": "Haití",
    "El Salvador": "El Salvador",
    
    "Japan": "Japón",
    "South Korea": "Corea del Sur",
    "Korea Republic": "Corea del Sur",
    "China": "China",
    "Iran": "Irán",
    "Saudi Arabia": "Arabia Saudita",
    "Iraq": "Irak",
    "United Arab Emirates": "Emiratos Árabes Unidos",
    "Kuwait": "Kuwait",
    "North Korea": "Corea del Norte",
    
    "Morocco": "Marruecos",
    "Nigeria": "Nigeria",
    "South Africa": "Sudáfrica",
    "Egypt": "Egipto",
    "Algeria": "Argelia",
    "Tunisia": "Túnez",
    "Cameroon": "Camerún",
    "Senegal": "Senegal",
    "Ghana": "Ghana",
    "Ivory Coast": "Costa de Marfil",
    
    "Australia": "Australia",
    "New Zealand": "Nueva Zelanda",
    
    "Qatar": "Catar",
    
    // Variantes históricas
    "West Germany": "Alemania Occidental",
    "East Germany": "Alemania Oriental",
    "FR Yugoslavia": "Yugoslavia (FR)",
    "Serbia and Montenegro": "Serbia y Montenegro"
  },
  
  // Traducción de regiones
  REGIONS: {
    "EUROPE": "Europa",
    "SOUTH_AMERICA": "Sudamérica",
    "NORTH_AMERICA": "Norteamérica",
    "AFRICA": "África",
    "ASIA": "Asia",
    "OCEANIA": "Oceanía",
    "UNKNOWN": "Desconocido",
    "ALL": "Todos"
  }
};

export const COUNTRY_COLORS = {
  // Colores principales de banderas de países anfitriones
  "Uruguay": "#0038a8",      // Azul celeste
  "Italy": "#009246",        // Verde italiano
  "France": "#0055a4",       // Azul francés
  "Brazil": "#009c3b",       // Verde brasileño
  "Switzerland": "#FF0000",  // Rojo suizo
  "Sweden": "#006AA7",       // Azul sueco
  "Chile": "#0039A6",        // Azul chileno
  "England": "#C8102E",      // Rojo inglés
  "Mexico": "#006847",       // Verde mexicano
  "Germany": "#DD0000",      // Rojo alemán
  "Argentina": "#74ACDF",    // Celeste argentino
  "Spain": "#C60B1E",        // Rojo español
  "United States": "#B22234", // Rojo estadounidense
  "Korea Republic": "#003478", // Azul coreano
  "Japan": "#BC002D",        // Rojo japonés
  "South Africa": "#007A4D", // Verde sudafricano
  "Russia": "#0033A0",       // Azul ruso
  "Qatar": "#8D1B3D"         // Granate qatarí
};
