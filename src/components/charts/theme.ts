import { useEffect, useState, type ReactNode } from 'react'
import { formatFullDate, formatHour, formatHourShort, formatWeekday } from '../../lib/time'

/**
 * Chart colours are defined once, in `index.css`, and read back out here.
 *
 * Recharts writes its colours as SVG presentation attributes, where `var()` is not
 * reliably resolved, so the tokens have to be resolved to concrete values in JS. Doing it
 * this way keeps the stylesheet the single source of truth for the palette, at the cost of
 * one recompute whenever the theme flips.
 */
const TOKENS = [
  'text',
  'dim',
  'line',
  'line-strong',
  'surface',
  'surface-hi',
  'accent',
  'chart-grid',
  'night',
  's-temp',
  's-feels',
  's-precip',
  's-snow',
  's-wind',
  's-humidity',
  's-cloud',
  's-pressure',
  's-aqi',
  'l0',
  'l1',
  'l2',
  'l3',
  'l4',
  'l5',
] as const

export type ChartColors = Record<(typeof TOKENS)[number], string>

function readTokens(): ChartColors {
  const style = getComputedStyle(document.documentElement)
  const colors = {} as ChartColors
  for (const token of TOKENS) colors[token] = style.getPropertyValue(`--${token}`).trim()
  return colors
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(readTokens)

  useEffect(() => {
    // `data-theme` is written by useSettings; watching the attribute covers both the
    // manual toggle and the OS preference changing underneath 'system'.
    const observer = new MutationObserver(() => setColors(readTokens()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return colors
}

/** Level ramp shared by UV and AQI, indexed by band. */
export function levelColor(colors: ChartColors, level: number): string {
  const ramp = [colors.l0, colors.l1, colors.l2, colors.l3, colors.l4, colors.l5]
  // Clamped at both ends: only the upper bound was guarded, so a negative band indexed off
  // the front of the ramp.
  return ramp[Math.min(Math.max(level, 0), 5)] ?? colors.l0
}

/** Axis defaults, so every chart in the app shares one tick treatment. */
export function axisProps(colors: ChartColors) {
  return {
    stroke: colors.line,
    tick: { fill: colors.dim, fontSize: 11 },
    tickLine: false,
    axisLine: false,
  } as const
}

export const CHART_MARGIN = { top: 6, right: 4, bottom: 0, left: 4 }

/** Hour ticks at a readable density: every 3rd hour, and always on the hour. */
export function hourTicks(rows: { t: number }[], every = 3): number[] {
  return rows.filter((_, index) => index % every === 0).map((row) => row.t)
}

export const formatHourTick = (t: number) => formatHourShort(t)
export const formatDayTick = (t: number) => formatWeekday(t)

export const tipHourHeading = (t: number) => `${formatWeekday(t)} ${formatHour(t)}`
export const tipDayHeading = (t: number) => formatFullDate(t)

/**
 * Adapter between Recharts' tooltip callback and the row-shaped data the charts hold.
 *
 * Recharts types the payload as a readonly array of loosely-typed entries; every chart in
 * this app instead wants the one row under the cursor, typed. The cast is done once, here,
 * rather than at each of the eleven call sites.
 */
export function rowTip<T>(render: (row: T) => ReactNode) {
  return (props: { active?: boolean; payload?: readonly { payload?: unknown }[] }): ReactNode => {
    if (!props.active) return null
    const row = props.payload?.[0]?.payload as T | undefined
    return row == null ? null : render(row)
  }
}
