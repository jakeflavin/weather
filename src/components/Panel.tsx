import type { ReactNode } from 'react'
import { Body, Head, Note, Tile, Title } from './Panel.styled'

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
    <Tile as="article" $wide={wide}>
      {(title || note) && (
        <Head>
          {title && <Title>{title}</Title>}
          {note && <Note>{note}</Note>}
        </Head>
      )}
      <Body>{children}</Body>
    </Tile>
  )
}
