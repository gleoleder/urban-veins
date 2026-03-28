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

export const COLOR_SCHEMES = {
  neon: {
    id: 'neon',
    name: 'NEON',
    background: '#050510',
    preview: 'linear-gradient(90deg, #ff2d6b 0%, #00d4ff 50%, #00ff9f 100%)',
    roads: {
      motorway: { solid: '#ff2d6b', glow: 'rgba(255,45,107,0.35)', width: 2.5, glowWidth: 10 },
      trunk:    { solid: '#ff6b2d', glow: 'rgba(255,107,45,0.3)',  width: 2.0, glowWidth: 8  },
      primary:  { solid: '#00d4ff', glow: 'rgba(0,212,255,0.3)',   width: 1.8, glowWidth: 8  },
      secondary:{ solid: '#00ff9f', glow: 'rgba(0,255,159,0.22)',  width: 1.3, glowWidth: 5  },
      tertiary: { solid: '#7b61ff', glow: 'rgba(123,97,255,0.18)', width: 0.9, glowWidth: 4  },
      minor:    { solid: '#1a2d5a', glow: null,                    width: 0.5, glowWidth: 0  },
    },
    legend: [
      { label: 'Autopista',   color: '#ff2d6b' },
      { label: 'Principal',   color: '#00d4ff' },
      { label: 'Secundaria',  color: '#00ff9f' },
      { label: 'Terciaria',   color: '#7b61ff' },
      { label: 'Menor',       color: '#1a2d5a' },
    ],
  },
  mono: {
    id: 'mono',
    name: 'MONO',
    background: '#080808',
    preview: 'linear-gradient(90deg, #fff 0%, #aaa 50%, #444 100%)',
    roads: {
      motorway: { solid: '#ffffff', glow: 'rgba(255,255,255,0.25)', width: 2.5, glowWidth: 7 },
      trunk:    { solid: '#e0e0e0', glow: 'rgba(224,224,224,0.18)', width: 2.0, glowWidth: 5 },
      primary:  { solid: '#bbbbbb', glow: 'rgba(187,187,187,0.15)', width: 1.8, glowWidth: 4 },
      secondary:{ solid: '#888888', glow: null,                     width: 1.3, glowWidth: 0 },
      tertiary: { solid: '#505050', glow: null,                     width: 0.9, glowWidth: 0 },
      minor:    { solid: '#222222', glow: null,                     width: 0.5, glowWidth: 0 },
    },
    legend: [
      { label: 'Autopista',  color: '#ffffff' },
      { label: 'Principal',  color: '#bbbbbb' },
      { label: 'Secundaria', color: '#888888' },
      { label: 'Terciaria', color: '#505050' },
      { label: 'Menor',     color: '#222222' },
    ],
  },
  warm: {
    id: 'warm',
    name: 'WARM',
    background: '#0c0602',
    preview: 'linear-gradient(90deg, #ff6b35 0%, #ffd23f 50%, #ffcc02 100%)',
    roads: {
      motorway: { solid: '#ff6b35', glow: 'rgba(255,107,53,0.38)', width: 2.5, glowWidth: 10 },
      trunk:    { solid: '#ff9500', glow: 'rgba(255,149,0,0.3)',   width: 2.0, glowWidth: 7  },
      primary:  { solid: '#ffd23f', glow: 'rgba(255,210,63,0.28)', width: 1.8, glowWidth: 7  },
      secondary:{ solid: '#f4a261', glow: 'rgba(244,162,97,0.2)',  width: 1.3, glowWidth: 4  },
      tertiary: { solid: '#c77c30', glow: null,                    width: 0.9, glowWidth: 0  },
      minor:    { solid: '#3a1a04', glow: null,                    width: 0.5, glowWidth: 0  },
    },
    legend: [
      { label: 'Autopista',  color: '#ff6b35' },
      { label: 'Principal',  color: '#ffd23f' },
      { label: 'Secundaria', color: '#f4a261' },
      { label: 'Terciaria',  color: '#c77c30' },
      { label: 'Menor',      color: '#3a1a04' },
    ],
  },
  cool: {
    id: 'cool',
    name: 'COOL',
    background: '#03030f',
    preview: 'linear-gradient(90deg, #4361ee 0%, #7209b7 50%, #00b4d8 100%)',
    roads: {
      motorway: { solid: '#4361ee', glow: 'rgba(67,97,238,0.38)',  width: 2.5, glowWidth: 10 },
      trunk:    { solid: '#7209b7', glow: 'rgba(114,9,183,0.35)',  width: 2.0, glowWidth: 7  },
      primary:  { solid: '#00b4d8', glow: 'rgba(0,180,216,0.3)',   width: 1.8, glowWidth: 7  },
      secondary:{ solid: '#0096c7', glow: 'rgba(0,150,199,0.22)', width: 1.3, glowWidth: 4  },
      tertiary: { solid: '#023e8a', glow: null,                    width: 0.9, glowWidth: 0  },
      minor:    { solid: '#05052a', glow: null,                    width: 0.5, glowWidth: 0  },
    },
    legend: [
      { label: 'Autopista',  color: '#4361ee' },
      { label: 'Principal',  color: '#00b4d8' },
      { label: 'Secundaria', color: '#0096c7' },
      { label: 'Terciaria',  color: '#023e8a' },
      { label: 'Menor',      color: '#05052a' },
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
    this._customBackground = null
    this._customLineColor = null

    this.panX = 0
    this.panY = 0
    this.scale = 1

    this._drag = false
    this._lastPos = null
    this._pinchDist = null

    this._bindEvents()
    this._drawEmpty()
  }

  resize(w, h) {
    this.canvas.width = w
    this.canvas.height = h
    if (this.network) {
      this._renderOffscreen()
    }
    this.draw()
  }

  setColorScheme(schemeId) {
    this.scheme = COLOR_SCHEMES[schemeId] || COLOR_SCHEMES.neon
    this._customBackground = null
    this._customLineColor = null
    if (this.network) this._renderOffscreen()
    this.draw()
  }

  setGlow(enabled) {
    this.glowEnabled = !!enabled
    if (this.network) this._renderOffscreen()
    this.draw()
  }

  setBackground(color) {
    this._customBackground = color || null
    this.draw()
  }

  setCustomLineColor(color) {
    this._customLineColor = color || null
    if (this.network) this._renderOffscreen()
    this.draw()
  }

  setNetwork(network) {
    this.network = network
    this.panX = 0
    this.panY = 0
    this.scale = 1
    this._renderOffscreen()
    this.draw()
  }

  _renderOffscreen() {
    if (!this.network) return
    const b = this.network.bounds
    const w = this.canvas.width
    const h = this.canvas.height

    this.offscreen.width = w
    this.offscreen.height = h

    const ctx = this.offCtx
    ctx.clearRect(0, 0, w, h)

    const latRange = b.maxLat - b.minLat
    const lonRange = b.maxLon - b.minLon

    const pad = 0.06
    const scaleX = (w * (1 - pad * 2)) / lonRange
    const scaleY = (h * (1 - pad * 2)) / latRange
    const s = Math.min(scaleX, scaleY)

    const renderedW = lonRange * s
    const renderedH = latRange * s
    const ox = (w - renderedW) / 2
    const oy = (h - renderedH) / 2

    const project = (lat, lon) => ({
      x: (lon - b.minLon) * s + ox,
      y: h - ((lat - b.minLat) * s + oy),
    })

    // Group ways by road type
    const groups = { motorway: [], trunk: [], primary: [], secondary: [], tertiary: [], minor: [] }
    for (const way of this.network.ways) {
      groups[classifyRoad(way.tags)].push(way)
    }

    const order = ['minor', 'tertiary', 'secondary', 'trunk', 'primary', 'motorway']

    for (const type of order) {
      const ways = groups[type]
      const style = this.scheme.roads[type]
      if (!ways.length) continue

      // Build path once
      const path = new Path2D()
      for (const way of ways) {
        const pts = way.points
        const p0 = project(pts[0].lat, pts[0].lon)
        path.moveTo(p0.x, p0.y)
        for (let i = 1; i < pts.length; i++) {
          const p = project(pts[i].lat, pts[i].lon)
          path.lineTo(p.x, p.y)
        }
      }

      // Glow pass
      if (this.glowEnabled && style.glow && style.glowWidth > 0) {
        ctx.save()
        ctx.strokeStyle = style.glow
        ctx.lineWidth = style.glowWidth
        ctx.shadowColor = style.solid
        ctx.shadowBlur = style.glowWidth * 2.5
        ctx.globalCompositeOperation = 'screen'
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke(path)
        ctx.restore()
      }

      // Solid pass
      ctx.save()
      ctx.strokeStyle = this._customLineColor || style.solid
      ctx.lineWidth = style.width
      ctx.shadowBlur = 0
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = 'source-over'
      ctx.stroke(path)
      ctx.restore()
    }
  }

  draw() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    ctx.fillStyle = this._customBackground || this.scheme.background
    ctx.fillRect(0, 0, w, h)

    if (!this.network) {
      this._drawGrid(ctx, w, h)
      return
    }

    ctx.save()
    ctx.translate(w / 2 + this.panX, h / 2 + this.panY)
    ctx.scale(this.scale, this.scale)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(this.offscreen, 0, 0)
    ctx.restore()

    this._drawScanlines(ctx, w, h)
  }

  _drawEmpty() {
    const ctx = this.ctx
    const w = this.canvas.width || window.innerWidth
    const h = this.canvas.height || window.innerHeight
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
    ctx.globalAlpha = 0.018
    ctx.fillStyle = '#000000'
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2)
    ctx.restore()
  }

  clear() {
    this.network = null
    this.panX = 0
    this.panY = 0
    this.scale = 1
    this._drawEmpty()
  }

  reset() {
    this.panX = 0
    this.panY = 0
    this.scale = 1
    this.draw()
  }

  toPNG(filename = 'urban-veins') {
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = this.canvas.width
    exportCanvas.height = this.canvas.height
    const ectx = exportCanvas.getContext('2d')

    ectx.drawImage(this.canvas, 0, 0)

    // Attribution overlay
    ectx.font = '12px monospace'
    ectx.fillStyle = 'rgba(200,224,255,0.55)'
    ectx.textAlign = 'right'
    ectx.fillText(
      '© OpenStreetMap contributors | ODbL 1.0 | urban-veins',
      exportCanvas.width - 12,
      exportCanvas.height - 10
    )

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }

  toSVG(filename = 'urban-veins') {
    if (!this.network) return
    const b = this.network.bounds
    const w = this.canvas.width
    const h = this.canvas.height

    const latRange = b.maxLat - b.minLat
    const lonRange = b.maxLon - b.minLon
    const pad = 0.06
    const scaleX = (w * (1 - pad * 2)) / lonRange
    const scaleY = (h * (1 - pad * 2)) / latRange
    const s = Math.min(scaleX, scaleY)
    const ox = (w - lonRange * s) / 2
    const oy = (h - latRange * s) / 2

    const project = (lat, lon) => ({
      x: ((lon - b.minLon) * s + ox).toFixed(2),
      y: (h - ((lat - b.minLat) * s + oy)).toFixed(2),
    })

    const groups = { motorway: [], trunk: [], primary: [], secondary: [], tertiary: [], minor: [] }
    for (const way of this.network.ways) groups[classifyRoad(way.tags)].push(way)

    const order = ['minor', 'tertiary', 'secondary', 'trunk', 'primary', 'motorway']
    let paths = ''

    for (const type of order) {
      const style = this.scheme.roads[type]
      const ways = groups[type]
      if (!ways.length) continue

      let d = ''
      for (const way of ways) {
        const pts = way.points
        const p0 = project(pts[0].lat, pts[0].lon)
        d += `M${p0.x},${p0.y}`
        for (let i = 1; i < pts.length; i++) {
          const p = project(pts[i].lat, pts[i].lon)
          d += `L${p.x},${p.y}`
        }
      }
      paths += `<path d="${d}" stroke="${style.solid}" stroke-width="${style.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n`
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>Urban Veins — ${filename}</title>
  <desc>Datos de calles © OpenStreetMap contributors | ODbL 1.0</desc>
  <rect width="${w}" height="${h}" fill="${this.scheme.background}"/>
  ${paths}
  <text x="${w - 8}" y="${h - 8}" font-family="monospace" font-size="11" fill="rgba(200,224,255,0.5)" text-anchor="end">© OpenStreetMap contributors | ODbL 1.0</text>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.download = `${filename}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  _bindEvents() {
    const c = this.canvas

    c.addEventListener('mousedown', e => {
      this._drag = true
      this._lastPos = { x: e.clientX, y: e.clientY }
      c.style.cursor = 'grabbing'
    })

    window.addEventListener('mousemove', e => {
      if (!this._drag) return
      const dx = e.clientX - this._lastPos.x
      const dy = e.clientY - this._lastPos.y
      this._lastPos = { x: e.clientX, y: e.clientY }
      this.panX += dx
      this.panY += dy
      this.draw()
    })

    window.addEventListener('mouseup', () => {
      if (this._drag) {
        this._drag = false
        c.style.cursor = 'grab'
      }
    })

    c.addEventListener('wheel', e => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      this.scale = Math.max(0.08, Math.min(100, this.scale * factor))
      this.draw()
    }, { passive: false })

    c.addEventListener('touchstart', e => {
      e.preventDefault()
      if (e.touches.length === 1) {
        this._drag = true
        this._lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      } else if (e.touches.length === 2) {
        this._pinchDist = this._touchDist(e.touches)
      }
    }, { passive: false })

    c.addEventListener('touchmove', e => {
      e.preventDefault()
      if (e.touches.length === 1 && this._drag) {
        const dx = e.touches[0].clientX - this._lastPos.x
        const dy = e.touches[0].clientY - this._lastPos.y
        this._lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        this.panX += dx
        this.panY += dy
        this.draw()
      } else if (e.touches.length === 2 && this._pinchDist) {
        const d = this._touchDist(e.touches)
        this.scale = Math.max(0.08, Math.min(100, this.scale * (d / this._pinchDist)))
        this._pinchDist = d
        this.draw()
      }
    }, { passive: false })

    c.addEventListener('touchend', () => {
      this._drag = false
      this._pinchDist = null
    })
  }

  _touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
}
