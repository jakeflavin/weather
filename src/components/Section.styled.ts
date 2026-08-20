import styled from 'styled-components'

/*
 * A section is one continuous raised block: its heading sits on the same surface as the
 * panels it introduces, with no rule between them. The separation between sections is the
 * sunken background showing through the gap instead.
 *
 * The earlier arrangement — heading on its own sunken strip, hairline, then the panels —
 * read as a divider that happened to have words on it, because the only thing the heading
 * touched was the band above it.
 */
export const band = `
  background: var(--surface);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-top: 12px;

  @media print {
    break-inside: avoid;
    border-color: #d0d0d0;
  }
`

export const Band = styled.section`
  ${band}
`

export const Head = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 16px 12px;

  /* A section control sits at the far end of the heading it governs. */
  > *:not(h2) {
    margin-left: auto;
  }
`

export const Title = styled.h2`
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  margin: 0;
`

export const Note = styled.span`
  font-size: var(--font-small);
  color: var(--dim);
`

/*
 * Bento.
 *
 * Wrapping flex rather than grid, deliberately. A grid of `auto-fit` tracks still strands
 * the last row — five tiles in a four-track grid leaves three empty tracks — whereas flex
 * items grow into whatever space is left, so the final row always fills. That holds at
 * every width and for any number of tiles, which is what "no empty space" actually
 * requires. The 1px gap over a `--line` background draws every divider in the layout.
 */
export const Bento = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  background: var(--line);
`

/** The same band, opened by its own summary rather than always on show. */
export const Disclosure = styled.details`
  ${band}

  > summary {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    list-style: none;
    padding: 14px 16px;
    font-size: var(--font-body);
    font-weight: 600;
    background: var(--surface);
  }

  > summary::-webkit-details-marker {
    display: none;
  }

  > summary:hover {
    background: var(--surface-hi);
  }

  > summary::before {
    content: '›';
    display: inline-block;
    color: var(--dim);
    transition: transform 0.12s ease;
  }

  &[open] > summary::before {
    transform: rotate(90deg);
  }
`

export const DisclosureNote = styled.span`
  margin-left: auto;
  font-size: var(--font-small);
  font-weight: 400;
  color: var(--dim);
`
