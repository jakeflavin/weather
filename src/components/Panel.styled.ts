import styled from 'styled-components'

export const Tile = styled.div<{ $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  /* Grow to fill the row, never shrink below a readable chart width. */
  flex: 1 1 320px;
  min-width: 0;
  padding: 16px;
  background: var(--surface);

  ${(props) => props.$wide && 'flex-basis: 100%;'}
`

export const Head = styled.header`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
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
`

export const Body = styled.div`
  flex: 1;
  min-height: 0;
`
