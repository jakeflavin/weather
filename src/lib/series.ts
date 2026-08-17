/**
 * Reshapes Open-Meteo's parallel arrays into row objects the charts can consume.
 *
 * Values stay metric here — `units.ts` converts at render time. Past hours arrive with
 * `null` in the forecast-only fields (probability, UV), which is left as `null` rather
 * than zeroed so Recharts draws a gap instead of a false floor.
 */

import type { AirQuality, Forecast } from '../api/openMeteo'
import { parseStamp, type Stamp } from './time'

export interface HourRow {
  t: number
  iso: string
  day: string
  hour: number
  temp: number | null
  apparent: number | null
  dewPoint: number | null
  humidity: number | null
  precip: number | null
  precipProb: number | null
  rain: number | null
  snow: number | null
  code: number | null
  cloud: number | null
  pressure: number | null
  visibility: number | null
  wind: number | null
  gust: number | null
  windDir: number | null
  uv: number | null
  isDay: boolean
}

export interface DayRow {
  t: number
  day: string
  code: number | null
  tempMax: number | null
  tempMin: number | null
  apparentMax: number | null
  apparentMin: number | null
  sunrise: Stamp | null
  sunset: Stamp | null
  daylight: number | null
  sunshine: number | null
  uvMax: number | null
  precipSum: number | null
  rainSum: number | null
  snowSum: number | null
  precipHours: number | null
  precipProb: number | null
  windMax: number | null
  gustMax: number | null
  windDir: number | null
  /** True for days before today — the history window. */
  past: boolean
}

export interface AqiRow {
  t: number
  usAqi: number | null
  euAqi: number | null
  pm2_5: number | null
  pm10: number | null
  ozone: number | null
  no2: number | null
  so2: number | null
  co: number | null
}

const at = (values: (number | null)[] | undefined, i: number): number | null => values?.[i] ?? null

export function toHourRows(forecast: Forecast): HourRow[] {
  const { hourly } = forecast
  return hourly.time.map((iso, i) => {
    const stamp = parseStamp(iso)
    return {
      t: stamp.t,
      iso,
      day: stamp.day,
      hour: stamp.hour,
      temp: at(hourly.temperature_2m, i),
      apparent: at(hourly.apparent_temperature, i),
      dewPoint: at(hourly.dew_point_2m, i),
      humidity: at(hourly.relative_humidity_2m, i),
      precip: at(hourly.precipitation, i),
      precipProb: at(hourly.precipitation_probability, i),
      rain: at(hourly.rain, i),
      snow: at(hourly.snowfall, i),
      code: at(hourly.weather_code, i),
      cloud: at(hourly.cloud_cover, i),
      pressure: at(hourly.pressure_msl, i),
      visibility: at(hourly.visibility, i),
      wind: at(hourly.wind_speed_10m, i),
      gust: at(hourly.wind_gusts_10m, i),
      windDir: at(hourly.wind_direction_10m, i),
      uv: at(hourly.uv_index, i),
      isDay: at(hourly.is_day, i) === 1,
    }
  })
}

export function toDayRows(forecast: Forecast, today: string): DayRow[] {
  const { daily } = forecast
  return daily.time.map((iso, i) => {
    const stamp = parseStamp(iso)
    return {
      t: stamp.t,
      day: stamp.day,
      code: at(daily.weather_code, i),
      tempMax: at(daily.temperature_2m_max, i),
      tempMin: at(daily.temperature_2m_min, i),
      apparentMax: at(daily.apparent_temperature_max, i),
      apparentMin: at(daily.apparent_temperature_min, i),
      sunrise: daily.sunrise[i] ? parseStamp(daily.sunrise[i]) : null,
      sunset: daily.sunset[i] ? parseStamp(daily.sunset[i]) : null,
      daylight: at(daily.daylight_duration, i),
      sunshine: at(daily.sunshine_duration, i),
      uvMax: at(daily.uv_index_max, i),
      precipSum: at(daily.precipitation_sum, i),
      rainSum: at(daily.rain_sum, i),
      snowSum: at(daily.snowfall_sum, i),
      precipHours: at(daily.precipitation_hours, i),
      precipProb: at(daily.precipitation_probability_max, i),
      windMax: at(daily.wind_speed_10m_max, i),
      gustMax: at(daily.wind_gusts_10m_max, i),
      windDir: at(daily.wind_direction_10m_dominant, i),
      past: stamp.day < today,
    }
  })
}

export function toAqiRows(air: AirQuality | undefined): AqiRow[] {
  if (!air) return []
  const { hourly } = air
  return hourly.time.map((iso, i) => ({
    t: parseStamp(iso).t,
    usAqi: at(hourly.us_aqi, i),
    euAqi: at(hourly.european_aqi, i),
    pm2_5: at(hourly.pm2_5, i),
    pm10: at(hourly.pm10, i),
    ozone: at(hourly.ozone, i),
    no2: at(hourly.nitrogen_dioxide, i),
    so2: at(hourly.sulphur_dioxide, i),
    co: at(hourly.carbon_monoxide, i),
  }))
}

/** The `count` hours starting at the top of the hour containing `from`. */
export function windowFrom(rows: HourRow[], from: number, count: number): HourRow[] {
  const start = rows.findIndex((row) => row.t >= from - 3600_000)
  if (start < 0) return rows.slice(-count)
  return rows.slice(start, start + count)
}

/** Hours either side of `from`, for charts that show where a trend came from. */
export function windowAround(rows: HourRow[], from: number, before: number, after: number): HourRow[] {
  const index = rows.findIndex((row) => row.t >= from - 3600_000)
  if (index < 0) return rows.slice(-(before + after))
  return rows.slice(Math.max(0, index - before), index + after)
}

export interface Band {
  from: number
  to: number
}

/**
 * Contiguous runs of night, as `[from, to]` pairs — drawn behind the hourly charts so the
 * shape of a curve can be read against the day/night cycle without a second axis.
 */
export function nightBands(rows: HourRow[]): Band[] {
  const bands: Band[] = []
  let open: number | null = null
  for (const row of rows) {
    if (!row.isDay && open == null) open = row.t
    if (row.isDay && open != null) {
      bands.push({ from: open, to: row.t })
      open = null
    }
  }
  if (open != null && rows.length) bands.push({ from: open, to: rows[rows.length - 1].t })
  return bands
}

/** Min/max of a field across rows, ignoring nulls. Used to pin axis domains. */
export function extent(rows: HourRow[], key: keyof HourRow): [number, number] | null {
  let min = Infinity
  let max = -Infinity
  for (const row of rows) {
    const value = row[key]
    if (typeof value !== 'number' || Number.isNaN(value)) continue
    if (value < min) min = value
    if (value > max) max = value
  }
  return min === Infinity ? null : [min, max]
}

/** The first upcoming hour with meaningful precipitation, for the "next rain" readout. */
export function nextWetHour(rows: HourRow[], from: number): HourRow | null {
  return (
    rows.find(
      (row) => row.t >= from && ((row.precipProb ?? 0) >= 40 || (row.precip ?? 0) >= 0.2),
    ) ?? null
  )
}

/** 24h temperature change at the same hour yesterday, for the "vs yesterday" readout. */
export function changeVsYesterday(rows: HourRow[], now: number): number | null {
  const current = rows.find((row) => row.t >= now - 3600_000)
  const yesterday = rows.find((row) => row.t >= now - 3600_000 - 86_400_000)
  if (!current?.temp || yesterday?.temp == null) return null
  return current.temp - yesterday.temp
}
