import type { ReactNode } from 'react'

/** Label, big number, and an optional footnote — the atom the metric strip is built from. */
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
  color?: string
}) {
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className={`stat__value${small ? ' stat__value--sm' : ''}`} style={color ? { color } : undefined}>
        {value}
        {unit && <span className="unit">{unit}</span>}
      </span>
      {note && <span className="stat__note">{note}</span>}
    </div>
  )
}

/**
 * A hairline level bar. `value` is a 0–1 fraction; anything outside is clamped, so an AQI
 * off the top of its scale still renders as a full bar rather than overflowing.
 */
export function Meter({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="meter">
      <div className="meter__fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}
