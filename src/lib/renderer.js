// Road type classification
function classifyRoad(tags) {
  const hw = tags.highway || ''
  if (['motorway', 'motorway_link'].includes(hw)) return 'motorway'
  if (['trunk', 'trunk_link'].includes(hw)) return 'trunk'
  if (['primary', 'primary_link'].includes(hw)) return 'primary'
  if (['secondary', 'secondary_link'].includes(hw)) return 'secondary'
  if (['tertiary', 'tertiary_link', 'unclassified'].includes(hw)) return 'tertiary'
  return 'minor'
}

const ROAD_ORDER = ['minor', 'tertiary', 'secondary', 'trunk', 'primary', 'motorway']

export const COLOR_SCHEMES = {
  neon: {
    id: 'neon', name: 'NEON',
    background: '#050510',
    preview: 'linear-gradient(90deg, #ff2d6b 0%, #00d4ff 50%, #00ff9f 100%)',
    roads: {
      motorway: { solid: '#ff2d6b', glow: 'rgba(255,45,107,0.35)',  width: 1.5, glowWidth: 6 },
      trunk:    { solid: '#ff6b2d', glow: 'rgba(255,107,45,0.3)',   width: 1.2, glowWidth: 5 },
      primary:  { solid: '#00d4ff', glow: 'rgba(0,212,255,0.3)',    width: 1.1, glowWidth: 5 },
      secondary:{ solid: '#00ff9f', glow: 'rgba(0,255,159,0.22)',   width: 0.8, glowWidth: 3 },
      tertiary: { solid: '#7b61ff', glow: 'rgba(123,97,255,0.18)',  width: 0.55, glowWidth: 3 },
      minor:    { solid: '#1a2d5a', glow: null,                     width: 0.3, glowWidth: 0 },
    },
    legend: [
      { label: 'Autopista',   color: '#ff2d6b', type: 'motorway' },
      { label: 'Vía rápida',  color: '#ff6b2d', type: 'trunk'    },
      { label: 'Principal',   color: '#00d4ff', type: 'primary'  },
      { label: 'Secundaria',  color: '#00ff9f', type: 'secondary'},
      { label: 'Terciaria',   color: '#7b61ff', type: 'tertiary' },
      { label: 'Menor',       color: '#1a2d5a', type: 'minor'    },
    ],
  },
  mono: {
    id: 'mono', name: 'MONO',
    background: '#080808',
    preview: 'linear-gradient(90deg, #fff 0%, #aaa 50%, #444 100%)',
    roads: {
      motorway: { solid: '#ffffff', glow: 'rgba(255,255,255,0.25)', width: 1.5, glowWidth: 4 },
      trunk:    { solid: '#e0e0e0', glow: 'rgba(224,224,224,0.18)', width: 1.2, glowWidth: 3 },
      primary:  { solid: '#bbbbbb', glow: 'rgba(187,187,187,0.15)', width: 1.1, glowWidth: 3 },
      secondary:{ solid: '#888888', glow: null,                     width: 0.8, glowWidth: 0 },
      tertiary: { solid: '#505050', glow: null,                     width: 0.55, glowWidth: 0 },
      minor:    { solid: '#222222', glow: null,                     width: 0.3, glowWidth: 0 },
    },
    legend: [
      { label: 'Autopista',  color: '#ffffff', type: 'motorway' },
      { label: 'Vía rápida', color: '#e0e0e0', type: 'trunk'    },
      { label: 'Principal',  color: '#bbbbbb', type: 'primary'  },
      { label: 'Secundaria', color: '#888888', type: 'secondary'},
      { label: 'Terciaria',  color: '#505050', type: 'tertiary' },
      { label: 'Menor',      color: '#222222', type: 'minor'    },
    ],
  },
  warm: {
    id: 'warm', name: 'WARM',
    background: '#0c0602',
    preview: 'linear-gradient(90deg, #ff6b35 0%, #ffd23f 50%, #ffcc02 100%)',
    roads: {
      motorway: { solid: '#ff6b35', glow: 'rgba(255,107,53,0.38)', width: 1.5, glowWidth: 6 },
      trunk:    { solid: '#ff9500', glow: 'rgba(255,149,0,0.3)',   width: 1.2, glowWidth: 4 },
      primary:  { solid: '#ffd23f', glow: 'rgba(255,210,63,0.28)', width: 1.1, glowWidth: 4 },
      secondary:{ solid: '#f4a261', glow: 'rgba(244,162,97,0.2)',  width: 0.8, glowWidth: 3 },
      tertiary: { solid: '#c77c30', glow: null,                    width: 0.55, glowWidth: 0 },
      minor:    { solid: '#3a1a04', glow: null,                    width: 0.3, glowWidth: 0 },
    },
    legend: [
      { label: 'Autopista',  color: '#ff6b35', type: 'motorway' },
      { label: 'Vía rápida', color: '#ff9500', type: 'trunk'    },
      { label: 'Principal',  color: '#ffd23f', type: 'primary'  },
      { label: 'Secundaria', color: '#f4a261', type: 'secondary'},
      { label: 'Terciaria',  color: '#c77c30', type: 'tertiary' },
      { label: 'Menor',      color: '#3a1a04', type: 'minor'    },
    ],
  },
  cool: {
    id: 'cool', name: 'COOL',
    background: '#03030f',
    preview: 'linear-gradient(90deg, #4361ee 0%, #7209b7 50%, #00b4d8 100%)',
    roads: {
      motorway: { solid: '#4361ee', glow: 'rgba(67,97,238,0.38)',  width: 1.5, glowWidth: 6 },
      trunk:    { solid: '#7209b7', glow: 'rgba(114,9,183,0.35)',  width: 1.2, glowWidth: 4 },
      primary:  { solid: '#00b4d8', glow: 'rgba(0,180,216,0.3)',   width: 1.1, glowWidth: 4 },
      secondary:{ solid: '#0096c7', glow: 'rgba(0,150,199,0.22)',  width: 0.8, glowWidth: 3 },
      tertiary: { solid: '#023e8a', glow: null,                    width: 0.55, glowWidth: 0 },
      minor:    { solid: '#05052a', glow: null,                    width: 0.3, glowWidth: 0 },
    },
    legend: [
      { label: 'Autopista',  color: '#4361ee', type: 'motorway' },
      { label: 'Vía rápida', color: '#7209b7', type: 'trunk'    },
      { label: 'Principal',  color: '#00b4d8', type: 'primary'  },
      { label: 'Secundaria', color: '#0096c7', type: 'secondary'},
      { label: 'Terciaria',  color: '#023e8a', type: 'tertiary' },
      { label: 'Menor',      color: '#05052a', type: 'minor'    },
    ],
  },
}

export class NeonRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.offscreen = document.createElement('canvas')
    this.offCtx = this.offscreen.getContext('2d')

    this.network = null
    this.scheme = COLOR_SCHEMES.neon
    this.glowEnabled = true

    // DPI
    this._dpr = window.devicePixelRatio || 1
    this._lw = 0
    this._lh = 0

    // Custom colors
    this._customBackground = null
    this._customRoadColors = {}

    // Cached Path2D per type (only rebuilt on setNetwork/resize)
    this._paths = null

    // Pan / zoom
    this.panX = 0
    this.panY = 0
    this.scale = 1

    // Interaction
    this._drag = false
    this._lastPos = null
    this._pinchDist = null

    this._bindEvents()
  }

  // ── Public API ──────────────────────────────────────────────────

  resize(w, h) {
    const dpr = window.devicePixelRatio || 1
    this._dpr = dpr
    this._lw = w
    this._lh = h
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.canvas.style.width = w + 'px'
    this.canvas.style.height = h + 'px'

    if (this.network) {
      this._buildPaths()   // rebuild for new size
      this._renderOffscreen()
    }
    this.draw()
  }

  setColorScheme(schemeId) {
    this.scheme = COLOR_SCHEMES[schemeId] || COLOR_SCHEMES.neon
    this._customBackground = null
    this._customRoadColors = {}
    if (this.network && this._paths) this._renderOffscreen()
    this.draw()
  }

  setGlow(enabled) {
    this.glowEnabled = !!enabled
    if (this.network && this._paths) this._renderOffscreen()
    this.draw()
  }

  setBackground(color) {
    this._customBackground = color || null
    this.draw() // no offscreen rebuild needed
  }

  // Per-type color — fast (uses cached paths)
  setRoadColor(type, color) {
    this._customRoadColors[type] = color || null
    if (this.network && this._paths) this._renderOffscreen()
    this.draw()
  }

  setNetwork(network) {
    this.network = network
    this.panX = 0
    this.panY = 0
    this.scale = 1
    this._buildPaths()      // expensive — only here
    this._renderOffscreen()
    this.draw()
  }

  clear() {
    this.network = null
    this._paths = null
    this._customBackground = null
    this._customRoadColors = {}
    this.panX = 0; this.panY = 0; this.scale = 1
    this._drawEmpty()
  }

  reset() {
    this.panX = 0; this.panY = 0; this.scale = 1
    this.draw()
  }

  // ── Path building (expensive) ────────────────────────────────────

  _buildPaths() {
    if (!this.network) return
    const b = this.network.bounds
    const w = this._lw
    const h = this._lh

    const pad = 0.06
    const s = Math.min(
      (w * (1 - pad * 2)) / (b.maxLon - b.minLon),
      (h * (1 - pad * 2)) / (b.maxLat - b.minLat)
    )
    const ox = (w - (b.maxLon - b.minLon) * s) / 2
    const oy = (h - (b.maxLat - b.minLat) * s) / 2

    const px = (lat, lon) => ({
      x: (lon - b.minLon) * s + ox,
      y: h - ((lat - b.minLat) * s + oy),
    })

    // Group by type
    const groups = { motorway: [], trunk: [], primary: [], secondary: [], tertiary: [], minor: [] }
    for (const way of this.network.ways) groups[classifyRoad(way.tags)].push(way)

    this._paths = {}
    for (const type of ROAD_ORDER) {
      const ways = groups[type]
      if (!ways.length) { this._paths[type] = null; continue }
      const path = new Path2D()
      for (const way of ways) {
        const pts = way.points
        const p0 = px(pts[0].lat, pts[0].lon)
        path.moveTo(p0.x, p0.y)
        for (let i = 1; i < pts.length; i++) {
          const p = px(pts[i].lat, pts[i].lon)
          path.lineTo(p.x, p.y)
        }
      }
      this._paths[type] = path
    }
  }

  // ── Offscreen render (fast — uses cached paths) ─────────────────

  _renderOffscreen() {
    if (!this.network || !this._paths) return
    const dpr = this._dpr
    const w = this._lw
    const h = this._lh

    this.offscreen.width = Math.round(w * dpr)
    this.offscreen.height = Math.round(h * dpr)

    const ctx = this.offCtx
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    for (const type of ROAD_ORDER) {
      const path = this._paths[type]
      const style = this.scheme.roads[type]
      if (!path) continue

      const solidColor = this._customRoadColors[type] || style.solid

      // Glow pass
      if (this.glowEnabled && style.glowWidth > 0) {
        ctx.save()
        ctx.strokeStyle = this._customRoadColors[type]
          ? solidColor + '55'
          : (style.glow || 'transparent')
        ctx.lineWidth = style.glowWidth
        ctx.shadowColor = solidColor
        ctx.shadowBlur = style.glowWidth * 2.5
        ctx.globalCompositeOperation = 'screen'
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke(path)
        ctx.restore()
      }

      // Solid pass
      ctx.save()
      ctx.strokeStyle = solidColor
      ctx.lineWidth = style.width
      ctx.shadowBlur = 0
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = 'source-over'
      ctx.stroke(path)
      ctx.restore()
    }
  }

  // ── Main draw ───────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx
    const dpr = this._dpr
    const w = this._lw || this.canvas.width
    const h = this._lh || this.canvas.height

    // Reset transform to DPR scale (logical coordinates)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background
    ctx.fillStyle = this._customBackground || this.scheme.background
    ctx.fillRect(0, 0, w, h)

    if (!this.network) {
      this._drawGrid(ctx, w, h)
      return
    }

    // Draw offscreen with pan/zoom, scaling it to logical size
    ctx.save()
    ctx.translate(w / 2 + this.panX, h / 2 + this.panY)
    ctx.scale(this.scale, this.scale)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(this.offscreen, 0, 0, w, h)
    ctx.restore()

    this._drawScanlines(ctx, w, h)
  }

  _drawEmpty() {
    const dpr = this._dpr || 1
    const w = this._lw || this.canvas.width / dpr
    const h = this._lh || this.canvas.height / dpr
    const ctx = this.ctx
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, w, h)
    this._drawGrid(ctx, w, h)
  }

  _drawGrid(ctx, w, h) {
    const size = 50
    ctx.strokeStyle = 'rgba(0,212,255,0.04)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= w; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, h) }
    for (let y = 0; y <= h; y += size) { ctx.moveTo(0, y); ctx.lineTo(w, y) }
    ctx.stroke()
    ctx.fillStyle = 'rgba(0,212,255,0.07)'
    for (let x = 0; x <= w; x += size) {
      for (let y = 0; y <= h; y += size) {
        ctx.beginPath()
        ctx.arc(x, y, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  _drawScanlines(ctx, w, h) {
    ctx.save()
    ctx.globalAlpha = 0.016
    ctx.fillStyle = '#000'
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2)
    ctx.restore()
  }

  // ── Export ──────────────────────────────────────────────────────

  toPNG(filename = 'mapleu', cityName = '', cityNameColor = '', dedication = '', dedicationColor = '', authorColor = '') {
    const dpr = this._dpr
    const w = this._lw
    const h = this._lh
    const AUTHOR = 'Elaborado por: John Leonardo Cabrera Espíndola.'

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = this.canvas.width
    exportCanvas.height = this.canvas.height
    const ectx = exportCanvas.getContext('2d')

    ectx.drawImage(this.canvas, 0, 0)
    ectx.scale(dpr, dpr)

    if (cityName) {
      // Font size capped to fit width — prevents clipping on small screens
      const maxW = w * 0.88
      const baseFontSize = Math.max(20, Math.min(w * 0.05, 56))
      const cityText = cityName.toUpperCase()
      // Measure and scale down if needed
      ectx.font = `bold ${baseFontSize}px monospace`
      const measured = ectx.measureText(cityText).width
      const fontSize = measured > maxW ? Math.floor(baseFontSize * (maxW / measured)) : baseFontSize

      const authorSize = Math.max(7, Math.round(fontSize * 0.13))
      const dedSize = Math.max(10, Math.round(fontSize * 0.21))
      const cleanDed = dedication ? dedication.replace(/[\r\n]+/g, ' ').trim() : ''

      const dedCol    = dedicationColor || 'rgba(200,224,255,0.50)'
      const authCol   = authorColor     || 'rgba(200,224,255,0.15)'

      ectx.textAlign = 'center'

      // Author — very bottom, barely visible
      const authorY = h - 30
      ectx.font = `${authorSize}px monospace`
      ectx.fillStyle = authCol
      ectx.fillText(AUTHOR, w / 2, authorY, maxW)

      if (cleanDed) {
        const dedY = authorY - authorSize - 7
        ectx.font = `italic ${dedSize}px monospace`
        ectx.fillStyle = dedCol
        ectx.fillText(cleanDed, w / 2, dedY, maxW)

        ectx.font = `bold ${fontSize}px monospace`
        ectx.fillStyle = cityNameColor || 'rgba(200,224,255,0.55)'
        ectx.fillText(cityText, w / 2, dedY - dedSize - 10, maxW)
      } else {
        ectx.font = `bold ${fontSize}px monospace`
        ectx.fillStyle = cityNameColor || 'rgba(200,224,255,0.55)'
        ectx.fillText(cityText, w / 2, authorY - authorSize - 18, maxW)
      }
    }

    // Attribution
    ectx.font = '11px monospace'
    ectx.fillStyle = 'rgba(200,224,255,0.4)'
    ectx.textAlign = 'right'
    ectx.fillText('© OpenStreetMap contributors | ODbL 1.0', w - 10, h - 10)

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }

  toSVG(filename = 'mapleu', cityName = '', cityNameColor = '', dedication = '', dedicationColor = '', authorColor = '') {
    if (!this.network) return
    const b = this.network.bounds
    const w = this._lw
    const h = this._lh
    const AUTHOR = 'Elaborado por: John Leonardo Cabrera Espíndola.'

    const pad = 0.06
    const s = Math.min(
      (w * (1 - pad * 2)) / (b.maxLon - b.minLon),
      (h * (1 - pad * 2)) / (b.maxLat - b.minLat)
    )
    const ox = (w - (b.maxLon - b.minLon) * s) / 2
    const oy = (h - (b.maxLat - b.minLat) * s) / 2

    const toXY = (lat, lon) => ({
      x: ((lon - b.minLon) * s + ox).toFixed(2),
      y: (h - ((lat - b.minLat) * s + oy)).toFixed(2),
    })

    const groups = { motorway: [], trunk: [], primary: [], secondary: [], tertiary: [], minor: [] }
    for (const way of this.network.ways) groups[classifyRoad(way.tags)].push(way)

    // Build path data strings
    let pathElems = ''
    for (const type of ROAD_ORDER) {
      const style = this.scheme.roads[type]
      const ways = groups[type]
      if (!ways.length) continue
      const color = this._customRoadColors[type] || style.solid
      // stroke-width divided by current scale so visual thickness matches preview
      const sw = (style.width / this.scale).toFixed(3)
      let d = ''
      for (const way of ways) {
        const pts = way.points
        const p0 = toXY(pts[0].lat, pts[0].lon)
        d += `M${p0.x},${p0.y}`
        for (let i = 1; i < pts.length; i++) {
          const p = toXY(pts[i].lat, pts[i].lon)
          d += `L${p.x},${p.y}`
        }
      }
      pathElems += `    <path d="${d}" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n`
    }

    // Current pan/zoom transform — mirrors draw() logic exactly
    const tx = (w / 2 + this.panX).toFixed(3)
    const ty = (h / 2 + this.panY).toFixed(3)
    const sc = this.scale.toFixed(6)
    const txi = (-w / 2).toFixed(3)
    const tyi = (-h / 2).toFixed(3)

    const bg = this._customBackground || this.scheme.background
    const baseFontSize = Math.max(20, Math.min(w * 0.05, 56))
    const nameColor = cityNameColor || 'rgba(200,224,255,0.55)'
    const authorSize = Math.max(7, Math.round(baseFontSize * 0.13))
    const dedSize = Math.max(10, Math.round(baseFontSize * 0.21))
    const cleanDed = dedication ? dedication.replace(/[\r\n]+/g, ' ').trim() : ''
    const dedCol  = dedicationColor || 'rgba(200,224,255,0.50)'
    const authCol = authorColor     || 'rgba(200,224,255,0.15)'

    // Scale city font down if too wide (monospace ≈ 0.62em per char)
    const cityText  = cityName.toUpperCase()
    const maxTextW  = w * 0.88
    const estWidth  = baseFontSize * 0.62 * cityText.length
    const fontSize  = estWidth > maxTextW ? Math.max(14, Math.floor(baseFontSize * maxTextW / estWidth)) : baseFontSize

    const authorY = h - 14
    let cityBlock = ''
    if (cityName) {
      if (cleanDed) {
        const dedY  = authorY - authorSize - 7
        const cityY = dedY - dedSize - 10
        cityBlock = `
  <text x="${w/2}" y="${cityY}" font-family="monospace" font-size="${fontSize}" font-weight="bold" fill="${nameColor}" text-anchor="middle">${cityText}</text>
  <text x="${w/2}" y="${dedY}" font-family="monospace" font-size="${dedSize}" font-style="italic" fill="${dedCol}" text-anchor="middle">${cleanDed}</text>
  <text x="${w/2}" y="${authorY}" font-family="monospace" font-size="${authorSize}" fill="${authCol}" text-anchor="middle">${AUTHOR}</text>`
      } else {
        const cityY = authorY - authorSize - 18
        cityBlock = `
  <text x="${w/2}" y="${cityY}" font-family="monospace" font-size="${fontSize}" font-weight="bold" fill="${nameColor}" text-anchor="middle">${cityText}</text>
  <text x="${w/2}" y="${authorY}" font-family="monospace" font-size="${authorSize}" fill="${authCol}" text-anchor="middle">${AUTHOR}</text>`
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>mapLeu — ${cityName || filename}</title>
  <desc>Datos de calles © OpenStreetMap contributors | ODbL 1.0</desc>
  <defs>
    <clipPath id="vp"><rect width="${w}" height="${h}"/></clipPath>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <g clip-path="url(#vp)">
    <g transform="translate(${tx},${ty}) scale(${sc}) translate(${txi},${tyi})">
${pathElems}    </g>
  </g>${cityBlock}
  <text x="${w - 8}" y="${h - 8}" font-family="monospace" font-size="11" fill="rgba(200,224,255,0.4)" text-anchor="end">© OpenStreetMap contributors | ODbL 1.0</text>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.download = `${filename}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // ── Events ──────────────────────────────────────────────────────

  _bindEvents() {
    const c = this.canvas

    c.addEventListener('mousedown', e => {
      this._drag = true
      this._lastPos = { x: e.clientX, y: e.clientY }
      c.style.cursor = 'grabbing'
    })
    window.addEventListener('mousemove', e => {
      if (!this._drag) return
      this.panX += e.clientX - this._lastPos.x
      this.panY += e.clientY - this._lastPos.y
      this._lastPos = { x: e.clientX, y: e.clientY }
      this.draw()
    })
    window.addEventListener('mouseup', () => {
      if (this._drag) { this._drag = false; c.style.cursor = 'grab' }
    })
    c.addEventListener('wheel', e => {
      e.preventDefault()
      const f = e.deltaY < 0 ? 1.12 : 1 / 1.12
      this.scale = Math.max(0.08, Math.min(100, this.scale * f))
      this.draw()
    }, { passive: false })
    c.addEventListener('touchstart', e => {
      e.preventDefault()
      if (e.touches.length === 1) {
        this._drag = true
        this._lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      } else if (e.touches.length === 2) {
        this._pinchDist = this._td(e.touches)
      }
    }, { passive: false })
    c.addEventListener('touchmove', e => {
      e.preventDefault()
      if (e.touches.length === 1 && this._drag) {
        this.panX += e.touches[0].clientX - this._lastPos.x
        this.panY += e.touches[0].clientY - this._lastPos.y
        this._lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        this.draw()
      } else if (e.touches.length === 2 && this._pinchDist) {
        const d = this._td(e.touches)
        this.scale = Math.max(0.08, Math.min(100, this.scale * (d / this._pinchDist)))
        this._pinchDist = d
        this.draw()
      }
    }, { passive: false })
    c.addEventListener('touchend', () => { this._drag = false; this._pinchDist = null })
  }

  _td(t) {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
}
