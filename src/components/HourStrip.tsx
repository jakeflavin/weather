import type { HourRow } from '@/lib/series'
import { Cell, CellTemp, Precip, Strip, Time } from './HourStrip.styled'
import { formatHourShort } from '@/lib/time'
import { num, toTemp, type UnitSystem } from '@/lib/units'
import { weatherCode } from '@/lib/weatherCode'
import { WeatherIcon } from './WeatherIcon'

/**
 * The next half-day, hour by hour, under the headline reading.
 *
 * The temperature chart below covers the same ground, but a chart answers "what is the
 * shape of the day" and this answers "what is it at 4pm" — the question actually being
 * asked at the top of the page. It also gives the hero something to fill its width with
 * other than air.
 *
 * It starts at the *next* hour: the current one is the headline reading above, and showing
 * it twice invites the two to disagree, since the observation and the hourly bucket round
 * from different numbers.
 */
const HOURS = 12

export function HourStrip({ rows, units }: { rows: HourRow[]; units: UnitSystem }) {
  const hours = rows.slice(1, HOURS + 1)
  if (hours.length < 2) return null

  return (
    <Strip role="list">
      {hours.map((row) => {
        const code = weatherCode(row.code)
        const chance = row.precipProb ?? 0
        return (
          <Cell role="listitem" key={row.t} title={code.label}>
            <Time>{formatHourShort(row.t)}</Time>
            <WeatherIcon code={row.code} isDay={row.isDay} size={18} />
            <CellTemp>{num(toTemp(row.temp ?? NaN, units))}°</CellTemp>
            {/* Below 10% the number is noise — the blank keeps the row heights equal. */}
            <Precip>{chance >= 10 ? `${num(chance)}%` : ''}</Precip>
          </Cell>
        )
      })}
    </Strip>
  )
}
