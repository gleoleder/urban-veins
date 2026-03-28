export class RoadNetwork {
  constructor() {
    this.nodes = new Map()
    this.ways = []
    this.bounds = {
      minLat: Infinity, maxLat: -Infinity,
      minLon: Infinity, maxLon: -Infinity,
    }
  }

  static fromOSMResponse(data) {
    const net = new RoadNetwork()

    for (const el of data.elements) {
      if (el.type === 'node') {
        net.nodes.set(el.id, { lat: el.lat, lon: el.lon })
        if (el.lat < net.bounds.minLat) net.bounds.minLat = el.lat
        if (el.lat > net.bounds.maxLat) net.bounds.maxLat = el.lat
        if (el.lon < net.bounds.minLon) net.bounds.minLon = el.lon
        if (el.lon > net.bounds.maxLon) net.bounds.maxLon = el.lon
      }
    }

    for (const el of data.elements) {
      if (el.type === 'way' && el.nodes?.length >= 2) {
        const pts = el.nodes.map(id => net.nodes.get(id)).filter(Boolean)
        if (pts.length >= 2) {
          net.ways.push({ points: pts, tags: el.tags || {}, id: el.id })
        }
      }
    }

    return net
  }

  getCenter() {
    return {
      lat: (this.bounds.minLat + this.bounds.maxLat) / 2,
      lon: (this.bounds.minLon + this.bounds.maxLon) / 2,
    }
  }

  get segmentCount() {
    return this.ways.reduce((sum, w) => sum + w.points.length - 1, 0)
  }
}
