import type { ReactNode } from 'react'
import { ReferenceArea, ReferenceLine } from 'recharts'
import type { Band } from '../../lib/series'
import type { ChartColors } from './theme'

/**
 * Night shading behind an hourly chart. Rendered as `ReferenceArea`s rather than a series
 * so it sits under the data and takes no part in the tooltip.
 */
export function NightBands({ bands, colors }: { bands: Band[]; colors: ChartColors }) {
  return (
    <>
      {bands.map((band) => (
        <ReferenceArea
          key={band.from}
          x1={band.from}
          x2={band.to}
          fill={colors.night}
          fillOpacity={1}
          stroke="none"
          ifOverflow="hidden"
        />
      ))}
    </>
  )
}

/**
 * The "you are here" rule, drawn on every chart that has a time axis.
 *
 * It carries a label because an unexplained dashed line is a puzzle: the reader has to
 * infer what it marks. `ifOverflow="hidden"` keeps it from being clamped to an edge on the
 * charts whose window starts at the current hour, where drawing it would be a lie.
 */
export function NowLine({
  now,
  colors,
  yAxisId,
}: {
  now: number
  colors: ChartColors
  /** Required on the dual-axis charts; Recharts needs to know which scale to sit on. */
  yAxisId?: string
}) {
  return (
    <ReferenceLine
      x={now}
      yAxisId={yAxisId}
      stroke={colors.text}
      strokeWidth={1}
      strokeDasharray="2 2"
      ifOverflow="hidden"
      label={{ value: 'Now', position: 'top', fill: colors.dim, fontSize: 10 }}
    />
  )
}

export interface TipRow {
  label: string
  value: string
  color?: string
}

/** The shared tooltip shell — charts supply their own rows so units stay correct. */
export function Tip({ heading, rows }: { heading: string; rows: TipRow[] }) {
  return (
    <div className="tip">
      <div className="tip__head">{heading}</div>
      {rows.map((row) => (
        <div className="tip__row" key={row.label}>
          {/* The swatch keeps its space when a row has no series colour, so the labels in
              a tooltip stay in one column. */}
          <i className="tip__swatch" style={{ background: row.color ?? 'transparent' }} />
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function Legend({
  items,
}: {
  items: { label: string; color: string; shape?: 'line' | 'dash' | 'box' }[]
}) {
  return (
    <div className="legend">
      {items.map((item) => (
        <span className="legend__item" key={item.label}>
          <i
            className="legend__key"
            data-shape={item.shape ?? 'line'}
            style={{
              background: item.shape === 'dash' ? undefined : item.color,
              color: item.color,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export function ChartFrame({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div className="chart" style={{ height }}>
      {children}
    </div>
  )
}
