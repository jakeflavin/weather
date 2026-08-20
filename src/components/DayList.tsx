import type { DayRow } from '@/lib/series'
import {
  Cond,
  Day,
  Days,
  Glyph,
  High,
  Low,
  Name,
  Precip,
  Range,
  RangeNow,
  RangeSpan,
} from './DayList.styled'
import { formatDayMonth, formatWeekday } from '@/lib/time'
import { UNIT_LABELS, num, precipDigits, toPrecip, toTemp, type UnitSystem } from '@/lib/units'
import { weatherCode } from '@/lib/weatherCode'
import { WeatherIcon } from './WeatherIcon'

/**
 * The day-by-day list.
 *
 * Every row's range bar is drawn against one shared scale — the coldest low and warmest
 * high across the whole window — so the bars are comparable down the column. Scaling each
 * row to itself would make a 3-degree day look like a 20-degree one.
 */
export function DayList({
  rows,
  units,
  today,
  currentTemp,
}: {
  rows: DayRow[]
  units: UnitSystem
  today: string
  /** Marks where today's temperature sits inside today's range. */
  currentTemp: number | null
}) {
  const u = UNIT_LABELS[units]
  const digits = precipDigits(units)

  // The last day of the window sometimes comes back without a summary; a row of dashes
  // is worse than no row.
  const days = rows.filter((row) => row.tempMin != null && row.tempMax != null)
  if (!days.length) return null

  const lows = days.map((row) => row.tempMin as number)
  const highs = days.map((row) => row.tempMax as number)

  const floor = Math.min(...lows)
  const ceiling = Math.max(...highs)
  const spread = Math.max(ceiling - floor, 1)
  const position = (value: number) => ((value - floor) / spread) * 100

  return (
    <Days>
      {days.map((row) => {
        const code = weatherCode(row.code)
        const isToday = row.day === today
        const precip = toPrecip(row.precipSum ?? 0, units)
        return (
          <Day key={row.day} data-past={row.past} data-today={isToday}>
            <Name>
              {isToday
                ? 'Today'
                : `${formatWeekday(row.t)} ${formatDayMonth(row.t).replace(/\D+/g, '')}`}
            </Name>
            <Glyph title={code.label}>
              <WeatherIcon code={row.code} size={18} />
            </Glyph>
            <Cond title={`${formatDayMonth(row.t)} · ${code.label}`}>
              {code.short}
            </Cond>
            <Low>
              {row.tempMin == null ? '—' : num(toTemp(row.tempMin, units))}
            </Low>
            <Range
              role="img"
              aria-label={`Low ${num(toTemp(row.tempMin ?? 0, units))} to high ${num(toTemp(row.tempMax ?? 0, units))} ${u.temp}`}
            >
              {row.tempMin != null && row.tempMax != null && (
                <RangeSpan
                  style={{
                    left: `${position(row.tempMin)}%`,
                    width: `${Math.max(position(row.tempMax) - position(row.tempMin), 1.5)}%`,
                  }}
                />
              )}
              {isToday && currentTemp != null && (
                <RangeNow style={{ left: `${position(currentTemp)}%` }} />
              )}
            </Range>
            <High>
              {row.tempMax == null ? '—' : num(toTemp(row.tempMax, units))}
            </High>
            <Precip data-zero={precip < 0.05}>
              {precip < 0.05 ? '—' : `${num(precip, digits)}`}
              <span className="unit">{precip < 0.05 ? '' : u.precip}</span>
            </Precip>
          </Day>
        )
      })}
    </Days>
  )
}
