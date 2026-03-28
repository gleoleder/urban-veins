const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

function buildQuery(areaId) {
  return `[out:json][timeout:90];
area(${areaId})->.a;
(
  way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|service|living_street|pedestrian|footway|path|cycleway|track)$"](area.a);
);
out body;
>;
out skel qt;`
}

export async function fetchRoads(areaId, onProgress) {
  const query = buildQuery(areaId)
  const errors = []

  for (const server of OVERPASS_SERVERS) {
    try {
      onProgress?.(10)
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: query,
      })

      if (!res.ok) {
        errors.push(`${new URL(server).hostname}: HTTP ${res.status}`)
        continue
      }

      onProgress?.(45)
      const data = await res.json()
      onProgress?.(85)
      return data
    } catch (e) {
      errors.push(`${new URL(server).hostname}: ${e.message}`)
    }
  }

  throw new Error(`Could not reach any server:\n${errors.join('\n')}`)
}
