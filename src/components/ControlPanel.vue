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
            <input type="color" :value="localBg" @input="onBg($event.target.value)" />
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
              <input type="color" :value="roadColor(item.type) || item.color" @input="onRoad(item.type, $event.target.value)" />
              <button class="xbtn" @click="onRoad(item.type, '')">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Color nombre ciudad -->
      <div class="section">
        <div class="stitle">NOMBRE EN PANTALLA</div>
        <div class="color-row">
          <span class="clabel">Color del nombre</span>
          <div class="cinput">
            <input type="color" :value="localCityName" @input="onCityName($event.target.value)" />
            <button class="xbtn" @click="onCityName('')">✕</button>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { COLOR_SCHEMES } from '../lib/renderer.js'

const props = defineProps({
  cityName:     { type: String, default: '' },
  stats:        { type: Object, default: () => ({ ways: 0, nodes: 0 }) },
  settings:     { type: Object, required: true },
  customColors: { type: Object, default: () => ({ cityName: '', background: '', roads: {} }) },
  dedication:   { type: String, default: '' },
})
const emit = defineEmits(['change-settings', 'change-colors', 'change-dedication', 'export-png', 'export-svg'])

// Collapse by default on small screens
const collapsed = ref(window.innerWidth < 640)

const schemes = Object.values(COLOR_SCHEMES).map(s => ({ id: s.id, name: s.name, preview: s.preview }))
const activeLegend = computed(() => COLOR_SCHEMES[props.settings.colorScheme]?.legend || COLOR_SCHEMES.neon.legend)

const localBg       = ref('#050510')
const localCityName = ref('#c8e0ff')

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

function fmtNum(n) { return n ? n.toLocaleString() : '0' }
</script>

<style scoped>
/* ── Panel (izquierda) ── */
.panel {
  position: absolute;
  left: 0; top: 50px; bottom: 0;
  width: 230px;
  background: rgba(240, 247, 255, 0.97);
  border-right: 1px solid rgba(100, 150, 220, 0.25);
  display: flex;
  z-index: 10;
  transition: width 0.25s ease;
  backdrop-filter: blur(16px);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18);
}
.panel.collapsed { width: 28px; }

.toggle-btn {
  position: absolute;
  right: -28px; top: 50%;
  transform: translateY(-50%);
  width: 28px; height: 52px;
  background: rgba(240, 247, 255, 0.97);
  border: 1px solid rgba(100, 150, 220, 0.25);
  border-left: none;
  color: #3a7bd5;
  font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0;
  box-shadow: 3px 0 10px rgba(0,0,0,0.1);
}
.toggle-btn:hover { background: rgba(220, 237, 255, 0.99); }

.panel-inner {
  flex: 1; overflow-y: auto;
  padding: 14px 12px;
  display: flex; flex-direction: column; gap: 2px;
}

/* Custom scrollbar for light panel */
.panel-inner::-webkit-scrollbar { width: 4px; }
.panel-inner::-webkit-scrollbar-track { background: transparent; }
.panel-inner::-webkit-scrollbar-thumb { background: rgba(100,150,220,0.3); border-radius: 2px; }

/* City */
.panel-city { margin-bottom: 4px; }
.city-label {
  font-size: 13px; color: #1a2d5a;
  letter-spacing: 0.06em; display: block;
  margin-bottom: 3px; font-weight: bold;
  word-break: break-word;
}
.city-stats { font-size: 10px; color: #6a8ab0; }
.sep { margin: 0 4px; }

.div { border: none; border-top: 1px solid rgba(100, 150, 220, 0.2); margin: 8px 0; }

/* Sections */
.section { margin-bottom: 12px; }
.stitle {
  font-size: 9px; letter-spacing: 0.22em;
  color: #7a9cc0; text-transform: uppercase;
  margin-bottom: 7px;
}

/* Schemes */
.schemes { display: flex; flex-direction: column; gap: 4px; }
.scheme-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 9px; font-size: 11px; letter-spacing: 0.08em;
  border: 1px solid rgba(100, 150, 220, 0.3);
  background: #fff; color: #1a2d5a;
  transition: all 0.15s; cursor: pointer;
  border-radius: 4px;
}
.scheme-btn:hover { background: #e8f2ff; border-color: #3a7bd5; }
.scheme-btn.active { border-color: #3a7bd5; color: #1a5abf; background: #deeeff; }
.swatch { width: 28px; height: 9px; border-radius: 2px; flex-shrink: 0; }

/* Toggle */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; font-size: 12px; color: #1a2d5a;
}
.toggle {
  width: 34px; height: 18px;
  background: rgba(0,0,0,0.08);
  border: 1px solid rgba(100, 150, 220, 0.35); border-radius: 9px;
  position: relative; transition: all 0.2s; flex-shrink: 0;
}
.toggle.on { background: rgba(58, 123, 213, 0.15); border-color: #3a7bd5; }
.knob {
  position: absolute; top: 2px; left: 2px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #aabcd8; transition: transform 0.2s, background 0.2s;
}
.toggle.on .knob { transform: translateX(16px); background: #3a7bd5; }

/* Color rows */
.color-row {
  display: flex; align-items: center;
  gap: 6px; margin-bottom: 6px;
}
.type-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.clabel {
  font-size: 11px; color: #3a5580; flex: 1;
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cinput { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }

input[type="color"] {
  width: 30px; height: 20px;
  padding: 1px 2px;
  border: 1px solid rgba(100, 150, 220, 0.35);
  background: #fff; cursor: pointer; border-radius: 3px;
}
input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }

/* X button — red, always visible */
.xbtn {
  width: 18px; height: 18px; padding: 0;
  font-size: 10px; font-weight: bold;
  border: 1px solid rgba(220, 50, 50, 0.45);
  color: #d32f2f;
  background: rgba(229, 57, 53, 0.07);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border-radius: 3px;
  transition: all 0.15s;
}
.xbtn:hover { background: rgba(229, 57, 53, 0.18); border-color: #d32f2f; color: #b71c1c; }

/* Dedication */
.ded-hint {
  font-size: 9px; color: #8aabcc;
  margin-bottom: 5px; letter-spacing: 0.04em;
}
.ded-input {
  width: 100%; resize: none;
  padding: 7px 9px; font-size: 11px;
  font-style: italic; letter-spacing: 0.04em;
  border: 1px solid rgba(100, 150, 220, 0.35);
  background: #fff; color: #1a2d5a;
  border-radius: 4px; outline: none;
  transition: border-color 0.15s;
  font-family: var(--font);
  line-height: 1.5;
}
.ded-input::placeholder { color: #aabcd8; font-style: italic; }
.ded-input:focus { border-color: #3a7bd5; }
.ded-counter {
  font-size: 9px; color: #aabcd8;
  text-align: right; margin-top: 2px;
}

/* Export */
.export-btn {
  width: 100%; padding: 7px; font-size: 11px;
  letter-spacing: 0.08em; text-align: center;
  border: 1px solid rgba(100, 150, 220, 0.35);
  background: #fff; color: #1a2d5a;
  transition: all 0.18s; display: block; cursor: pointer;
  border-radius: 4px;
}
.export-btn.mt6 { margin-top: 5px; }
.export-btn:hover { border-color: #3a7bd5; color: #1a5abf; background: #deeeff; }

/* Attribution */
.attribution {
  margin-top: auto; padding-top: 10px;
  font-size: 10px; color: #8aabcc; line-height: 1.7;
}
.attribution a { color: #3a7bd5; }
.attribution a:hover { color: #1a5abf; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .panel { width: 200px; }
  .panel.collapsed { width: 28px; }
}
@media (max-width: 640px) {
  .panel { width: 190px; top: 44px; }
  .panel.collapsed { width: 28px; }
  .panel-inner { padding: 10px 9px; }
}
</style>
