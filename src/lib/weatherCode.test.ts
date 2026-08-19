import { describe, it, expect } from 'vitest'
import { uvBand, aqiBand, windBand } from './weatherCode'

describe('uvBand', () => {
  it('bands the scale', () => {
    expect(uvBand(1).label).toBe('Low')
    expect(uvBand(4).label).toBe('Moderate')
    expect(uvBand(7).label).toBe('High')
    expect(uvBand(9).label).toBe('Very high')
    expect(uvBand(12).label).toBe('Extreme')
  })

  it('reports no reading rather than guessing at one', () => {
    expect(uvBand(null).label).toBe('—')
    expect(uvBand(undefined).label).toBe('—')
  })

  // level indexes a colour ramp, so it must stay inside it
  it('keeps level within the ramp', () => {
    for (const v of [0, 3, 6, 8, 11, 99]) {
      expect(uvBand(v).level).toBeGreaterThanOrEqual(0)
      expect(uvBand(v).level).toBeLessThanOrEqual(4)
    }
  })
})

describe('aqiBand and windBand', () => {
  it('band their own scales', () => {
    expect(aqiBand(10).label).toBeTruthy()
    expect(aqiBand(null).label).toBe('—')
    expect(windBand(0)).toBeTruthy()
  })
})
