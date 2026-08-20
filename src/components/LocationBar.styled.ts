import styled from 'styled-components'

export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
`

export const Search = styled.div`
  position: relative;
  flex: 1 1 300px;
  min-width: 240px;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    min-height: 32px;
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

/** The "/" hint, which gets out of the way once the field has focus. */
export const SearchKbd = styled.span`
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
export const Results = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 40;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow-float);
  max-height: 320px;
  overflow-y: auto;

  button {
    display: flex;
    align-items: baseline;
    gap: 8px;
    width: 100%;
    text-align: left;
    border: 0;
    background: none;
    padding: 8px 12px;
    min-height: 32px;
    cursor: pointer;
    font-size: var(--font-body);
  }

  button:hover,
  [data-active='true'] button {
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
export const Chips = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
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
  }
`
