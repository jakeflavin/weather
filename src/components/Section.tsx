import type { ReactNode } from 'react'
import { Band, Bento, Head, Title } from './Section.styled'

/**
 * A band of the page: a sentence-case heading on the sunken background, then a bento of
 * panels on raised surfaces.
 *
 * Sections are what give the dashboard its hierarchy. Without them every panel is a
 * sibling of every other and there is nowhere for the eye to start; with them the page
 * reads as four or five questions, each answered by a small group of charts.
 */
export function Section({
  title,
  action,
  children,
}: {
  title: string
  /**
   * A control that governs this section, sat in its heading rather than the masthead.
   * The phone layout uses it for the hourly range: a control belongs next to the thing it
   * changes, and the masthead has no room to spare on a 390px screen.
   */
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Band>
      <Head>
        <Title>{title}</Title>
        {action}
      </Head>
      <Bento>{children}</Bento>
    </Band>
  )
}
