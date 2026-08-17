/**
 * Open-Meteo (no API key). Everything is fetched in metric with `timezone=auto`, and
 * converted at render time — so flipping units never costs a network round trip.
 *
 * @see https://open-meteo.com/en/docs
 */

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

/** Days of history pulled in alongside the forecast, so trends have a run-up. */
export const PAST_DAYS = 7
export const FORECAST_DAYS = 16

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'weather_code',
  'is_day',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'cloud_cover',
  'pressure_msl',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
] as const

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'precipitation',
  'precipitation_probability',
  'rain',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
  'is_day',
] as const

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'daylight_duration',
  'sunshine_duration',
  'uv_index_max',
  'precipitation_sum',
  'rain_sum',
  'snowfall_sum',
  'precipitation_hours',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'wind_direction_10m_dominant',
] as const

const AIR_QUALITY_FIELDS = [
  'us_aqi',
  'european_aqi',
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
] as const

type Field<T extends readonly string[]> = T[number]

export type CurrentBlock = { time: string; interval: number } & Record<
  Field<typeof CURRENT_FIELDS>,
  number
>
export type HourlyBlock = { time: string[] } & Record<
  Field<typeof HOURLY_FIELDS>,
  (number | null)[]
>
export type DailyBlock = { time: string[]; sunrise: string[]; sunset: string[] } & Record<
  Exclude<Field<typeof DAILY_FIELDS>, 'sunrise' | 'sunset'>,
  (number | null)[]
>

export interface Forecast {
  latitude: number
  longitude: number
  elevation: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
  current: CurrentBlock
  hourly: HourlyBlock
  daily: DailyBlock
}

export interface AirQuality {
  latitude: number
  longitude: number
  timezone: string
  current: { time: string } & Record<Field<typeof AIR_QUALITY_FIELDS>, number | null>
  hourly: { time: string[] } & Record<Field<typeof AIR_QUALITY_FIELDS>, (number | null)[]>
}

export interface Place {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
  admin2?: string
  timezone?: string
  elevation?: number
  population?: number
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    // Open-Meteo puts a human-readable cause in the body on 4xx.
    const reason = await res.text().catch(() => '')
    throw new Error(reason ? `${res.status}: ${reason.slice(0, 200)}` : `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function fetchForecast(lat: number, lon: number, signal?: AbortSignal): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
  })
  return getJson<Forecast>(`${FORECAST_URL}?${params}`, signal)
}

export function fetchAirQuality(lat: number, lon: number, signal?: AbortSignal): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: AIR_QUALITY_FIELDS.join(','),
    hourly: AIR_QUALITY_FIELDS.join(','),
    forecast_days: '4',
    timezone: 'auto',
  })
  return getJson<AirQuality>(`${AIR_QUALITY_URL}?${params}`, signal)
}

export async function searchPlaces(name: string, signal?: AbortSignal): Promise<Place[]> {
  const query = name.trim()
  if (query.length < 2) return []
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' })
  const json = await getJson<{ results?: Place[] }>(`${GEOCODING_URL}?${params}`, signal)
  return json.results ?? []
}

/**
 * Open-Meteo's geocoder has no reverse endpoint, so a coordinate gets a label the cheap
 * way: ask the forecast response what timezone it landed in and take the city from it
 * (`America/Denver` → `Denver`). Good enough for the geolocation case, where the point is
 * to show *something* recognisable rather than an exact administrative name.
 */
export function labelFromTimezone(timezone: string): string {
  const city = timezone.split('/').pop() ?? timezone
  return city.replace(/_/g, ' ')
}
