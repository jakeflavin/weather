import styled from 'styled-components'

export const Wrap = styled.div`
  overflow-x: auto;
  max-height: 460px;
  overflow-y: auto;
`

/** The first column and the header row both stay put while the rest scrolls under them. */
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-small);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  th {
    text-align: right;
    font-weight: 600;
    color: var(--dim);
    padding: 0 0 8px 16px;
    border-bottom: 1px solid var(--line);
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 1;
  }

  th:first-child,
  td:first-child {
    text-align: left;
    padding-left: 0;
    position: sticky;
    left: 0;
    background: var(--surface);
  }

  td {
    text-align: right;
    padding: 6px 0 6px 16px;
    border-bottom: 1px solid var(--line);
    color: var(--dim);
  }

  td:first-child,
  td.strong {
    color: var(--text);
  }

  tbody tr:hover td {
    background: var(--surface-hi);
  }

  tr[data-daybreak='true'] td {
    border-top: 1px solid var(--line-strong);
  }
`
