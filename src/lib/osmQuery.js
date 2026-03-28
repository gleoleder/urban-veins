const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

const HIGHWAY_FILTER = '"highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|service|living_street|pedestrian|footway|path|cycleway|track)$"'

function buildAreaQuery(areaId) {
  return `[out:json][timeout:90];
area(${areaId})->.a;
(way[${HIGHWAY_FILTER}](area.a););
out body;>;out skel qt;`
}

function buildBBoxQuery(south, west, north, east) {
  return `[out:json][timeout:90];
(way[${HIGHWAY_FILTER}](${south},${west},${north},${east}););
out body;>;out skel qt;`
}

async function postQuery(server, query, onProgress, progressStart) {
  onProgress?.(progressStart)
  const res = await fetch(server, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: query,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  onProgress?.(progressStart + 30)
  const data = await res.json()
  onProgress?.(progressStart + 40)
  return data
}

async function tryServers(query, onProgress, progressStart = 10) {
  const errors = []
  for (const server of OVERPASS_SERVERS) {
    try {
      return await postQuery(server, query, onProgress, progressStart)
    } catch (e) {
      errors.push(`${new URL(server).hostname}: ${e.message}`)
    }
  }
  throw new Error(`Servidores no disponibles:\n${errors.join('\n')}`)
}

export async function fetchRoads(areaId, bbox, onProgress) {
  const [south, north, west, east] = bbox || []

  // If it's a node type (no area in OSM), go straight to bbox
  if (!areaId && bbox) {
    return tryServers(buildBBoxQuery(south, west, north, east), onProgress, 10)
  }

  // Try area query first
  try {
    const data = await tryServers(buildAreaQuery(areaId), onProgress, 10)
    // If area query returned roads, use it
    if (data.elements && data.elements.some(e => e.type === 'way')) {
      return data
    }
  } catch (_) {
    // fall through to bbox
  }

  // Fallback: bbox query (works for any place with a bounding box)
  if (bbox) {
    onProgress?.(55)
    return tryServers(buildBBoxQuery(south, west, north, east), onProgress, 55)
  }

  throw new Error('No se pudieron obtener los datos de calles.')
}
