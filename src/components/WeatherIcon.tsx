import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { weatherCode, type WeatherGroup } from '@/lib/weatherCode'

/**
 * The sky, as a glyph.
 *
 * Icons come from lucide rather than being hand-drawn: it already carries the whole
 * weather family in one consistent stroke weight, which is the part that is tedious to get
 * right by hand. Clear and partly-cloudy have night variants — a crescent instead of a
 * sun — because "clear" at 2am should not read as a sunny hour in the hourly table.
 */
const BY_GROUP: Record<WeatherGroup, { day: LucideIcon; night: LucideIcon }> = {
  clear: { day: Sun, night: Moon },
  cloud: { day: CloudSun, night: CloudMoon },
  fog: { day: CloudFog, night: CloudFog },
  drizzle: { day: CloudDrizzle, night: CloudDrizzle },
  rain: { day: CloudRain, night: CloudRain },
  snow: { day: CloudSnow, night: CloudSnow },
  storm: { day: CloudLightning, night: CloudLightning },
}

/** Overcast is fully covered, so it loses the sun the other cloud codes keep. */
const OVERCAST = 3

/**
 * Colour follows the data palette: the same hue the quantity gets in the charts, so a rainy
 * day in the list and a precipitation spike in the chart are visibly the same fact.
 */
const COLOR: Record<WeatherGroup, string> = {
  clear: 'var(--s-pressure)',
  cloud: 'var(--s-cloud)',
  fog: 'var(--s-cloud)',
  drizzle: 'var(--s-precip)',
  rain: 'var(--s-precip)',
  snow: 'var(--s-snow)',
  storm: 'var(--warn)',
}

export function WeatherIcon({
  code,
  isDay = true,
  size = 16,
  muted = false,
}: {
  code: number | null | undefined
  isDay?: boolean
  size?: number
  /** Drops the palette colour, for places where colour would be noise. */
  muted?: boolean
}) {
  const meta = weatherCode(code)
  const Icon = code === OVERCAST ? Cloud : BY_GROUP[meta.group][isDay ? 'day' : 'night']
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
      color={muted ? 'currentColor' : COLOR[meta.group]}
      style={{ flex: 'none' }}
    />
  )
}
