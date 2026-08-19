import { describe, it, expect } from 'vitest'
import { toTemp, toTempDelta, toSpeed, toPrecip, compass } from './units'

describe('temperature', () => {
  it('leaves metric alone', () => {
    expect(toTemp(21, 'metric')).toBe(21)
  })

  it('converts to Fahrenheit', () => {
    expect(toTemp(0, 'imperial')).toBe(32)
    expect(toTemp(100, 'imperial')).toBe(212)
  })

  // The distinction the app gets wrong if these two are confused: a 5°C rise is 9°F,
  // not 41°F.
  it('drops the offset for deltas', () => {
    expect(toTempDelta(5, 'imperial')).toBeCloseTo(9, 6)
    expect(toTempDelta(0, 'imperial')).toBe(0)
  })
})

describe('other conversions', () => {
  it('converts speed and precipitation', () => {
    expect(toSpeed(100, 'imperial')).toBeCloseTo(62.1371, 3)
    expect(toPrecip(25.4, 'imperial')).toBeCloseTo(1, 6)
  })

  it('leaves metric untouched', () => {
    expect(toSpeed(42, 'metric')).toBe(42)
    expect(toPrecip(7, 'metric')).toBe(7)
  })
})

describe('compass', () => {
  it('names the cardinal points', () => {
    expect(compass(0)).toBe('N')
    expect(compass(90)).toBe('E')
    expect(compass(180)).toBe('S')
    expect(compass(270)).toBe('W')
  })

  it('wraps rather than running off the end of the table', () => {
    expect(compass(360)).toBe('N')
    expect(compass(-90)).toBe('W')
  })

  it('has a sentinel for no reading', () => {
    expect(compass(null)).toBe('—')
    expect(compass(undefined)).toBe('—')
    expect(compass(NaN)).toBe('—')
  })
})
