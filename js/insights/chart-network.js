/* =====================================================
 * CHART-NETWORK.JS — Red de rivalidades
 * ===================================================== */

import { CONFIG, TEXT_ES } from '../config.js';
import { regionOfTeam } from '../data-normalize.js';
import { tipShow, tipHide, tipMove } from './insights.js';

function computeTeamStats(rows){
  const M = new Map();

  function ensure(team){
    if (!M.has(team)){
      M.set(team, { team, matches:0, wins:0, draws:0, losses:0, gf:0, ga:0 });
    }
    return M.get(team);
  }

  rows.forEach(r => {
    const home = String(r["Home Team Name"] || "").trim();
    const away = String(r["Away Team Name"] || "").trim();
    if (!home || !away) return;

    const hs = Number(r["Home Team Score"] || 0);
    const as = Number(r["Away Team Score"] || 0);

    const hw = Number(r["Home Team Win"] || 0);
    const aw = Number(r["Away Team Win"] || 0);
    const dr = Number(r["Draw"] || 0);

    const H = ensure(home);
    const A = ensure(away);

    H.matches += 1; A.matches += 1;
    H.gf += hs; H.ga += as;
    A.gf += as; A.ga += hs;

    if (dr === 1){
      H.draws += 1; A.draws += 1;
    } else if (hw === 1){
      H.wins += 1; A.losses += 1;
    } else if (aw === 1){
      A.wins += 1; H.losses += 1;
    }
  });

  return Array.from(M.values());
}

export function renderNetwork(rows){
  const svgEl = d3.select("#networkSvg");
  if (svgEl.empty()) return;

  svgEl.selectAll("*").remove();

  const W = 900, H = 420;

  const minSlider = document.getElementById("rivalMinInput");
  const minVal = minSlider ? Number(minSlider.value || 2) : 2;

  // Colores por región
  const regionColors = {
    "EUROPE": "#4a90e2",
    "SOUTH_AMERICA": "#50c878",
    "NORTH_AMERICA": "#f5a623",
    "AFRICA": "#e94b3c",
    "ASIA": "#bd10e0",
    "OCEANIA": "#ff6b9d",
    "UNKNOWN": "rgba(255,255,255,0.3)"
  };
  
  const getRegionColor = (team) => {
    const region = regionOfTeam(team);
    return regionColors[region] || regionColors["UNKNOWN"];
  };

  // edges por rivalidad (conteo)
  const edgeMap = new Map();
  rows.forEach(r=>{
    const a = String(r["Home Team Name"]||"").trim();
    const b = String(r["Away Team Name"]||"").trim();
    if (!a || !b) return;

    const key = [a,b].sort().join("|||");
    edgeMap.set(key, (edgeMap.get(key)||0) + 1);
  });

  // top equipos por partidos
  const stats = computeTeamStats(rows).sort((x,y)=>y.matches-x.matches).slice(0, CONFIG.INSIGHTS.NETWORK_TOP_TEAMS);
  const keep = new Set(stats.map(d=>d.team));

  const nodes = Array.from(keep).map(name=>({id:name}));
  const links = [];

  edgeMap.forEach((v,k)=>{
    if (v < minVal) return; // ✅ filtro slider
    const [a,b] = k.split("|||");
    if (!keep.has(a) || !keep.has(b)) return;
    links.push({source:a, target:b, value:v});
  });

  const gRoot = svgEl.append("g");

  svgEl.call(d3.zoom().scaleExtent([0.6, 2.5]).on("zoom", (e)=>{
    gRoot.attr("transform", e.transform);
  }));

  const link = gRoot.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", d => {
      // Color basado en la región del equipo fuente
      const sourceTeam = typeof d.source === 'string' ? d.source : d.source.id;
      return getRegionColor(sourceTeam);
    })
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", d => Math.max(1, Math.min(7, d.value/5)));

  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d=>d.id).distance(90).strength(0.14))
    .force("charge", d3.forceManyBody().strength(-230))
    .force("center", d3.forceCenter(W/2, H/2))
    .force("collision", d3.forceCollide().radius(18));

  const node = gRoot.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 8)
    .attr("fill", d => getRegionColor(d.id))
    .attr("stroke", "rgba(255,255,255,0.6)")
    .attr("stroke-width", 1.5)
    .call(d3.drag()
      .on("start",(e,d)=>{ if(!e.active) sim.alphaTarget(0.25).restart(); d.fx=d.x; d.fy=d.y; })
      .on("drag",(e,d)=>{ d.fx=e.x; d.fy=e.y; })
      .on("end",(e,d)=>{ if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; })
    )
    .on("mousemove",(e,d)=>{
      const rivals = links
        .filter(l => l.source.id===d.id || l.target.id===d.id || l.source===d.id || l.target===d.id)
        .sort((a,b)=>b.value-a.value)
        .slice(0,3)
        .map(l => {
          const s = l.source.id || l.source;
          const t = l.target.id || l.target;
          const other = (s===d.id) ? t : s;
          const otherName = TEXT_ES.COUNTRIES[other] || other;
          return `${otherName}: ${l.value}`;
        })
        .join("<br>");

      const teamName = TEXT_ES.COUNTRIES[d.id] || d.id;
      const region = regionOfTeam(d.id);
      const regionName = TEXT_ES.REGIONS[region] || region;
      tipShow(`<b>${teamName}</b><br/>Región: ${regionName}<br/>${rivals || "—"}`, e.clientX, e.clientY);
      tipMove(e.clientX, e.clientY);
    })
    .on("mouseleave", tipHide);

  const label = gRoot.append("g")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .text(d => TEXT_ES.COUNTRIES[d.id] || d.id)
    .attr("fill","rgba(255,255,255,0.80)")
    .style("font-size","11px")
    .style("font-weight","700");

  sim.on("tick", ()=>{
    link
      .attr("x1", d=> (d.source.x ?? d.source.id ? d.source.x : 0))
      .attr("y1", d=> (d.source.y ?? d.source.id ? d.source.y : 0))
      .attr("x2", d=> (d.target.x ?? d.target.id ? d.target.x : 0))
      .attr("y2", d=> (d.target.y ?? d.target.id ? d.target.y : 0));

    node.attr("cx", d=>d.x).attr("cy", d=>d.y);

    label.attr("x", d=>d.x + 12).attr("y", d=>d.y + 4);
  });
}
