<template>
  <div class="app">
    <canvas ref="canvasRef" class="canvas" />

    <!-- Top bar -->
    <header class="topbar">
      <div class="topbar-left-space" />
      <div class="logo" v-if="appState !== 'idle'">
        <span class="lb">[</span>map<span class="la">Leu</span><span class="lb">]</span>
      </div>
      <div v-else></div>
      <div class="topbar-right" v-if="appState === 'loaded'">
        <button class="tb-btn" @click="resetView">&#8859; RESTABLECER</button>
        <button class="tb-btn accent" @click="startOver">&#8635; NUEVA CIUDAD</button>
      </div>
      <div v-else class="topbar-right" />
    </header>

    <!-- City Search -->
    <Transition name="fade">
      <div class="center-panel" v-if="appState === 'idle'">
        <div class="hero">
          <div class="hero-logo"><span class="hl-b">[</span>map<span class="hl-a">Leu</span><span class="hl-b">]</span></div>
          <div class="hero-tag">Regala un mapa a quien más quieres</div>
        </div>
        <CitySearch @select="onCitySelected" />
      </div>
    </Transition>

    <!-- Loading -->
    <Transition name="fade">
      <div class="center-panel" v-if="appState === 'loading'">
        <LoadingScreen :cityName="loadingCityName" :progress="loadProgress" :status="loadStatus" />
      </div>
    </Transition>

    <!-- Nombre ciudad + dedicatoria + autor en pantalla -->
    <Transition name="fade">
      <div class="overlays" v-if="appState === 'loaded'">
        <div class="city-overlay" :style="{ color: customColors.cityName }">
          {{ cityShortName }}
        </div>
        <div class="dedication-overlay" v-if="dedication">{{ dedication }}</div>
        <div class="author-overlay">
          Elaborado por: John Leonardo Cabrera Espíndola.
        </div>
      </div>
    </Transition>

    <!-- Panel de control (izquierda) -->
    <Transition name="slide-left">
      <ControlPanel
        v-if="appState === 'loaded'"
        :cityName="cityShortName"
        :stats="stats"
        :settings="renderSettings"
        :customColors="customColors"
        :dedication="dedication"
        @change-settings="onSettingsChange"
        @change-colors="onColorsChange"
        @change-dedication="dedication = $event"
        @export-png="exportPNG"
        @export-svg="exportSVG"
      />
    </Transition>

    <!-- Error toast -->
    <Transition name="fade">
      <div class="error-toast" v-if="errorMsg" @click="errorMsg = null">
        &#9888; {{ errorMsg }}
      </div>
    </Transition>

    <!-- Atribución -->
    <div class="attribution-bar">
      &#169; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>
      &nbsp;|&nbsp;
      <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener">ODbL 1.0</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import CitySearch from './components/CitySearch.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import ControlPanel from './components/ControlPanel.vue'
import { NeonRenderer } from './lib/renderer.js'
import { fetchRoads } from './lib/osmQuery.js'
import { placeToAreaId } from './lib/geocoding.js'
import { RoadNetwork } from './lib/roadData.js'

const canvasRef = ref(null)
const appState = ref('idle')
const loadingCityName = ref('')
const cityShortName = ref('')
const loadProgress = ref(0)
const loadStatus = ref('')
const errorMsg = ref(null)

const dedication = ref('')
const stats = reactive({ ways: 0, nodes: 0 })
const renderSettings = reactive({ colorScheme: 'neon', glowEnabled: true })
const customColors = reactive({
  cityName: 'rgba(200,224,255,0.45)',
  background: '',
  roads: { motorway: '', trunk: '', primary: '', secondary: '', tertiary: '', minor: '' },
})

let renderer = null

function handleResize() {
  renderer?.resize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  renderer = new NeonRenderer(canvasRef.value)
  renderer.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => window.removeEventListener('resize', handleResize))

async function onCitySelected(place) {
  appState.value = 'loading'
  loadingCityName.value = place.shortName
  loadProgress.value = 0
  loadStatus.value = 'Conectando con OpenStreetMap...'
  errorMsg.value = null

  try {
    const areaId = place.osmType === 'node' ? null : placeToAreaId(place.osmType, place.osmId)

    loadStatus.value = 'Descargando red vial...'
    const osmData = await fetchRoads(areaId, place.bbox, p => {
      loadProgress.value = p
      loadStatus.value = p < 55 ? 'Descargando datos de calles...' : 'Procesando segmentos...'
    })

    loadStatus.value = 'Construyendo red...'
    loadProgress.value = 88

    const network = RoadNetwork.fromOSMResponse(osmData)

    if (network.ways.length === 0) {
      throw new Error('No se encontraron calles. Intenta con otra ciudad o un área más grande.')
    }

    stats.ways = network.ways.length
    stats.nodes = network.nodes.size
    cityShortName.value = place.shortName

    await new Promise(r => setTimeout(r, 80))

    renderer.setColorScheme(renderSettings.colorScheme)
    renderer.setGlow(renderSettings.glowEnabled)
    renderer.setNetwork(network)

    // Re-apply any custom colors
    if (customColors.background) renderer.setBackground(customColors.background)
    for (const [type, color] of Object.entries(customColors.roads)) {
      if (color) renderer.setRoadColor(type, color)
    }

    loadProgress.value = 100
    appState.value = 'loaded'

  } catch (e) {
    appState.value = 'idle'
    errorMsg.value = e.message || 'Error al cargar los datos. Por favor intenta de nuevo.'
    setTimeout(() => { errorMsg.value = null }, 7000)
  }
}

function onSettingsChange(newSettings) {
  Object.assign(renderSettings, newSettings)
  if (renderer) {
    renderer.setColorScheme(newSettings.colorScheme)
    renderer.setGlow(newSettings.glowEnabled)
    // Reset custom road colors when switching scheme
    for (const type of Object.keys(customColors.roads)) customColors.roads[type] = ''
    customColors.background = ''
  }
}

function onColorsChange(delta) {
  if ('background' in delta) {
    customColors.background = delta.background
    renderer?.setBackground(delta.background || null)
  }
  if ('cityName' in delta) {
    customColors.cityName = delta.cityName || 'rgba(200,224,255,0.45)'
  }
  if ('roads' in delta) {
    for (const [type, color] of Object.entries(delta.roads)) {
      customColors.roads[type] = color
      renderer?.setRoadColor(type, color || null)
    }
  }
}

function resetView() { renderer?.reset() }

function exportPNG() {
  const filename = cityShortName.value.replace(/\s+/g, '-').toLowerCase() || 'mapleu'
  renderer?.toPNG(filename, cityShortName.value, customColors.cityName, dedication.value)
}

function exportSVG() {
  const filename = cityShortName.value.replace(/\s+/g, '-').toLowerCase() || 'mapleu'
  renderer?.toSVG(filename, cityShortName.value, customColors.cityName, dedication.value)
}

function startOver() {
  appState.value = 'idle'
  cityShortName.value = ''
  dedication.value = ''
  customColors.background = ''
  customColors.cityName = 'rgba(200,224,255,0.45)'
  for (const type of Object.keys(customColors.roads)) customColors.roads[type] = ''
  renderer?.clear()
}
</script>

<style scoped>
.app { width: 100vw; height: 100vh; position: relative; overflow: hidden; }

.canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  cursor: grab; display: block;
}
.canvas:active { cursor: grabbing; }

/* Top bar */
.topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: linear-gradient(180deg, rgba(5,5,16,0.96) 0%, transparent 100%);
  z-index: 20;
  pointer-events: none;
}
.topbar-left-space { width: 230px; flex-shrink: 0; }
.topbar-right { pointer-events: all; display: flex; gap: 6px; }

.logo {
  font-size: 17px; font-weight: bold;
  letter-spacing: 0.18em; color: #c8e0ff;
}
.la { color: #00d4ff; }
.lb { color: rgba(0,212,255,0.35); font-weight: normal; }

.tb-btn { font-size: 10px; padding: 5px 11px; letter-spacing: 0.1em; }
.tb-btn.accent { border-color: rgba(0,255,159,0.3); color: #00ff9f; }
.tb-btn.accent:hover { background: rgba(0,255,159,0.08); border-color: #00ff9f; }

/* Center panel (start screen) */
.center-panel {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 25;
  width: min(480px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Hero — mapLeu logo + tagline */
.hero {
  text-align: center;
  margin-bottom: 22px;
  user-select: none;
}
.hero-logo {
  font-size: clamp(38px, 9vw, 72px);
  font-weight: bold;
  letter-spacing: 0.16em;
  color: #c8e0ff;
  line-height: 1;
  margin-bottom: 10px;
  text-shadow: 0 0 40px rgba(0,212,255,0.25);
}
.hl-a { color: #00d4ff; }
.hl-b { color: rgba(0,212,255,0.3); font-weight: normal; }
.hero-tag {
  font-size: clamp(11px, 2.2vw, 15px);
  color: rgba(200,224,255,0.55);
  letter-spacing: 0.06em;
  line-height: 1.5;
}

/* City + author overlays */
.overlays {
  position: absolute;
  bottom: max(28px, env(safe-area-inset-bottom, 0px) + 20px);
  left: 0; right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  pointer-events: none;
  z-index: 8;
  user-select: none;
  padding: 0 16px;
}
.city-overlay {
  font-size: clamp(20px, 5vw, 54px);
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  max-width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
}
.dedication-overlay {
  font-size: clamp(10px, 1.4vw, 15px);
  font-style: italic;
  letter-spacing: 0.05em;
  color: rgba(200,224,255,0.50);
  max-width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.author-overlay {
  font-size: clamp(6px, 0.7vw, 9px);
  letter-spacing: 0.05em;
  color: rgba(200,224,255,0.14);
}

/* Error */
.error-toast {
  position: absolute; bottom: 36px; left: 50%;
  transform: translateX(-50%);
  background: rgba(255,0,110,0.12);
  border: 1px solid rgba(255,0,110,0.45);
  color: #ff006e;
  padding: 10px 22px; font-size: 12px;
  cursor: pointer; z-index: 30;
  white-space: nowrap; max-width: 90vw;
  overflow: hidden; text-overflow: ellipsis;
}

/* Attribution */
.attribution-bar {
  position: absolute; bottom: 8px; right: 12px;
  font-size: 10px; color: rgba(200,224,255,0.35);
  z-index: 5; letter-spacing: 0.02em;
}
.attribution-bar a { color: rgba(0,212,255,0.5); }
.attribution-bar a:hover { color: #00d4ff; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-240px); opacity: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .topbar-left-space { width: 210px; }
}
@media (max-width: 640px) {
  .topbar { height: 44px; padding: 0 12px; }
  .topbar-left-space { width: 0; }
  .logo { font-size: 14px; }
  .tb-btn { font-size: 9px; padding: 4px 8px; }
  .hero-logo { margin-bottom: 8px; }
  .attribution-bar { font-size: 9px; right: 8px; bottom: 6px; }
}
@media (max-width: 400px) {
  .hero { margin-bottom: 16px; }
  .center-panel { width: 97vw; }
}
</style>
