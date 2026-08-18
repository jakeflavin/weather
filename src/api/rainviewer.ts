/**
 * RainViewer's public radar mosaic (no API key).
 *
 * The index lists frames as opaque tile-path fragments rather than timestamps you can
 * template yourself, so every frame URL has to be built from the path the API hands back.
 *
 * @see https://www.rainviewer.com/api/weather-maps-api.html
 */

const INDEX_URL = 'https://api.rainviewer.com/public/weather-maps.json'

interface RawFrame {
  time: number
  path: string
}

interface RawIndex {
  host: string
  generated: number
  radar?: { past?: RawFrame[]; nowcast?: RawFrame[] }
}

export interface Frame {
  /** Unix seconds, UTC. */
  time: number
  path: string
  /** Nowcast frames are model output, not observation, and are marked as such in the UI. */
  forecast: boolean
}

export interface RadarIndex {
  host: string
  generated: number
  radar: Frame[]
}

/** RainViewer's palettes, by their documented ids. */
export const COLOR_SCHEMES = [
  { id: 2, name: 'Universal blue' },
  { id: 4, name: 'The Weather Channel' },
  { id: 8, name: 'Dark Sky' },
  { id: 6, name: 'NEXRAD III' },
  { id: 0, name: 'Black and white' },
] as const

export async function fetchRadarIndex(signal?: AbortSignal): Promise<RadarIndex> {
  const res = await fetch(INDEX_URL, { signal })
  if (!res.ok) throw new Error(`Radar index unavailable (${res.status})`)
  const json = (await res.json()) as RawIndex

  const past = (json.radar?.past ?? []).map((frame) => ({ ...frame, forecast: false }))
  const nowcast = (json.radar?.nowcast ?? []).map((frame) => ({ ...frame, forecast: true }))

  return { host: json.host, generated: json.generated, radar: [...past, ...nowcast] }
}

/** A tile URL template for one frame, with `{z}/{x}/{y}` left for Leaflet to fill. */
export function frameTileUrl(
  index: RadarIndex,
  frame: Frame,
  options: { color: number; smooth: boolean; snow: boolean },
): string {
  const flags = `${options.smooth ? 1 : 0}_${options.snow ? 1 : 0}`
  return `${index.host}${frame.path}/512/{z}/{x}/{y}/${options.color}/${flags}.png`
}
