import type { HourRow } from '@/lib/series'
import { formatHour, formatWeekday } from '@/lib/time'
import {
  UNIT_LABELS,
  compass,
  num,
  precipDigits,
  toDistance,
  toPrecip,
  toSpeed,
  toTemp,
  type UnitSystem,
} from '@/lib/units'
import { weatherCode } from '@/lib/weatherCode'
import { WeatherIcon } from './WeatherIcon'

/**
 * The raw hourly numbers, for when a chart is not precise enough.
 *
 * Rows carry a `data-daybreak` flag that draws a heavier rule at midnight, and night hours
 * dim their time cell — so the table can be scanned for a specific hour without reading
 * every date.
 */
export function HourTable({ rows, units }: { rows: HourRow[]; units: UnitSystem }) {
  const u = UNIT_LABELS[units]
  const digits = precipDigits(units)

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th scope="col">Hour</th>
            <th scope="col">Sky</th>
            <th scope="col">Temp {u.temp}</th>
            <th scope="col">Feels</th>
            <th scope="col">Dew</th>
            <th scope="col">RH %</th>
            <th scope="col">Chance %</th>
            <th scope="col">Precip {u.precip}</th>
            <th scope="col">Cloud %</th>
            <th scope="col">Wind {u.speed}</th>
            <th scope="col">Gust</th>
            <th scope="col">Dir</th>
            <th scope="col">UV</th>
            <th scope="col">Vis {u.distance}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.t} data-daybreak={index > 0 && row.hour === 0}>
              <td>
                {row.hour === 0 || index === 0 ? `${formatWeekday(row.t)} ` : ''}
                {formatHour(row.t)}
              </td>
              <td title={weatherCode(row.code).label}>
                <WeatherIcon code={row.code} isDay={row.isDay} size={15} />
              </td>
              <td className="strong">{num(toTemp(row.temp ?? NaN, units))}</td>
              <td>{num(toTemp(row.apparent ?? NaN, units))}</td>
              <td>{num(toTemp(row.dewPoint ?? NaN, units))}</td>
              <td>{num(row.humidity)}</td>
              <td>{num(row.precipProb)}</td>
              <td>{(row.precip ?? 0) > 0 ? num(toPrecip(row.precip ?? 0, units), digits) : '—'}</td>
              <td>{num(row.cloud)}</td>
              <td>{num(toSpeed(row.wind ?? NaN, units))}</td>
              <td>{num(toSpeed(row.gust ?? NaN, units))}</td>
              <td>{compass(row.windDir)}</td>
              <td>{num(row.uv, 1)}</td>
              <td>{row.visibility == null ? '—' : num(toDistance(row.visibility, units), 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
