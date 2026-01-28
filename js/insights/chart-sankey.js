/* =====================================================
 * CHART-SANKEY.JS — Diagrama de flujo Sankey
 * ===================================================== */

import { TEXT_ES } from '../config.js';
import { tipShow, tipHide, tipMove } from './insights.js';

export function renderSankeyReal(sankeyData){
  const svgEl = d3.select("#sankeySvg");
  if (svgEl.empty()) return;
  svgEl.selectAll("*").remove();

  const W = 520, H = 340;
  const margin = { top: 12, right: 12, bottom: 12, left: 12 };

  // Si el plugin no cargó, fallback simple:
  if (!d3.sankey) {
    svgEl.append("text")
      .attr("x", W/2).attr("y", H/2)
      .attr("text-anchor","middle")
      .attr("fill","rgba(255,255,255,0.8)")
      .style("font-weight","800")
      .text("Sankey no cargó (plugin d3-sankey).");
    return;
  }

  const sankey = d3.sankey()
    .nodeWidth(14)
    .nodePadding(10)
    .extent([[margin.left, margin.top], [W - margin.right, H - margin.bottom]])
    .nodeSort(null); // Deshabilitar el ordenamiento automático

  const graph = sankey({
    nodes: sankeyData.nodes.map(d => ({...d})),
    links: sankeyData.links.map(d => ({...d}))
  });

  const g = svgEl.append("g");

  // Colores para selecciones campeonas
  const championColors = {
    "Uruguay": "#0038A8",
    "Italy": "#009246",
    "Germany": "#000000",
    "Brazil": "#009C3B",
    "England": "#CF142B",
    "Argentina": "#74ACDF",
    "France": "#0055A4",
    "Spain": "#C60B1E"
  };
  
  const bucketColors = {
    "0-49 goles": "#4a90e2",
    "50-99 goles": "#50c878",
    "100-149 goles": "#f5a623",
    "150-199 goles": "#e94b3c",
    "200+ goles": "#ff6b9d"
  };
  
  const getNodeColor = (name) => {
    return championColors[name] || bucketColors[name] || "rgba(255,140,0,0.6)";
  };

  // links
  g.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(graph.links)
    .enter().append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", d => getNodeColor(d.source.name))
    .attr("stroke-width", d => Math.max(1, d.width))
    .attr("opacity", 0.5)
    .on("mousemove",(e,d)=>{
      tipShow(`<b>${d.source.name}</b><br/>Total: ${d.value} goles`, e.clientX, e.clientY);
      tipMove(e.clientX, e.clientY);
    })
    .on("mouseleave", tipHide);

  // nodes
  const node = g.append("g")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g");

  node.append("rect")
    .attr("x", d=>d.x0)
    .attr("y", d=>d.y0)
    .attr("height", d=>d.y1 - d.y0)
    .attr("width", d=>d.x1 - d.x0)
    .attr("rx", 8)
    .attr("fill", d => getNodeColor(d.name))
    .attr("stroke", "rgba(255,255,255,0.4)")
    .attr("stroke-width", 1.5)
    .on("mousemove",(e,d)=>{
      tipShow(`<b>${d.name}</b><br/>Goles: ${Math.round(d.value)}`, e.clientX, e.clientY);
      tipMove(e.clientX, e.clientY);
    })
    .on("mouseleave", tipHide);

  node.append("text")
    .attr("x", d => d.x0 < W/2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y0 + d.y1)/2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < W/2 ? "start" : "end")
    .attr("fill","rgba(255,255,255,0.85)")
    .style("font-size","11px")
    .style("font-weight","800")
    .text(d=>d.name);
}
