import styled from 'styled-components'
import { Button } from './components/controls.styled'

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

  /* The tool groups need a full row of their own here; letting them wrap beside the brand
     leaves it floating against a two-line block. */
  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 8px;
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

  @media (max-width: 600px) {
    display: none;
  }
`

export const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    width: 100%;

    ${Button} {
      margin-left: auto;
    }
  }
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
