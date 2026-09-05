# Weather App

A premium, production-quality weather dashboard: search any city, save multiple
locations, switch between Light/Dark themes and °C/°F, see current conditions plus
key metrics, and view the location on an interactive map.

## What it does

- Search-with-autocomplete for any city worldwide, powered by Open-Meteo's free
  geocoding API (no signup, no API key).
- "Use my location" button (browser geolocation + reverse geocoding).
- Save multiple locations as chips; switch between them, remove them via a 3-dot menu.
- Light and Dark themes, and °C/°F unit switching — both remembered across visits.
- Current conditions (temperature, feels-like, high/low, sunrise/sunset, condition +
  icon) plus a metrics grid (wind, humidity, visibility, pressure, dew point).
- An interactive OpenStreetMap view of the selected location, with a button to open it
  in a new tab.
- Nothing here needs an API key — both the weather data (Open-Meteo) and the map
  (OpenStreetMap/Leaflet) are free, keyless, public services.

## Running it locally

1. Install dependencies (only needed once, or after `package.json` changes):
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. It prints a local URL (usually `http://localhost:5173`) — open that in your browser.

## Building for production

```bash
npm run build
```

This outputs a static site into `dist/`, which is exactly what Netlify deploys.

## How it's deployed

This site is a plain static build — no server, no serverless functions, no
environment variables required. Once the GitHub repo is connected to Netlify, Netlify
runs `npm run build` and publishes the `dist/` folder automatically on every push to
`main`.

## Project structure

```
weather-app/
├── index.html                 # Vite entry point
├── src/
│   ├── main.jsx                 # React app bootstrap
│   ├── App.jsx                   # top-level layout & state
│   ├── index.css                  # theme tokens (light/dark) & global styles
│   ├── components/                  # one folder per UI piece (see CLAUDE.md for the list)
│   ├── hooks/                         # useWeather, useLocationSearch, useSavedLocations, etc.
│   ├── services/                        # geocoding / weather / reverse-geocoding API calls
│   └── utils/                             # temperature, wind direction, time formatting helpers
├── netlify.toml                            # Netlify build config
└── CLAUDE.md                                 # project notes for future Claude Code sessions
```
