import styled from 'styled-components'

export const Tile = styled.div<{ $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  /* Grow to fill the row, never shrink below a readable chart width. */
  flex: 1 1 320px;
  min-width: 0;
  padding: 16px;
  background: var(--surface);

  @media print {
    break-inside: avoid;
  }

  ${(props) => props.$wide && 'flex-basis: 100%;'}
`

export const Head = styled.header`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`

export const Title = styled.h3`
  font-size: var(--font-small);
  font-weight: 600;
  color: var(--dim);
  margin: 0;
`

export const Note = styled.span`
  font-size: var(--font-small);
  color: var(--dim);
  margin-left: auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;

  /* At 320px "2h observed · nowcast where available" is 218px of unbreakable text in a
     288px header that is already holding a title. It takes a second line instead. */
  @media (max-width: 480px) {
    white-space: normal;
    text-align: right;
  }
`

export const Body = styled.div`
  flex: 1;
  min-height: 0;
`
