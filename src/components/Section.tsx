import type { ReactNode } from 'react'

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
    <section className="section">
      <header className="section-head">
        <h2 className="section-title">{title}</h2>
      </header>
      <div className="bento">{children}</div>
    </section>
  )
}
