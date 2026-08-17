import { useQuery } from '@tanstack/react-query'
import { fetchAirQuality, fetchForecast } from '../api/openMeteo'
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
