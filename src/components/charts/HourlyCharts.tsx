/**
 * The hourly charts.
 *
 * All six share an x axis convention — the pseudo-UTC instant from `lib/time`, numeric,
 * with ticks every third hour and night shaded behind — so a reading can be traced
 * vertically from one panel to the next without re-orienting.
 */

import {
  Area,
  Bar,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Band, HourRow } from '../../lib/series'
import { uvBand } from '../../lib/weatherCode'
import { ChartFrame, Legend, NightBands, Tip } from './base'
import {
  CHART_MARGIN,
  type ChartColors,
  axisProps,
  formatHourTick,
  hourTicks,
  levelColor,
  rowTip,
  tipHourHeading,
  useChartColors,
} from './theme'
import {
  UNIT_LABELS,
  num,
  precipDigits,
  pressureDigits,
  toPrecip,
  toPressure,
  toSpeed,
  toTemp,
  type UnitSystem,
} from '../../lib/units'
import { compass } from '../../lib/units'

interface HourlyProps {
  rows: HourRow[]
  bands: Band[]
  now: number
  units: UnitSystem
  height?: number
}

const gridProps = (colors: ChartColors) => ({
  ...axisProps(colors),
  type: 'number' as const,
  dataKey: 't',
  domain: ['dataMin', 'dataMax'] as [string, string],
  scale: 'time' as const,
})

/** The vertical "you are here" rule, drawn on every hourly chart. */
function NowLine({ now, colors }: { now: number; colors: ChartColors }) {
  return (
    <ReferenceLine x={now} stroke={colors.text} strokeWidth={1} strokeDasharray="2 2" ifOverflow="hidden" />
  )
}

// ------------------------------------------------------------------ temperature

export function TemperatureChart({ rows, bands, now, units, height = 190 }: HourlyProps) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]
  const freezing = toTemp(0, units)

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="wx-temp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors['s-temp']} stopOpacity={0.28} />
                <stop offset="100%" stopColor={colors['s-temp']} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <NightBands bands={bands} colors={colors} />
            <XAxis {...gridProps(colors)} ticks={hourTicks(rows)} tickFormatter={formatHourTick} />
            <YAxis
              {...axisProps(colors)}
              width={30}
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => num(toTemp(value, units))}
            />
            {/* Freezing is the one threshold worth marking: it changes what falls. */}
            <ReferenceLine
              y={0}
              stroke={colors['s-snow']}
              strokeDasharray="3 3"
              strokeOpacity={0.7}
              label={{
                value: `${num(freezing)}${u.temp}`,
                position: 'insideLeft',
                fill: colors.dim,
                fontSize: 9,
              }}
              ifOverflow="hidden"
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke={colors['s-temp']}
              strokeWidth={1.6}
              fill="url(#wx-temp)"
              dot={false}
              activeDot={{ r: 2.5, strokeWidth: 0 }}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="apparent"
              stroke={colors['s-feels']}
              strokeWidth={1.2}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <NowLine now={now} colors={colors} />
            <Tooltip
              cursor={{ stroke: colors.dim, strokeWidth: 1 }}
              content={rowTip<HourRow>((row) => {
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'Temp',
                        value: `${num(toTemp(row.temp ?? 0, units), 1)}${u.temp}`,
                        color: colors['s-temp'],
                      },
                      {
                        label: 'Feels',
                        value: `${num(toTemp(row.apparent ?? 0, units), 1)}${u.temp}`,
                        color: colors['s-feels'],
                      },
                      {
                        label: 'Dew pt',
                        value: `${num(toTemp(row.dewPoint ?? 0, units), 1)}${u.temp}`,
                      },
                      { label: 'Humidity', value: `${num(row.humidity)}%` },
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
          { label: `Temperature ${u.temp}`, color: colors['s-temp'] },
          { label: 'Feels like', color: colors['s-feels'], shape: 'dash' },
          { label: 'Night', color: colors['chart-grid'], shape: 'box' },
        ]}
      />
    </>
  )
}

// ---------------------------------------------------------------- precipitation

export function PrecipitationChart({ rows, bands, now, units, height = 190 }: HourlyProps) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]
  const digits = precipDigits(units)

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={CHART_MARGIN}>
            <NightBands bands={bands} colors={colors} />
            <XAxis {...gridProps(colors)} ticks={hourTicks(rows)} tickFormatter={formatHourTick} />
            {/* Probability on the left because it is the field most people read first. */}
            <YAxis
              {...axisProps(colors)}
              yAxisId="prob"
              width={30}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(value: number) => `${value}`}
            />
            <YAxis
              {...axisProps(colors)}
              yAxisId="amount"
              orientation="right"
              width={34}
              domain={[0, (max: number) => Math.max(max * 1.2, units === 'imperial' ? 0.1 : 1)]}
              tickFormatter={(value: number) => num(toPrecip(value, units), digits)}
            />
            <Area
              yAxisId="prob"
              type="monotone"
              dataKey="precipProb"
              stroke={colors['s-precip']}
              strokeWidth={1.3}
              fill={colors['s-precip']}
              fillOpacity={0.1}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Bar
              yAxisId="amount"
              dataKey="precip"
              fill={colors['s-precip']}
              fillOpacity={0.85}
              maxBarSize={8}
              isAnimationActive={false}
            />
            <NowLine now={now} colors={colors} />
            <Tooltip
              cursor={{ fill: colors['chart-grid'], fillOpacity: 0.5 }}
              content={rowTip<HourRow>((row) => {
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'Chance',
                        value: `${num(row.precipProb)}%`,
                        color: colors['s-precip'],
                      },
                      {
                        label: 'Amount',
                        value: `${num(toPrecip(row.precip ?? 0, units), digits)} ${u.precip}`,
                      },
                      ...((row.snow ?? 0) > 0
                        ? [
                            {
                              label: 'Snow',
                              value: `${num(row.snow, 1)} cm`,
                              color: colors['s-snow'],
                            },
                          ]
                        : []),
                      { label: 'Cloud', value: `${num(row.cloud)}%` },
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
          { label: 'Chance %', color: colors['s-precip'] },
          {
            label: `Amount ${u.precip}`,
            color: colors['s-precip'],
            shape: 'box',
          },
        ]}
      />
    </>
  )
}

// ------------------------------------------------------------------------- wind

export function WindChart({ rows, bands, now, units, height = 190 }: HourlyProps) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="wx-wind" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors['s-wind']} stopOpacity={0.26} />
                <stop offset="100%" stopColor={colors['s-wind']} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <NightBands bands={bands} colors={colors} />
            <XAxis {...gridProps(colors)} ticks={hourTicks(rows)} tickFormatter={formatHourTick} />
            <YAxis
              {...axisProps(colors)}
              width={30}
              domain={[0, 'auto']}
              tickFormatter={(value: number) => num(toSpeed(value, units))}
            />
            <Area
              type="monotone"
              dataKey="wind"
              stroke={colors['s-wind']}
              strokeWidth={1.5}
              fill="url(#wx-wind)"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="gust"
              stroke={colors['s-wind']}
              strokeWidth={1}
              strokeDasharray="2 3"
              strokeOpacity={0.8}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <NowLine now={now} colors={colors} />
            <Tooltip
              cursor={{ stroke: colors.dim, strokeWidth: 1 }}
              content={rowTip<HourRow>((row) => {
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'Wind',
                        value: `${num(toSpeed(row.wind ?? 0, units))} ${u.speed}`,
                        color: colors['s-wind'],
                      },
                      {
                        label: 'Gusts',
                        value: `${num(toSpeed(row.gust ?? 0, units))} ${u.speed}`,
                      },
                      {
                        label: 'From',
                        value: `${compass(row.windDir)} ${num(row.windDir)}°`,
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
          { label: `Sustained ${u.speed}`, color: colors['s-wind'] },
          { label: 'Gusts', color: colors['s-wind'], shape: 'dash' },
        ]}
      />
    </>
  )
}

// ----------------------------------------------------------- humidity & dew point

export function HumidityChart({ rows, bands, now, units, height = 170 }: HourlyProps) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={CHART_MARGIN}>
            <NightBands bands={bands} colors={colors} />
            <XAxis {...gridProps(colors)} ticks={hourTicks(rows, 6)} tickFormatter={formatHourTick} />
            <YAxis {...axisProps(colors)} yAxisId="rh" width={30} domain={[0, 100]} ticks={[0, 50, 100]} />
            <YAxis
              {...axisProps(colors)}
              yAxisId="dew"
              orientation="right"
              width={30}
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => num(toTemp(value, units))}
            />
            <Area
              yAxisId="rh"
              type="monotone"
              dataKey="humidity"
              stroke={colors['s-humidity']}
              strokeWidth={1.4}
              fill={colors['s-humidity']}
              fillOpacity={0.1}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            {/* Dew point is the honest measure of muggy — it earns the second axis. */}
            <Line
              yAxisId="dew"
              type="monotone"
              dataKey="dewPoint"
              stroke={colors['s-temp']}
              strokeWidth={1.2}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <NowLine now={now} colors={colors} />
            <Tooltip
              cursor={{ stroke: colors.dim, strokeWidth: 1 }}
              content={rowTip<HourRow>((row) => {
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'Humidity',
                        value: `${num(row.humidity)}%`,
                        color: colors['s-humidity'],
                      },
                      {
                        label: 'Dew point',
                        value: `${num(toTemp(row.dewPoint ?? 0, units), 1)}${u.temp}`,
                        color: colors['s-temp'],
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
          { label: 'Relative humidity %', color: colors['s-humidity'] },
          { label: `Dew point ${u.temp}`, color: colors['s-temp'] },
        ]}
      />
    </>
  )
}

// ------------------------------------------------------------ cloud & pressure

export function CloudPressureChart({ rows, bands, now, units, height = 170 }: HourlyProps) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]
  const digits = pressureDigits(units)

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={CHART_MARGIN}>
            <NightBands bands={bands} colors={colors} />
            <XAxis {...gridProps(colors)} ticks={hourTicks(rows, 6)} tickFormatter={formatHourTick} />
            <YAxis
              {...axisProps(colors)}
              yAxisId="cloud"
              width={30}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
            />
            <YAxis
              {...axisProps(colors)}
              yAxisId="p"
              orientation="right"
              width={40}
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => num(toPressure(value, units), digits)}
            />
            <Area
              yAxisId="cloud"
              type="monotone"
              dataKey="cloud"
              stroke={colors['s-cloud']}
              strokeWidth={1}
              fill={colors['s-cloud']}
              fillOpacity={0.16}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            {/* Falling pressure is the classic early warning, so it sits on top. */}
            <Line
              yAxisId="p"
              type="monotone"
              dataKey="pressure"
              stroke={colors['s-pressure']}
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <NowLine now={now} colors={colors} />
            <Tooltip
              cursor={{ stroke: colors.dim, strokeWidth: 1 }}
              content={rowTip<HourRow>((row) => {
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'Cloud',
                        value: `${num(row.cloud)}%`,
                        color: colors['s-cloud'],
                      },
                      {
                        label: 'Pressure',
                        value: `${num(toPressure(row.pressure ?? 0, units), digits)} ${u.pressure}`,
                        color: colors['s-pressure'],
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
          { label: 'Cloud cover %', color: colors['s-cloud'] },
          { label: `Pressure ${u.pressure}`, color: colors['s-pressure'] },
        ]}
      />
    </>
  )
}

// --------------------------------------------------------------------- uv index

export function UvChart({ rows, now, units: _units, height = 150 }: HourlyProps) {
  const colors = useChartColors()
  // Only daylight hours carry UV; the overnight zeros are dropped so the bars are not
  // separated by long flat stretches that read as missing data.
  const daylight = rows.filter((row) => (row.uv ?? 0) > 0)

  return (
    <>
      <ChartFrame height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={daylight} margin={CHART_MARGIN}>
            <XAxis {...gridProps(colors)} ticks={hourTicks(daylight, 4)} tickFormatter={formatHourTick} />
            <YAxis
              {...axisProps(colors)}
              width={22}
              domain={[0, (max: number) => Math.max(3, Math.ceil(max))]}
            />
            <ReferenceLine y={3} stroke={colors.line} strokeDasharray="2 2" />
            <ReferenceLine y={8} stroke={colors.line} strokeDasharray="2 2" />
            <Bar dataKey="uv" maxBarSize={10} isAnimationActive={false}>
              {daylight.map((row) => (
                <Cell key={row.t} fill={levelColor(colors, uvBand(row.uv).level)} />
              ))}
            </Bar>
            <NowLine now={now} colors={colors} />
            <Tooltip
              cursor={{ fill: colors['chart-grid'], fillOpacity: 0.5 }}
              content={rowTip<HourRow>((row) => {
                const band = uvBand(row.uv)
                return (
                  <Tip
                    heading={tipHourHeading(row.t)}
                    rows={[
                      {
                        label: 'UV index',
                        value: num(row.uv, 1),
                        color: levelColor(colors, band.level),
                      },
                      { label: 'Exposure', value: band.label },
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
          { label: 'Low', color: colors.l0, shape: 'box' },
          { label: 'Moderate', color: colors.l1, shape: 'box' },
          { label: 'High', color: colors.l2, shape: 'box' },
          { label: 'Very high', color: colors.l3, shape: 'box' },
          { label: 'Extreme', color: colors.l4, shape: 'box' },
        ]}
      />
    </>
  )
}
