<template>
  <div class="search-panel">
    <div class="search-header">
      <span class="prompt-sym">&#62;</span>
      <span class="search-title">BUSCAR CIUDAD</span>
    </div>

    <div class="input-wrap">
      <input
        ref="inputRef"
        type="search"
        v-model="query"
        @input="onInput"
        @keydown.enter.prevent="selectFocused"
        @keydown.escape="clearSuggestions"
        @keydown.down.prevent="moveFocus(1)"
        @keydown.up.prevent="moveFocus(-1)"
        placeholder="Escribe el nombre de la ciudad..."
        autocomplete="off"
        spellcheck="false"
      />
      <span class="cursor-blink" :class="{ loading }">{{ loading ? '...' : '_' }}</span>
    </div>

    <transition name="list-fade">
      <div class="suggestions" v-if="suggestions.length">
        <div
          v-for="(s, i) in suggestions"
          :key="s.place_id"
          class="suggestion"
          :class="{ focused: i === focusIdx }"
          @click="select(s)"
          @mouseenter="focusIdx = i"
        >
          <span class="s-name">{{ primaryName(s) }}</span>
          <span class="s-detail">{{ detail(s) }}</span>
          <span class="s-type">{{ s.type }}</span>
        </div>
      </div>
    </transition>

    <div class="no-results" v-if="noResults">
      Sin resultados para "{{ query }}"
    </div>

    <div class="search-footer">
      Impulsado por
      <a href="https://nominatim.openstreetmap.org" target="_blank" rel="noopener">Nominatim</a>
      y
      <a href="https://www.openstreetmap.org" target="_blank" rel="noopener">OpenStreetMap</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { searchCity } from '../lib/geocoding.js'

const emit = defineEmits(['select'])

const query = ref('')
const suggestions = ref([])
const loading = ref(false)
const didSearch = ref(false)
const focusIdx = ref(-1)
const inputRef = ref(null)

let debouncer = null

const noResults = computed(() => didSearch.value && !loading.value && suggestions.value.length === 0 && query.value.trim().length >= 2)

onMounted(() => inputRef.value?.focus())

function onInput() {
  clearTimeout(debouncer)
  focusIdx.value = -1
  didSearch.value = false
  const q = query.value.trim()
  if (q.length < 2) { suggestions.value = []; return }
  debouncer = setTimeout(doSearch, 420)
}

async function doSearch() {
  loading.value = true
  try {
    const results = await searchCity(query.value.trim())
    suggestions.value = results
      .filter(r =>
        ['city', 'town', 'village', 'municipality', 'suburb', 'quarter', 'borough', 'administrative'].includes(r.type) ||
        r.class === 'boundary' || r.class === 'place'
      )
      .slice(0, 7)
    didSearch.value = true
  } catch {
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

function primaryName(s) {
  return s.name || s.display_name.split(',')[0].trim()
}

function detail(s) {
  return s.display_name.split(',').slice(1, 3).map(p => p.trim()).join(', ')
}

function select(s) {
  emit('select', {
    displayName: s.display_name,
    shortName: primaryName(s),
    osmId: s.osm_id,
    osmType: s.osm_type,
    lat: parseFloat(s.lat),
    lon: parseFloat(s.lon),
    bbox: s.boundingbox, // [south, north, west, east]
  })
}

function selectFocused() {
  const list = suggestions.value
  if (!list.length) return
  select(list[focusIdx.value >= 0 ? focusIdx.value : 0])
}

function clearSuggestions() {
  suggestions.value = []
  didSearch.value = false
  focusIdx.value = -1
}

function moveFocus(dir) {
  if (!suggestions.value.length) return
  focusIdx.value = Math.max(0, Math.min(suggestions.value.length - 1, focusIdx.value + dir))
}
</script>

<style scoped>
.search-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  padding: clamp(16px, 4vw, 26px) clamp(14px, 4vw, 24px) 20px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  border-radius: 2px;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.prompt-sym { color: var(--cyan); font-size: 14px; }
.search-title {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--text-dim);
  text-transform: uppercase;
}

.input-wrap {
  display: flex;
  align-items: center;
  position: relative;
}

input[type="search"] {
  width: 100%;
  padding: 10px 38px 10px 14px;
  font-size: 15px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--text);
  outline: none;
  letter-spacing: 0.03em;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input[type="search"]:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 14px rgba(0,212,255,0.18);
}
input[type="search"]::-webkit-search-cancel-button { display: none; }

.cursor-blink {
  position: absolute;
  right: 12px;
  color: var(--text-dim);
  font-size: 16px;
  pointer-events: none;
  animation: blink 1.2s steps(1) infinite;
}
.cursor-blink.loading {
  color: var(--cyan);
  animation: pulse 0.7s ease-in-out infinite;
}

.suggestions {
  border: 1px solid var(--border);
  border-top: none;
  overflow-y: auto;
  max-height: 280px;
}

.suggestion {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 9px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,212,255,0.06);
  transition: background 0.12s;
}
.suggestion:last-child { border-bottom: none; }
.suggestion:hover, .suggestion.focused {
  background: rgba(0,212,255,0.07);
}

.s-name { font-size: 14px; color: var(--text); white-space: nowrap; flex-shrink: 0; }
.s-detail {
  font-size: 11px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.s-type {
  font-size: 10px;
  color: var(--cyan);
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  flex-shrink: 0;
}

.no-results {
  padding: 14px;
  font-size: 12px;
  color: var(--text-dim);
  text-align: center;
  border: 1px solid var(--border);
  border-top: none;
}

.search-footer {
  margin-top: 16px;
  font-size: 10px;
  color: rgba(200,224,255,0.22);
  text-align: center;
  letter-spacing: 0.05em;
}
.search-footer a { color: rgba(0,212,255,0.38); }
.search-footer a:hover { color: var(--cyan); }

.list-fade-enter-active, .list-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.list-fade-enter-from, .list-fade-leave-to { opacity: 0; transform: translateY(-4px); }

@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
@keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }

@media (max-width: 640px) {
  input[type="search"] { font-size: 14px; padding: 9px 34px 9px 12px; }
  .suggestion { padding: 8px 12px; }
  .s-name { font-size: 13px; }
  .suggestions { max-height: 200px; }
}
</style>
