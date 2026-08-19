import { useCallback, useEffect, useState } from 'react'
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
  if (location.region && location.region !== location.name) parts.push(location.region)
  else if (location.country) parts.push(location.country)
  return parts.join(', ')
}

function fromUrl(): Location | null {
  const params = new URLSearchParams(window.location.search)
  const rawLat = params.get('lat')
  const rawLon = params.get('lon')
  // `Number(null)` is 0, which would silently place everyone in the Gulf of Guinea, so the
  // parameters have to be checked for presence before they are converted.
  if (!rawLat || !rawLon) return null
  const lat = Number(rawLat)
  const lon = Number(rawLon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180)
    return null
  return {
    id: locationId(lat, lon),
    name: params.get('name') ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    region: params.get('region') ?? undefined,
    country: params.get('country') ?? undefined,
    lat,
    lon,
  }
}

/**
 * The active location, plus the short list of saved ones.
 *
 * Resolution order on first load is: a location in the URL (so a shared link always wins),
 * then the last one used, then the device's own position, then a fallback. Geolocation is
 * only *asked for* when there is nothing else to show — an unprompted permission dialog on
 * a cold open is worse than a default city.
 */
export function useLocations() {
  const [saved, setSaved] = usePersistentState<Location[]>('wx:saved', [])
  const [last, setLast] = usePersistentState<Location | null>('wx:last', null)
  const [current, setCurrent] = useState<Location>(() => fromUrl() ?? last ?? FALLBACK)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  /** True while showing the fallback because nothing better was known yet. */
  const [isDefault, setIsDefault] = useState(() => !fromUrl() && !last)

  const select = useCallback(
    (location: Location) => {
      setCurrent(location)
      setLast(location)
      setIsDefault(false)
      setGeoError(null)
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
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('lat', current.lat.toFixed(4))
    params.set('lon', current.lon.toFixed(4))
    params.set('name', current.name)
    if (current.region) params.set('region', current.region)
    if (current.country) params.set('country', current.country)
    window.history.replaceState(null, '', `?${params}`)
  }, [current])

  return { current, select, saved, save, remove, isSaved, locate, locating, geoError, isDefault }
}
