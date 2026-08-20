import styled from 'styled-components'

/*
 * Capped so a 23-row list does not stretch its row and leave the panel beside it half
 * empty; the daily-range chart above already carries the whole window at a glance.
 */
export const Days = styled.div`
  max-height: 330px;
  overflow-y: auto;
`

export const Name = styled.span``

/*
 * Seven columns that can actually shrink.
 *
 * These used to be fixed tracks adding up to 428px inside a panel that is only that wide
 * above about 940px of viewport — so between 660 and 900 the high temperature and the
 * whole precipitation column walked off the panel's right edge with nothing to say they
 * had. The two text columns now yield, and the compact layout starts at 760 rather than
 * 600, which covers the width the fixed tracks could never reach.
 */
export const Day = styled.div`
  display: grid;
  grid-template-columns: 62px 20px minmax(0, 1fr) 34px minmax(56px, 1.3fr) 34px 56px;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  font-size: var(--font-small);
  font-variant-numeric: tabular-nums;

  &:last-child {
    border-bottom: 0;
  }

  &[data-past='true'] {
    opacity: 0.55;
  }

  &[data-today='true'] ${Name} {
    font-weight: 600;
  }

  @media (max-width: 760px) {
    grid-template-columns: 56px 20px 30px minmax(50px, 1fr) 30px 50px;
    gap: 8px;
  }
`

export const Glyph = styled.span`
  color: var(--dim);
  text-align: center;
`

export const Cond = styled.span`
  color: var(--dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 760px) {
    display: none;
  }
`

export const Low = styled.span`
  color: var(--dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
`

export const High = styled.span`
  text-align: right;
`

/** One shared scale across every row, so the bars are comparable down the column. */
export const Range = styled.div`
  position: relative;
  height: 6px;
  border-radius: 3px;
  background: var(--surface-hi);
`

export const RangeSpan = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--s-precip), var(--s-temp));
`

export const RangeNow = styled.div`
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  border-radius: 1px;
  background: var(--text);
`

export const Precip = styled.span`
  text-align: right;
  color: var(--s-precip);

  &[data-zero='true'] {
    color: var(--dim);
  }
`
