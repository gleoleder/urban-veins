<template>
  <div class="panel" :class="{ collapsed }">
    <button class="toggle-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Abrir panel' : 'Cerrar panel'">
      {{ collapsed ? '&#9656;' : '&#9666;' }}
    </button>

    <div class="panel-inner" v-show="!collapsed">

      <!-- Ciudad -->
      <div class="panel-city">
        <span class="city-label">{{ cityName }}</span>
        <div class="city-stats">
          <span>{{ fmtNum(stats.ways) }} calles</span>
          <span class="sep">·</span>
          <span>{{ fmtNum(stats.nodes) }} nodos</span>
        </div>
      </div>

      <hr class="div" />

      <!-- Esquema -->
      <div class="section">
        <div class="stitle">ESQUEMA DE COLOR</div>
        <div class="schemes">
          <button
            v-for="s in schemes" :key="s.id"
            class="scheme-btn" :class="{ active: settings.colorScheme === s.id }"
            @click="changeSettings('colorScheme', s.id)"
          >
            <span class="swatch" :style="{ background: s.preview }"></span>
            {{ s.name }}
          </button>
        </div>
      </div>

      <!-- Efectos -->
      <div class="section">
        <div class="stitle">EFECTOS</div>
        <label class="toggle-row">
          <span>Brillo Neón</span>
          <span class="toggle" :class="{ on: settings.glowEnabled }" @click="changeSettings('glowEnabled', !settings.glowEnabled)">
            <span class="knob"></span>
          </span>
        </label>
      </div>

      <!-- Fondo -->
      <div class="section">
        <div class="stitle">COLOR DE FONDO</div>
        <div class="color-row">
          <span class="clabel">Fondo del mapa</span>
          <div class="cinput">
            <button class="color-swatch" :class="{ active: activePicker === 'bg' }" :style="{ background: localBg }" @click="openPicker('bg')"></button>
            <button class="xbtn" @click="onBg('')">✕</button>
          </div>
        </div>
      </div>

      <!-- Color por tipo de calle -->
      <div class="section">
        <div class="stitle">COLOR POR TIPO DE CALLE</div>
        <div class="type-colors">
          <div v-for="item in activeLegend" :key="item.type" class="color-row">
            <span class="type-dot" :style="{ background: roadColor(item.type) || item.color }"></span>
            <span class="clabel">{{ item.label }}</span>
            <div class="cinput">
              <button class="color-swatch" :class="{ active: activePicker === item.type }" :style="{ background: roadColor(item.type) || item.color }" @click="openPicker(item.type)"></button>
              <button class="xbtn" @click="onRoad(item.type, '')">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Textos en pantalla -->
      <div class="section">
        <div class="stitle">TEXTOS EN PANTALLA</div>
        <div class="color-row">
          <span class="clabel">Nombre ciudad</span>
          <div class="cinput">
            <button class="color-swatch" :class="{ active: activePicker === 'cityName' }" :style="{ background: localCityName }" @click="openPicker('cityName')"></button>
            <button class="xbtn" @click="onCityName('')">✕</button>
          </div>
        </div>
        <div class="color-row">
          <span class="clabel">Dedicatoria</span>
          <div class="cinput">
            <button class="color-swatch" :class="{ active: activePicker === 'dedicationColor' }" :style="{ background: localDedicationColor || 'rgba(200,224,255,0.5)' }" @click="openPicker('dedicationColor')"></button>
            <button class="xbtn" @click="onDedicationColor('')">✕</button>
          </div>
        </div>
        <div class="color-row">
          <span class="clabel">Elaborado por</span>
          <div class="cinput">
            <button class="color-swatch" :class="{ active: activePicker === 'authorColor' }" :style="{ background: localAuthorColor || 'rgba(200,224,255,0.15)' }" @click="openPicker('authorColor')"></button>
            <button class="xbtn" @click="onAuthorColor('')">✕</button>
          </div>
        </div>
      </div>

      <!-- Dedicatoria -->
      <div class="section">
        <div class="stitle">DEDICATORIA</div>
        <div class="ded-hint">Aparece en el mapa y en las descargas</div>
        <textarea
          class="ded-input"
          :value="dedication"
          @input="$emit('change-dedication', $event.target.value)"
          placeholder="Para ti, con todo mi cariño..."
          maxlength="90"
          rows="2"
          spellcheck="false"
        ></textarea>
        <div class="ded-counter">{{ dedication.length }}/90</div>
      </div>

      <!-- Exportar -->
      <div class="section">
        <div class="stitle">EXPORTAR</div>
        <button class="export-btn" @click="$emit('export-png')">&#11015; GUARDAR PNG</button>
        <button class="export-btn mt6" @click="$emit('export-svg')">&#11015; GUARDAR SVG</button>
      </div>

      <!-- Atribución -->
      <div class="attribution">
        Datos © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a><br />
        Licencia: <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener">ODbL 1.0</a>
      </div>
    </div>

    <!-- Spectrum color picker — pinned at bottom of panel -->
    <Transition name="sp-slide">
      <div class="spectrum-panel" v-if="activePicker && !collapsed">
        <div class="sp-header">
          <span class="sp-label">{{ pickerLabel }}</span>
          <button class="sp-close" @click="activePicker = null">✕</button>
        </div>
        <canvas
          ref="pickerCanvas"
          class="sp-canvas"
          @pointerdown.prevent="onPickerDown"
          @pointermove="onPickerMove"
          @pointerup="onPickerUp"
          @pointercancel="onPickerUp"
        ></canvas>
        <div class="sp-footer">
          <div class="sp-dot" :style="{ background: pickerColor }"></div>
          <code class="sp-hex">{{ pickerColor }}</code>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { COLOR_SCHEMES } from '../lib/renderer.js'

const props = defineProps({
  cityName:     { type: String, default: '' },
  stats:        { type: Object, default: () => ({ ways: 0, nodes: 0 }) },
  settings:     { type: Object, required: true },
  customColors: { type: Object, default: () => ({ cityName: '', background: '', roads: {} }) },
  dedication:   { type: String, default: '' },
})
const emit = defineEmits(['change-settings', 'change-colors', 'change-dedication', 'export-png', 'export-svg'])

const collapsed = ref(window.innerWidth < 640)

const schemes = Object.values(COLOR_SCHEMES).map(s => ({ id: s.id, name: s.name, preview: s.preview }))
const activeLegend = computed(() => COLOR_SCHEMES[props.settings.colorScheme]?.legend || COLOR_SCHEMES.neon.legend)

const localBg              = ref('#050510')
const localCityName        = ref('#c8e0ff')
const localDedicationColor = ref('')
const localAuthorColor     = ref('')

// ── Spectrum picker ──────────────────────────────────────────────
const activePicker = ref(null)
const pickerCanvas = ref(null)
const pickerColor  = ref('#00d4ff')
let picking = false

const PICKER_LABELS = {
  bg: 'Fondo del mapa', cityName: 'Nombre ciudad',
  dedicationColor: 'Color dedicatoria', authorColor: 'Color elaborado por',
  motorway: 'Autopista', trunk: 'Vía rápida', primary: 'Principal',
  secondary: 'Secundaria', tertiary: 'Terciaria', minor: 'Menor',
}
const pickerLabel = computed(() => PICKER_LABELS[activePicker.value] || '')

function openPicker(key) {
  if (activePicker.value === key) { activePicker.value = null; return }
  activePicker.value = key
  if (key === 'bg') pickerColor.value = localBg.value
  else if (key === 'cityName') pickerColor.value = localCityName.value
  else if (key === 'dedicationColor') pickerColor.value = localDedicationColor.value || '#c8e0ff'
  else if (key === 'authorColor') pickerColor.value = localAuthorColor.value || '#c8e0ff'
  else pickerColor.value = props.customColors.roads?.[key] || '#ffffff'
  nextTick(() => drawSpectrum())
}

function drawSpectrum() {
  const c = pickerCanvas.value
  if (!c) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = c.offsetWidth
  const h = c.offsetHeight
  c.width  = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)

  // Full hue spectrum (horizontal)
  const hGrad = ctx.createLinearGradient(0, 0, w, 0)
  ;[0, 60, 120, 180, 240, 300, 360].forEach((hue, i) => hGrad.addColorStop(i / 6, `hsl(${hue},100%,50%)`))
  ctx.fillStyle = hGrad
  ctx.fillRect(0, 0, w, h)

  // White fade top→mid
  const wGrad = ctx.createLinearGradient(0, 0, 0, h)
  wGrad.addColorStop(0,   'rgba(255,255,255,1)')
  wGrad.addColorStop(0.5, 'rgba(255,255,255,0)')
  ctx.fillStyle = wGrad
  ctx.fillRect(0, 0, w, h)

  // Black fade mid→bottom
  const bGrad = ctx.createLinearGradient(0, 0, 0, h)
  bGrad.addColorStop(0.5, 'rgba(0,0,0,0)')
  bGrad.addColorStop(1,   'rgba(0,0,0,1)')
  ctx.fillStyle = bGrad
  ctx.fillRect(0, 0, w, h)
}

function pickAt(clientX, clientY) {
  const c = pickerCanvas.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const x = Math.max(0, Math.min(Math.round((clientX - rect.left) * dpr), c.width - 1))
  const y = Math.max(0, Math.min(Math.round((clientY - rect.top)  * dpr), c.height - 1))
  const [r, g, b] = c.getContext('2d').getImageData(x, y, 1, 1).data
  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
  pickerColor.value = hex
  applyPickerColor(hex)
}

function onPickerDown(e) {
  picking = true
  pickerCanvas.value?.setPointerCapture(e.pointerId)
  pickAt(e.clientX, e.clientY)
}
function onPickerMove(e) { if (picking) pickAt(e.clientX, e.clientY) }
function onPickerUp()    { picking = false }

function applyPickerColor(hex) {
  const key = activePicker.value
  if (!key) return
  if (key === 'bg') onBg(hex)
  else if (key === 'cityName') onCityName(hex)
  else if (key === 'dedicationColor') onDedicationColor(hex)
  else if (key === 'authorColor') onAuthorColor(hex)
  else onRoad(key, hex)
}

// ── Standard handlers ────────────────────────────────────────────
function roadColor(type) { return props.customColors.roads?.[type] || '' }

function changeSettings(key, value) {
  emit('change-settings', { ...props.settings, [key]: value })
}

function onBg(val) {
  localBg.value = val || '#050510'
  emit('change-colors', { background: val })
}

function onRoad(type, val) {
  emit('change-colors', { roads: { [type]: val } })
}

function onCityName(val) {
  localCityName.value = val || '#c8e0ff'
  emit('change-colors', { cityName: val || '' })
}

function onDedicationColor(val) {
  localDedicationColor.value = val || ''
  emit('change-colors', { dedicationColor: val || '' })
}

function onAuthorColor(val) {
  localAuthorColor.value = val || ''
  emit('change-colors', { authorColor: val || '' })
}

function fmtNum(n) { return n ? n.toLocaleString() : '0' }
</script>

<style scoped>
/* ── Panel ── */
.panel {
  position: absolute;
  left: 0; top: 50px; bottom: 0;
  width: 230px;
  background: rgba(6, 9, 26, 0.96);
  border-right: 1px solid rgba(0, 212, 255, 0.18);
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: visible;
  transition: width 0.25s ease;
  backdrop-filter: blur(16px);
  box-shadow: 4px 0 28px rgba(0, 0, 0, 0.5);
}
.panel.collapsed { width: 0; border-right: none; }

.toggle-btn {
  position: absolute;
  right: -28px; top: 50%;
  transform: translateY(-50%);
  width: 28px; height: 52px;
  background: rgba(6, 9, 26, 0.96);
  border: 1px solid rgba(0, 212, 255, 0.22);
  border-left: none;
  color: var(--cyan);
  font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0;
  backdrop-filter: blur(12px);
  z-index: 1;
}
.toggle-btn:hover { background: rgba(0, 212, 255, 0.08); }

.panel-inner {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 14px 12px;
  display: flex; flex-direction: column; gap: 2px;
  min-width: 230px;
}
.panel-inner::-webkit-scrollbar { width: 4px; }
.panel-inner::-webkit-scrollbar-track { background: transparent; }
.panel-inner::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 2px; }

/* City */
.panel-city { margin-bottom: 4px; }
.city-label {
  font-size: 13px; color: var(--cyan);
  letter-spacing: 0.06em; display: block;
  margin-bottom: 3px;
  text-shadow: 0 0 10px rgba(0,212,255,0.25);
  word-break: break-word;
}
.city-stats { font-size: 10px; color: var(--text-dim); }
.sep { margin: 0 4px; }

.div { border: none; border-top: 1px solid rgba(0,212,255,0.1); margin: 8px 0; }

/* Sections */
.section { margin-bottom: 12px; }
.stitle {
  font-size: 9px; letter-spacing: 0.22em;
  color: rgba(0,212,255,0.5); text-transform: uppercase;
  margin-bottom: 7px;
}

/* Schemes */
.schemes { display: flex; flex-direction: column; gap: 4px; }
.scheme-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 9px; font-size: 11px; letter-spacing: 0.08em;
  border: 1px solid rgba(0,212,255,0.18);
  background: rgba(255,255,255,0.03); color: var(--text);
  transition: all 0.15s; cursor: pointer;
}
.scheme-btn:hover { background: rgba(0,212,255,0.07); border-color: rgba(0,212,255,0.4); }
.scheme-btn.active { border-color: var(--cyan); color: var(--cyan); background: rgba(0,212,255,0.1); }
.swatch { width: 28px; height: 9px; border-radius: 2px; flex-shrink: 0; }

/* Toggle */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; font-size: 12px; color: var(--text);
}
.toggle {
  width: 34px; height: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(0,212,255,0.2); border-radius: 9px;
  position: relative; transition: all 0.2s; flex-shrink: 0;
}
.toggle.on { background: rgba(0,212,255,0.15); border-color: var(--cyan); box-shadow: 0 0 8px rgba(0,212,255,0.2); }
.knob {
  position: absolute; top: 2px; left: 2px;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--text-dim); transition: transform 0.2s, background 0.2s;
}
.toggle.on .knob { transform: translateX(16px); background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }

/* Color rows */
.color-row {
  display: flex; align-items: center;
  gap: 6px; margin-bottom: 6px;
}
.type-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.clabel {
  font-size: 11px; color: var(--text-dim); flex: 1;
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cinput { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

/* Color swatch button (opens spectrum picker) */
.color-swatch {
  width: 32px; height: 20px;
  border: 1px solid rgba(0,212,255,0.25);
  cursor: pointer; border-radius: 2px;
  transition: border-color 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
}
.color-swatch:hover { border-color: rgba(0,212,255,0.6); }
.color-swatch.active {
  border-color: var(--cyan);
  box-shadow: 0 0 6px rgba(0,212,255,0.5);
}

/* X button */
.xbtn {
  width: 18px; height: 18px; padding: 0;
  font-size: 10px; font-weight: bold;
  border: 1px solid rgba(220, 50, 50, 0.5);
  color: #ff5555;
  background: rgba(220, 50, 50, 0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.xbtn:hover { background: rgba(220, 50, 50, 0.25); border-color: #ff4444; }

/* Dedication */
.ded-hint { font-size: 9px; color: rgba(0,212,255,0.4); margin-bottom: 5px; }
.ded-input {
  width: 100%; resize: none;
  padding: 7px 9px; font-size: 11px;
  font-style: italic; letter-spacing: 0.04em;
  border: 1px solid rgba(0,212,255,0.2);
  background: rgba(255,255,255,0.04); color: var(--text);
  outline: none; transition: border-color 0.15s;
  font-family: var(--font); line-height: 1.5;
}
.ded-input::placeholder { color: rgba(200,224,255,0.25); font-style: italic; }
.ded-input:focus { border-color: rgba(0,212,255,0.5); }
.ded-counter { font-size: 9px; color: var(--text-dim); text-align: right; margin-top: 2px; }

/* Export */
.export-btn {
  width: 100%; padding: 7px; font-size: 11px;
  letter-spacing: 0.08em; text-align: center;
  border: 1px solid rgba(0,212,255,0.2);
  background: transparent; color: var(--text);
  transition: all 0.18s; display: block; cursor: pointer;
}
.export-btn.mt6 { margin-top: 5px; }
.export-btn:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(0,212,255,0.07); }

/* Attribution */
.attribution {
  margin-top: auto; padding-top: 10px;
  font-size: 10px; color: rgba(200,224,255,0.2); line-height: 1.7;
}
.attribution a { color: rgba(0,212,255,0.35); }
.attribution a:hover { color: var(--cyan); }

/* ── Spectrum picker ── */
.spectrum-panel {
  flex-shrink: 0;
  padding: 10px 12px 12px;
  background: rgba(3, 5, 18, 0.99);
  border-top: 1px solid rgba(0,212,255,0.2);
  min-width: 230px;
}
.sp-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 7px;
}
.sp-label { font-size: 10px; color: rgba(0,212,255,0.6); letter-spacing: 0.1em; }
.sp-close {
  width: 18px; height: 18px; padding: 0; font-size: 9px;
  border: 1px solid rgba(0,212,255,0.2); color: var(--text-dim);
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.sp-close:hover { border-color: var(--cyan); color: var(--cyan); }

.sp-canvas {
  width: 100%; height: 110px;
  cursor: crosshair; touch-action: none;
  display: block; border-radius: 2px;
}
.sp-footer {
  display: flex; align-items: center; gap: 8px;
  margin-top: 7px;
}
.sp-dot {
  width: 28px; height: 20px;
  border-radius: 2px;
  border: 1px solid rgba(0,212,255,0.25);
  flex-shrink: 0;
}
.sp-hex { font-size: 11px; color: var(--text-dim); letter-spacing: 0.05em; }

/* Spectrum slide transition */
.sp-slide-enter-active, .sp-slide-leave-active { transition: transform 0.2s ease, opacity 0.2s; }
.sp-slide-enter-from, .sp-slide-leave-to { transform: translateY(20px); opacity: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .panel { width: 210px; }
  .panel-inner { min-width: 210px; }
  .spectrum-panel { min-width: 210px; }
}
@media (max-width: 640px) {
  .panel { width: 200px; top: 44px; }
  .panel.collapsed { width: 0; border-right: none; }
  .panel-inner { min-width: 200px; padding: 10px 9px; }
  .spectrum-panel { min-width: 200px; }
}
</style>
