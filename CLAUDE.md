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

## Roadmap ideas (not yet built)

- Multi-day forecast strip (Open-Meteo's `daily` block already has the data available).
- Optional Google Maps mode behind a `VITE_GOOGLE_MAPS_API_KEY` env var, if Anna decides
  she wants Google's map styling badly enough to set up billing for it.
- Atmosphere follow-ups if wanted: subtle scroll parallax for sun/moon, restrained
  lightning flashes during thunderstorms, very slight wind-driven card jitter.
