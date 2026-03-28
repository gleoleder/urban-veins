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
  background: rgba(6, 9, 26, 0.96);
  border-right: 1px solid rgba(0, 212, 255, 0.18);
  display: flex;
  z-index: 10;
  overflow: visible;
  transition: width 0.25s ease;
  backdrop-filter: blur(16px);
  box-shadow: 4px 0 28px rgba(0, 0, 0, 0.5);
}
/* Fully hidden when collapsed — no strip */
.panel.collapsed {
  width: 0;
  border-right: none;
}

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
}
.toggle-btn:hover { background: rgba(0, 212, 255, 0.08); }

.panel-inner {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 14px 12px;
  display: flex; flex-direction: column; gap: 2px;
  min-width: 230px;
}

/* Scrollbar */
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
.cinput { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }

input[type="color"] {
  width: 30px; height: 20px;
  padding: 1px 2px;
  border: 1px solid rgba(0,212,255,0.22);
  background: rgba(255,255,255,0.05); cursor: pointer; border-radius: 2px;
}
input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
input[type="color"]::-webkit-color-swatch { border: none; }

/* X button — red, always visible */
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
.xbtn:hover { background: rgba(220, 50, 50, 0.25); border-color: #ff4444; color: #ff3333; }

/* Dedication */
.ded-hint {
  font-size: 9px; color: rgba(0,212,255,0.4);
  margin-bottom: 5px; letter-spacing: 0.04em;
}
.ded-input {
  width: 100%; resize: none;
  padding: 7px 9px; font-size: 11px;
  font-style: italic; letter-spacing: 0.04em;
  border: 1px solid rgba(0,212,255,0.2);
  background: rgba(255,255,255,0.04); color: var(--text);
  outline: none;
  transition: border-color 0.15s;
  font-family: var(--font);
  line-height: 1.5;
}
.ded-input::placeholder { color: rgba(200,224,255,0.25); font-style: italic; }
.ded-input:focus { border-color: rgba(0,212,255,0.5); }
.ded-counter {
  font-size: 9px; color: var(--text-dim);
  text-align: right; margin-top: 2px;
}

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

/* ── Responsive ── */
@media (max-width: 900px) {
  .panel { width: 210px; }
  .panel.collapsed { width: 0; border-right: none; }
  .panel-inner { min-width: 210px; }
}
@media (max-width: 640px) {
  .panel { width: 200px; top: 44px; }
  .panel.collapsed { width: 0; border-right: none; }
  .panel-inner { min-width: 200px; padding: 10px 9px; }
}
</style>
