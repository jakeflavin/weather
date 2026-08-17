/**
 * Time handling for a location that is not the viewer's.
 *
 * With `timezone=auto` Open-Meteo returns naive local ISO strings — `2026-08-17T14:00`,
 * no offset — meaning 14:00 *where the weather is*. Handing those to `new Date()` would
 * reinterpret them in the browser's zone and shift every label, so instead each stamp is
 * parsed into a pseudo-UTC instant. Every comparison and every label in the app goes
 * through here, so the whole UI stays in the location's clock.
 */

export interface Stamp {
  /** Milliseconds, in the fiction that the location's local time *is* UTC. */
  t: number
  /** The original naive ISO string. */
  iso: string
  hour: number
  minute: number
  /** `YYYY-MM-DD` in local time — the key daily rows are joined on. */
  day: string
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/

export function parseStamp(iso: string): Stamp {
  const match = ISO.exec(iso)
  if (!match) return { t: NaN, iso, hour: 0, minute: 0, day: iso.slice(0, 10) }
  const [, y, mo, d, h = '0', mi = '0'] = match
  return {
    t: Date.UTC(+y, +mo - 1, +d, +h, +mi),
    iso,
    hour: +h,
    minute: +mi,
    day: `${y}-${mo}-${d}`,
  }
}

/** All formatters read the pseudo-UTC instant back out in UTC, undoing the fiction. */
function fmt(t: number, options: Intl.DateTimeFormatOptions): string {
  if (Number.isNaN(t)) return '—'
  return new Date(t).toLocaleString(undefined, { ...options, timeZone: 'UTC' })
}

/** `14:00` or `2 PM`, following the viewer's locale. */
export function formatHour(t: number): string {
  return fmt(t, { hour: 'numeric', minute: '2-digit' })
}

/** Compact axis label: `2 PM` / `14`. */
export function formatHourShort(t: number): string {
  return fmt(t, { hour: 'numeric' })
}

export function formatWeekday(t: number): string {
  return fmt(t, { weekday: 'short' })
}

export function formatDayMonth(t: number): string {
  return fmt(t, { day: 'numeric', month: 'short' })
}

export function formatFullDate(t: number): string {
  return fmt(t, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** The location's current wall-clock time, from the forecast's UTC offset. */
export function nowAt(utcOffsetSeconds: number): number {
  return Date.now() + utcOffsetSeconds * 1000
}

/** `2h 15m ago`, for the freshness readout. */
export function sinceLabel(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}
