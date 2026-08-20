import styled from 'styled-components'

/*
 * Flex, not grid, for the same reason the bento is: a trailing stat grows into the space
 * left over instead of stranding empty cells beside it.
 *
 * 120px basis so all eight condition readings fit one row from ~1130px up, and split
 * evenly (four and four, or two and two) below that. A trailing row of flex items always
 * divides the full width between them, so no row ends part-filled.
 *
 * `fixed` opts out of that: the eight condition readings use fixed column counts — 8, 4 or
 * 2, all of which divide eight exactly — which keeps every row full *and* keeps the columns
 * aligned between rows, which growing flex items do not. A row of three stretches each one
 * wider than a row of five above it, and the strip stops reading as a table.
 */
export const Stats = styled.div<{ $fixed?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;

  > * {
    flex: 1 1 120px;
    min-width: 0;
  }

  ${(props) =>
    props.$fixed &&
    `
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (min-width: 620px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    @media (min-width: 1180px) { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  `}
`

export const StatLabel = styled.div`
  font-size: var(--font-small);
  color: var(--dim);
`

export const StatValue = styled.div<{ $small?: boolean }>`
  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  ${(props) =>
    props.$small &&
    `
    font-size: 16px;
    line-height: 20px;
  `}
`

export const StatUnit = styled.span`
  font-size: 0.65em;
  font-weight: 500;
  color: var(--dim);
  margin-left: 2px;
`

/** One line always, so the meter below it never shifts relative to the stat alongside. */
export const StatNote = styled.div`
  font-size: var(--font-small);
  color: var(--dim);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const MeterTrack = styled.div`
  max-width: 148px;
  height: 4px;
  border-radius: 2px;
  background: var(--surface-hi);
  position: relative;
  margin-top: 6px;
  overflow: hidden;
`

export const MeterFill = styled.div`
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 2px;
  background: var(--accent);
`
