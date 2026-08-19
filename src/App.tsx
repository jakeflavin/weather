import { useEffect, useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { LocationBar } from './components/LocationBar'

import { describe, useLocations } from './hooks/useLocations'
import { useSettings, type Theme } from './hooks/useSettings'
import { useAirQuality, useClimatology, useForecast } from './hooks/useWeather'
import { toAqiRows } from './lib/series'
import { type UnitSystem } from './lib/units'

/** How much of the hourly series the charts and table show. */
const RANGES = [24, 48, 72] as const
type Range = (typeof RANGES)[number]
import { Dashboard } from './components/Dashboard'

export default function App() {
  const { units, setUnits, theme, setTheme } = useSettings()
  const locations = useLocations()
  const { current } = locations
  const [range, setRange] = useState<Range>(48)

  const forecast = useForecast(current)
  const air = useAirQuality(current)
  const climate = useClimatology(current)
  const queryClient = useQueryClient()
  const fetching = useIsFetching({ queryKey: ['forecast'] }) > 0

  // Shortcuts for the three things worth reaching for without a pointer.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.isContentEditable ||
        event.metaKey ||
        event.ctrlKey
      )
        return
      if (event.key === 'u') setUnits((value) => (value === 'metric' ? 'imperial' : 'metric'))
      if (event.key === 't')
        setTheme((value) => (value === 'dark' ? 'light' : value === 'light' ? 'system' : 'dark'))
      if (event.key === 'r') queryClient.invalidateQueries()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [queryClient, setTheme, setUnits])

  return (
    <div className="app">
      <header className="appbar">
        <span className="appbar-brand">Weather</span>
        <span className="appbar-spacer" />
        <div className="appbar-tools">
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
              <button
                key={value}
                type="button"
                aria-pressed={units === value}
                onClick={() => setUnits(value)}
              >
                {value === 'metric' ? '°C' : '°F'}
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label="Theme">
            {(['light', 'system', 'dark'] as Theme[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
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
          <span className="notice-title">Loading</span>
          Fetching the forecast for {describe(current)}.
        </p>
      )}

      {forecast.isError && (
        <div className="notice is-error" role="alert">
          <span className="notice-title">No data</span>
          {forecast.error instanceof Error
            ? forecast.error.message
            : 'The forecast request failed.'}
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
          normals={climate.data}
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
        <span className="footer-spacer" />
        <span>
          {forecast.data
            ? `${forecast.data.timezone} · ${forecast.data.timezone_abbreviation}`
            : 'Awaiting position'}
        </span>
      </footer>
    </div>
  )
}
