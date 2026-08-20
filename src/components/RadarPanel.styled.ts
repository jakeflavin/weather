import styled from 'styled-components'
import { Button, TOUCH } from './controls.styled'

/**
 * The play/pause control: the standard button, laid out for its icon.
 *
 * `min-width` is sized to the longer of the two labels. Without it the button is 70px
 * reading "Play" and 81px reading "Pause", and the timeline beside it — a flex item —
 * absorbs the difference, so every press shifts the whole scrubber 11px sideways just as
 * you go to use it.
 */
export const PlayButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: none;
  min-width: 84px;
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

/**
 * The scrubber.
 *
 * One control, not one per frame. The ticks used to be twelve buttons measuring 21×18px on
 * a phone — a fifth of the area a finger needs, twelve tab stops between Play and the
 * palette, and twelve list items a screen reader had to read out as bare times. They are
 * painted marks now, and a range input laid over the whole strip does the work: the full
 * width becomes the target, arrow keys come free, and it is one stop in the tab order.
 */
export const Timeline = styled.div`
  position: relative;
  flex: 1 1 200px;
  min-width: 120px;
  height: 18px;

  ${TOUCH} {
    height: 44px;
  }
`

/** The painted marks, purely decorative — the input above them carries the semantics. */
export const Ticks = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  pointer-events: none;
`

export const Tick = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  height: 18px;
  border-radius: 2px;
  background: var(--surface-hi);

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

/** Transparent, full-bleed, and the only thing here that is actually a control. */
export const Scrub = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  appearance: none;
  background: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 8px;
    height: 100%;
    background: none;
  }

  &::-moz-range-thumb {
    width: 8px;
    border: 0;
    background: none;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    border-radius: 3px;
  }

  &:disabled {
    cursor: default;
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

  /*
   * Leaflet's own chrome, brought into the design system.
   *
   * Two things had to be right here and neither was. This element *is* the
   * .leaflet-container — Leaflet adds the class to the node it is handed — so a rule
   * written as a descendant of it matched nothing at all, which is why the credit strip
   * and the zoom buttons still rendered in Leaflet's Helvetica. And Leaflet's stylesheet
   * is imported into this same lazy chunk, so a single-class selector only ties with it:
   * the attribution kept its own rgba(255,255,255,0.8), invisible against a white surface
   * and a near-white slab carrying 2.7:1 grey text against a dark one.
   *
   * A doubled ampersand fixes both: it repeats this component's own class, which
   * addresses the container itself and outranks anything Leaflet ships.
   */
  && {
    font-family: var(--font-sans);
    background: var(--surface-hi);
  }

  && .leaflet-bar a {
    background: var(--surface);
    color: var(--text);
    border-bottom-color: var(--line);
  }

  && .leaflet-bar a:hover {
    background: var(--surface-hi);
    color: var(--text);
  }

  /* Leaflet's zoom buttons are 30px square. On a map that deliberately ignores the wheel,
     they are how you zoom, so they get the touch floor like everything else. */
  ${TOUCH} {
    && .leaflet-bar a {
      width: 44px;
      height: 44px;
      line-height: 44px;
      font-size: 20px;
    }
  }

  && .leaflet-control-attribution {
    background: var(--surface);
    color: var(--dim);
    font-family: var(--font-sans);
    font-size: var(--font-lozenge);
  }

  && .leaflet-control-attribution a {
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

    ${TOUCH} {
      min-height: 44px;
      /* Below 16px iOS zooms the page in when the picker opens. */
      font-size: 16px;
      padding: 0 10px;
    }
  }

  input[type='range'] {
    width: 96px;
    accent-color: var(--accent);

    ${TOUCH} {
      width: 140px;
      height: 44px;
    }
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

  /* The label is part of the target, so the whole row gets the floor rather than the
     13×13 box alone. */
  ${TOUCH} {
    min-height: 44px;
    padding-right: 4px;

    input {
      width: 20px;
      height: 20px;
    }
  }
`
