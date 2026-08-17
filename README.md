# Weather

A chart-first weather dashboard. Every number the forecast carries, plotted — hourly
temperature, precipitation, wind, humidity, pressure, cloud, UV and air quality, plus a
three-week daily range that includes the past week so a forecast has something to be read
against.

No API key, no account, no server. It talks to [Open-Meteo](https://open-meteo.com)
directly from the browser.

## Running it

```bash
npm install
```

```bash
npm run dev
```

| Script              | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Vite dev server                                  |
| `npm run build`     | Typecheck, then production build into `dist/`    |
| `npm run typecheck` | Types only                                       |
| `npm run lint`      | oxlint                                           |
| `npm run icons`     | Regenerate the PNG home-screen icons             |

## Using it

- **`/`** focuses the search box; arrows and Enter pick a place. **Locate** uses the
  device's position, and is only asked for on request.
- **`u`** flips metric/imperial, **`t`** cycles light/auto/dark, **`r`** refetches.
- The hourly window is 24, 48 or 72 hours, set in the masthead; it drives every hourly
  chart and the detail table at the bottom.
- The location lives in the URL, so any view can be linked or bookmarked. Up to eight
  places can be saved to the rail under the search box.

## How it fits together

```
src/
  api/openMeteo.ts   one module per remote surface — forecast, air quality, geocoding
  lib/time.ts        naive-local-ISO handling, so the UI runs on the location's clock
  lib/series.ts      parallel API arrays reshaped into chart rows
  lib/units.ts       metric in, whatever you asked for out
  components/charts/ theme.ts holds the palette + axis defaults; the rest are charts
  App.tsx            the panel layout
```

Three decisions worth knowing about:

- **Everything is fetched in metric** and converted at render time, so switching units is
  instant and costs no network.
- **Times come back without a UTC offset** (`2026-08-17T14:00` means 14:00 *there*), so
  `lib/time.ts` parses them into a pseudo-UTC instant and formats them back in UTC. The
  whole app therefore reads in the location's local time, not the viewer's.
- **Chart colours live in `index.css`** and are read out with `getComputedStyle`, because
  Recharts writes colours as SVG presentation attributes where `var()` is not reliably
  resolved. The stylesheet stays the one place the palette is defined.

## Design

Deliberately unlike the other apps in this workspace: an instrument printout. Hairline
rules instead of cards, no shadows or rounded corners, monospaced tabular figures so
columns of readings line up, and one fixed colour per measured quantity — temperature is
always the same orange, precipitation always the same blue — wherever it appears.

Data from [Open-Meteo](https://open-meteo.com), free for non-commercial use under CC BY 4.0.
