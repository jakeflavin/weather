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
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Band>
      <Head>
        <Title>{title}</Title>
      </Head>
      <Bento>{children}</Bento>
    </Band>
  )
}
