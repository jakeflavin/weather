import type { ReactNode } from 'react'

/**
 * A cell in the hairline grid. The rules between panels come from the grid's background
 * showing through a 1px gap, so a panel draws no border of its own.
 */
export function Panel({
  title,
  note,
  span = 4,
  flush = false,
  children,
}: {
  title?: string
  /** Right-aligned annotation in the header — a range, a unit, a timestamp. */
  note?: ReactNode
  span?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12
  /** Trims the bottom padding for panels whose content is a chart with its own axis gutter. */
  flush?: boolean
  children: ReactNode
}) {
  return (
    <section className={`panel c${span}${flush ? ' panel--flush' : ''}`}>
      {(title || note) && (
        <header className="panel__head">
          {title && <h2 className="panel__title">{title}</h2>}
          {note && <span className="panel__note">{note}</span>}
        </header>
      )}
      <div className="panel__body">{children}</div>
    </section>
  )
}
