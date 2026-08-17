/**
 * WMO 4677 present-weather codes, as returned by Open-Meteo.
 *
 * Each code carries a label, a coarse group used for colouring, and a glyph. The glyphs
 * are text rather than icons on purpose: this app is a printout, not a picture book, and a
 * single character keeps the dense tables aligned on the monospace grid.
 */

export type WeatherGroup = 'clear' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

export interface WeatherCode {
  label: string
  short: string
  group: WeatherGroup
  glyph: string
}

const CODES: Record<number, WeatherCode> = {
  0: { label: 'Clear sky', short: 'Clear', group: 'clear', glyph: '○' },
  1: { label: 'Mainly clear', short: 'Mainly clear', group: 'clear', glyph: '◔' },
  2: { label: 'Partly cloudy', short: 'Partly cloudy', group: 'cloud', glyph: '◑' },
  3: { label: 'Overcast', short: 'Overcast', group: 'cloud', glyph: '●' },
  45: { label: 'Fog', short: 'Fog', group: 'fog', glyph: '≡' },
  48: { label: 'Depositing rime fog', short: 'Rime fog', group: 'fog', glyph: '≣' },
  51: { label: 'Light drizzle', short: 'Lt drizzle', group: 'drizzle', glyph: '⋮' },
  53: { label: 'Moderate drizzle', short: 'Drizzle', group: 'drizzle', glyph: '⋮' },
  55: { label: 'Dense drizzle', short: 'Hvy drizzle', group: 'drizzle', glyph: '⋮' },
  56: { label: 'Light freezing drizzle', short: 'Frz drizzle', group: 'drizzle', glyph: '⋮' },
  57: { label: 'Dense freezing drizzle', short: 'Frz drizzle', group: 'drizzle', glyph: '⋮' },
  61: { label: 'Slight rain', short: 'Lt rain', group: 'rain', glyph: '↓' },
  63: { label: 'Moderate rain', short: 'Rain', group: 'rain', glyph: '↓' },
  65: { label: 'Heavy rain', short: 'Hvy rain', group: 'rain', glyph: '⇓' },
  66: { label: 'Light freezing rain', short: 'Frz rain', group: 'rain', glyph: '↓' },
  67: { label: 'Heavy freezing rain', short: 'Frz rain', group: 'rain', glyph: '⇓' },
  71: { label: 'Slight snowfall', short: 'Lt snow', group: 'snow', glyph: '✦' },
  73: { label: 'Moderate snowfall', short: 'Snow', group: 'snow', glyph: '✦' },
  75: { label: 'Heavy snowfall', short: 'Hvy snow', group: 'snow', glyph: '✦' },
  77: { label: 'Snow grains', short: 'Snow grains', group: 'snow', glyph: '·' },
  80: { label: 'Slight rain showers', short: 'Showers', group: 'rain', glyph: '↓' },
  81: { label: 'Moderate rain showers', short: 'Showers', group: 'rain', glyph: '↓' },
  82: { label: 'Violent rain showers', short: 'Hvy showers', group: 'rain', glyph: '⇓' },
  85: { label: 'Slight snow showers', short: 'Snow showers', group: 'snow', glyph: '✦' },
  86: { label: 'Heavy snow showers', short: 'Snow showers', group: 'snow', glyph: '✦' },
  95: { label: 'Thunderstorm', short: 'Storm', group: 'storm', glyph: '⚡' },
  96: { label: 'Thunderstorm with slight hail', short: 'Storm, hail', group: 'storm', glyph: '⚡' },
  99: { label: 'Thunderstorm with heavy hail', short: 'Storm, hail', group: 'storm', glyph: '⚡' },
}

const UNKNOWN: WeatherCode = { label: 'Unknown', short: 'Unknown', group: 'cloud', glyph: '?' }

export function weatherCode(code: number | null | undefined): WeatherCode {
  if (code == null) return UNKNOWN
  return CODES[code] ?? UNKNOWN
}

/** UV index bands, per WHO. */
export function uvBand(value: number | null | undefined): { label: string; level: 0 | 1 | 2 | 3 | 4 } {
  if (value == null) return { label: '—', level: 0 }
  if (value < 3) return { label: 'Low', level: 0 }
  if (value < 6) return { label: 'Moderate', level: 1 }
  if (value < 8) return { label: 'High', level: 2 }
  if (value < 11) return { label: 'Very high', level: 3 }
  return { label: 'Extreme', level: 4 }
}

/** US EPA AQI bands. */
export function aqiBand(value: number | null | undefined): { label: string; level: 0 | 1 | 2 | 3 | 4 | 5 } {
  if (value == null) return { label: '—', level: 0 }
  if (value <= 50) return { label: 'Good', level: 0 }
  if (value <= 100) return { label: 'Moderate', level: 1 }
  if (value <= 150) return { label: 'Unhealthy for sensitive groups', level: 2 }
  if (value <= 200) return { label: 'Unhealthy', level: 3 }
  if (value <= 300) return { label: 'Very unhealthy', level: 4 }
  return { label: 'Hazardous', level: 5 }
}

/** Beaufort-ish descriptor for a wind speed in km/h. */
export function windBand(kmh: number | null | undefined): string {
  if (kmh == null) return '—'
  if (kmh < 1) return 'Calm'
  if (kmh < 12) return 'Light'
  if (kmh < 29) return 'Moderate'
  if (kmh < 50) return 'Fresh'
  if (kmh < 75) return 'Strong'
  if (kmh < 103) return 'Gale'
  return 'Storm'
}
