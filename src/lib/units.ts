/**
 * Unit conversion and number formatting.
 *
 * The API is asked for metric and nothing else; every imperial number in the UI comes out
 * of here. Formatters return bare strings without the unit so charts can put the symbol on
 * the axis instead of repeating it on every tick.
 */

export type UnitSystem = 'metric' | 'imperial'

export interface UnitLabels {
  temp: string
  speed: string
  length: string
  precip: string
  pressure: string
  distance: string
}

export const UNIT_LABELS: Record<UnitSystem, UnitLabels> = {
  metric: { temp: '°C', speed: 'km/h', length: 'm', precip: 'mm', pressure: 'hPa', distance: 'km' },
  imperial: { temp: '°F', speed: 'mph', length: 'ft', precip: 'in', pressure: 'inHg', distance: 'mi' },
}

export function toTemp(celsius: number, system: UnitSystem): number {
  return system === 'imperial' ? celsius * 1.8 + 32 : celsius
}

/** For deltas and ranges, where the +32 offset must not apply. */
export function toTempDelta(celsius: number, system: UnitSystem): number {
  return system === 'imperial' ? celsius * 1.8 : celsius
}

export function toSpeed(kmh: number, system: UnitSystem): number {
  return system === 'imperial' ? kmh * 0.621371 : kmh
}

export function toPrecip(mm: number, system: UnitSystem): number {
  return system === 'imperial' ? mm / 25.4 : mm
}

export function toPressure(hPa: number, system: UnitSystem): number {
  return system === 'imperial' ? hPa * 0.02953 : hPa
}

export function toDistance(metres: number, system: UnitSystem): number {
  return system === 'imperial' ? metres / 1609.344 : metres / 1000
}

export function toElevation(metres: number, system: UnitSystem): number {
  return system === 'imperial' ? metres * 3.28084 : metres
}

/** Fixed-decimal formatter that renders `null`/`NaN` as an em dash rather than "NaN". */
export function num(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return '—'
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** Precipitation needs more decimals in inches than it does in millimetres. */
export function precipDigits(system: UnitSystem): number {
  return system === 'imperial' ? 2 : 1
}

export function pressureDigits(system: UnitSystem): number {
  return system === 'imperial' ? 2 : 0
}

/** Compass point for a bearing in degrees. */
export function compass(degrees: number | null | undefined): string {
  if (degrees == null || Number.isNaN(degrees)) return '—'
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return points[Math.round(degrees / 22.5) % 16]
}

/** Seconds → `13h 42m`, used for daylight and sunshine durations. */
export function duration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return '—'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}
