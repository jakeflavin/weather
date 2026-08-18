# Weather

A chart-first weather dashboard. Every number the forecast carries, plotted — hourly
temperature, precipitation, wind, humidity, pressure, cloud, UV and air quality, a
three-week daily range against a ten-year baseline, and animated precipitation radar.

No API key, no account, no server. It talks to [Open-Meteo](https://open-meteo.com),
[RainViewer](https://www.rainviewer.com) and [CARTO](https://carto.com) directly from the
browser, all of which are usable without credentials.

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
- The radar plays two hours of observed frames plus any nowcast. Scrub with the timeline,
  and set palette and opacity underneath it. The wheel deliberately does **not** zoom — a
  map that swallows the scroll halfway down a long page is a trap; use the buttons,
  double-click or pinch. Detail stops at zoom 7, which is as far as RainViewer renders;
  past that the imagery is upscaled rather than dropped.
- The location lives in the URL, so any view can be linked or bookmarked. Up to eight
  places can be saved to the rail under the search box.

## How it fits together

```
src/
  api/openMeteo.ts   forecast, air quality, geocoding, and the historical archive
  api/rainviewer.ts  the radar frame index and its tile URLs
  lib/time.ts        naive-local-ISO handling, so the UI runs on the location's clock
  lib/series.ts      parallel API arrays reshaped into chart rows
  lib/climate.ts     ten years of archive reduced to a daily baseline
  lib/units.ts       metric in, whatever you asked for out
  components/charts/ theme.ts holds the palette + axis defaults; the rest are charts
  components/RadarPanel.tsx  Leaflet, driven imperatively (see below)
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
- **The radar drives Leaflet imperatively**, not through a React wrapper. Smooth animation
  means keeping every visited frame mounted as its own tile layer and swapping opacity
  between them; reconciling sixteen tile layers through React on every tick fights that.
  The panel is lazy-loaded, so Leaflet stays out of the main bundle.
- **The baseline is a ten-year average, not a climate normal.** WMO normals are computed
  over thirty years and published by national services; this is ten years of Open-Meteo
  archive, pooled over a seven-day window to damp the noise. The UI says "10-yr avg" for
  exactly that reason — calling it a normal would claim more than the data supports.

## Design

Shares fibo's Atlassian Design System skin, so the two apps read as siblings: full-bleed
chrome with structure from 1px dividers rather than floating cards, system sans at three
sizes, quiet sentence-case section headers, and blue as the only interactive accent.
Tokens and shadows are lifted directly from fibo's `styles.css`.

What weather adds is a data palette — one colour per measured quantity, held constant
everywhere that quantity appears, including the sky icons (lucide) in the hero, the day
list and the hourly table. That follows the same rule fibo applies to its per-player
identity colours: those hues are content, not chrome, and never appear on a control.

Two layout rules do most of the work:

- **Sections carry the hierarchy.** The page is a hero answering "what is it like out
  there" — the reading, the condition, a few flags for what changes your day, and the next
  twelve hours — then four bands of panels. A section's heading sits on the same surface as the
  panels it introduces, with the sunken background showing only in the gap *between*
  sections — a heading on its own strip above a rule reads as a divider, not a title.
- **Rows always fill.** Panels are flex items, not grid tracks, so a row that does not
  divide evenly grows its members instead of stranding empty cells. A grid of `auto-fit`
  tracks cannot do this: five tiles in a four-track grid leaves three holes. The eight
  condition readings are the exception — they use fixed counts of 8/4/2, all of which
  divide eight, because a strip of numbers also has to keep its columns aligned between
  rows, which growing flex items do not.

Forecast, air quality and archive data from [Open-Meteo](https://open-meteo.com), free for
non-commercial use under CC BY 4.0. Radar mosaic from
[RainViewer](https://www.rainviewer.com). Basemap © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors, © [CARTO](https://carto.com/attributions).
