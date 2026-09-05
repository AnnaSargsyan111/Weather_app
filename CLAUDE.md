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
  `LocationSuggestions`, `CurrentLocationButton`, `LocationChip`, `LocationMenu`,
  `ThemeSelector`, `TemperatureUnitSelector`, `CurrentWeather`, `WeatherIcon`,
  `WeatherMetrics` + `MetricCard`, `WeatherMap`, `LoadingState`, `ErrorState`.
- `src/hooks/*` — state and data-fetching logic, kept out of components:
  `useSavedLocations` (locations + active id, persisted), `useTheme`,
  `useTemperatureUnit`, `useLocationSearch` (debounced autocomplete),
  `useWeather` (fetch for a given location), `useGeolocation` (browser geolocation +
  reverse geocode).
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

## Roadmap ideas (not yet built)

- Multi-day forecast strip (Open-Meteo's `daily` block already has the data available).
- Optional Google Maps mode behind a `VITE_GOOGLE_MAPS_API_KEY` env var, if Anna decides
  she wants Google's map styling badly enough to set up billing for it.
