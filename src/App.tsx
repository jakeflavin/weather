import { useEffect, useState } from 'react'
import {
  AppBar,
  Brand,
  Footer,
  FooterSpacer,
  FooterTheme,
  Notice,
  NoticeTitle,
  Shell,
  Spacer,
  Tools,
} from './App.styled'
import { Button, Segmented } from './components/controls.styled'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { LocationBar } from './components/LocationBar'

import { describe, useLocations } from './hooks/useLocations'
import { PHONE, useMediaQuery } from './hooks/useMediaQuery'
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
  const phone = useMediaQuery(PHONE)

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

  const rangeControl = (
    <Segmented role="group" aria-label="Hourly range">
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
    </Segmented>
  )

  const themeControl = (
    <Segmented role="group" aria-label="Theme">
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
    </Segmented>
  )

  return (
    <Shell>
      {/*
       * On a phone the masthead keeps only what changes every number on the page — the
       * units — and the action. The hourly range moves into the heading of the section it
       * governs, and the theme moves to the footer: it is a preference set once, and three
       * cells of a 390px masthead is a sixth of the first screen spent on it.
       */}
      <AppBar>
        <Brand>Weather</Brand>
        <Spacer />
        <Tools>
          {!phone && rangeControl}
          <Segmented role="group" aria-label="Units">
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
          </Segmented>
          {!phone && themeControl}
          <Button type="button" onClick={() => queryClient.invalidateQueries()} disabled={fetching}>
            {fetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </Tools>
      </AppBar>

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

      {/*
       * A link that carried a location and could not be used is a different event from
       * arriving with no location at all, and gets said out loud: the reader needs to know
       * the place on screen is not the place they were sent.
       */}
      {locations.linkError && (
        <Notice $error role="alert">
          <NoticeTitle>That link didn’t work</NoticeTitle>
          {locations.linkError} Showing {describe(current)} instead.
        </Notice>
      )}

      {locations.geoError && (
        <Notice as="p" role="status">
          {locations.geoError}
        </Notice>
      )}

      {forecast.isPending && !forecast.data && (
        <Notice as="p">
          <NoticeTitle>Loading</NoticeTitle>
          Fetching the forecast for {describe(current)}.
        </Notice>
      )}

      {forecast.isError && (
        <Notice $error role="alert">
          <NoticeTitle>No forecast</NoticeTitle>
          Couldn’t reach the forecast service for {describe(current)}. Check your connection — the
          data comes straight from Open-Meteo, with nothing in between.
          <div style={{ marginTop: 12 }}>
            <Button type="button" onClick={() => forecast.refetch()}>
              Try again
            </Button>
          </div>
        </Notice>
      )}

      {forecast.data && (
        <Dashboard
          forecast={forecast.data}
          airRows={toAqiRows(air.data)}
          airCurrent={air.data?.current}
          normals={climate.data}
          units={units}
          range={range}
          rangeControl={phone ? rangeControl : null}
          place={describe(current)}
          isDefaultPlace={locations.isDefault}
          updatedAt={forecast.dataUpdatedAt}
        />
      )}

      <Footer>
        <span>
          Data ·{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </span>
        <span>Shortcuts · / search · u units · t theme · r refresh</span>
        <FooterSpacer />
        {phone && <FooterTheme>{themeControl}</FooterTheme>}
        <span>
          {forecast.data
            ? `${forecast.data.timezone} · ${forecast.data.timezone_abbreviation}`
            : forecast.isError
              ? 'No connection to Open-Meteo'
              : 'Loading the forecast'}
        </span>
      </Footer>
    </Shell>
  )
}
