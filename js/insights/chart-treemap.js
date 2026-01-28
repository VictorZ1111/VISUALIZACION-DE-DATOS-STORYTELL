/* =====================================================
 * CHART-TREEMAP.JS — Gráfico de campeones (barra)
 * ===================================================== */

import { CONFIG, COUNTRY_COLORS, TEXT_ES } from '../config.js';
import { regionOfTeam } from '../data-normalize.js';
import { tipShow, tipHide, tipMove } from './insights.js';

let WORLD_CUPS = null;

export function setWorldCupsData(data) {
  WORLD_CUPS = data;
}

function computeChampionCountsFromJSON(){
  const counts = new Map();

  (WORLD_CUPS?.cups || []).forEach(c => {
    const name = c?.champion?.name;
    if (!name) return;
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([team, titles]) => ({
    team,
    titles,
    region: regionOfTeam(team)
  }));
}

export function renderChampionsBar(){
  const svgEl = d3.select("#championsSvg");
  if (svgEl.empty()) return;
  svgEl.selectAll("*").remove();

  const W = 520, H = 340;
  const margin = { top: 16, right: 14, bottom: 40, left: 44 };

  const select = document.getElementById("champRegionSelect");
  const region = select ? select.value : "ALL";

  let data = computeChampionCountsFromJSON();
  if (region !== "ALL"){
    data = data.filter(d => d.region === region);
  }

  data = data.sort((a,b)=>b.titles-a.titles).slice(0, CONFIG.INSIGHTS.TOP_CHAMPIONS);

  const x = d3.scaleBand()
    .domain(data.map(d => TEXT_ES.COUNTRIES[d.team] || d.team))
    .range([margin.left, W - margin.right])
    .padding(0.18);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d=>d.titles) || 1])
    .nice()
    .range([H - margin.bottom, margin.top]);

  const g = svgEl.append("g");

  g.append("g")
    .attr("transform", `translate(0,${H - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("transform","rotate(-25)")
    .style("text-anchor","end")
    .attr("fill","rgba(255,255,255,0.85)");

  g.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text")
    .attr("fill","rgba(255,255,255,0.85)");

  g.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("x", d => {
      const teamNameES = TEXT_ES.COUNTRIES[d.team] || d.team;
      return x(teamNameES);
    })
    .attr("y", d=>y(d.titles))
    .attr("width", x.bandwidth())
    .attr("height", d=>y(0) - y(d.titles))
    .attr("rx", 10)
    .attr("fill", d => COUNTRY_COLORS[d.team] || "rgba(255,140,0,0.5)")
    .attr("stroke", d => COUNTRY_COLORS[d.team] ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.18)")
    .attr("stroke-width", 1.5)
    .on("mousemove",(e,d)=>{
      const teamName = TEXT_ES.COUNTRIES[d.team] || d.team;
      const regionName = TEXT_ES.REGIONS[d.region] || d.region;
      tipShow(`<b>${teamName}</b><br/>Títulos: ${d.titles}<br/>Región: ${regionName}`, e.clientX, e.clientY);
      tipMove(e.clientX, e.clientY);
    })
    .on("mouseleave", tipHide);
}
