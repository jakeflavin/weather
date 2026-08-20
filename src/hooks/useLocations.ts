import { useCallback, useEffect, useRef, useState } from 'react'
import { usePersistentState } from './usePersistentState'
import type { Place } from '@/api/openMeteo'

export interface Location {
  /** `lat,lon` rounded to ~1km — stable across the geocoder returning slightly different points. */
  id: string
  name: string
  region?: string
  country?: string
  lat: number
  lon: number
}

const FALLBACK: Location = {
  id: '40.71,-74.01',
  name: 'New York',
  region: 'New York',
  country: 'United States',
  lat: 40.7128,
  lon: -74.006,
}
const MAX_SAVED = 8

export function locationId(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`
}

export function fromPlace(place: Place): Location {
  return {
    id: locationId(place.latitude, place.longitude),
    name: place.name,
    region: place.admin1,
    country: place.country,
    lat: place.latitude,
    lon: place.longitude,
  }
}

/** `Denver, Colorado` — the region is dropped when it merely repeats the city. */
export function describe(location: Location): string {
  const parts = [location.name]
  if (location.region && !repeats(location.region, location.name)) parts.push(location.region)
  else if (location.country) parts.push(location.country)
  return parts.join(', ')
}

/**
 * A short label, for the saved rail.
 *
 * The rail is a shortcut back to somewhere you chose on purpose, so the city name is the
 * whole of what it needs; the full description rides along as the chip's tooltip. Eight
 * full descriptions do not fit the rail at any width the app supports.
 */
export function label(location: Location): string {
  return location.name
}

/**
 * Whether a region name is just the city's again.
 *
 * Geocoders return administrative suffixes — `Wellington Region`, `Nizhny Novgorod
 * Oblast`, `Capital Region` — so an equality test leaves the name printed twice. Comparing
 * with the suffix stripped catches those while still keeping `Denver, Colorado`.
 */
const SUFFIXES =
  /\s+(region|oblast|province|prefecture|county|district|state|governorate|department|municipality|metropolitan area|city)$/i

function repeats(region: string, name: string): boolean {
  const bare = region.replace(SUFFIXES, '').trim().toLowerCase()
  return bare === name.trim().toLowerCase()
}

/** A location read out of the query string, or the reason it could not be. */
type UrlResult = { location: Location } | { error: string } | null

function fromUrl(): UrlResult {
  const params = new URLSearchParams(window.location.search)
  const rawLat = params.get('lat')
  const rawLon = params.get('lon')
  // Nothing asked for: a cold open, not a broken link.
  if (!rawLat && !rawLon) return null
  // `Number(null)` is 0, which would silently place everyone in the Gulf of Guinea, so the
  // parameters have to be checked for presence before they are converted.
  if (!rawLat || !rawLon) return { error: 'It was missing a coordinate.' }
  const lat = Number(rawLat)
  const lon = Number(rawLon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    return { error: `“${rawLat}, ${rawLon}” isn’t a coordinate.` }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return { error: `${lat}, ${lon} is off the map.` }
  return {
    location: {
      id: locationId(lat, lon),
      name: params.get('name') ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      region: params.get('region') ?? undefined,
      country: params.get('country') ?? undefined,
      lat,
      lon,
    },
  }
}

/**
 * The active location, plus the short list of saved ones.
 *
 * Resolution order on first load is: a location in the URL (so a shared link always wins),
 * then the last one used, then the device's own position, then a fallback city.
 *
 * Geolocation is asked for automatically only on a *cold* open — no link, no history. A
 * shared link and a returning visitor both already know where they are going, and neither
 * should meet a permission dialog. The fallback city is shown immediately and swapped for
 * the real position when it arrives, so the page is never blocked on the prompt.
 */
export function useLocations() {
  const [saved, setSaved] = usePersistentState<Location[]>('wx:saved', [])
  const [last, setLast] = usePersistentState<Location | null>('wx:last', null)
  const initial = useRef<UrlResult>(fromUrl()).current
  const fromLink = initial && 'location' in initial ? initial.location : null
  const [current, setCurrent] = useState<Location>(() => fromLink ?? last ?? FALLBACK)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(
    initial && 'error' in initial ? initial.error : null,
  )
  /** True while showing the fallback because nothing better was known yet. */
  const [isDefault, setIsDefault] = useState(() => !fromLink && !last)

  const select = useCallback(
    (location: Location) => {
      setCurrent(location)
      setLast(location)
      setIsDefault(false)
      setGeoError(null)
      setLinkError(null)
    },
    [setLast],
  )

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('This browser has no location support.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        select({
          id: locationId(latitude, longitude),
          name: 'Current location',
          lat: latitude,
          lon: longitude,
        })
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setGeoError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied — search for a place instead.'
            : 'Could not get your location.',
        )
      },
      { timeout: 10_000, maximumAge: 300_000 },
    )
  }, [select])

  // A cold open asks for the position itself rather than waiting to be asked. Guarded by a
  // ref as well as the dependency list, because a permission prompt fired twice is worse
  // than one fired once.
  const askedForPosition = useRef(false)
  useEffect(() => {
    if (askedForPosition.current) return
    if (fromLink || last || linkError) return
    askedForPosition.current = true
    locate()
    // `last` is read once, on the first render that matters: a location saved *by* this
    // effect must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = useCallback(
    (location: Location) => {
      setSaved((list) =>
        [location, ...list.filter((item) => item.id !== location.id)].slice(0, MAX_SAVED),
      )
    },
    [setSaved],
  )

  const remove = useCallback(
    (id: string) => setSaved((list) => list.filter((item) => item.id !== id)),
    [setSaved],
  )

  const isSaved = saved.some((item) => item.id === current.id)

  // Keep the address bar in step so the page can be linked, bookmarked, or reloaded onto
  // the same place. Replace rather than push: back should leave the app, not walk the
  // history of every city looked at.
  //
  // A URL that arrived broken is left exactly as it came until the reader picks somewhere,
  // so it can still be read, copied or sent back to whoever shared it.
  useEffect(() => {
    if (linkError) return
    const params = new URLSearchParams()
    params.set('lat', current.lat.toFixed(4))
    params.set('lon', current.lon.toFixed(4))
    params.set('name', current.name)
    if (current.region) params.set('region', current.region)
    if (current.country) params.set('country', current.country)
    window.history.replaceState(null, '', `?${params}`)
  }, [current, linkError])

  return {
    current,
    select,
    saved,
    save,
    remove,
    isSaved,
    locate,
    locating,
    geoError,
    linkError,
    isDefault,
  }
}
