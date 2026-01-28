/* =====================================================
 * INSIGHTS.JS — Orquestador de gráficos insights
 * ===================================================== */

import { renderChampionsBar } from './chart-treemap.js';
import { renderSankeyReal } from './chart-sankey.js';
import { normalizeStageName } from '../data-normalize.js';

let MATCHES = null;
let WORLDCUPS = null;

export function setMatchesData(data) {
  MATCHES = data;
}

export function setWorldCupsData(data) {
  WORLDCUPS = data;
}

/* =====================================================
 * TOOLTIP GLOBAL
 * ===================================================== */
const chartTooltip = document.getElementById("chartTooltip");

export function tipShow(html, x, y){
  if (!chartTooltip) return;
  chartTooltip.innerHTML = html;
  chartTooltip.classList.remove("hidden");
  tipMove(x, y);
}

export function tipMove(x, y){
  if (!chartTooltip) return;
  const pad = 14;
  const w = chartTooltip.offsetWidth || 240;
  const h = chartTooltip.offsetHeight || 60;
  const nx = Math.min(window.innerWidth - w - pad, x + 14);
  const ny = Math.min(window.innerHeight - h - pad, y + 14);
  chartTooltip.style.left = `${nx}px`;
  chartTooltip.style.top  = `${ny}px`;
}

export function tipHide(){
  if (!chartTooltip) return;
  chartTooltip.classList.add("hidden");
}

/* =====================================================
 * BUILDER SANKEY
 * ===================================================== */
function safeLower(x) { return String(x || "").trim().toLowerCase(); }

export /* =====================================================
 * SANKEY: Goles por selección campeona
 * ===================================================== */
function buildChampionGoalsSankey(rows, worldcups, order = 'desc') {
  // Obtener todas las selecciones campeonas
  const champions = new Set();
  worldcups.cups.forEach(cup => {
    if (cup.champion && cup.champion.name) {
      champions.add(cup.champion.name);
    }
  });

  // Contar goles de cada selección campeona
  const goalsByChampion = new Map();
  
  rows.forEach(r => {
    const homeTeam = r["Home Team Name"];
    const awayTeam = r["Away Team Name"];
    const homeScore = Number(r["Home Team Score"] || 0);
    const awayScore = Number(r["Away Team Score"] || 0);
    
    // Si el equipo local es campeón
    if (champions.has(homeTeam)) {
      goalsByChampion.set(homeTeam, (goalsByChampion.get(homeTeam) || 0) + homeScore);
    }
    
    // Si el equipo visitante es campeón
    if (champions.has(awayTeam)) {
      goalsByChampion.set(awayTeam, (goalsByChampion.get(awayTeam) || 0) + awayScore);
    }
  });

  // Clasificar en rangos de goles
  const bucket = (g) => {
    if (g < 50) return "0-49 goles";
    if (g < 100) return "50-99 goles";
    if (g < 150) return "100-149 goles";
    if (g < 200) return "150-199 goles";
    return "200+ goles";
  };

  // Crear nodos y links
  const buckets = ["0-49 goles", "50-99 goles", "100-149 goles", "150-199 goles", "200+ goles"];
  const championsList = Array.from(champions).filter(c => goalsByChampion.has(c));
  
  // Ordenar por goles
  championsList.sort((a, b) => {
    const goalsA = goalsByChampion.get(a) || 0;
    const goalsB = goalsByChampion.get(b) || 0;
    return order === 'desc' ? goalsB - goalsA : goalsA - goalsB;
  });
  
  // Crear nodos con posición Y fija para forzar el orden
  const nodeHeight = 30;
  const nodeSpacing = 10;
  const nodes = [
    ...championsList.map((n, i) => ({
      name: n,
      y0: 10 + i * (nodeHeight + nodeSpacing),
      y1: 10 + i * (nodeHeight + nodeSpacing) + nodeHeight
    })),
    ...buckets.map(n => ({name: n}))
  ];
  const idx = new Map(nodes.map((n,i)=>[n.name,i]));

  // Crear links en el mismo orden que los nodos ordenados
  const links = [];
  championsList.forEach(champion => {
    const goals = goalsByChampion.get(champion) || 0;
    const b = bucket(goals);
    links.push({ 
      source: idx.get(champion), 
      target: idx.get(b), 
      value: goals,
      champion: champion,
      bucket: b 
    });
  });

  return { nodes, links };
}

function buildGoalsSankey(rows){
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { nodes: [], links: [] };
  }
  
  const stageTo = (stageRaw) => {
    if (!stageRaw) return "Other";
    const s = normalizeStageName(stageRaw);
    if (s === "group stage") return "Group";
    if (s === "second group stage") return "2nd Group";
    if (s === "round of 16") return "R16";
    if (s === "quarter-finals") return "QF";
    if (s === "semi-finals") return "SF";
    if (s === "third-place match") return "3rd";
    if (s === "final round") return "Final Round";
    if (s === "final") return "Final";
    return "Other";
  };

  const bucket = (g) => {
    if (g <= 1) return "0–1";
    if (g <= 3) return "2–3";
    if (g <= 5) return "4–5";
    return "6+";
  };

  const counts = new Map();
  rows.forEach(r => {
    const st = stageTo(r["Stage Name"]);
    const hs = Number(r["Home Team Score"] || 0);
    const as = Number(r["Away Team Score"] || 0);
    const g = hs + as;
    const b = bucket(g);
    const k = `${st}|||${b}`;
    counts.set(k, (counts.get(k) || 0) + 1);
  });

  const stages = Array.from(new Set(Array.from(counts.keys()).map(k => k.split("|||")[0])));
  const buckets = ["0–1","2–3","4–5","6+"];

  const nodes = [...stages.map(n => ({name:n})), ...buckets.map(n => ({name:n}))];
  const idx = new Map(nodes.map((n,i)=>[n.name,i]));

  const links = [];
  counts.forEach((v,k)=>{
    const [st,b] = k.split("|||");
    links.push({ source: idx.get(st), target: idx.get(b), value: v, stage: st, bucket: b });
  });

  return { nodes, links };
}

/* =====================================================
 * RENDER TODOS LOS CHARTS
 * ===================================================== */
export function renderInsightsCharts(){
  if (!MATCHES || !Array.isArray(MATCHES)) return;
  if (!WORLDCUPS) {
    console.warn('WORLDCUPS no está disponible aún');
    return;
  }

  renderChampionsBar();

  // Cambiar a goles por selección campeona
  renderSankeyWithOrder();
  
  // Nuevo gráfico de radar por década
  renderRadarByDecade();

  // hooks de controles
  const regionSel = document.getElementById("champRegionSelect");
  if (regionSel && !regionSel.dataset.bound){
    regionSel.dataset.bound = "1";
    regionSel.addEventListener("change", renderChampionsBar);
  }
  
  // Filtro de orden del Sankey
  const orderSel = document.getElementById("sankeyOrderSelect");
  if (orderSel && !orderSel.dataset.bound){
    orderSel.dataset.bound = "1";
    orderSel.addEventListener("change", renderSankeyWithOrder);
  }
  
  // Filtro de partidos mínimos de la red
  const networkSel = document.getElementById("networkFilterSelect");
  if (networkSel && !networkSel.dataset.bound){
    networkSel.dataset.bound = "1";
    networkSel.addEventListener("change", renderRadarByDecade);
  }
}

function renderSankeyWithOrder() {
  const orderSel = document.getElementById("sankeyOrderSelect");
  const order = orderSel ? orderSel.value : "desc";
  
  const sank = buildChampionGoalsSankey(MATCHES, WORLDCUPS, order);
  renderSankeyReal(sank);
}

/* =====================================================
 * NETWORK: Red de rivalidades (telaraña)
 * ===================================================== */
function renderRadarByDecade() {
  if (!MATCHES || !WORLDCUPS) return;
  
  const filterSel = document.getElementById("networkFilterSelect");
  const minMatches = filterSel ? Number(filterSel.value) : 3;
  
  const networkData = calculateNetworkData(MATCHES, minMatches);
  renderNetworkChart(networkData);
}

function calculateNetworkData(rows, minMatches = 3) {
  // Contar enfrentamientos entre equipos
  const connections = {};
  const teams = new Set();
  
  rows.forEach(r => {
    const home = r["Home Team Name"];
    const away = r["Away Team Name"];
    if (!home || !away) return;
    
    teams.add(home);
    teams.add(away);
    
    const key = [home, away].sort().join("|");
    connections[key] = (connections[key] || 0) + 1;
  });
  
  // Top equipos con más partidos
  const teamCounts = {};
  rows.forEach(r => {
    const home = r["Home Team Name"];
    const away = r["Away Team Name"];
    if (home) teamCounts[home] = (teamCounts[home] || 0) + 1;
    if (away) teamCounts[away] = (teamCounts[away] || 0) + 1;
  });
  
  const topTeams = Object.entries(teamCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(e => e[0]);
  
  // Filtrar conexiones entre top teams con al menos minMatches partidos
  const links = [];
  Object.entries(connections).forEach(([key, count]) => {
    if (count < minMatches) return;
    const [team1, team2] = key.split("|");
    if (topTeams.includes(team1) && topTeams.includes(team2)) {
      links.push({ source: team1, target: team2, count: count });
    }
  });
  
  return { teams: topTeams, links: links };
}

function renderNetworkChart(data) {
  const canvas = document.getElementById("radarCanvas");
  if (!canvas || !data || data.teams.length === 0) return;
  
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = (height / 2) + 25;
  const radius = Math.min(width, height) / 2 - 60;
  
  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);
  
  // Mapa de colores de banderas por equipo
  const teamColors = {
    "Brazil": "#009739",
    "Germany": "#000000",
    "Italy": "#009246",
    "Argentina": "#74ACDF",
    "France": "#002395",
    "Uruguay": "#0038A8",
    "Spain": "#C60B1E",
    "England": "#C8102E",
    "Netherlands": "#FF9B00",
    "Portugal": "#006600",
    "Belgium": "#FFD100",
    "Mexico": "#006847",
    "Croatia": "#FF0000",
    "Poland": "#DC143C",
    "Sweden": "#006AA7"
  };
  
  // Posicionar equipos en círculo
  const nodes = {};
  const angleStep = (Math.PI * 2) / data.teams.length;
  
  data.teams.forEach((team, i) => {
    const angle = angleStep * i;
    nodes[team] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      name: team,
      color: teamColors[team] || "#4a90e2"
    };
  });
  
  // Dibujar enlaces (telaraña) con colores de banderas
  data.links.forEach(link => {
    const source = nodes[link.source];
    const target = nodes[link.target];
    if (!source || !target) return;
    
    // Grosor según cantidad de enfrentamientos
    const thickness = Math.min(link.count * 0.5, 5);
    const opacity = Math.min(0.3 + link.count * 0.05, 0.8);
    
    // Gradiente con colores de ambas banderas
    const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
    gradient.addColorStop(0, source.color);
    gradient.addColorStop(1, target.color);
    
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  
  // Dibujar nodos
  data.teams.forEach((team, i) => {
    const node = nodes[team];
    const color = node.color;
    
    // Círculo exterior blanco
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Círculo interior de color
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Borde
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Etiqueta
    const angle = angleStep * i;
    const labelRadius = radius + 30;
    const labelX = centerX + Math.cos(angle) * labelRadius;
    const labelY = centerY + Math.sin(angle) * labelRadius;
    
    ctx.font = "bold 10px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Nombre corto (primeras 3 letras)
    const shortName = team.substring(0, 3).toUpperCase();
    ctx.fillText(shortName, labelX, labelY);
  });
  
  // Título - movido más arriba para evitar solapamiento
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Red de Rivalidades Históricas", centerX, 10);
  ctx.font = "11px Arial";
  ctx.fillStyle = "#cccccc";
  ctx.fillText("Top 15 selecciones con más enfrentamientos", centerX, 28);
}

