/**
 * The multi-day charts, covering the full window the API returns: a week of history
 * behind, a fortnight of forecast ahead.
 *
 * History is included on purpose. A forecast alone gives no sense of whether 24° is a warm
 * day or a cold one for this place right now — the run-up supplies that.
 */

import {
  Area,
  Bar,
  Cell,
  ComposedChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AqiRow, DayRow } from '../../lib/series'
import { aqiBand, weatherCode } from '../../lib/weatherCode'
import { ChartFrame, Legend, Tip } from './base'
import {
  CHART_MARGIN,
  type ChartColors,
  axisProps,
  levelColor,
  rowTip,
  tipDayHeading,
  tipHourHeading,
  useChartColors,
} from './theme'
import { formatDayMonth, formatHour, formatWeekday } from '../../lib/time'
import {
  UNIT_LABELS,
  duration,
  num,
  precipDigits,
  toPrecip,
  toTemp,
  type UnitSystem,
} from '../../lib/units'

const dayAxis = (colors: ChartColors) => ({
  ...axisProps(colors),
  type: 'number' as const,
  dataKey: 't',
  domain: ['dataMin', 'dataMax'] as [string, string],
  scale: 'time' as const,
})

/** One tick per day gets crowded over three weeks, so label every other one. */
function dayTicks(rows: { t: number }[], every = 2): number[] {
  return rows.filter((_, index) => index % every === 0).map((row) => row.t)
}

const formatDayTick = (t: number) => formatDayMonth(t)

// -------------------------------------------------------------- temperature range

interface TrendRow extends DayRow {
  range: [number, number] | null
  apparentRange: [number, number] | null
}

export function DailyTrendChart({
  rows,
  now,
  units,
  height = 230,
}: {
  rows: DayRow[]
  now: number
  units: UnitSystem
  height?: number
}) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]
  const digits = precipDigits(units)

  const data: TrendRow[] = rows.map((row) => ({
    ...row,
    range: row.tempMin != null && row.tempMax != null ? [row.tempMin, row.tempMax] : null,
    apparentRange:
      row.apparentMin != null && row.apparentMax != null ? [row.apparentMin, row.apparentMax] : null,
  }))

  const firstPast = data.find((row) => row.past)
  const lastPast = [...data].reverse().find((row) => row.past)

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={CHART_MARGIN}>
            {/* The observed week is tinted so it reads as recorded rather than predicted. */}
            {firstPast && lastPast && (
              <ReferenceArea
                x1={firstPast.t}
                x2={lastPast.t}
                fill={colors.night}
                fillOpacity={1}
                stroke="none"
              />
            )}
            <XAxis {...dayAxis(colors)} ticks={dayTicks(data)} tickFormatter={formatDayTick} />
            <YAxis
              {...axisProps(colors)}
              yAxisId="t"
              width={32}
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => num(toTemp(value, units))}
            />
            <YAxis
              {...axisProps(colors)}
              yAxisId="p"
              orientation="right"
              width={34}
              domain={[0, (max: number) => Math.max(max * 3, units === 'imperial' ? 0.4 : 10)]}
              tickFormatter={(value: number) => num(toPrecip(value, units), digits)}
            />
            <ReferenceLine
              yAxisId="t"
              y={0}
              stroke={colors['s-snow']}
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            {/* Daily rainfall sits under the temperature band, scaled down so it never
                competes with it — the shape matters more than the exact height. */}
            <Bar
              yAxisId="p"
              dataKey="precipSum"
              fill={colors['s-precip']}
              fillOpacity={0.55}
              maxBarSize={14}
              isAnimationActive={false}
            />
            <Area
              yAxisId="t"
              type="monotone"
              dataKey="apparentRange"
              stroke="none"
              fill={colors['s-feels']}
              fillOpacity={0.14}
              connectNulls
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              yAxisId="t"
              type="monotone"
              dataKey="range"
              stroke={colors['s-temp']}
              strokeWidth={1.4}
              fill={colors['s-temp']}
              fillOpacity={0.09}
              connectNulls
              activeDot={{ r: 2.5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <ReferenceLine yAxisId="t" x={now} stroke={colors.text} strokeWidth={1} strokeDasharray="2 2" />
            <Tooltip
              cursor={{ stroke: colors.dim, strokeWidth: 1 }}
              content={rowTip<TrendRow>((row) => {
                return (
                  <Tip
                    heading={`${tipDayHeading(row.t)}${row.past ? ' · observed' : ''}`}
                    rows={[
                      {
                        label: 'High',
                        value: `${num(toTemp(row.tempMax ?? 0, units))}${u.temp}`,
                        color: colors['s-temp'],
                      },
                      {
                        label: 'Low',
                        value: `${num(toTemp(row.tempMin ?? 0, units))}${u.temp}`,
                      },
                      {
                        label: 'Feels',
                        value: `${num(toTemp(row.apparentMin ?? 0, units))} – ${num(toTemp(row.apparentMax ?? 0, units))}${u.temp}`,
                        color: colors['s-feels'],
                      },
                      {
                        label: 'Precip',
                        value: `${num(toPrecip(row.precipSum ?? 0, units), digits)} ${u.precip}`,
                        color: colors['s-precip'],
                      },
                      {
                        label: 'Condition',
                        value: weatherCode(row.code).short,
                      },
                    ]}
                  />
                )
              })}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
      <Legend
        items={[
          {
            label: `Low–high ${u.temp}`,
            color: colors['s-temp'],
            shape: 'box',
          },
          { label: 'Feels-like range', color: colors['s-feels'], shape: 'box' },
          {
            label: `Precip ${u.precip}`,
            color: colors['s-precip'],
            shape: 'box',
          },
        ]}
      />
    </>
  )
}

// ------------------------------------------------------------------- daylight

interface DaylightRow {
  t: number
  /** Hours after midnight — the transparent pad under the visible bar. */
  rise: number
  /** Bar height in hours: the length of the day. */
  span: number
  set: number
  daylight: number | null
  sunshine: number | null
  past: boolean
}

/**
 * Sunrise-to-sunset as a floating bar per day, drawn by stacking a transparent spacer
 * under a visible span. The y axis is reversed so midnight is at the top and the bars hang
 * the way a day does.
 */
export function DaylightChart({ rows, height = 190 }: { rows: DayRow[]; height?: number }) {
  const colors = useChartColors()

  const data: DaylightRow[] = rows
    .filter((row) => row.sunrise && row.sunset)
    .map((row) => {
      const rise = row.sunrise!.hour + row.sunrise!.minute / 60
      const set = row.sunset!.hour + row.sunset!.minute / 60
      return {
        t: row.t,
        rise,
        span: Math.max(set - rise, 0),
        set,
        daylight: row.daylight,
        sunshine: row.sunshine,
        past: row.past,
      }
    })

  if (!data.length) return null

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={CHART_MARGIN}>
            <XAxis {...dayAxis(colors)} ticks={dayTicks(data)} tickFormatter={formatDayTick} />
            <YAxis
              {...axisProps(colors)}
              width={26}
              domain={[0, 24]}
              reversed
              ticks={[0, 6, 12, 18, 24]}
              tickFormatter={(value: number) => `${value}`}
            />
            <Bar dataKey="rise" stackId="day" fill="transparent" isAnimationActive={false} />
            <Bar
              dataKey="span"
              stackId="day"
              fill={colors['s-pressure']}
              fillOpacity={0.45}
              maxBarSize={16}
              isAnimationActive={false}
            >
              {data.map((row) => (
                <Cell key={row.t} fillOpacity={row.past ? 0.22 : 0.45} />
              ))}
            </Bar>
            <Tooltip
              cursor={{ fill: colors['chart-grid'], fillOpacity: 0.5 }}
              content={rowTip<DaylightRow>((row) => {
                const clock = (hours: number) =>
                  `${String(Math.floor(hours)).padStart(2, '0')}:${String(Math.round((hours % 1) * 60)).padStart(2, '0')}`
                return (
                  <Tip
                    heading={tipDayHeading(row.t)}
                    rows={[
                      {
                        label: 'Sunrise',
                        value: clock(row.rise),
                        color: colors['s-pressure'],
                      },
                      { label: 'Sunset', value: clock(row.set) },
                      { label: 'Daylight', value: duration(row.daylight) },
                      { label: 'Sunshine', value: duration(row.sunshine) },
                    ]}
                  />
                )
              })}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
      <Legend
        items={[
          {
            label: 'Sunrise to sunset · hour of day',
            color: colors['s-pressure'],
            shape: 'box',
          },
        ]}
      />
    </>
  )
}

// ---------------------------------------------------------------- air quality

export function AqiChart({ rows, now, height = 170 }: { rows: AqiRow[]; now: number; height?: number }) {
  const colors = useChartColors()
  const data = rows.filter((row) => row.usAqi != null)
  if (!data.length) return null

  const peak = Math.max(...data.map((row) => row.usAqi ?? 0))

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={CHART_MARGIN}>
            {/* Band boundaries rather than gridlines: the number only means something
                relative to where "good" ends. */}
            <ReferenceArea y1={0} y2={50} fill={colors.l0} fillOpacity={0.07} stroke="none" />
            <ReferenceArea y1={50} y2={100} fill={colors.l1} fillOpacity={0.07} stroke="none" />
            <ReferenceArea y1={100} y2={150} fill={colors.l2} fillOpacity={0.07} stroke="none" />
            <ReferenceArea y1={150} y2={500} fill={colors.l3} fillOpacity={0.07} stroke="none" />
            <XAxis
              {...dayAxis(colors)}
              ticks={dayTicks(
                data.filter((_, i) => i % 6 === 0),
                2,
              )}
              tickFormatter={(t: number) => `${formatWeekday(t)} ${formatHour(t)}`}
            />
            <YAxis
              {...axisProps(colors)}
              width={26}
              domain={[0, () => Math.max(60, Math.ceil((peak * 1.25) / 25) * 25)]}
            />
            <Area
              type="monotone"
              dataKey="usAqi"
              stroke={colors['s-aqi']}
              strokeWidth={1.5}
              fill={colors['s-aqi']}
              fillOpacity={0.12}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <ReferenceLine x={now} stroke={colors.text} strokeWidth={1} strokeDasharray="2 2" />
            <Tooltip
              cursor={{ stroke: colors.dim, strokeWidth: 1 }}
              content={rowTip<AqiRow>((row) => {
                const band = aqiBand(row.usAqi)
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'US AQI',
                        value: num(row.usAqi),
                        color: levelColor(colors, band.level),
                      },
                      { label: 'Band', value: band.label },
                      { label: 'PM2.5', value: `${num(row.pm2_5, 1)} µg/m³` },
                      { label: 'Ozone', value: `${num(row.ozone)} µg/m³` },
                    ]}
                  />
                )
              })}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
      <Legend
        items={[
          { label: 'Good', color: colors.l0, shape: 'box' },
          { label: 'Moderate', color: colors.l1, shape: 'box' },
          { label: 'Sensitive', color: colors.l2, shape: 'box' },
          { label: 'Unhealthy', color: colors.l3, shape: 'box' },
        ]}
      />
    </>
  )
}

// ----------------------------------------------------------------- pollutants

interface PollutantRow {
  name: string
  value: number
  /** Percentage of the WHO/EPA guideline, which is what makes the bars comparable. */
  pct: number
  limit: number
}

/**
 * Pollutant concentrations are in different units and different orders of magnitude, so
 * they are plotted as a percentage of their guideline value — the only way a single bar
 * chart of CO and PM2.5 says anything useful.
 */
export function PollutantChart({
  current,
  height = 150,
}: {
  current: AqiRow | undefined
  height?: number
}) {
  const colors = useChartColors()
  if (!current) return null

  const limits: { key: keyof AqiRow; name: string; limit: number }[] = [
    { key: 'pm2_5', name: 'PM2.5', limit: 15 },
    { key: 'pm10', name: 'PM10', limit: 45 },
    { key: 'ozone', name: 'O₃', limit: 100 },
    { key: 'no2', name: 'NO₂', limit: 25 },
    { key: 'so2', name: 'SO₂', limit: 40 },
    { key: 'co', name: 'CO', limit: 4000 },
  ]

  const data: PollutantRow[] = limits
    .map(({ key, name, limit }) => {
      const value = current[key]
      return typeof value === 'number' ? { name, value, limit, pct: (value / limit) * 100 } : null
    })
    .filter((row): row is PollutantRow => row != null)

  if (!data.length) return null

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} layout="vertical" margin={{ ...CHART_MARGIN, left: 8 }}>
            <XAxis
              {...axisProps(colors)}
              type="number"
              domain={[0, (max: number) => Math.max(120, Math.ceil(max / 25) * 25)]}
              tickFormatter={(value: number) => `${value}%`}
            />
            <YAxis {...axisProps(colors)} type="category" dataKey="name" width={44} />
            {/* The guideline itself: bars crossing this line are over the limit. */}
            <ReferenceLine x={100} stroke={colors.dim} strokeDasharray="2 2" />
            <Bar dataKey="pct" maxBarSize={12} isAnimationActive={false}>
              {data.map((row) => (
                <Cell key={row.name} fill={row.pct > 100 ? colors.l3 : colors['s-aqi']} fillOpacity={0.8} />
              ))}
            </Bar>
            <Tooltip
              cursor={{ fill: colors['chart-grid'], fillOpacity: 0.5 }}
              content={rowTip<PollutantRow>((row) => {
                return (
                  <Tip
                    heading={row.name}
                    rows={[
                      {
                        label: 'Measured',
                        value: `${num(row.value, 1)} µg/m³`,
                      },
                      { label: 'Guideline', value: `${num(row.limit)} µg/m³` },
                      { label: 'Of guideline', value: `${num(row.pct)}%` },
                    ]}
                  />
                )
              })}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
      <Legend
        items={[
          {
            label: 'Share of WHO guideline · dashed line = limit',
            color: colors['s-aqi'],
            shape: 'box',
          },
        ]}
      />
    </>
  )
}
