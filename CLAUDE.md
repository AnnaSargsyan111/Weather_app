# Weather App — project notes for Claude Code

## Purpose

Anna's weather dashboard project. Owner has no coding experience — explain any step
that needs her judgment or action in plain language, don't assume familiarity with
git/npm/CLI/React concepts.

## Stack

- React + Vite, plain CSS Modules per component (no Tailwind, no UI kit).
- Weather + geocoding data: **Open-Meteo** (`src/services/weatherService.js`,
  `geocodingService.js`) — free, no API key.
- Reverse geocoding (for the "current location" button): **Nominatim (OpenStreetMap)**
  (`src/services/reverseGeocodingService.js`) — free, no API key, but has a fair-use
  policy (light/personal use only, no bulk/automated requests).
- Map: **Leaflet + react-leaflet** with OpenStreetMap tiles — free, no API key, no
  billing account required (this is a deliberate choice over Google Maps, which
  requires a Google Cloud billing account even for free-tier usage).
- Air quality: **Open-Meteo's separate Air Quality API** (`air-quality-api.open-meteo.com`,
  `src/services/airQualityService.js`) — free, no key.
- Moon rise/set/phase: **`suncalc`** (npm, `src/services/moonService.js`) — pure
  astronomical math from lat/lon/date, no API/key at all. Import it as
  `import * as SunCalc from "suncalc"` (a plain `import SunCalc from "suncalc"` default
  import broke under Vite's CJS interop the first time this was added).
- Icons: `react-icons` (`wi` weather-icons set + `pi` Phosphor icons for UI chrome).
- Persistence: `localStorage` via `src/hooks/useLocalStorage.js` (saved locations,
  theme, temperature unit).

## No secrets, no `.env`

This app calls no authenticated APIs — there is no API key anywhere and nothing to
gitignore for secrecy. If a future feature needs a real API key (e.g. switching to
Google Maps), reintroduce a `.env` + `.gitignore` entry + document it in a setup guide,
following the pattern from this project's v1 (see git history / an earlier version of
this file if needed) — never hardcode a key into source.

## Architecture

- `src/components/*` — one folder per UI piece: `Header`, `LocationSearch`,
  `LocationSuggestions`, `CurrentLocationButton`, `LocationChip` (its own X button
  removes it directly - no submenu), `ThemeSelector`, `TemperatureUnitSelector`,
  `ClimateLink` (the IPCC link next to the unit selector), `CurrentWeather`,
  `WeatherIcon`, `WeatherMetrics` + `MetricCard`, `WeatherMap`, `LoadingState`, `ErrorState`,
  `InfoTooltip` (portal-rendered metric explanations), `WeatherAtmosphere` (the
  time/weather-driven background scene — sky, sun/moon, stars, clouds, fog,
  canvas-based rain/snow particles).
- `src/hooks/*` — state and data-fetching logic, kept out of components:
  `useSavedLocations` (locations + active id, persisted), `useTheme`,
  `useTemperatureUnit`, `useLocationSearch` (debounced autocomplete, 2-char minimum),
  `useWeather` (fetch for a given location), `useGeolocation` (browser geolocation +
  reverse geocode), `useAtmosphereScene` (derives the atmosphere's scene data from
  weather + real sunrise/sunset — see `src/utils/daylight.js` for the continuous,
  non-abrupt day/night math), `usePrefersReducedMotion`.
- `src/services/*` — the only files that call `fetch()` against external APIs.
  Components/hooks never call `fetch` directly.
- Top-level state lives in `src/App.jsx` and is passed down as props — no Redux/Context,
  the app is small enough that this stays readable.

## Conventions

- Keep API calls inside `src/services/*`, never inline in components.
- Every new color must be a CSS variable from `src/index.css` (`--color-*`), so both
  themes stay consistent — never hardcode a hex color in a component's CSS module.
- Before pushing to GitHub or changing anything in the live Netlify site, confirm with
  Anna first (visible/shared actions).

## WeatherAtmosphere (background scene)

A `position: fixed; z-index: -1` layer behind the whole app (see
`src/components/WeatherAtmosphere/`). Important gotcha: it MUST use a **negative**
z-index, not `0` — a positioned fixed element with `z-index: 0` paints *above*
non-positioned normal-flow content per CSS stacking rules, which would cover the
entire UI. Rain/snow render on a single `<canvas>` (not per-particle DOM nodes) via
`requestAnimationFrame`, paused on `visibilitychange` and skipped entirely under
`prefers-reduced-motion`. Day/night is a continuous function of real sunrise/sunset
(no fixed-hour cutoffs) recomputed every 60s — see `computeDaylight` in
`src/utils/daylight.js`. This was intentionally scoped down from a much larger request
(scroll parallax, lightning, wind-driven card jitter were deferred) — see git history
if extending it further.

## DailyForecast (real 16-day forecast strip)

`src/components/DailyForecast/` (`src/services/dailyForecastService.js`,
`src/hooks/useDailyForecast.js`) — a horizontal strip showing Open-Meteo's real daily
forecast out to `forecast_days=16`, the actual physical limit of reliable day-by-day
weather prediction (verified live). **Note**: Open-Meteo's day 16 consistently returns
`null` for temperatures (verified via a raw curl check) — this is a real API boundary
effect, not a bug; `formatTemp`'s existing `--°` fallback handles it gracefully. This
exists specifically because a genuine forward-looking forecast is NOT possible beyond
this window — see the "Weather forecast" section below for how that constraint was
handled for the (much longer) 12-month view.

## WeatherDetails (13-card detailed dashboard)

`src/components/WeatherDetails/` — the "Weather details" section below the map, one
card per metric (Temperature, Feels Like, Cloud Cover, Precipitation, Wind, Humidity,
UV, AQI, Visibility, Pressure, Sun, Moon, Moon Phase). `useWeatherDetails.js` is the
single hook that fetches Open-Meteo hourly data + air quality + suncalc moon data and
reduces it all into one plain `details` object — every card is a pure function of that
object (per the user's own ask: one JSON shape driving all 13 cards, so swapping data
sources later stays easy). Categorization/trend logic (Beaufort scale, UV/AQI/cloud
labels, peak/trough finding, the "dominant feels-like factor" heuristic) lives in
`src/utils/weatherDetailsHelpers.js`, kept separate from the fetching hook so each rule
can be reasoned about independently. All 13 cards share one `WeatherDetails.module.css`
plus a `DetailCard`/`Badge` shell — deliberately kept on this app's existing CSS Modules
+ react-icons stack rather than the Tailwind/Lucide the original design spec suggested,
to avoid mixing two styling systems in one small app.

## WeatherForecastCalendar ("Weather forecast" 12-month history)

`src/components/WeatherForecastCalendar/` — the section below Weather Details: a
12-month selector + heatmap calendar grid. **Important**: despite the "forecast" name
(kept because that's what the user asked to call it), this shows real **historical**
data from Open-Meteo's free Archive API (`src/services/historicalWeatherService.js`,
`archive-api.open-meteo.com`), not predictions — genuine day-by-day forecasts 12 months
out don't exist for any weather API. The original design spec asked for fabricated mock
data and a fake "AI Trend Insight" sentence; both were replaced with real computed stats
(see the Month Insight banner) to avoid ever presenting made-up numbers as real analysis.
`useMonthlyHistory.js` fetches once per location and buckets the flat daily arrays into
12 month objects (see the hook for the exact shape). The grid uses
`grid-template-columns: repeat(7, minmax(0, 1fr))` (not bare `1fr`) — a bare `1fr` grid
blew out past the viewport on mobile because it doesn't allow tracks to shrink below
their content's min-content width; `minmax(0, 1fr)` plus `min-width: 0` on `.cell` fixed
it. The glass-panel look (`.glassPanel` in `WeatherForecastCalendar.module.css`) uses
`color-mix(in srgb, var(--color-surface) 72%, transparent)` + `backdrop-filter: blur()`
so it stays theme-aware rather than the spec's fixed dark-only background. Day Detail
drawer (hourly chart, UV/AQI/moon/clothing advisory) was scoped out of this pass — noted
below.

## Roadmap ideas (not yet built)

- Multi-day forecast strip (Open-Meteo's `daily` block already has the data available).
- Optional Google Maps mode behind a `VITE_GOOGLE_MAPS_API_KEY` env var, if Anna decides
  she wants Google's map styling badly enough to set up billing for it.
- Atmosphere follow-ups if wanted: subtle scroll parallax for sun/moon, restrained
  lightning flashes during thunderstorms, very slight wind-driven card jitter.
- Day Detail slide-over drawer for the forecast calendar (hourly chart, UV/AQI/humidity/
  moon-phase breakdown, clothing/activity advisory) when a calendar day is clicked.
