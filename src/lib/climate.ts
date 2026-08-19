/**
 * Daily climatology, built from the archive.
 *
 * This is a ten-year average, not a WMO climate normal — those are computed over thirty
 * years and published by national services. The UI says "10-yr avg" rather than "normal"
 * for that reason: the number is a useful baseline, but it is not the official one, and
 * calling it a normal would be a claim the data does not support.
 */

import type { Archive } from '../api/openMeteo'

/**
 * Half-width of the smoothing window, in days.
 *
 * A single calendar date across ten years is ten samples, which is noisy enough that the
 * baseline wobbles by a couple of degrees between neighbouring days for no physical reason.
 * Pooling a week around each date is the usual fix and gives seventy samples instead.
 */
const WINDOW = 3

export interface DayNormal {
  tempMax: number
  tempMin: number
  precip: number
  /** How many observations went into this average, after smoothing. */
  samples: number
}

export interface Normals {
  /** Keyed by `MM-DD`. */
  byDay: Map<string, DayNormal>
  years: number
}

const key = (isoDate: string) => isoDate.slice(5, 10)

interface Bucket {
  max: number[]
  min: number[]
  precip: number[]
}

export function buildNormals(archive: Archive | undefined, years: number): Normals | null {
  if (!archive?.daily?.time?.length) return null
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = archive.daily

  // One bucket per calendar date, holding every year's observation for that date.
  const buckets = new Map<string, Bucket>()
  for (let i = 0; i < time.length; i++) {
    const max = temperature_2m_max[i]
    const min = temperature_2m_min[i]
    const stamp = time[i]
    if (max == null || min == null || stamp == null) continue
    const day = key(stamp)
    let bucket = buckets.get(day)
    if (!bucket) {
      bucket = { max: [], min: [], precip: [] }
      buckets.set(day, bucket)
    }
    bucket.max.push(max)
    bucket.min.push(min)
    bucket.precip.push(precipitation_sum[i] ?? 0)
  }
  if (!buckets.size) return null

  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

  // Walk a leap year so 29 February gets a bucket of its own rather than being skipped.
  const byDay = new Map<string, DayNormal>()
  for (let offset = 0; offset < 366; offset++) {
    const date = new Date(Date.UTC(2020, 0, 1 + offset))
    const day = date.toISOString().slice(5, 10)

    const pooled: Bucket = { max: [], min: [], precip: [] }
    for (let shift = -WINDOW; shift <= WINDOW; shift++) {
      const neighbour = new Date(date)
      neighbour.setUTCDate(neighbour.getUTCDate() + shift)
      const bucket = buckets.get(neighbour.toISOString().slice(5, 10))
      if (!bucket) continue
      pooled.max.push(...bucket.max)
      pooled.min.push(...bucket.min)
      pooled.precip.push(...bucket.precip)
    }

    if (!pooled.max.length) continue
    byDay.set(day, {
      tempMax: mean(pooled.max),
      tempMin: mean(pooled.min),
      precip: mean(pooled.precip),
      samples: pooled.max.length,
    })
  }

  return { byDay, years }
}

export function normalFor(normals: Normals | null | undefined, isoDate: string): DayNormal | null {
  return normals?.byDay.get(key(isoDate)) ?? null
}

/**
 * How far a day's high sits from its baseline. Positive is warmer than usual.
 */
export function departure(normals: Normals | null | undefined, isoDate: string, tempMax: number | null): number | null {
  const normal = normalFor(normals, isoDate)
  if (!normal || tempMax == null) return null
  return tempMax - normal.tempMax
}
