import styled from 'styled-components'

/**
 * The touch floor.
 *
 * The ADS cell heights this skin is built on — 30px segmented cells, 32px buttons — are
 * right for a pointer and a gamble for a finger, and the phone layout used to reflow those
 * controls onto more rows without ever resizing them. Anything a finger has to hit gets
 * 44px on a coarse pointer; the desktop skin is left exactly as it was.
 */
export const TOUCH = '@media (pointer: coarse), (max-width: 600px)'

/** Joined segmented control: 30px cells inside a 1px group border (ADS §2). */
export const Segmented = styled.div`
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  background: var(--surface);

  button {
    appearance: none;
    background: none;
    border: 0;
    border-left: 1px solid var(--line);
    min-height: 30px;
    padding: 0 10px;
    font-size: var(--font-small);
    font-weight: 500;
    color: var(--dim);
    cursor: pointer;
  }

  button:first-child {
    border-left: 0;
  }

  button:hover {
    background: var(--surface-hi);
    color: var(--text);
  }

  button:disabled {
    color: var(--dim);
    opacity: 0.5;
    cursor: default;
  }

  button:disabled:hover {
    background: none;
  }

  button[aria-pressed='true'] {
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 600;
  }

  ${TOUCH} {
    button {
      min-height: 44px;
      /* Wide enough that the narrowest cell — "°C" — also clears 44 across. */
      min-width: 44px;
      padding: 0 14px;
    }
  }
`

export const Button = styled.button<{ $subtle?: boolean }>`
  appearance: none;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text);
  min-height: 32px;
  padding: 0 12px;
  font-size: var(--font-small);
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--surface-hi);
  }

  &:disabled {
    color: var(--dim);
    cursor: default;
  }

  ${(props) =>
    props.$subtle &&
    `
    border-color: transparent;
    background: none;

    &:hover:not(:disabled) { background: var(--surface-hi); }
  `}

  ${TOUCH} {
    min-height: 44px;
    padding: 0 16px;
  }
`

/** Muted inline text, used where a label sits beside its value. */
export const Dim = styled.span`
  color: var(--dim);
`
