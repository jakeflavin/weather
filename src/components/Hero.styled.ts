import styled from 'styled-components'

/*
 * The answer to "what is it like out there", at the top, at display size, with nothing
 * competing. Everything below is detail in support of this block — that ordering is the
 * page's hierarchy, so the hero deliberately gets more air than any panel.
 */
export const Hero = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 32px;
  padding: 20px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);

  @media (max-width: 600px) {
    gap: 12px 24px;
    padding: 20px 16px;
  }
`

export const Place = styled.div`
  min-width: 200px;
`

export const Name = styled.div`
  font-size: 24px;
  line-height: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
`

export const Meta = styled.div`
  font-size: var(--font-small);
  color: var(--dim);
  margin-top: 2px;
`

export const Temp = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  sup {
    font-size: 0.32em;
    font-weight: 500;
    color: var(--dim);
    margin-top: 0.28em;
  }
`

export const Reading = styled.div`
  display: flex;
  align-items: flex-start;
  font-size: clamp(44px, 7vw, 60px);
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
`

export const Cond = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const Summary = styled.div`
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
`

export const Detail = styled.div`
  font-size: var(--font-small);
  color: var(--dim);
  font-variant-numeric: tabular-nums;
`

/** Two or three facts that change what you do today, pulled out of the panels below. */
export const Flags = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;

  @media (max-width: 600px) {
    margin-left: 0;
    width: 100%;
  }
`

export const FlagRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

export const FlagLabel = styled.div`
  font-size: var(--font-small);
  color: var(--dim);
`

/** ADS lozenge: a tinted pill carrying the quantity's own colour, as fibo tags do. */
export const FlagValue = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 2px;
  padding: 2px 8px;
  font-size: var(--font-small);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--flag, var(--text));
  background: color-mix(in srgb, var(--flag, var(--line-strong)) 16%, transparent);
`
