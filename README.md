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

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Vite dev server                               |
| `npm run build`     | Typecheck, then production build into `dist/` |
| `npm run typecheck` | Types only                                    |
| `npm run lint`      | oxlint                                        |
| `npm run icons`     | Regenerate the PNG home-screen icons          |

## Using it

- **`/`** focuses the search box; arrows and Enter pick a place.
- **A cold open asks for your position by itself** — no link, no history, no button to
  find first. A shared link and a returning visit both skip the prompt entirely, because
  each already knows where it is going, and the fallback city is on screen throughout so
  nothing is blocked on the permission dialog. **Locate** re-asks at any time.
- **`u`** flips metric/imperial, **`t`** cycles light/auto/dark, **`r`** refetches.
- The hourly window is 24, 48 or 72 hours; it drives every hourly chart and the detail
  table at the bottom. It sits in the masthead on a wide screen and in the heading of the
  section it governs on a phone, where the masthead has no room to spare.
- The radar plays two hours of observed frames plus any nowcast. The timeline is a single
  slider, so the whole strip is the target and the arrow keys work; palette and opacity sit
  underneath it. Playback steps at a slideshow's pace under `prefers-reduced-motion`.
  The wheel deliberately does **not** zoom — a
  map that swallows the scroll halfway down a long page is a trap; use the buttons,
  double-click or pinch. Detail stops at zoom 7, which is as far as RainViewer renders;
  past that the imagery is upscaled rather than dropped.
- The location lives in the URL, so any view can be linked or bookmarked. A link whose
  coordinates cannot be used says so and is left in the address bar unaltered, rather than
  quietly becoming the fallback city. Up to eight places can be saved to the rail under
  the search box, and all eight are visible at every width.

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
- **Times come back without a UTC offset** (`2026-08-17T14:00` means 14:00 _there_), so
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
Tokens and shadows are lifted directly from fibo's `styles.css`. The type is the system
stack and nothing else — there is no web font to fetch.

What weather adds is a data palette — one colour per measured quantity, held constant
everywhere that quantity appears, including the sky icons (lucide) in the hero, the day
list and the hourly table. That follows the same rule fibo applies to its per-player
identity colours: those hues are content, not chrome, and never appear on a control.

Three layout rules do most of the work:

- **Sections carry the hierarchy.** The page is a hero answering "what is it like out
  there" — the reading, the condition, a few flags for what changes your day, and the next
  twelve hours — then four bands of panels. A section's heading sits on the same surface as the
  panels it introduces, with the sunken background showing only in the gap _between_
  sections — a heading on its own strip above a rule reads as a divider, not a title.
- **Rows always fill.** Panels are flex items, not grid tracks, so a row that does not
  divide evenly grows its members instead of stranding empty cells. A grid of `auto-fit`
  tracks cannot do this: five tiles in a four-track grid leaves three holes. The eight
  condition readings are the exception — they use fixed counts of 8/4/2, all of which
  divide eight, because a strip of numbers also has to keep its columns aligned between
  rows, which growing flex items do not.
- **A finger gets 44px.** The ADS cell heights this skin is built on — 30px segmented
  cells, 32px buttons — are right for a pointer and a gamble for a finger, so every control
  takes a 44px floor on a coarse pointer while the desktop skin is left alone. The same
  rule is why the radar timeline is one slider rather than a button per frame, and why the
  masthead sheds the range and theme controls on a phone: they move to the section they
  govern and to the footer, and the bar goes from three rows to one.

Forecast, air quality and archive data from [Open-Meteo](https://open-meteo.com), free for
non-commercial use under CC BY 4.0. Radar mosaic from
[RainViewer](https://www.rainviewer.com). Basemap © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors, © [CARTO](https://carto.com/attributions).

## Standards

Code in this repo follows the [shared standards](https://github.com/jakeflavin/portfolio/blob/main/docs/STANDARDS.md) and [layout](https://github.com/jakeflavin/portfolio/blob/main/docs/LAYOUT.md) used across the directory.
