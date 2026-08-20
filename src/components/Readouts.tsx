import type { ReactNode } from 'react'
import { FlagLabel, FlagRow, FlagValue } from './Hero.styled'
import { Navigation } from 'lucide-react'

/** Label, value, footnote — the atom the condition tiles are built from. */
export function Stat({
  label,
  value,
  unit,
  note,
  meter,
  small = false,
  color,
}: {
  label: string
  value: ReactNode
  unit?: string
  note?: ReactNode
  /**
   * A level bar, as its own slot rather than nested in `note`. Kept separate so a note that
   * runs long cannot push the bar down and misalign it against the stat beside it — the
   * note clamps to one line, and the bar always sits at the same offset.
   */
  meter?: ReactNode
  small?: boolean
  /** Ties the number to its series colour where the same quantity is plotted nearby. */
  color?: string
}) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div
        className={small ? 'stat-value is-sm' : 'stat-value'}
        style={color ? { color } : undefined}
      >
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {note && <div className="stat-note">{note}</div>}
      {meter}
    </div>
  )
}

/**
 * A level bar. `value` is a 0–1 fraction; anything outside is clamped, so a reading off the
 * top of its scale still renders as a full bar rather than overflowing.
 */
export function Meter({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="meter">
      <div className="meter-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

/**
 * A headline fact in the hero: the two or three things that change what you do today,
 * lifted out of the panels so they are not buried among twenty other numbers.
 */
export function Flag({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <FlagRow style={color ? ({ '--flag': color } as React.CSSProperties) : undefined}>
      <FlagLabel>{label}</FlagLabel>
      <FlagValue>{value}</FlagValue>
    </FlagRow>
  )
}

/**
 * A compass arrow for a wind bearing.
 *
 * Open-Meteo reports the direction wind blows *from*, so the arrow is turned to point the
 * way the air is travelling — 180° off the reported bearing, which is what a wind barb on
 * a chart does and what anyone reading it expects.
 */
export function WindArrow({
  degrees,
  size = 14,
}: {
  degrees: number | null | undefined
  size?: number
}) {
  if (degrees == null || Number.isNaN(degrees)) return null
  return (
    <Navigation
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
      style={{ transform: `rotate(${degrees + 180}deg)`, flex: 'none', verticalAlign: '-2px' }}
    />
  )
}
