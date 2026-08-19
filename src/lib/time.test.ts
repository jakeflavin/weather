import { describe, expect, it } from 'vitest'
import { formatClockHours } from './time'

// Asserted against Intl rather than a literal like '06:30': the whole point of the
// function is that it follows the reader's clock, so a literal would only be true
// wherever the test happens to run.
const expected = (hours: number) =>
  new Date(Math.round(hours * 60) * 60_000).toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })

describe('formatClockHours', () => {
  it('reads decimal hours as a time of day', () => {
    expect(formatClockHours(6.5)).toBe(expected(6.5))
    expect(formatClockHours(20.25)).toBe(expected(20.25))
  })

  it('follows the viewer’s clock rather than forcing 24-hour', () => {
    // The bug this replaced: padStart always produced 20:15, never 8:15 PM.
    expect(new Date(20.25 * 3_600_000).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })).toMatch(/PM/)
    expect(new Date(20.25 * 3_600_000).toLocaleString('fr-FR', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })).toMatch(/20/)
  })

  it('rounds to the whole minute, rather than truncating or overflowing to :60', () => {
    expect(formatClockHours(6.999_9)).toBe(expected(7))
    expect(formatClockHours(6.999_9)).not.toMatch(/60/)
  })

  it('shows a dash rather than an invalid time', () => {
    expect(formatClockHours(Number.NaN)).toBe('—')
    expect(formatClockHours(Infinity)).toBe('—')
  })

  it('handles midnight and noon', () => {
    expect(formatClockHours(0)).toBe(expected(0))
    expect(formatClockHours(12)).toBe(expected(12))
  })
})
