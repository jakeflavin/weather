import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stat } from './Readouts'

describe('Stat', () => {
  it('shows the label, the value and the unit', () => {
    render(<Stat label="Wind" value="12" unit="km/h" />)

    expect(screen.getByText('Wind')).toBeVisible()
    expect(screen.getByText('12')).toBeVisible()
    expect(screen.getByText('km/h')).toBeVisible()
  })

  it('renders without a unit or a note', () => {
    render(<Stat label="Cloud cover" value="40" />)

    expect(screen.getByText('Cloud cover')).toBeVisible()
    expect(screen.getByText('40')).toBeVisible()
  })

  it('shows a note when one is given', () => {
    render(<Stat label="UV index" value="3" note="Moderate · max 6" />)

    expect(screen.getByText('Moderate · max 6')).toBeVisible()
  })
})
