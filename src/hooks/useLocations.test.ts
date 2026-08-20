import { describe as it_describes, expect, test } from 'vitest'
import { describe, label, locationId, type Location } from './useLocations'

const place = (name: string, region?: string, country?: string): Location => ({
  id: locationId(0, 0),
  name,
  region,
  country,
  lat: 0,
  lon: 0,
})

it_describes('describe', () => {
  test('keeps a region that adds something', () => {
    expect(describe(place('Denver', 'Colorado', 'United States'))).toBe('Denver, Colorado')
  })

  test('drops a region that is only the city again', () => {
    expect(describe(place('New York', 'New York', 'United States'))).toBe('New York, United States')
  })

  test('drops a region that is the city plus an administrative suffix', () => {
    // The geocoder returns these constantly, and an equality test left the name twice.
    expect(describe(place('Wellington', 'Wellington Region', 'New Zealand'))).toBe(
      'Wellington, New Zealand',
    )
    expect(describe(place('Nizhny Novgorod', 'Nizhny Novgorod Oblast', 'Russia'))).toBe(
      'Nizhny Novgorod, Russia',
    )
  })

  test('falls back to the name alone when there is nothing to add', () => {
    expect(describe(place('Reykjavik'))).toBe('Reykjavik')
  })
})

it_describes('label', () => {
  test('is the city alone, so eight of them fit the rail', () => {
    expect(label(place('Nizhny Novgorod', 'Nizhny Novgorod Oblast', 'Russia'))).toBe(
      'Nizhny Novgorod',
    )
  })
})
