import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { Pause, Play } from 'lucide-react'
import {
  COLOR_SCHEMES,
  fetchRadarIndex,
  frameTileUrl,
  type Frame,
  type RadarIndex,
} from '@/api/rainviewer'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'
import { formatHour, formatWeekday } from '@/lib/time'
import { usePersistentState } from '@/hooks/usePersistentState'

/** CARTO's basemaps are keyless and come in a matched light/dark pair. */
const BASEMAP = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · radar <a href="https://www.rainviewer.com/">RainViewer</a>'

/**
 * The highest zoom RainViewer actually renders. Ask for z8 and it returns a placeholder
 * PNG reading "zoom level not supported" — the same image whatever palette you chose,
 * which is why a palette change appeared to do nothing once you had zoomed in.
 *
 * Leaflet's answer is `maxNativeZoom`: stop requesting new tiles past this level and
 * upscale the last real ones instead. Radar goes soft as you zoom rather than vanishing.
 * Verified by probing the tile server: z4–z7 return imagery, z8 and up do not.
 */
const MAX_NATIVE_ZOOM = 7

/** Past the native limit the overlay is upscaled, so there is little point going further. */
const MAP_MAX_ZOOM = 10
const MAP_MIN_ZOOM = 3

/** Milliseconds per frame while playing, and the pause held on the newest frame. */
const FRAME_MS = 450
const HOLD_MS = 1200

interface RadarSettings {
  color: number
  smooth: boolean
  snow: boolean
  opacity: number
}

const DEFAULTS: RadarSettings = {
  color: 2,
  smooth: true,
  snow: true,
  opacity: 0.8,
}

/**
 * Animated precipitation radar.
 *
 * Leaflet is driven imperatively rather than through a React wrapper: the animation works
 * by keeping every visited frame mounted as its own tile layer and swapping opacity between
 * them, which is the only way to avoid a white flash while the next frame's tiles load.
 * Reconciling sixteen tile layers through React on every tick would fight that.
 *
 * The module is loaded lazily — Leaflet and its CSS are a third of the bundle, and most
 * visits never scroll this far.
 */
export default function RadarPanel({
  lat,
  lon,
  place,
  /** The location's offset, so frame times read in its clock like everything else. */
  utcOffsetSeconds,
}: {
  lat: number
  lon: number
  place: string
  utcOffsetSeconds: number
}) {
  const theme = useResolvedTheme()
  const [settings, setSettings] = usePersistentState<RadarSettings>('wx:radar', DEFAULTS)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const baseRef = useRef<L.TileLayer | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  /** Frame path → its tile layer, so a revisited frame is already cached and cannot flash. */
  const layersRef = useRef(new Map<string, L.TileLayer>())
  const shownRef = useRef<string | null>(null)

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['radar-index'],
    queryFn: ({ signal }) => fetchRadarIndex(signal),
    // The mosaic advances every ten minutes; anything faster is wasted.
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  })

  const frames: Frame[] = useMemo(() => data?.radar ?? [], [data])

  // Newest observed frame is the sensible landing point: "what is happening now".
  const latestObserved = useMemo(() => {
    const last = frames.map((frame) => frame.forecast).lastIndexOf(false)
    return last < 0 ? Math.max(frames.length - 1, 0) : last
  }, [frames])

  useEffect(() => setIndex(latestObserved), [latestObserved])

  // ── map lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = L.map(container, {
      center: [lat, lon],
      zoom: 7,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      // The map sits inside a long scrolling page; a wheel that zooms instead of scrolling
      // traps the reader. Buttons, double-click and pinch all still zoom.
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    })
    mapRef.current = map

    baseRef.current = L.tileLayer(BASEMAP[theme], {
      attribution: BASEMAP_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: MAP_MAX_ZOOM,
    }).addTo(map)

    markerRef.current = L.circleMarker([lat, lon], {
      radius: 5,
      weight: 2,
      color: '#ffffff',
      fillColor: '#1868db',
      fillOpacity: 1,
    }).addTo(map)

    // The panel is flex-sized and may be laid out after the map is built.
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    observer.observe(container)

    // Captured now: by cleanup time the refs may already point elsewhere.
    const layers = layersRef.current

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      baseRef.current = null
      markerRef.current = null
      layers.clear()
      shownRef.current = null
    }
    // Built once; location and theme are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    baseRef.current?.setUrl(BASEMAP[theme])
  }, [theme])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([lat, lon], map.getZoom(), { animate: false })
    markerRef.current?.setLatLng([lat, lon])
  }, [lat, lon])

  // Palette, smoothing and layer changes invalidate every cached tile layer.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const layer of layersRef.current.values()) map.removeLayer(layer)
    layersRef.current.clear()
    shownRef.current = null
  }, [settings.color, settings.smooth, settings.snow])

  /** Mounts a frame's layer if it does not exist yet, at zero opacity. */
  const ensureLayer = useCallback(
    (frame: Frame, radarIndex: RadarIndex) => {
      const map = mapRef.current
      if (!map) return null
      const existing = layersRef.current.get(frame.path)
      if (existing) return existing
      const layer = L.tileLayer(frameTileUrl(radarIndex, frame, settings), {
        opacity: 0,
        zIndex: 10,
        maxZoom: MAP_MAX_ZOOM,
        maxNativeZoom: MAX_NATIVE_ZOOM,
        // Keep tiles for frames that have scrolled out of view, so a replay is instant.
        keepBuffer: 4,
      })
      layer.addTo(map)
      layersRef.current.set(frame.path, layer)
      return layer
    },
    [settings],
  )

  // Show the current frame, and warm the next one so playback does not stutter.
  useEffect(() => {
    if (!data || !frames.length) return
    const frame = frames[Math.min(index, frames.length - 1)]
    if (!frame) return

    const layer = ensureLayer(frame, data)
    if (!layer) return

    if (shownRef.current && shownRef.current !== frame.path) {
      layersRef.current.get(shownRef.current)?.setOpacity(0)
    }
    layer.setOpacity(settings.opacity)
    shownRef.current = frame.path

    const next = frames[index + 1]
    if (next) ensureLayer(next, data)
  }, [data, frames, index, ensureLayer, settings.opacity])

  // ── playback ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!playing || frames.length < 2) return
    const atEnd = index >= frames.length - 1
    const timer = setTimeout(
      () => setIndex((value) => (value >= frames.length - 1 ? 0 : value + 1)),
      atEnd ? HOLD_MS : FRAME_MS,
    )
    return () => clearTimeout(timer)
  }, [playing, index, frames.length])

  const update = (patch: Partial<RadarSettings>) => setSettings((value) => ({ ...value, ...patch }))

  const frame = frames[Math.min(index, frames.length - 1)]
  const frameLabel = frame
    ? `${formatWeekday(frame.time * 1000 + utcOffsetSeconds * 1000)} ${formatHour(
        frame.time * 1000 + utcOffsetSeconds * 1000,
      )}`
    : '—'

  return (
    <div className="radar">
      <div className="radar-bar">
        <button
          type="button"
          className="button radar-play"
          onClick={() => setPlaying((value) => !value)}
          disabled={frames.length < 2}
          aria-label={playing ? 'Pause animation' : 'Play animation'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="radar-timeline">
          {frames.map((item, position) => (
            <button
              type="button"
              key={item.path}
              className="radar-tick"
              data-active={position === index}
              data-forecast={item.forecast}
              onClick={() => {
                setPlaying(false)
                setIndex(position)
              }}
              aria-label={formatHour(item.time * 1000 + utcOffsetSeconds * 1000)}
              title={formatHour(item.time * 1000 + utcOffsetSeconds * 1000)}
            />
          ))}
        </div>

        <span className="radar-time">
          {frameLabel}
          {frame?.forecast && <span className="radar-badge">forecast</span>}
        </span>
      </div>

      <div
        className="radar-map"
        ref={containerRef}
        aria-label={`Precipitation radar near ${place}`}
      />

      {isPending && <p className="radar-state">Loading radar frames…</p>}
      {!isPending && !isError && frames.length === 0 && (
        <p className="radar-state">No radar frames are published right now.</p>
      )}
      {isError && (
        <p className="radar-state">
          Radar is unavailable right now.{' '}
          <button type="button" className="button is-subtle" onClick={() => refetch()}>
            Retry
          </button>
        </p>
      )}

      <div className="radar-options">
        <label className="radar-field">
          <span>Palette</span>
          <select
            value={settings.color}
            onChange={(event) => update({ color: Number(event.target.value) })}
          >
            {COLOR_SCHEMES.map((scheme) => (
              <option key={scheme.id} value={scheme.id}>
                {scheme.name}
              </option>
            ))}
          </select>
        </label>

        <label className="radar-field">
          <span>Opacity</span>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={settings.opacity}
            onChange={(event) => update({ opacity: Number(event.target.value) })}
          />
        </label>

        <label className="radar-check">
          <input
            type="checkbox"
            checked={settings.smooth}
            onChange={(event) => update({ smooth: event.target.checked })}
          />
          Smooth
        </label>

        <label className="radar-check">
          <input
            type="checkbox"
            checked={settings.snow}
            onChange={(event) => update({ snow: event.target.checked })}
          />
          Mark snow
        </label>
      </div>
    </div>
  )
}
