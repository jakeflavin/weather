import type { ReactNode } from 'react'

/**
 * A tile in a section's bento.
 *
 * There are only two widths on purpose. A tile takes one column of the auto-fitting grid,
 * and `wide` takes the whole row. Anything more expressive — a span of 5 out of 12, say —
 * reintroduces the half-empty rows that fixed column counts produce when the viewport
 * lands between breakpoints.
 */
export function Panel({
  title,
  note,
  wide = false,
  children,
}: {
  title?: string
  note?: ReactNode
  wide?: boolean
  children: ReactNode
}) {
  return (
    <article className={wide ? 'panel is-wide' : 'panel'}>
      {(title || note) && (
        <header className="panel-head">
          {title && <h3 className="panel-title">{title}</h3>}
          {note && <span className="panel-note">{note}</span>}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </article>
  )
}
