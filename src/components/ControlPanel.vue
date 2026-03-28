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
          <span class="dot-sep">·</span>
          <span>{{ fmtNum(stats.nodes) }} nodos</span>
        </div>
      </div>

      <hr class="divider" />

      <!-- Esquema de color -->
      <div class="section">
        <div class="section-title">ESQUEMA DE COLOR</div>
        <div class="schemes">
          <button
            v-for="s in schemes"
            :key="s.id"
            class="scheme-btn"
            :class="{ active: settings.colorScheme === s.id }"
            @click="change('colorScheme', s.id)"
            :title="s.name"
          >
            <span class="scheme-swatch" :style="{ background: s.preview }"></span>
            <span>{{ s.name }}</span>
          </button>
        </div>
      </div>

      <!-- Efectos -->
      <div class="section">
        <div class="section-title">EFECTOS</div>
        <label class="toggle-row">
          <span class="toggle-label">Brillo Neón</span>
          <span
            class="toggle-switch"
            :class="{ on: settings.glowEnabled }"
            @click="change('glowEnabled', !settings.glowEnabled)"
          >
            <span class="toggle-knob"></span>
          </span>
        </label>
      </div>

      <!-- Colores personalizados -->
      <div class="section">
        <div class="section-title">COLOR PERSONALIZADO</div>
        <div class="color-rows">
          <div class="color-row">
            <span class="color-label">Fondo</span>
            <div class="color-input-wrap">
              <input type="color" :value="localBg" @input="onBgChange($event.target.value)" />
              <button class="reset-color" @click="onBgChange('')" title="Restablecer">&#10006;</button>
            </div>
          </div>
          <div class="color-row">
            <span class="color-label">Líneas</span>
            <div class="color-input-wrap">
              <input type="color" :value="localLines" @input="onLinesChange($event.target.value)" />
              <button class="reset-color" @click="onLinesChange('')" title="Restablecer">&#10006;</button>
            </div>
          </div>
          <div class="color-row">
            <span class="color-label">Nombre ciudad</span>
            <div class="color-input-wrap">
              <input type="color" :value="localCityName" @input="onCityNameChange($event.target.value)" />
              <button class="reset-color" @click="onCityNameChange('rgba(200,224,255,0.08)')" title="Restablecer">&#10006;</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="section">
        <div class="section-title">LEYENDA</div>
        <div class="legend">
          <div v-for="item in activeLegend" :key="item.label" class="legend-row">
            <span class="legend-color" :style="{ background: localLines || item.color, boxShadow: `0 0 5px ${localLines || item.color}` }"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Exportar -->
      <div class="section">
        <div class="section-title">EXPORTAR</div>
        <button class="export-btn" @click="$emit('export-png')">&#11015; GUARDAR PNG</button>
        <button class="export-btn" style="margin-top:6px" @click="$emit('export-svg')">&#11015; GUARDAR SVG</button>
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
import { ref, computed, watch } from 'vue'
import { COLOR_SCHEMES } from '../lib/renderer.js'

const props = defineProps({
  cityName: { type: String, default: '' },
  stats: { type: Object, default: () => ({ ways: 0, nodes: 0 }) },
  settings: { type: Object, required: true },
  customColors: { type: Object, default: () => ({ cityName: '', background: '', lines: '' }) },
})

const emit = defineEmits(['change-settings', 'change-colors', 'export-png', 'export-svg'])

const collapsed = ref(false)

// Local color state (hex for input[type=color])
const localBg = ref('#050510')
const localLines = ref('#00d4ff')
const localCityName = ref('#ffffff')

const schemes = Object.values(COLOR_SCHEMES).map(s => ({ id: s.id, name: s.name, preview: s.preview }))

const activeLegend = computed(() => COLOR_SCHEMES[props.settings.colorScheme]?.legend || COLOR_SCHEMES.neon.legend)

function change(key, value) {
  emit('change-settings', { ...props.settings, [key]: value })
}

function fmtNum(n) { return n ? n.toLocaleString() : '0' }

function onBgChange(val) {
  localBg.value = val || '#050510'
  emit('change-colors', { ...props.customColors, background: val })
}

function onLinesChange(val) {
  localLines.value = val || '#00d4ff'
  emit('change-colors', { ...props.customColors, lines: val })
}

function onCityNameChange(val) {
  localCityName.value = val || '#ffffff'
  emit('change-colors', { ...props.customColors, cityName: val || 'rgba(200,224,255,0.08)' })
}
</script>

<style scoped>
.panel {
  position: absolute;
  right: 0;
  top: 50px;
  bottom: 0;
  width: 230px;
  background: var(--panel);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: row;
  z-index: 10;
  transition: width 0.25s ease;
  backdrop-filter: blur(12px);
}
.panel.collapsed { width: 28px; }

.toggle-btn {
  position: absolute;
  left: -28px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 52px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-right: none;
  color: var(--cyan);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.toggle-btn:hover { background: rgba(0,212,255,0.08); }

.panel-inner {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-city { margin-bottom: 4px; }
.city-label {
  font-size: 13px;
  color: var(--cyan);
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 4px;
  text-shadow: 0 0 12px rgba(0,212,255,0.3);
  word-break: break-word;
}
.city-stats { font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em; }
.dot-sep { margin: 0 4px; }

.divider { border: none; border-top: 1px solid var(--border); margin: 8px 0; }

.section { margin-bottom: 14px; }
.section-title {
  font-size: 9px;
  letter-spacing: 0.22em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.schemes { display: flex; flex-direction: column; gap: 5px; }
.scheme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  font-size: 11px;
  letter-spacing: 0.1em;
  border: 1px solid var(--border);
  transition: all 0.15s;
}
.scheme-btn.active { border-color: var(--cyan); color: var(--cyan); background: rgba(0,212,255,0.08); }
.scheme-swatch { width: 30px; height: 10px; border-radius: 2px; flex-shrink: 0; }

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.toggle-label { font-size: 12px; color: var(--text); }
.toggle-switch {
  width: 34px; height: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border);
  border-radius: 9px;
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.toggle-switch.on { background: rgba(0,212,255,0.15); border-color: var(--cyan); box-shadow: 0 0 8px rgba(0,212,255,0.2); }
.toggle-knob {
  position: absolute;
  top: 2px; left: 2px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--text-dim);
  transition: transform 0.2s, background 0.2s;
}
.toggle-switch.on .toggle-knob { transform: translateX(16px); background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }

/* Color pickers */
.color-rows { display: flex; flex-direction: column; gap: 8px; }
.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.color-label { font-size: 11px; color: var(--text-dim); }
.color-input-wrap { display: flex; align-items: center; gap: 4px; }
input[type="color"] {
  width: 32px;
  height: 22px;
  padding: 1px 2px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  border-radius: 2px;
}
input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
input[type="color"]::-webkit-color-swatch { border: none; border-radius: 1px; }
.reset-color {
  width: 18px; height: 18px;
  padding: 0;
  font-size: 9px;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-dim);
  display: flex; align-items: center; justify-content: center;
  line-height: 1;
}
.reset-color:hover { border-color: var(--magenta); color: var(--magenta); background: transparent; box-shadow: none; }

.legend { display: flex; flex-direction: column; gap: 5px; }
.legend-row { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-dim); }
.legend-color { width: 20px; height: 3px; border-radius: 2px; flex-shrink: 0; }

.export-btn {
  width: 100%;
  padding: 8px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-align: center;
  border: 1px solid var(--border);
  transition: all 0.18s;
}
.export-btn:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(0,212,255,0.08); box-shadow: 0 0 12px rgba(0,212,255,0.15); }

.attribution {
  margin-top: auto;
  padding-top: 12px;
  font-size: 10px;
  color: rgba(200,224,255,0.28);
  line-height: 1.7;
}
.attribution a { color: rgba(0,212,255,0.45); }
.attribution a:hover { color: var(--cyan); }
</style>
