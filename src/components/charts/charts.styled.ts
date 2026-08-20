import styled from 'styled-components'

export const Chart = styled.div`
  width: 100%;

  text {
    font-family: var(--font-sans);
    font-size: 11px;
    fill: var(--dim);
  }

  .recharts-cartesian-axis-line,
  .recharts-cartesian-axis-tick-line {
    stroke: var(--line);
  }
`

/** Tooltip: an ADS overlay — raised surface, soft radius, float shadow, no hard border. */
export const Tip = styled.div`
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow-float);
  padding: 10px 12px;
  min-width: 150px;
  font-size: var(--font-small);
  font-variant-numeric: tabular-nums;
`

export const TipHead = styled.div`
  font-weight: 600;
  color: var(--text);
  font-size: var(--font-small);
  margin-bottom: 8px;
`

export const TipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;

  > span:first-of-type {
    color: var(--dim);
  }

  > span:last-of-type {
    margin-left: auto;
    color: var(--text);
    font-weight: 500;
  }
`

export const TipSwatch = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex: none;
`

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-top: 8px;
`

export const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-small);
  color: var(--dim);
`

export const LegendKey = styled.span`
  width: 12px;
  height: 2px;
  border-radius: 1px;
  flex: none;

  &[data-shape='dash'] {
    background: repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 8px);
  }

  &[data-shape='box'] {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
`
