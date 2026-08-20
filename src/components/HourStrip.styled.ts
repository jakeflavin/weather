import styled from 'styled-components'

/*
 * The hourly strip takes the width the hero would otherwise leave empty, and wraps to its
 * own line before it would squeeze the headline reading.
 */
export const Strip = styled.div`
  display: flex;
  flex: 1 1 420px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /*
   * Twelve cells never fit a phone — eight show and four sit off the right edge — and with
   * the scrollbar suppressed the only hint was a cell clipped mid-label, which reads as a
   * layout bug rather than an invitation. Below the breakpoint the strip always overflows,
   * so the fade is unconditional there and absent everywhere else.
   */
  @media (max-width: 600px) {
    mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
  }
`

export const Cell = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 46px;
  padding: 4px 6px;
  border-radius: 4px;

  &:hover {
    background: var(--surface-hi);
  }
`

export const Time = styled.span`
  font-size: var(--font-lozenge);
  color: var(--dim);
  white-space: nowrap;
`

export const CellTemp = styled.span`
  font-size: var(--font-body);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`

/** Always rendered, blank below 10%, so every cell is the same height. */
export const Precip = styled.span`
  font-size: var(--font-lozenge);
  color: var(--s-precip);
  font-variant-numeric: tabular-nums;
  min-height: 14px;
`
