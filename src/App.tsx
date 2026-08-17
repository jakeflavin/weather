import { useEffect, useMemo, useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { Sunrise, Sunset } from 'lucide-react'
import { LocationBar } from './components/LocationBar'
import { DayList } from './components/DayList'
import { HourStrip } from './components/HourStrip'
import { HourTable } from './components/HourTable'
import { Panel } from './components/Panel'
import { Section } from './components/Section'
import { Flag, Meter, Stat, WindArrow } from './components/Readouts'
import { WeatherIcon } from './components/WeatherIcon'
import {
  CloudPressureChart,
  HumidityChart,
  PrecipitationChart,
  TemperatureChart,
  UvChart,
  WindChart,
} from './components/charts/HourlyCharts'
import { AqiChart, DailyTrendChart, DaylightChart, PollutantChart } from './components/charts/DailyCharts'
import { levelColor, useChartColors } from './components/charts/theme'
import { describe, useLocations } from './hooks/useLocations'
import { useSettings, type Theme } from './hooks/useSettings'
import { useAirQuality, useForecast } from './hooks/useWeather'
import {
  changeVsYesterday,
  nextWetHour,
  nightBands,
  toAqiRows,
  toDayRows,
  toHourRows,
  windowFrom,
} from './lib/series'
import { formatHour, formatWeekday, nowAt, parseStamp, sinceLabel } from './lib/time'
import {
  UNIT_LABELS,
  compass,
  duration,
  num,
  precipDigits,
  pressureDigits,
  toDistance,
  toElevation,
  toPrecip,
  toPressure,
  toSpeed,
  toTemp,
  toTempDelta,
  type UnitSystem,
} from './lib/units'
import { aqiBand, uvBand, weatherCode, windBand } from './lib/weatherCode'

/** How much of the hourly series the charts and table show. */
const RANGES = [24, 48, 72] as const
type Range = (typeof RANGES)[number]

export default function App() {
  const { units, setUnits, theme, setTheme } = useSettings()
  const locations = useLocations()
  const { current } = locations
  const [range, setRange] = useState<Range>(48)

  const forecast = useForecast(current)
  const air = useAirQuality(current)
  const queryClient = useQueryClient()
  const fetching = useIsFetching({ queryKey: ['forecast'] }) > 0

  // Shortcuts for the three things worth reaching for without a pointer.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.isContentEditable || event.metaKey || event.ctrlKey) return
      if (event.key === 'u') setUnits((value) => (value === 'metric' ? 'imperial' : 'metric'))
      if (event.key === 't') setTheme((value) => (value === 'dark' ? 'light' : value === 'light' ? 'system' : 'dark'))
      if (event.key === 'r') queryClient.invalidateQueries()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [queryClient, setTheme, setUnits])

  return (
    <div className="app">
      <header className="appbar">
        <span className="appbar__brand">Weather</span>
        <span className="appbar__spacer" />
        <div className="appbar__tools">
          <div className="segmented" role="group" aria-label="Hourly range">
            {RANGES.map((value) => (
              <button key={value} type="button" aria-pressed={range === value} onClick={() => setRange(value)}>
                {value}h
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label="Units">
            {(['metric', 'imperial'] as UnitSystem[]).map((value) => (
              <button key={value} type="button" aria-pressed={units === value} onClick={() => setUnits(value)}>
                {value === 'metric' ? '°C' : '°F'}
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label="Theme">
            {(['light', 'system', 'dark'] as Theme[]).map((value) => (
              <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>
                {value === 'light' ? 'Light' : value === 'dark' ? 'Dark' : 'Auto'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="button"
            onClick={() => queryClient.invalidateQueries()}
            disabled={fetching}
          >
            {fetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <LocationBar
        current={current}
        onSelect={locations.select}
        saved={locations.saved}
        onSave={locations.save}
        onRemove={locations.remove}
        isSaved={locations.isSaved}
        onLocate={locations.locate}
        locating={locations.locating}
      />

      {locations.geoError && (
        <p className="notice" role="status">
          {locations.geoError}
        </p>
      )}

      {forecast.isPending && !forecast.data && (
        <p className="notice">
          <span className="notice__title">Loading</span>
          Fetching the forecast for {describe(current)}.
        </p>
      )}

      {forecast.isError && (
        <div className="notice notice--error" role="alert">
          <span className="notice__title">No data</span>
          {forecast.error instanceof Error ? forecast.error.message : 'The forecast request failed.'}
          <div style={{ marginTop: 12 }}>
            <button type="button" className="button" onClick={() => forecast.refetch()}>
              Try again
            </button>
          </div>
        </div>
      )}

      {forecast.data && (
        <Dashboard
          forecast={forecast.data}
          airRows={toAqiRows(air.data)}
          airCurrent={air.data?.current}
          units={units}
          range={range}
          place={describe(current)}
          isDefaultPlace={locations.isDefault}
          updatedAt={forecast.dataUpdatedAt}
        />
      )}

      <footer className="footer">
        <span>
          Data ·{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </span>
        <span>Shortcuts · / search · u units · t theme · r refresh</span>
        <span className="footer__spacer" />
        <span>
          {forecast.data
            ? `${forecast.data.timezone} · ${forecast.data.timezone_abbreviation}`
            : 'Awaiting position'}
        </span>
      </footer>
    </div>
  )
}

/**
 * The dashboard proper, rendered only once a forecast exists — which keeps every panel
 * below free of null-checking on the top-level response.
 */
function Dashboard({
  forecast,
  airRows,
  airCurrent,
  units,
  range,
  place,
  isDefaultPlace,
  updatedAt,
}: {
  forecast: NonNullable<ReturnType<typeof useForecast>['data']>
  airRows: ReturnType<typeof toAqiRows>
  airCurrent: NonNullable<ReturnType<typeof useAirQuality>['data']>['current'] | undefined
  units: UnitSystem
  range: Range
  place: string
  isDefaultPlace: boolean
  updatedAt: number
}) {
  const colors = useChartColors()
  const u = UNIT_LABELS[units]
  const digits = precipDigits(units)

  const now = nowAt(forecast.utc_offset_seconds)
  const today = new Date(now).toISOString().slice(0, 10)

  const hours = useMemo(() => toHourRows(forecast), [forecast])
  const days = useMemo(() => toDayRows(forecast, today), [forecast, today])
  const window = useMemo(() => windowFrom(hours, now, range), [hours, now, range])
  const bands = useMemo(() => nightBands(window), [window])

  const current = forecast.current
  const code = weatherCode(current.weather_code)
  const todayRow = days.find((row) => row.day === today)
  const wet = nextWetHour(hours, now)
  const yesterday = changeVsYesterday(hours, now)
  // The tile bands the reading it shows; the day's peak is what matters for planning, so
  // it rides along as a note and drives the hero flag. Banding "now" against the peak
  // would label an overnight 0.0 as "Moderate".
  const uvNow = hours.find((row) => row.t >= now - 3600_000)?.uv ?? 0
  const uv = uvBand(uvNow)
  const uvPeak = uvBand(todayRow?.uvMax)
  const aqi = aqiBand(airCurrent?.us_aqi)
  const currentAqiRow = airRows.find((row) => row.t >= now - 3600_000) ?? airRows[airRows.length - 1]
  const visibility = hours.find((row) => row.t >= now - 3600_000)?.visibility

  // Pressure trend over the last three hours — the direction matters more than the value.
  const pressureNow = current.pressure_msl
  const pressureBefore = hours.find((row) => row.t >= now - 4 * 3600_000)?.pressure
  const pressureTrend = pressureBefore != null ? pressureNow - pressureBefore : null

  const hourly = { rows: window, bands, now, units }


  // The hero carries at most three flags: what changes what you do today. Rain first,
  // then UV, then air quality — each only when it is actually worth acting on.
  const flags: { label: string; value: string; color: string }[] = []
  if (wet) {
    flags.push({
      label: 'Rain expected',
      value: `${num(wet.precipProb)}% at ${formatHour(wet.t)}`,
      color: colors['s-precip'],
    })
  }
  if (uvPeak.level >= 2) {
    flags.push({ label: 'UV peak today', value: uvPeak.label, color: levelColor(colors, uvPeak.level) })
  }
  if (aqi.level >= 1) {
    flags.push({ label: 'Air quality', value: aqi.label, color: levelColor(colors, aqi.level) })
  }
  if (!flags.length && todayRow) {
    flags.push({
      label: 'Today',
      value: `${num(toTemp(todayRow.tempMin ?? 0, units))}–${num(toTemp(todayRow.tempMax ?? 0, units))}${u.temp}`,
      color: colors['s-temp'],
    })
  }

  // Whichever of the two is still ahead — after dark that is tomorrow's sunrise, which is
  // why the next day's row is consulted rather than clamping to today's.
  const sunrise = todayRow?.sunrise?.t
  const sunset = todayRow?.sunset?.t
  const nextSunrise = days.find((row) => (row.sunrise?.t ?? 0) > now)?.sunrise?.t
  if (sunrise != null && sunset != null) {
    const next =
      now < sunrise
        ? { label: 'Sunrise', at: sunrise }
        : now < sunset
          ? { label: 'Sunset', at: sunset }
          : nextSunrise != null
            ? { label: 'Sunrise', at: nextSunrise }
            : null
    if (next) {
      flags.push({ label: next.label, value: formatHour(next.at), color: colors['s-pressure'] })
    }
  }

  return (
    <main>
      {/* Level one: the answer, before any chart. */}
      <div className="hero">
        <div className="hero__place">
          <div className="hero__name">{place}</div>
          <div className="hero__meta">
            {formatWeekday(now)} {formatHour(now)} local
            {isDefaultPlace ? ' · default location' : ''} · updated {sinceLabel(Date.now() - updatedAt)}
          </div>
        </div>

        <div className="hero__temp">
          <WeatherIcon code={current.weather_code} isDay={current.is_day === 1} size={52} />
          <span className="hero__reading">
            {num(toTemp(current.temperature_2m, units))}
            <sup>{u.temp}</sup>
          </span>
        </div>

        <div className="hero__cond">
          <span className="hero__summary">{code.label}</span>
          <span className="hero__detail">
            Feels {num(toTemp(current.apparent_temperature, units))}
            {u.temp}
            {todayRow && (
              <>
                {' · '}
                {num(toTemp(todayRow.tempMin ?? 0, units))}–{num(toTemp(todayRow.tempMax ?? 0, units))}
                {u.temp} today
              </>
            )}
            {yesterday != null && (
              <>
                {' · '}
                {yesterday >= 0 ? '+' : '−'}
                {num(Math.abs(toTempDelta(yesterday, units)), 1)}
                {u.temp} vs 24h ago
              </>
            )}
          </span>
        </div>

        <div className="hero__flags">
          {flags.map((flag) => (
            <Flag key={flag.label} label={flag.label} value={flag.value} color={flag.color} />
          ))}
        </div>

        <HourStrip rows={window} units={units} />
      </div>

      <Section title="Right now">
        <Panel wide>
          <div className="stats stats--fixed">
            <Stat
              label="Wind"
              value={num(toSpeed(current.wind_speed_10m, units))}
              unit={u.speed}
              note={
                <>
                  <WindArrow degrees={current.wind_direction_10m} /> {compass(current.wind_direction_10m)} ·{' '}
                  {windBand(current.wind_speed_10m)}
                </>
              }
              color={colors['s-wind']}
            />
            <Stat
              label="Gusts"
              value={num(toSpeed(current.wind_gusts_10m, units))}
              unit={u.speed}
              note={`+${num(toSpeed(current.wind_gusts_10m - current.wind_speed_10m, units))} ${u.speed}`}
            />
            <Stat
              label="Humidity"
              value={num(current.relative_humidity_2m)}
              unit="%"
              note={`Dew point ${num(toTemp(current.dew_point_2m, units))}${u.temp}`}
              color={colors['s-humidity']}
            />
            <Stat
              label="Pressure"
              value={num(toPressure(pressureNow, units), pressureDigits(units))}
              unit={u.pressure}
              note={
                pressureTrend == null
                  ? '—'
                  : `${pressureTrend > 0.3 ? 'Rising' : pressureTrend < -0.3 ? 'Falling' : 'Steady'} over 3h`
              }
              color={colors['s-pressure']}
            />
            <Stat
              label="Cloud cover"
              value={num(current.cloud_cover)}
              unit="%"
              note={visibility == null ? undefined : `Visibility ${num(toDistance(visibility, units), 1)} ${u.distance}`}
              color={colors['s-cloud']}
            />
            <Stat
              label="UV index"
              value={num(uvNow, 1)}
              note={`${uv.label}${todayRow?.uvMax != null ? ` · max ${num(todayRow.uvMax, 1)}` : ''}`}
              meter={<Meter value={uvNow / 11} color={levelColor(colors, uv.level)} />}
              color={levelColor(colors, uv.level)}
            />
            <Stat
              label="Air quality"
              value={num(airCurrent?.us_aqi)}
              note={aqi.label}
              meter={<Meter value={(airCurrent?.us_aqi ?? 0) / 200} color={levelColor(colors, aqi.level)} />}
              color={levelColor(colors, aqi.level)}
            />
            <Stat
              label="Next rain"
              value={wet ? `${num(wet.precipProb)}%` : 'None'}
              note={wet ? `${formatWeekday(wet.t)} ${formatHour(wet.t)}` : `Dry for the next ${range}h`}
              color={colors['s-precip']}
            />
          </div>
        </Panel>
      </Section>

      <Section title={`Next ${range} hours`}>
        <Panel wide title="Temperature" note={u.temp}>
          <TemperatureChart {...hourly} />
        </Panel>

        {/* Temperature and precipitation are the two questions most visits are about, so
            both get the full row; the supporting four tile beneath them, four across on a
            wide screen and two across on a laptop — an even split at either size. */}
        <Panel wide title="Precipitation" note={`chance % · ${u.precip}`}>
          <PrecipitationChart {...hourly} />
        </Panel>

        <Panel title="Wind" note={u.speed}>
          <WindChart {...hourly} height={170} />
        </Panel>

        <Panel title="Humidity & dew point" note={`% · ${u.temp}`}>
          <HumidityChart {...hourly} height={170} />
        </Panel>

        <Panel title="Cloud & pressure" note={`% · ${u.pressure}`}>
          <CloudPressureChart {...hourly} height={170} />
        </Panel>

        <Panel title="UV index" note="daylight only">
          <UvChart {...hourly} height={170} />
        </Panel>
      </Section>

      <Section title="Past week and forecast">
        <Panel wide title="Daily range" note={`${u.temp} · shaded = observed`}>
          <DailyTrendChart rows={days} now={now} units={units} />
        </Panel>

        <Panel title="By day" note={`${u.temp} · ${u.precip}`}>
          <DayList rows={days} units={units} today={today} currentTemp={current.temperature_2m} />
        </Panel>

        <Panel title="Daylight" note={todayRow ? `${duration(todayRow.daylight)} today` : undefined}>
          <DaylightChart rows={days} now={now} height={214} />
          {todayRow?.sunrise && todayRow.sunset && (
            <div className="stats" style={{ marginTop: 16 }}>
              <Stat
                label="Sunrise"
                value={
                  <>
                    <Sunrise size={17} strokeWidth={1.75} color="var(--s-pressure)" style={{ verticalAlign: '-3px' }} />{' '}
                    {formatHour(parseStamp(todayRow.sunrise.iso).t)}
                  </>
                }
                small
              />
              <Stat
                label="Sunset"
                value={
                  <>
                    <Sunset size={17} strokeWidth={1.75} color="var(--s-pressure)" style={{ verticalAlign: '-3px' }} />{' '}
                    {formatHour(parseStamp(todayRow.sunset.iso).t)}
                  </>
                }
                small
              />
              <Stat label="Daylight" value={duration(todayRow.daylight)} small />
              <Stat label="Sunshine" value={duration(todayRow.sunshine)} small />
            </div>
          )}
        </Panel>
      </Section>

      {airRows.length > 0 && (
        <Section title="Air quality">
          <Panel wide title="Index" note="next 4 days">
            <AqiChart rows={airRows} now={now} />
          </Panel>

          <Panel wide title="Pollutants" note="% of WHO guideline">
            <PollutantChart current={currentAqiRow} />
          </Panel>
        </Section>
      )}

      {/* Level three: reference data, folded away until asked for. */}
      <details className="disclosure">
        <summary>
          Hourly detail
          <span className="disclosure__note">{window.length} rows</span>
        </summary>
        <div className="bento">
          <Panel wide>
            <HourTable rows={window} units={units} />
          </Panel>
          <Panel wide title="Station">
            <div className="stats">
              <Stat label="Latitude" value={forecast.latitude.toFixed(3)} small />
              <Stat label="Longitude" value={forecast.longitude.toFixed(3)} small />
              <Stat label="Elevation" value={num(toElevation(forecast.elevation, units))} unit={u.length} small />
              <Stat label="Timezone" value={forecast.timezone_abbreviation} note={forecast.timezone} small />
              <Stat
                label="Forecast precipitation"
                value={num(
                  toPrecip(
                    days.filter((day) => !day.past).reduce((sum, day) => sum + (day.precipSum ?? 0), 0),
                    units,
                  ),
                  digits,
                )}
                unit={u.precip}
                small
              />
            </div>
          </Panel>
        </div>
      </details>
    </main>
  )
}
