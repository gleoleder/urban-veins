const NOMINATIM = 'https://nominatim.openstreetmap.org'

let lastRequestTime = 0
const MIN_DELAY = 1100 // Nominatim usage policy: max 1 req/sec

async function throttle() {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_DELAY) {
    await new Promise(r => setTimeout(r, MIN_DELAY - elapsed))
  }
  lastRequestTime = Date.now()
}

export async function searchCity(query) {
  await throttle()
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '8',
    addressdetails: '1',
  })

  const res = await fetch(`${NOMINATIM}/search?${params}`, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'UrbanVeins/1.0 (road network visualizer; open source)',
    },
  })

  if (!res.ok) throw new Error(`Nominatim error: HTTP ${res.status}`)
  return res.json()
}

export function placeToAreaId(osmType, osmId) {
  const id = Number(osmId)
  if (osmType === 'relation') return 3600000000 + id
  if (osmType === 'way') return 2400000000 + id
  return id
}
