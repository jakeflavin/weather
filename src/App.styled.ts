import styled from 'styled-components'
import { TOUCH } from './components/controls.styled'

export const Shell = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
`

export const AppBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 48px;
  padding: 6px 16px;
  padding-top: max(6px, env(safe-area-inset-top));
  background: var(--surface);
  border-bottom: 1px solid var(--line);

  /*
   * One row on a phone, not three. The range and theme controls move out of the masthead
   * below 600px (see App.tsx), which leaves the brand, the unit toggle and Refresh — and
   * those fit a 390px bar without wrapping, so the bar costs one 56px strip instead of
   * 116px of permanently sticky chrome.
   */
  @media (max-width: 600px) {
    gap: 8px;
  }

  @media print {
    display: none;
  }
`

export const Brand = styled.span`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
`

export const Spacer = styled.span`
  flex: 1;
`

export const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`

export const NoticeTitle = styled.span`
  display: block;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
`

/** Empty, loading and error states all share the band; only the title's colour differs. */
export const Notice = styled.div<{ $error?: boolean }>`
  margin: 0;
  padding: 40px 16px;
  text-align: center;
  color: var(--dim);
  font-size: var(--font-body);
  background: var(--surface);
  border-bottom: 1px solid var(--line);

  ${(props) => props.$error && `${NoticeTitle} { color: var(--danger); }`}
`

export const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  font-size: var(--font-small);
  color: var(--dim);
  background: var(--surface);
  border-top: 1px solid var(--line);

  @media print {
    display: none;
  }

  a {
    color: var(--accent);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

export const FooterSpacer = styled.span`
  flex: 1;
`

/**
 * The theme control's home on a phone. The footer is where the other set-once facts
 * already live — the data source and the keyboard shortcuts — so it reads as settings
 * rather than as a stray control.
 */
export const FooterTheme = styled.span`
  flex-basis: 100%;
  margin: 4px 0;

  ${TOUCH} {
    margin: 8px 0 4px;
  }
`
