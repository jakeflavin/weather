import { useQuery } from '@tanstack/react-query'
import { CLIMATE_YEARS, fetchAirQuality, fetchArchive } from '@/api/openMeteo'
import { fetchForecast } from '@/api/openMeteo'
import { buildNormals } from '@/lib/climate'
import type { Location } from './useLocations'

/** Open-Meteo updates hourly; refetching faster than this only burns their bandwidth. */
const FRESH_FOR = 10 * 60 * 1000

export function useForecast(location: Location) {
  return useQuery({
    queryKey: ['forecast', location.id],
    queryFn: ({ signal }) => fetchForecast(location.lat, location.lon, signal),
    staleTime: FRESH_FOR,
    refetchInterval: FRESH_FOR,
    refetchOnWindowFocus: true,
    retry: 1,
  })
}

/**
 * Air quality is a separate service and is allowed to fail on its own — the panels that
 * need it hide, and the rest of the dashboard carries on.
 */
export function useAirQuality(location: Location) {
  return useQuery({
    queryKey: ['air', location.id],
    queryFn: ({ signal }) => fetchAirQuality(location.lat, location.lon, signal),
    staleTime: FRESH_FOR,
    refetchInterval: FRESH_FOR,
    retry: 1,
  })
}

/**
 * The ten-year daily baseline for this point.
 *
 * A day's worth of staleness is generous — the average of a decade does not move — and the
 * reduction runs in `select` so the 100 KB response is turned into a small lookup once per
 * fetch rather than on every render. Like air quality, it is allowed to fail quietly: the
 * chart simply omits the baseline band.
 */
export function useClimatology(location: Location) {
  return useQuery({
    queryKey: ['climate', location.id],
    queryFn: ({ signal }) => fetchArchive(location.lat, location.lon, signal),
    select: (archive) => buildNormals(archive, CLIMATE_YEARS),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })
}
