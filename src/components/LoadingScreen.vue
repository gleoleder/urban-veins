<template>
  <div class="loading-panel">
    <div class="city-name">{{ cityName }}</div>

    <div class="progress-track">
      <div class="progress-bar" :style="{ width: progress + '%' }">
        <div class="progress-head"></div>
      </div>
    </div>

    <div class="status-text">{{ status }}</div>

    <div class="dots">
      <span v-for="i in 6" :key="i" class="dot" :style="{ animationDelay: (i * 0.14) + 's' }"></span>
    </div>

    <div class="loading-note">
      Consultando la API Overpass de OpenStreetMap<br />
      Las ciudades grandes pueden tardar hasta 90 segundos
    </div>
  </div>
</template>

<script setup>
defineProps({
  cityName: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  status: { type: String, default: 'Loading...' },
})
</script>

<style scoped>
.loading-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  padding: 36px 32px;
  text-align: center;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.city-name {
  font-size: 20px;
  color: var(--cyan);
  letter-spacing: 0.1em;
  margin-bottom: 28px;
  text-shadow: 0 0 24px rgba(0,212,255,0.45);
  min-height: 1.4em;
}

.progress-track {
  height: 2px;
  background: rgba(0,212,255,0.1);
  margin-bottom: 18px;
  position: relative;
  overflow: visible;
}

.progress-bar {
  height: 100%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-head {
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 10px var(--cyan), 0 0 20px rgba(0,212,255,0.5);
}

.status-text {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cyan);
  animation: dotPulse 1.4s ease-in-out infinite;
}

.loading-note {
  font-size: 10px;
  color: rgba(200,224,255,0.2);
  letter-spacing: 0.04em;
  line-height: 1.7;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.15; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); box-shadow: 0 0 8px var(--cyan); }
}
</style>
