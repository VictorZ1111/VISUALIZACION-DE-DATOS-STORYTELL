/* =====================================================
 * STORY-BUILDER.JS — Genera los steps desde JSON + insights
 * ===================================================== */

export function buildStepsFromJSON(json) {
  const story = document.getElementById("story");
  
  if (!story) {
    console.error("❌ ERROR: No se encontró el elemento #story en el DOM");
    return;
  }

  json.cups.forEach((cup) => {
    // WORLD
    const sWorld = document.createElement("section");
    sWorld.className = "step";
    sWorld.dataset.type = "world";
    story.appendChild(sWorld);

    // WORLDCUP (centrado)
    const sWC = document.createElement("section");
    sWC.className = "step";
    sWC.dataset.type = "worldcup";
    sWC.dataset.year = cup.year;
    sWC.dataset.country = cup.host;
    sWC.dataset.flag = cup.hostFlag || "";
    sWC.dataset.audio = cup.audio || "";
    story.appendChild(sWC);

    // SPLIT (país izq + panels der)
    const sSplit = document.createElement("section");
    sSplit.className = "step";
    sSplit.dataset.type = "split";
    sSplit.dataset.year = cup.year;
    sSplit.dataset.country = cup.host;
    sSplit.dataset.flag = cup.hostFlag || "";
    sSplit.dataset.audio = cup.audio || "";
    story.appendChild(sSplit);

    // MATCHES
    (cup._matches || []).forEach((m, idx) => {
      const sMatch = document.createElement("section");
      sMatch.className = "step";
      sMatch.dataset.type = "match";
      sMatch.dataset.year = cup.year;
      sMatch.dataset.country = cup.host;
      sMatch.dataset.matchIndex = idx;
      story.appendChild(sMatch);
    });

    // CHAMPION
    const sChamp = document.createElement("section");
    sChamp.className = "step";
    sChamp.dataset.type = "champion";
    sChamp.dataset.year = cup.year;
    sChamp.dataset.country = cup.host;
    story.appendChild(sChamp);

    // FACTS
    const sFacts = document.createElement("section");
    sFacts.className = "step";
    sFacts.dataset.type = "facts";
    sFacts.dataset.year = cup.year;
    sFacts.dataset.country = cup.host;
    story.appendChild(sFacts);
  });
}

/* =====================================================
 * INSIGHTS STEP
 * ===================================================== */
export let insightsStepEl = null;

function injectInsightsControlStyles(){
  if (document.getElementById("insightsControlsStyle")) return;
  const style = document.createElement("style");
  style.id = "insightsControlsStyle";
  style.textContent = `
    /* Steps de insights con espacio */
    .step.insights-intro,
    .step.insights-chart,
    .step.insights-conclusion {
      min-height: 150vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .insightsWrap {
      max-width: 1400px;
      margin: 0 auto;
      padding: 150px 40px 200px 40px;
      color: #fff;
      min-height: 100vh;
    }
    
    /* Introducción */
    .insightsIntro {
      text-align: center;
      margin-bottom: 80px;
      padding: 40px;
      background: rgba(255,255,255,0.03);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .insightsIntro h2 {
      font-size: 42px;
      margin: 0 0 16px 0;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .insightsSubtitle {
      font-size: 18px;
      color: rgba(255,255,255,0.7);
      margin: 0 0 30px 0;
    }
    .insightsDescription {
      text-align: left;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.8;
    }
    .insightsDescription p {
      margin: 16px 0;
      font-size: 16px;
    }
    .insightsDescription ul {
      margin: 20px 0;
      padding-left: 30px;
    }
    .insightsDescription li {
      margin: 12px 0;
      font-size: 15px;
      line-height: 1.6;
    }
    
    /* Cards individuales */
    .insightCard.solo {
      margin-bottom: 200px;
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      padding: 40px;
    }
    .insightCard.solo.wide {
      max-width: 100%;
    }
    
    .insightHeader {
      margin-bottom: 30px;
      border-bottom: 2px solid rgba(255,140,0,0.3);
      padding-bottom: 20px;
    }
    .insightTitle {
      font-size: 28px;
      margin: 0 0 8px 0;
      color: #fff;
    }
    .insightContext {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      margin: 0;
      font-style: italic;
    }
    
    .insightContent {
      display: flex;
      gap: 80px;
      align-items: flex-start;
    }
    .insightLeft {
      flex: 1.2;
      min-width: 0;
    }
    .insightRight {
      flex: 0.8;
      background: rgba(255,255,255,0.04);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .insightRight h4 {
      font-size: 16px;
      margin: 0 0 12px 0;
      color: rgba(255,140,0,0.9);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .insightRight p {
      font-size: 14px;
      line-height: 1.7;
      margin: 0 0 20px 0;
      color: rgba(255,255,255,0.85);
    }
    .insightRight ul {
      margin: 0 0 20px 0;
      padding-left: 20px;
    }
    .insightRight li {
      font-size: 13px;
      line-height: 1.6;
      margin: 8px 0;
      color: rgba(255,255,255,0.75);
    }
    
    /* Controles */
    .insightControls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .insightControls label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
    }
    .insightControls select,
    .insightControls input {
      pointer-events: auto;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.16);
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      outline: none;
      font-size: 13px;
    }
    .insightControls select:hover,
    .insightControls input:hover {
      background: rgba(255,255,255,0.12);
    }
    .insightControls option {
      color: #000;
    }
    
    /* Gráficos */
    .chartBox {
      background: rgba(255,255,255,0.02);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    
    /* Conclusión */
    .insightsConclusion {
      margin-top: 60px;
      padding: 40px;
      background: rgba(255,140,0,0.08);
      border-radius: 16px;
      border: 1px solid rgba(255,140,0,0.2);
      text-align: center;
    }
    .insightsConclusion h3 {
      font-size: 24px;
      margin: 0 0 20px 0;
      color: #fff;
    }
    .insightsConclusion p {
      font-size: 16px;
      line-height: 1.8;
      color: rgba(255,255,255,0.85);
      max-width: 900px;
      margin: 16px auto;
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .insightContent {
        flex-direction: column;
      }
      .insightLeft, .insightRight {
        flex: 1;
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

export function addInsightsStep(){
  const story = document.getElementById("story");
  if (!story) {
    console.error("❌ ERROR: No se encontró el elemento #story para insights");
    return;
  }
  if (insightsStepEl) return;

  injectInsightsControlStyles();

  // Agregar step "world" antes de insights para regresar al mapa
  const worldBeforeInsights = document.createElement("section");
  worldBeforeInsights.className = "step";
  worldBeforeInsights.dataset.type = "world";
  story.appendChild(worldBeforeInsights);

  // Step 1: Introducción
  const introStep = document.createElement("section");
  introStep.className = "step insights-intro";
  introStep.dataset.type = "insights-intro";
  introStep.innerHTML = `
    <div class="insightsWrap">
      <div class="insightsIntro">
        <h2>ANÁLISIS GLOBAL DE LOS MUNDIALES (1930–2022)</h2>
        <p class="insightsSubtitle">Explorando patrones, tendencias y datos históricos del torneo más importante del fútbol</p>
        <div class="insightsDescription">
          <p>A través de <strong>93 años de historia</strong>, los Mundiales de la FIFA han generado datos fascinantes sobre equipos campeones, goles anotados y rivalidades épicas.</p>
          <p>Los siguientes gráficos interactivos revelan <strong>3 perspectivas clave</strong> del análisis de datos:</p>
          <ul>
            <li><strong>Dominio regional:</strong> ¿Qué continentes han dominado el fútbol mundial?</li>
            <li><strong>Patrones de goles:</strong> ¿Cuáles son las selecciones campeonas que han anotado más goles?</li>
            <li><strong>Rivalidades históricas:</strong> ¿Qué equipos se han enfrentado más veces?</li>
          </ul>
        </div>
      </div>
    </div>
  `;
  story.appendChild(introStep);

  // Step 2: Campeones
  const champStep = document.createElement("section");
  champStep.className = "step insights-chart";
  champStep.dataset.type = "insights-chart1";
  champStep.innerHTML = `
    <div class="insightsWrap">
      <div class="insightCard solo">
        <div class="insightHeader">
          <h3 class="insightTitle">1. Campeones Mundiales — Distribución de títulos por país</h3>
          <p class="insightContext">Visualización: <strong>Gráfico de barras interactivo con filtro por región</strong></p>
        </div>
        <div class="insightContent">
          <div class="insightLeft">
            <div class="insightControls">
              <label>
                Filtrar por región:
                <select id="champRegionSelect">
                  <option value="ALL">Todos</option>
                  <option value="EUROPE">Europa</option>
                  <option value="SOUTH_AMERICA">Sudamérica</option>
                  <option value="NORTH_AMERICA">Norteamérica</option>
                  <option value="AFRICA">África</option>
                  <option value="ASIA">Asia</option>
                  <option value="OCEANIA">Oceanía</option>
                  <option value="UNKNOWN">Desconocido</option>
                </select>
              </label>
            </div>
            <div class="chartBox">
              <svg id="championsSvg" viewBox="0 0 520 340"></svg>
            </div>
          </div>
          <div class="insightRight">
            <h4>Descripción</h4>
            <p>Muestra la <strong>distribución de títulos mundiales</strong> por selección y región desde 1930.</p>
            
            <h4>Cómo leerlo</h4>
            <ul>
              <li><strong>Tamaño del rectángulo:</strong> Proporción de títulos ganados</li>
              <li><strong>Color:</strong> Identifica cada región del mundo</li>
              <li><strong>Etiqueta:</strong> País y número de títulos</li>
            </ul>
            
            <h4>Uso del filtro</h4>
            <p>Selecciona una región para comparar el desempeño entre continentes:</p>
            <ul>
              <li><strong>Todos:</strong> Vista global de todos los campeones históricos</li>
              <li><strong>Europa/Sudamérica:</strong> Regiones dominantes con más títulos</li>
              <li><strong>Otras regiones:</strong> Analiza el desempeño de otras confederaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  story.appendChild(champStep);

  // Step 3: Sankey
  const sankeyStep = document.createElement("section");
  sankeyStep.className = "step insights-chart";
  sankeyStep.dataset.type = "insights-chart2";
  sankeyStep.innerHTML = `
    <div class="insightsWrap">
      <div class="insightCard solo">
        <div class="insightHeader">
          <h3 class="insightTitle">2. Goles Totales por Selección Campeona</h3>
          <p class="insightContext">Visualización: <strong>Diagrama Sankey de goles históricos</strong></p>
        </div>
        <div class="insightControls">
          <label>Ordenar selecciones campeonas por:
            <select id="sankeyOrderSelect">
              <option value="desc">Mayor a Menor (más goles primero)</option>
              <option value="asc">Menor a Mayor (menos goles primero)</option>
            </select>
          </label>
        </div>
        <div class="insightContent">
          <div class="insightLeft">
            <div class="chartBox">
              <svg id="sankeySvg" viewBox="0 0 520 340"></svg>
            </div>
          </div>
          <div class="insightRight">
            <h4>Descripción</h4>
            <p>Visualiza el <strong>total de goles</strong> anotados por cada selección campeona según rangos.</p>
            
            <h4>Cómo leerlo</h4>
            <ul>
              <li><strong>Izquierda:</strong> Selecciones campeonas ordenadas por goles</li>
              <li><strong>Derecha:</strong> Rangos de goles (0-49, 50-99, 100-149, 150-199, 200+)</li>
              <li><strong>Grosor de flujo:</strong> Representa la cantidad de goles</li>
            </ul>
            
            <h4>Uso del filtro</h4>
            <p>El filtro ordena las selecciones para facilitar comparaciones:</p>
            <ul>
              <li><strong>Mayor a Menor:</strong> Brasil y potencias goleadoras arriba</li>
              <li><strong>Menor a Mayor:</strong> Ver las selecciones con menos goles históricos</li>
              <li><strong>Flujos de colores:</strong> Cada campeón tiene un color distintivo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  story.appendChild(sankeyStep);

  // Step 4: Radar por década
  const radarStep = document.createElement("section");
  radarStep.className = "step insights-chart";
  radarStep.dataset.type = "insights-chart3";
  radarStep.innerHTML = `
    <div class="insightsWrap">
      <div class="insightCard solo">
        <div class="insightHeader">
          <h3 class="insightTitle">3. Red de Rivalidades (Network Graph)</h3>
          <p class="insightContext">Visualización: <strong>Gráfico de red tipo telaraña</strong></p>
        </div>
        <div class="insightControls">
          <label>Filtrar rivalidades — Mostrar solo enfrentamientos con:
            <select id="networkFilterSelect">
              <option value="2">2 o más partidos (muestra más conexiones)</option>
              <option value="3" selected>3 o más partidos (rivalidades consolidadas)</option>
              <option value="4">4 o más partidos (rivalidades frecuentes)</option>
              <option value="5">5 o más partidos (clásicos históricos)</option>
            </select>
          </label>
        </div>
        <div class="insightContent">
          <div class="insightLeft">
            <div class="chartBox" style="padding-top: 60px;">
              <canvas id="radarCanvas" width="520" height="520"></canvas>
            </div>
          </div>
          <div class="insightRight">
            <h4>Descripción</h4>
            <p>Muestra las <strong>conexiones históricas</strong> entre las 15 selecciones con más partidos disputados.</p>
            
            <h4>Cómo leerlo</h4>
            <ul>
              <li><strong>Círculos de colores:</strong> Cada selección nacional</li>
              <li><strong>Líneas con gradiente:</strong> Enfrentamientos directos (colores de ambas banderas)</li>
              <li><strong>Grosor de línea:</strong> Más gruesa = más partidos jugados</li>
              <li><strong>Opacidad:</strong> Mayor = rivalidad más frecuente</li>
            </ul>
            
            <h4>Uso del filtro</h4>
            <p>El filtro superior controla <strong>cuántos enfrentamientos mínimos</strong> debe tener una rivalidad para mostrarse:</p>
            <ul>
              <li><strong>2+ partidos:</strong> Incluye casi todas las rivalidades (red más densa)</li>
              <li><strong>3+ partidos:</strong> Solo rivalidades consolidadas (balanceado) ✓</li>
              <li><strong>4+ partidos:</strong> Rivalidades frecuentes (red más clara)</li>
              <li><strong>5+ partidos:</strong> Solo los clásicos históricos del fútbol</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  story.appendChild(radarStep);

  // Step 5: Conclusión
  const conclusionStep = document.createElement("section");
  conclusionStep.className = "step insights-conclusion";
  conclusionStep.dataset.type = "insights-conclusion";
  conclusionStep.innerHTML = `
    <div class="insightsWrap">
      <div class="insightsConclusion">
        <img src="assets/icons/COPA1.png" class="conclusionTrophy" alt="Copa" />
        <h3>Conclusiones del Análisis</h3>
        <p>A través de este recorrido por <strong>93 años de historia mundialista</strong>, hemos explorado:</p>
        <ul>
          <li><strong>Dominio regional</strong> de Europa y Sudamérica en el fútbol mundial</li>
          <li><strong>Patrones de goles</strong> que muestran la evolución táctica del torneo</li>
          <li><strong>Rivalidades históricas</strong> que han definido los clásicos del fútbol</li>
        </ul>
        
        <p>Los datos revelan que <strong>solo 8 naciones</strong> han alzado la Copa del Mundo, con Brasil liderando históricamente tanto en títulos como en goles totales. Las conexiones entre selecciones muestran cómo las potencias tradicionales se han enfrentado repetidamente en las fases decisivas.</p>
        
        <div class="conclusionDivider"></div>
        
        <h4>¡Gracias por explorar la historia de los Mundiales!</h4>
        <p>Esperamos que este viaje interactivo te haya permitido descubrir nuevos datos y perspectivas sobre el torneo más importante del fútbol.</p>
        <button id="backToStartBtn" class="cta">↺ Volver al Inicio</button>
      </div>
    </div>
  `;
  story.appendChild(conclusionStep);

  // Event listener para botón de volver al inicio
  setTimeout(() => {
    const backBtn = document.getElementById("backToStartBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, 100);

  insightsStepEl = introStep; // Guardar referencia
}
