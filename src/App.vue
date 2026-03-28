<template>
  <div class="app">
    <canvas ref="canvasRef" class="canvas" />

    <!-- Top bar -->
    <header class="topbar">
      <div class="logo">
        <span class="lb">[</span>URBAN<span class="la">VEINS</span><span class="lb">]</span>
      </div>
      <div class="topbar-right" v-if="appState === 'loaded'">
        <button class="tb-btn" @click="resetView" title="Restablecer vista">&#8859; RESTABLECER</button>
        <button class="tb-btn accent" @click="startOver">&#8635; NUEVA CIUDAD</button>
      </div>
    </header>

    <!-- City Search -->
    <Transition name="fade">
      <div class="center-panel" v-if="appState === 'idle'">
        <CitySearch @select="onCitySelected" />
      </div>
    </Transition>

    <!-- Loading -->
    <Transition name="fade">
      <div class="center-panel" v-if="appState === 'loading'">
        <LoadingScreen
          :cityName="loadingCityName"
          :progress="loadProgress"
          :status="loadStatus"
        />
      </div>
    </Transition>

    <!-- Nombre de ciudad en pantalla -->
    <Transition name="fade">
      <div class="city-overlay" v-if="appState === 'loaded'">
        {{ cityShortName }}
      </div>
    </Transition>

    <!-- Control Panel (loaded) -->
    <Transition name="slide-right">
      <ControlPanel
        v-if="appState === 'loaded'"
        :cityName="cityShortName"
        :stats="stats"
        :settings="renderSettings"
        @change-settings="onSettingsChange"
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

    <!-- Attribution (always visible) -->
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
const appState = ref('idle') // idle | loading | loaded
const loadingCityName = ref('')
const cityShortName = ref('')
const loadProgress = ref(0)
const loadStatus = ref('')
const errorMsg = ref(null)

const stats = reactive({ ways: 0, nodes: 0 })
const renderSettings = reactive({ colorScheme: 'neon', glowEnabled: true })

let renderer = null

function handleResize() {
  renderer?.resize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  renderer = new NeonRenderer(canvasRef.value)
  renderer.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

async function onCitySelected(place) {
  appState.value = 'loading'
  loadingCityName.value = place.shortName
  loadProgress.value = 0
  loadStatus.value = 'Conectando con OpenStreetMap...'
  errorMsg.value = null

  try {
    const areaId = placeToAreaId(place.osmType, place.osmId)

    loadStatus.value = 'Descargando red vial...'
    const osmData = await fetchRoads(areaId, p => {
      loadProgress.value = p
      loadStatus.value = p < 50 ? 'Descargando datos de calles...' : 'Procesando segmentos...'
    })

    loadStatus.value = 'Construyendo red...'
    loadProgress.value = 88

    const network = RoadNetwork.fromOSMResponse(osmData)

    if (network.ways.length === 0) {
      throw new Error('No se encontraron calles. Intenta con una ciudad más grande.')
    }

    stats.ways = network.ways.length
    stats.nodes = network.nodes.size
    cityShortName.value = place.shortName

    await new Promise(r => setTimeout(r, 80))

    renderer.setColorScheme(renderSettings.colorScheme)
    renderer.setGlow(renderSettings.glowEnabled)
    renderer.setNetwork(network)

    loadProgress.value = 100
    appState.value = 'loaded'

  } catch (e) {
    appState.value = 'idle'
    errorMsg.value = e.message || 'Error al cargar los datos. Por favor intenta de nuevo.'
    setTimeout(() => { errorMsg.value = null }, 6000)
  }
}

function onSettingsChange(newSettings) {
  Object.assign(renderSettings, newSettings)
  if (renderer) {
    renderer.setColorScheme(newSettings.colorScheme)
    renderer.setGlow(newSettings.glowEnabled)
  }
}

function resetView() { renderer?.reset() }

function exportPNG() {
  const filename = cityShortName.value.replace(/\s+/g, '-').toLowerCase() || 'urban-veins'
  renderer?.toPNG(filename)
}

function exportSVG() {
  const filename = cityShortName.value.replace(/\s+/g, '-').toLowerCase() || 'urban-veins'
  renderer?.toSVG(filename)
}

function startOver() {
  appState.value = 'idle'
  cityShortName.value = ''
  renderer?.clear()
}
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
  display: block;
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
  background: linear-gradient(180deg, rgba(5,5,16,0.96) 0%, rgba(5,5,16,0) 100%);
  z-index: 20;
  pointer-events: none;
}

.topbar-right { pointer-events: all; display: flex; gap: 6px; }

.logo {
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 0.18em;
  color: #c8e0ff;
  pointer-events: none;
}
.la { color: #00d4ff; }
.lb { color: rgba(0,212,255,0.35); font-weight: normal; }

.tb-btn {
  font-size: 10px;
  padding: 5px 11px;
  letter-spacing: 0.1em;
}
.tb-btn.accent { border-color: rgba(0,255,159,0.3); color: #00ff9f; }
.tb-btn.accent:hover { background: rgba(0,255,159,0.08); border-color: #00ff9f; box-shadow: 0 0 10px rgba(0,255,159,0.2); }

/* Center panel */
.center-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 25;
  width: min(460px, 92vw);
}

/* Error */
.error-toast {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,0,110,0.12);
  border: 1px solid rgba(255,0,110,0.45);
  color: #ff006e;
  padding: 10px 22px;
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
  z-index: 30;
  white-space: nowrap;
  max-width: 90vw;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Attribution bar */
.attribution-bar {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 10px;
  color: rgba(200,224,255,0.35);
  z-index: 5;
  pointer-events: all;
  letter-spacing: 0.02em;
}
.attribution-bar a { color: rgba(0,212,255,0.5); }
.attribution-bar a:hover { color: #00d4ff; }

/* Nombre ciudad en pantalla */
.city-overlay {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(28px, 5vw, 56px);
  font-weight: bold;
  letter-spacing: 0.12em;
  color: rgba(200, 224, 255, 0.08);
  text-transform: uppercase;
  pointer-events: none;
  white-space: nowrap;
  z-index: 4;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.04);
  user-select: none;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(220px); opacity: 0; }
</style>
