# 🏆 Trayectoria de los Mundiales de Fútbol

## Resumen Ejecutivo

**Trayectoria de los Mundiales** es una experiencia de storytelling interactivo que narra visualmente 93 años de historia de las Copas del Mundo FIFA (1930-2022). A través de scroll narrativo, mapas interactivos y visualizaciones de datos, el proyecto transporta al usuario por cada una de las 24 ediciones del torneo más importante del fútbol mundial.

El proyecto combina cartografía geoespacial con D3.js, bases de datos históricas de partidos, y elementos visuales (banderas, mascotas, iconos) para crear una experiencia inmersiva que permite explorar desde el primer mundial en Uruguay 1930 hasta Qatar 2022.

---

## Narrativa del Storytelling

### Historia que se Cuenta

El proyecto narra cronológicamente la historia de cada Copa del Mundo a través de cinco dimensiones:

1. **Contexto Geográfico** - Ubicación del país anfitrión en el mapa mundial con zoom cinematográfico
2. **Historia del Torneo** - Narrativa de lo que sucedió: formato del torneo, equipos participantes, sistema de eliminatorias
3. **Desarrollo Competitivo** - Recorrido partido por partido mostrando:
   - Fase del torneo (Grupos, Octavos, Cuartos, Semifinales, Final)
   - Equipos enfrentados con sus banderas nacionales
   - Resultados y marcadores
   - Estadio y ciudad donde se jugó
4. **Coronación** - Celebración del equipo campeón con su bandera y trofeo
5. **Datos Curiosos** - Hechos históricos memorables de cada edición (récords, anécdotas, primeras veces)

### Arco Narrativo

**Inicio** → El usuario es recibido con una pantalla de bienvenida decorada con trofeos de la Copa del Mundo

**Desarrollo** → Para cada uno de los 24 mundiales (Uruguay 1930 → Qatar 2022):
- Vista panorámica mundial con el título del próximo mundial
- Acercamiento al país anfitrión con resaltado visual
- Presentación histórica con texto narrativo y mascota oficial
- Secuencia de todos los partidos del torneo con mascota animada moviéndose por el país
- Revelación del campeón con animación de celebración
- Datos históricos curiosos de esa edición

**Cierre** → Análisis comparativo global con tres visualizaciones interactivas:
1. **Campeones por Región** - Distribución geográfica de los títulos mundialistas
2. **Goles de Campeones** - Flujo de anotaciones por naciones campeonas
3. **Red de Rivalidades** - Conexiones históricas entre las selecciones más enfrentadas

**Conclusión** - Reflexión sobre 93 años de historia con resumen de hallazgos clave

---

## Características del Proyecto

### Experiencia de Usuario

**Navegación Intuitiva**
- Scroll vertical fluido como método principal de navegación
- Atajos de teclado (flechas, espacio, Page Up/Down) para control preciso
- Navegación circular: al terminar, regresa al inicio automáticamente

**Elementos Visuales Dinámicos**
- Mapa mundial interactivo con zoom geoespacial suave
- Paneles flotantes con fondo translúcido y efecto blur
- Mascotas oficiales de cada mundial (44 animadas en total) que se mueven por el país anfitrión
- Líneas apuntadoras que conectan la mascota con la tarjeta del partido actual
- Banderas de 92 naciones participantes en formato PNG
- Iconos de trofeos específicos de cada edición

**Transiciones Cinematográficas**
- Zoom out mundial → zoom in al país anfitrión
- Fade in/out de paneles informativos
- Animación de trofeo flotante en celebraciones
- Transiciones suaves de 0.3-0.8 segundos entre estados

### Datos y Fuentes

**Base de Datos de Partidos** (`worldcup_matches_1930_2022.csv`)
- Dataset completo con todos los partidos de la historia (1930-2022)
- Información detallada: equipos, marcadores, fases, estadios, resultados
- Total aproximado: +800 partidos históricos

**Información de Mundiales** (`worldcups.json`)
- 24 objetos JSON (uno por mundial)
- Incluye: año, país anfitrión, campeón, mascota, narrativas históricas
- Coordenadas geográficas de estadios y sedes

**Cartografía** (`geo/MEDIAR-MAPA.json`)
- Mapa mundial en formato GeoJSON
- Geometrías de 195+ países
- Optimizado para proyección Mercator con D3.js

**Recursos Visuales** (`assets/`)
- 92 banderas en formato PNG (códigos ISO2: ar.png, br.png, de.png...)
- 44 mascotas oficiales de mundiales
- 24 iconos de trofeos por edición
- Audio ambiental opcional

---

## Arquitectura Técnica

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Visualización de Datos** | D3.js v7 | Mapas geoespaciales, gráficos (treemap, sankey, network) |
| **Diagramas de Flujo** | d3-sankey | Gráfico Sankey de goles por campeón |
| **JavaScript** | ES6 Modules | Arquitectura modular sin frameworks |
| **Scroll Detection** | IntersectionObserver API | Detección de sección visible para activar estados |
| **Layout** | CSS Grid/Flexbox | Diseño responsivo de paneles |
| **Efectos Visuales** | CSS Backdrop Filter | Blur y transparencias en paneles |

### Estructura Modular (14 Módulos)

```
js/
├─ main.js              → Orquestador principal, carga datos, inicializa app
├─ config.js            → Constantes, colores, mapeo de banderas, configuración
├─ loaders.js           → Carga asíncrona de GeoJSON, JSON, CSV
├─ data-normalize.js    → Normalización de fases del CSV, códigos de banderas
├─ map-core.js          → Motor del mapa SVG, proyección, zoom, resaltado de países
├─ map-overlay.js       → Mascota animada sobre el mapa, línea apuntadora
├─ ui-panels.js         → Sistema de paneles (título, historia, partidos, campeón)
├─ story-builder.js     → Constructor dinámico de secciones HTML por cada mundial
├─ story-scroll.js      → IntersectionObserver, estados del flujo, navegación por teclado
├─ audio.js             → Sistema de audio con fade in/out
└─ insights/
   ├─ insights.js       → Orquestador de gráficos, tooltip global
   ├─ chart-treemap.js  → Gráfico de barras de campeones con filtro por región
   ├─ chart-sankey.js   → Diagrama de flujo de goles por campeón con ordenamiento
   └─ chart-network.js  → Red de rivalidades tipo telaraña con filtro de encuentros
```

### Flujo de Ejecución

1. **Carga** → `main.js` carga en paralelo GeoJSON, JSON de mundiales, CSV de partidos
2. **Normalización** → Estandariza fases del torneo, códigos de banderas, estructura de datos
3. **Construcción** → `story-builder.js` genera dinámicamente HTML para cada mundial
4. **Inicialización** → Configura mapa D3.js, proyección Mercator, grupos SVG
5. **Observación** → IntersectionObserver detecta scroll y activa estados
6. **Interacción** → Usuario navega, el sistema actualiza mapa y paneles según la sección visible
7. **Visualización Final** → Al llegar al final, carga gráficos D3 con datos agregados

---

## Visualizaciones de Análisis

Al finalizar el recorrido histórico, se presentan tres visualizaciones interactivas para análisis comparativo:

### 1. Treemap - Distribución de Títulos por Región

**Objetivo:** Mostrar qué regiones del mundo han dominado el fútbol mundial

**Diseño Visual:**
- Rectángulos proporcionales al número de títulos ganados por campeón
- Colores categóricos por región (Europa: azul, Sudamérica: verde, etc.)
- Banderas de países dentro de cada rectángulo
- Tooltip con información detallada al hacer hover

**Interacción:**
- Filtro dropdown para seleccionar región específica (Todas, Europa, Sudamérica, etc.)
- Al filtrar, solo muestra campeones de esa región

**Insight:** Europa (12 títulos) y Sudamérica (10 títulos) concentran el 100% de las copas mundiales

### 2. Sankey - Flujo de Goles por Campeón

**Objetivo:** Visualizar cuántos goles han anotado históricamente las 8 naciones campeonas

**Diseño Visual:**
- Diagrama de flujo de izquierda a derecha
- Nodos izquierda: Brasil, Alemania, Italia, Argentina, Francia, Uruguay, Inglaterra, España
- Nodos derecha: Rangos de goles (0-50, 50-100, 100-150, 150+)
- Líneas de conexión con grosor proporcional a la cantidad
- Colores distintivos por nación

**Interacción:**
- Filtro para ordenar campeones por cantidad de goles (Mayor a Menor / Menor a Mayor)
- Tooltip muestra exactamente cuántos goles anotó cada selección

**Insight:** Brasil lidera con 229 goles totales, seguido por Alemania con 226

### 3. Network - Red de Rivalidades Históricas

**Objetivo:** Identificar qué selecciones se han enfrentado más veces en mundiales

**Diseño Visual:**
- Grafo tipo telaraña con 15 nodos (selecciones más enfrentadas)
- Nodos: Círculos con colores de banderas nacionales
- Enlaces: Líneas con gradiente que mezcla colores de ambos equipos
- Grosor de línea proporcional a cantidad de enfrentamientos
- Disposición circular para equilibrio visual

**Interacción:**
- Filtro para mostrar rivalidades según intensidad (2+, 3+, 4+, 5+ partidos)
- Tooltip muestra número exacto de enfrentamientos al hacer hover

**Insight:** Las rivalidades más intensas son Brasil-Argentina, Alemania-Italia, Brasil-Alemania

---

## Configuración y Personalización

### Parámetros Ajustables (`js/config.js`)

```javascript
export const CONFIG = {
  MASCOT_SIZE: 60,              // Tamaño de mascota sobre el mapa (px)
  AUDIO_TARGET_VOL: 0.75,       // Volumen de audio de fondo (0.0 - 1.0)
  WORLD_AUTO_ENTER_MS: 2800,    // Delay antes de zoom al país (ms)
  WORLD_FIT_PADDING: -0.35,     // Padding del zoom mundial (-1.0 a 0.0)
};

export const STYLES = {
  FILL_BASE: "#1a1f2b",                      // Color de países inactivos
  FILL_ACTIVE: "#2a2f3b",                    // Color del país resaltado
  STROKE_COLOR_BASE: "rgba(255,140,0,0.35)", // Color borde países normales
  STROKE_COLOR_ACTIVE: "rgb(255,255,255)",   // Color borde país activo
};
```

### Estilos Visuales (`style.css`)

**Mascota en Panel de Historia**
```css
.histMascot {
  width: 140px;  /* Tamaño de mascota en panel derecho */
  opacity: 0.8;  /* Transparencia */
}
```

**Paneles Flotantes**
```css
.panel {
  background: rgba(10,14,22,0.60);  /* Fondo semi-transparente */
  backdrop-filter: blur(10px);      /* Efecto de desenfoque */
  border: 1px solid rgba(255,255,255,0.10);  /* Borde sutil */
}
```

---

## Guía de Uso

### Requisitos Previos

⚠️ **IMPORTANTE:** El proyecto usa ES6 Modules que requieren protocolo HTTP. No funciona abriendo `index.html` directamente.

### Instalación y Ejecución

**Opción 1: Live Server en VS Code (Recomendado)**
```
1. Abrir proyecto en VS Code
2. Instalar extensión "Live Server"
3. Click derecho en index.html → "Open with Live Server"
4. Se abre automáticamente en http://127.0.0.1:5500
```

**Opción 2: Servidor Python**
```bash
cd STORYTELL-VISUALIZACION
python -m http.server 8000
# Abrir navegador en: http://localhost:8000
```

**Opción 3: Servidor Node.js**
```bash
npx http-server -p 8000
# Abrir navegador en: http://localhost:8000
```

### Controles de Navegación

| Acción | Control |
|--------|---------|
| Avanzar al siguiente mundial | **Scroll Down** / **Flecha ↓** / **Espacio** |
| Retroceder al anterior | **Scroll Up** / **Flecha ↑** |
| Saltar sección | **Page Down** / **Page Up** |
| Volver al inicio | Botón en conclusión final |

### Datos Requeridos

**Archivos Mínimos para Funcionamiento:**
- `geo/MEDIAR-MAPA.json` - Mapa mundial
- `data/worldcups.json` - Información de 24 mundiales
- `data/worldcup_matches_1930_2022.csv` - Base de partidos

**Archivos Opcionales (Mejoran Experiencia Visual):**
- `assets/flags/*.png` - Banderas de naciones
- `assets/mascots/*.png` - Mascotas oficiales
- `assets/icons/*.png` - Iconos de trofeos
- `assets/audio/*.mp3` - Música ambiental

---

## Resolución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Pantalla en blanco | No se usa servidor local | Ejecutar con Live Server o Python server |
| `Cannot find module` | Ruta de import incorrecta | Verificar rutas relativas en archivos .js |
| `d3 is not defined` | D3.js no cargó | Verificar `<script src="d3.js">` en index.html |
| Mapa no aparece | GeoJSON no cargó | Verificar existencia de `geo/MEDIAR-MAPA.json` |
| Banderas no se ven | Faltan archivos PNG | Verificar carpeta `assets/flags/` |

**Consola de Desarrollo (F12):**
- ✅ `Datos cargados: {geo, cups, matches}` → Carga exitosa
- ✅ `Aplicación inicializada correctamente` → Todo funcionando

---

## Alcance del Proyecto

### Lo que Incluye

✅ Historia completa de 24 Copas del Mundo (1930-2022)  
✅ Base de datos con +800 partidos históricos  
✅ Visualización geoespacial interactiva  
✅ 44 mascotas oficiales animadas  
✅ 92 banderas de naciones participantes  
✅ 3 gráficos de análisis con filtros interactivos  
✅ Narrativa histórica detallada por edición  
✅ Sistema de navegación por scroll y teclado  

### Limitaciones Conocidas

⚠️ No incluye estadísticas individuales de jugadores  
⚠️ Navegación optimizada para desktop (responsive parcial en móvil)  
⚠️ Requiere conexión a internet para cargar D3.js desde CDN  
⚠️ Audio ambiental es opcional y debe agregarse manualmente  

---

## Créditos y Fuentes

**Datos:**
- Kaggle: "FIFA World Cup Matches 1930-2022" dataset
- FIFA.com: Información oficial de torneos

**Visualización:**
- D3.js por Mike Bostock
- d3-sankey por d3 contributors

**Diseño:**
- Banderas: Flaticon / Country Flags
- Mascotas: Imágenes oficiales FIFA

---

**Proyecto educativo de visualización de datos deportivos**  
**93 años de pasión futbolística en una experiencia interactiva** ⚽🏆

```
INTRO → WORLD → WORLDCUP → SPLIT → MATCH × N → CHAMPION → FACTS → (repite) → INSIGHTS
```

| Estado | Descripción |
|--------|-------------|
| **INTRO** | Pantalla inicial con botón |
| **WORLD** | Vista mundial completa |
| **WORLDCUP** | Zoom al país anfitrión |
| **SPLIT** | País + paneles de historia |
| **MATCH** | Tarjetas de partidos con mascota |
| **CHAMPION** | Celebración del campeón |
| **FACTS** | Datos históricos curiosos |
| **INSIGHTS** | 3 gráficos de análisis final |

**Navegación:** Scroll, flechas ↑↓, Espacio, PgUp/PgDn

## 🔧 Configuración Rápida

Edita `js/config.js`:

```javascript
export const CONFIG = {
  MASCOT_SIZE: 60,              // Tamaño mascota (px)
  AUDIO_TARGET_VOL: 0.75,       // Volumen (0-1)
  WORLD_AUTO_ENTER_MS: 2800,    // Delay auto-zoom (ms)
};

export const STYLES = {
  FILL_BASE: "#1a1f2b",         // Color países
  FILL_ACTIVE: "#2a2f3b",       // Color país activo
  STROKE_COLOR_ACTIVE: "rgb(255, 255, 255)",  // Borde activo
};
```

## 📊 Datos Necesarios

**Mínimo:**
- `geo/MEDIAR-MAPA.json` (mapa mundial)
- `data/worldcups.json` (info de mundiales)
- `data/worldcup_matches_1930_2022.csv` (partidos)

**Opcional (mejora visual):**
- `assets/flags/*.png` (banderas ISO2: ar.png, br.png...)
- `assets/mascots/*.png` (mascotas)
- `assets/icons/*.png` (trofeos)

## 📈 Gráficos de Insights

1. **Treemap**: Campeones por región con filtro
2. **Sankey**: Flujo de goles de campeones por rango
3. **Network**: Red de rivalidades históricas (top 15 equipos)



**Abre la consola (F12)** para ver logs:
- ✅ `Datos cargados:` → OK
- ✅ `Aplicación inicializada correctamente` → OK

## 🛠️ Stack Tecnológico

- D3.js v7 (visualizaciones y mapas)
- d3-sankey (diagramas de flujo)
- Vanilla JS ES6 Modules
- IntersectionObserver API (scroll)
- CSS Grid/Flexbox

---

**⚽ ¡Disfruta del recorrido por la historia mundialista! 🏆**
