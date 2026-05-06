export type SegmentType = "subterranean" | "elevated" | "transition"

export const SEMINARIO_STATIONS = [
  { id: "san-joaquin", name: "San Joaquín", line: "L5", lat: -33.4994, lng: -70.6158, type: "subterranean", order: 1 },
  { id: "vicente-valdes", name: "Vicente Valdés", line: "L5/L4", lat: -33.5264, lng: -70.5968, type: "transition", order: 2 },
  { id: "trinidad", name: "Trinidad", line: "L4", lat: -33.5353, lng: -70.5887, type: "elevated", order: 3 },
  { id: "plaza-egana", name: "Plaza Egaña", line: "L4", lat: -33.4548, lng: -70.5752, type: "subterranean", order: 4 },
] as const

export const SEMINARIO_SEGMENTS = [
  { id: "sj-vv", origin: "San Joaquín", destination: "Vicente Valdés", line: "L5", type: "subterranean", direction: "ida" },
  { id: "vv-tr", origin: "Vicente Valdés", destination: "Trinidad", line: "L4", type: "transition", direction: "ida" },
  { id: "tr-pe", origin: "Trinidad", destination: "Plaza Egaña", line: "L4", type: "elevated", direction: "ida" },
  { id: "pe-vv", origin: "Plaza Egaña", destination: "Vicente Valdés", line: "L4", type: "elevated", direction: "regreso" },
  { id: "vv-sj", origin: "Vicente Valdés", destination: "San Joaquín", line: "L5", type: "subterranean", direction: "regreso" },
] as const

export type SeminarioSegmentId = typeof SEMINARIO_SEGMENTS[number]["id"]

export function getStation(name: string) {
  return SEMINARIO_STATIONS.find((station) => station.name === name)
}

export function getSegment(id: string) {
  return SEMINARIO_SEGMENTS.find((segment) => segment.id === id)
}

export function segmentLabel(id: string) {
  const segment = getSegment(id)
  if (!segment) return id
  return `${segment.origin} → ${segment.destination}`
}
