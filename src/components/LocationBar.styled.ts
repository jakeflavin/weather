import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);

  @media print {
    display: none;
  }
`

export const Search = styled.div`
  position: relative;
  flex: 1 1 300px;
  min-width: 240px;
  display: flex;
  align-items: center;

  /* Narrow enough that the field, Save and Locate share one row on a 390px phone. The bar
     used to take two rows and 113px of a screen whose job is to show the weather. */
  @media (max-width: 600px) {
    flex: 1 1 140px;
    min-width: 140px;
  }

  input {
    width: 100%;
    min-height: 32px;

    ${TOUCH} {
      min-height: 44px;
      /* Below 16px iOS zooms the whole page in on focus and never zooms back out. */
      font-size: 16px;
    }
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--surface);
    padding: 0 34px 0 32px;
    font-size: var(--font-body);
  }

  input::placeholder {
    color: var(--dim);
  }

  input:hover {
    background: var(--surface-hi);
  }

  input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
    background: var(--surface);
  }
`

export const SearchGlyph = styled.span`
  position: absolute;
  left: 10px;
  color: var(--dim);
  pointer-events: none;
  display: flex;
`

/** The "/" hint, which gets out of the way once the field has focus — and stays away on a
 *  device with no keyboard to press it on. */
export const SearchKbd = styled.span`
  ${TOUCH} {
    display: none;
  }

  position: absolute;
  right: 8px;
  font-size: var(--font-lozenge);
  color: var(--dim);
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 0 5px;
  pointer-events: none;

  ${Search}:focus-within & {
    display: none;
  }
`

/* Overlay elevation: shadow, not a hard border (ADS §4). */
/*
 * Capped to a readable measure rather than matched to the field. The field is wide because
 * it is the bar's primary control; a menu stretched to the same 1,400px puts a place name
 * at one edge and its coordinates at the other, with two-thirds of a screen between the
 * halves of a single row.
 */
export const Results = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-width: 520px;
  z-index: 40;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow-float);
  max-height: 320px;
  overflow-y: auto;

  li[role='option'] {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 8px 12px;
    min-height: 32px;
    cursor: pointer;
    font-size: var(--font-body);

    ${TOUCH} {
      min-height: 44px;
      align-items: center;
    }
  }

  li[data-active='true'] {
    background: var(--surface-hi);
  }
`

export const ResultMeta = styled.span`
  margin-left: auto;
  font-size: var(--font-small);
  color: var(--dim);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`

export const ResultsEmpty = styled.li`
  padding: 8px 12px;
  font-size: var(--font-small);
  color: var(--dim);
`

/** Saved places, as ADS chips. */
/*
 * The rail wraps rather than scrolls.
 *
 * It used to be a single row with its scrollbar suppressed, which meant the app invited
 * you to save eight places and could show five — with no bar, fade or arrow to say the
 * rest were there. Wrapping costs a second line on a narrow screen and shows all eight at
 * every width; the short chip labels are what make that affordable.
 */
export const Chips = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 100%;
  min-width: 0;
  flex-wrap: wrap;

  &:empty {
    display: none;
  }
`

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--surface);
  white-space: nowrap;

  button {
    appearance: none;
    border: 0;
    background: none;
    min-height: 30px;
    padding: 0 10px;
    font-size: var(--font-small);
    color: var(--dim);
    cursor: pointer;

    ${TOUCH} {
      min-height: 44px;
      padding: 0 12px;
    }
  }

  button:hover {
    color: var(--text);
  }

  &[data-current='true'] {
    border-color: var(--accent);
    background: var(--accent-dim);
  }

  &[data-current='true'] button {
    color: var(--text);
    font-weight: 600;
  }
`

/** Tighter on its left so the label and the cross read as one control. */
export const ChipRemove = styled.button`
  && {
    padding: 0 8px 0 2px;

    ${TOUCH} {
      /* A cross is the smallest thing on the bar and the only destructive one; it gets
         the full floor rather than the label's leftovers. */
      padding: 0 14px 0 8px;
      font-size: var(--font-body);
    }
  }
`
