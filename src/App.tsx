import { useEffect, useMemo, useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { LocationBar } from './components/LocationBar'
import { DayList } from './components/DayList'
import { HourTable } from './components/HourTable'
import { Panel } from './components/Panel'
import { Meter, Stat } from './components/Readouts'
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
      <header className="masthead">
        <span className="masthead__mark">Weather</span>
        <span className="masthead__spacer" />
        <div className="masthead__tools">
          <div className="segmented" role="group" aria-label="Hourly range">
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={range === value}
                onClick={() => setRange(value)}
              >
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
                {value === 'light' ? '☀' : value === 'dark' ? '☾' : 'Auto'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => queryClient.invalidateQueries()}
            disabled={fetching}
          >
            {fetching ? 'Loading' : 'Refresh'}
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
          <span className="notice__title">Reading instruments</span>
          Fetching the forecast for {describe(current)}.
        </p>
      )}

      {forecast.isError && (
        <div className="notice" role="alert">
          <div className="notice__title">No data</div>
          {forecast.error instanceof Error ? forecast.error.message : 'The forecast request failed.'}
          <div style={{ marginTop: 12 }}>
            <button type="button" className="icon-button" onClick={() => forecast.refetch()}>
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
        <span>Keys · / search · u units · t theme · r refresh</span>
        <span className="masthead__spacer" />
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
  const uv = uvBand(hours.find((row) => row.t >= now - 3600_000)?.uv ?? todayRow?.uvMax)
  const aqi = aqiBand(airCurrent?.us_aqi)
  const currentAqiRow = airRows.find((row) => row.t >= now - 3600_000) ?? airRows[airRows.length - 1]
  const visibility = hours.find((row) => row.t >= now - 3600_000)?.visibility

  // Pressure trend over the last three hours — the direction matters more than the value.
  const pressureNow = current.pressure_msl
  const pressureBefore = hours.find((row) => row.t >= now - 4 * 3600_000)?.pressure
  const pressureTrend = pressureBefore != null ? pressureNow - pressureBefore : null

  const hourly = { rows: window, bands, now, units }

  return (
    <main className="grid">
      <Panel span={7} note={`Updated ${sinceLabel(Date.now() - updatedAt)}`}>
        <div className="now">
          <div>
            <div className="now__place">{place}</div>
            <div className="now__sub">
              {formatWeekday(now)} {formatHour(now)} local
              {isDefaultPlace ? ' · default location' : ''}
            </div>
          </div>
          <div className="now__temp">
            {num(toTemp(current.temperature_2m, units))}
            <sup>{u.temp}</sup>
          </div>
          <div>
            <div className="now__cond">
              <span className="now__glyph" aria-hidden="true">
                {code.glyph}
              </span>
              {code.label}
            </div>
            <div className="now__sub">
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
            </div>
          </div>
        </div>
      </Panel>

      <Panel span={5} title="Conditions now">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))', gap: '14px 18px' }}>
          <Stat
            label="Wind"
            value={num(toSpeed(current.wind_speed_10m, units))}
            unit={u.speed}
            note={`${compass(current.wind_direction_10m)} · ${windBand(current.wind_speed_10m)}`}
            color={colors['s-wind']}
            small
          />
          <Stat
            label="Gusts"
            value={num(toSpeed(current.wind_gusts_10m, units))}
            unit={u.speed}
            note={`${num(toSpeed(current.wind_gusts_10m - current.wind_speed_10m, units))} over sustained`}
            small
          />
          <Stat
            label="Humidity"
            value={num(current.relative_humidity_2m)}
            unit="%"
            note={`Dew ${num(toTemp(current.dew_point_2m, units))}${u.temp}`}
            color={colors['s-humidity']}
            small
          />
          <Stat
            label="Pressure"
            value={num(toPressure(pressureNow, units), pressureDigits(units))}
            unit={u.pressure}
            note={
              pressureTrend == null
                ? '—'
                : `${pressureTrend > 0.3 ? '↑ rising' : pressureTrend < -0.3 ? '↓ falling' : '→ steady'} 3h`
            }
            color={colors['s-pressure']}
            small
          />
          <Stat
            label="UV index"
            value={num(uv.level === 0 && !todayRow?.uvMax ? 0 : hours.find((row) => row.t >= now - 3600_000)?.uv ?? 0, 1)}
            note={
              <>
                {uv.label}
                <Meter value={(hours.find((row) => row.t >= now - 3600_000)?.uv ?? 0) / 11} color={levelColor(colors, uv.level)} />
              </>
            }
            color={levelColor(colors, uv.level)}
            small
          />
          <Stat
            label="Air quality"
            value={num(airCurrent?.us_aqi)}
            note={
              <>
                {aqi.label}
                <Meter value={(airCurrent?.us_aqi ?? 0) / 200} color={levelColor(colors, aqi.level)} />
              </>
            }
            color={levelColor(colors, aqi.level)}
            small
          />
          <Stat
            label="Cloud"
            value={num(current.cloud_cover)}
            unit="%"
            note={visibility == null ? '—' : `Vis ${num(toDistance(visibility, units), 1)} ${u.distance}`}
            color={colors['s-cloud']}
            small
          />
          <Stat
            label="Next rain"
            value={wet ? `${num(wet.precipProb)}%` : '—'}
            note={wet ? `${formatWeekday(wet.t)} ${formatHour(wet.t)}` : 'None in window'}
            color={colors['s-precip']}
            small
          />
        </div>
      </Panel>

      <Panel span={12} title={`Temperature · next ${range} hours`} note={`${u.temp} · night shaded`} flush>
        <TemperatureChart {...hourly} />
      </Panel>

      <Panel span={6} title="Precipitation" note={`chance % · ${u.precip}`} flush>
        <PrecipitationChart {...hourly} />
      </Panel>

      <Panel span={6} title="Wind" note={u.speed} flush>
        <WindChart {...hourly} />
      </Panel>

      <Panel
        span={12}
        title="Daily range"
        note={`${u.temp} · one week back, forecast ahead · shaded region observed`}
        flush
      >
        <DailyTrendChart rows={days} now={now} units={units} />
      </Panel>

      <Panel span={5} title="By day" note={`${u.temp} · ${u.precip}`}>
        <DayList rows={days} units={units} today={today} currentTemp={current.temperature_2m} />
      </Panel>

      <Panel
        span={7}
        title="Daylight"
        note={todayRow ? `${duration(todayRow.daylight)} today` : undefined}
        flush
      >
        <DaylightChart rows={days} />
        {todayRow?.sunrise && todayRow.sunset && (
          <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
            <Stat label="Sunrise" value={formatHour(parseStamp(todayRow.sunrise.iso).t)} small />
            <Stat label="Sunset" value={formatHour(parseStamp(todayRow.sunset.iso).t)} small />
            <Stat label="Daylight" value={duration(todayRow.daylight)} small />
            <Stat label="Sunshine" value={duration(todayRow.sunshine)} small />
          </div>
        )}
      </Panel>

      <Panel span={6} title="Humidity & dew point" note="% · °" flush>
        <HumidityChart {...hourly} />
      </Panel>

      <Panel span={6} title="Cloud & pressure" note={`% · ${u.pressure}`} flush>
        <CloudPressureChart {...hourly} />
      </Panel>

      <Panel span={6} title="UV index" note="daylight hours only" flush>
        <UvChart {...hourly} />
      </Panel>

      <Panel span={6} title="Pollutants" note="vs WHO guideline" flush>
        {currentAqiRow ? (
          <PollutantChart current={currentAqiRow} />
        ) : (
          <p className="stat__note">Air quality data is unavailable for this location.</p>
        )}
      </Panel>

      {airRows.length > 0 && (
        <Panel span={12} title="Air quality index" note="US AQI · next 4 days" flush>
          <AqiChart rows={airRows} now={now} />
        </Panel>
      )}

      <Panel span={12} title={`Hourly detail · next ${range} hours`} note={`${window.length} rows`}>
        <HourTable rows={window} units={units} />
      </Panel>

      <Panel span={12}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px' }}>
          <Stat label="Latitude" value={forecast.latitude.toFixed(3)} small />
          <Stat label="Longitude" value={forecast.longitude.toFixed(3)} small />
          <Stat
            label="Elevation"
            value={num(toElevation(forecast.elevation, units))}
            unit={u.length}
            small
          />
          <Stat label="Timezone" value={forecast.timezone_abbreviation} note={forecast.timezone} small />
          <Stat
            label="Precip total"
            value={num(
              toPrecip(
                days.filter((day) => !day.past).reduce((sum, day) => sum + (day.precipSum ?? 0), 0),
                units,
              ),
              digits,
            )}
            unit={u.precip}
            note="forecast window"
            small
          />
        </div>
      </Panel>
    </main>
  )
}
