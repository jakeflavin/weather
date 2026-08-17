import type { ReactNode } from 'react'

/** Label, value, footnote — the atom the condition tiles are built from. */
export function Stat({
  label,
  value,
  unit,
  note,
  small = false,
  color,
}: {
  label: string
  value: ReactNode
  unit?: string
  note?: ReactNode
  small?: boolean
  /** Ties the number to its series colour where the same quantity is plotted nearby. */
  color?: string
}) {
  return (
    <div>
      <div className="stat__label">{label}</div>
      <div className={small ? 'stat__value stat__value--sm' : 'stat__value'} style={color ? { color } : undefined}>
        {value}
        {unit && <span className="stat__unit">{unit}</span>}
      </div>
      {note && <div className="stat__note">{note}</div>}
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
      <div className="meter__fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

/**
 * A headline fact in the hero: the two or three things that change what you do today,
 * lifted out of the panels so they are not buried among twenty other numbers.
 */
export function Flag({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div className="flag" style={color ? ({ '--flag': color } as React.CSSProperties) : undefined}>
      <span className="flag__label">{label}</span>
      <span className="flag__value">{value}</span>
    </div>
  )
}
