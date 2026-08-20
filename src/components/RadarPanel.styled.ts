import styled from 'styled-components'
import { Button } from './controls.styled'

/** The play/pause control: the standard button, laid out for its icon. */
export const PlayButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
`

export const Radar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

/** One tick per frame: a scrubber that also shows how much history there is. */
export const Timeline = styled.div`
  display: flex;
  align-items: stretch;
  gap: 2px;
  flex: 1 1 200px;
  min-width: 120px;
  height: 18px;
`

export const Tick = styled.button`
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  border-radius: 2px;
  padding: 0;
  background: var(--surface-hi);
  cursor: pointer;

  &:hover {
    background: var(--line-strong);
  }

  &[data-active='true'] {
    background: var(--accent);
  }

  /* Nowcast frames are model output; the stripe keeps them from reading as observation. */
  &[data-forecast='true'] {
    background: repeating-linear-gradient(45deg, var(--surface-hi) 0 3px, transparent 3px 6px);
    box-shadow: inset 0 0 0 1px var(--line);
  }

  &[data-forecast='true'][data-active='true'] {
    background: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
`

export const Time = styled.span`
  font-size: var(--font-small);
  color: var(--dim);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
`

export const Badge = styled.span`
  border-radius: 2px;
  padding: 1px 6px;
  font-size: var(--font-lozenge);
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
`

export const MapBox = styled.div`
  height: 440px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--surface-hi);
  /* Leaflet panes sit above the page otherwise and cover the sticky app bar. */
  z-index: 0;
  isolation: isolate;

  @media (max-width: 600px) {
    height: 300px;
  }

  /* Leaflet's own chrome, brought into the design system. */
  .leaflet-container {
    font-family: var(--font-sans);
    background: var(--surface-hi);
  }

  .leaflet-bar a {
    background: var(--surface);
    color: var(--text);
    border-bottom-color: var(--line);
  }

  .leaflet-bar a:hover {
    background: var(--surface-hi);
    color: var(--text);
  }

  .leaflet-control-attribution {
    background: var(--surface);
    color: var(--dim);
    font-size: var(--font-lozenge);
  }

  .leaflet-control-attribution a {
    color: var(--accent);
  }
`

export const State = styled.p`
  margin: 0;
  font-size: var(--font-small);
  color: var(--dim);
`

export const Options = styled.div`
  display: flex;
  align-items: center;
  gap: 10px 20px;
  flex-wrap: wrap;
`

export const Field = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-small);
  color: var(--dim);

  select {
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--surface);
    color: var(--text);
    min-height: 30px;
    padding: 0 8px;
    font-size: var(--font-small);
  }

  input[type='range'] {
    width: 96px;
    accent-color: var(--accent);
  }
`

export const Check = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-small);
  color: var(--dim);
  cursor: pointer;

  input {
    accent-color: var(--accent);
  }
`
