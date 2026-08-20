import styled from 'styled-components'

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
`

/** Muted inline text, used where a label sits beside its value. */
export const Dim = styled.span`
  color: var(--dim);
`
