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
  requires a Google Cloud billing account even for free-tier usage). `WeatherMap.jsx`
  defaults to `zoom={13}` and `flyTo`s (not `setView`) on location change for a smooth
  animated recenter. Clicking anywhere on the map opens Google Maps to the same
  coordinates in a new tab (`window.open` to a plain `google.com/maps/@lat,lon,zoom`
  URL — this is just a link, not the Maps JavaScript API, so it needs no key/billing).
  That click is wired via react-leaflet's `useMapEvent("click", ...)`, not a plain DOM
  `onClick` on the wrapper - Leaflet stops event propagation for its own zoom-control
  and attribution-link clicks internally, so listening on Leaflet's own click event
  (rather than the wrapper div) is what keeps those controls from also triggering the
  external-open handler. The external-link icon in the top-right corner is
  opacity-revealed on `.wrapper:hover`/`:focus-within` (same pattern as the tooltips in
  `ClimateLink`/`CurrentLocationButton`) but forced visible via `@media (hover: none)`
  for touch devices, which can't hover to reveal it.
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
if extending it further. **Update**: scroll parallax and thunderstorm lightning were
later added (see below); wind-driven card jitter is still not built.

The sky gradient blends toward a `RAIN_TOP`/`RAIN_BOTTOM` (moodier/darker) or
`SNOW_TOP`/`SNOW_BOTTOM` (pale/frosted) tint when `scene.precipitationKind` is "rain"
or "snow", layered on top of the existing brightness/cloud-cover blend rather than
replacing it, so day/night continuity is preserved. Before this, rain and snow only
differed visually via the particle canvas, not the sky color itself. Snow's blend
amount is additionally scaled by `brightness` so a snowy night doesn't render an
implausibly pale sky. The `RAIN_TOP`/`RAIN_BOTTOM` tint and blend ceiling were later
darkened further (and `PrecipitationCanvas`'s rain particle count roughly doubled -
`MAX_RAIN_PARTICLES`, kept separate from `MAX_SNOW_PARTICLES` so snow density wasn't
changed - with wider opacity/line-width variance per drop for a sense of depth) for a
more prominent, stormier rain mood; snow's canvas density and sky tint were left as
they were, since only rain was reported as too subtle.

Rain's fall angle was later made a deliberate stylistic choice rather than a physically
wind-accurate one: `rainLean` in `PrecipitationCanvas.jsx`'s `step()` is
`-1 + windLean * 0.25` - always negative (top-right to bottom-left), with real wind only
adding a subtle secondary wobble on top rather than ever flipping the dominant diagonal.
Used for both the per-frame `x` position update and the drawn streak's own tilt (`dx`),
so the line itself visually slants the same direction it's moving. Snow's fall angle is
untouched and still follows real `windLean` directly, since only rain's direction was
asked to change.

**Premium atmosphere upgrade** (scroll parallax, lightning, richer sun/moon/clouds):
- **Sun/moon dimming by cloud cover**: previously the sun/moon's opacity depended only
  on `brightness` (time of day), so a full-opacity sun rendered even under heavy
  overcast. Now both are also scaled by a `skyOcclusion` factor derived from
  `cloudCover` (`1 - min(0.88, cloudCover * 0.92)`) - heavy overcast nearly hides them,
  while lighter cover during rain naturally reads as a "sun shower" without any
  special-cased condition for it.
- **Sun/moon glow**: each is now a `celestialWrap` containing a soft blurred `*Halo`
  layer behind the disc, with a slow (7-10s) "breathing" scale/opacity animation for a
  sense of life rather than a static circle. Paused under `prefers-reduced-motion`.
- **Two cloud layers** (`cloudsFar`/`cloudsNear`, in `WeatherAtmosphere.jsx`) instead of
  one, for depth - different sizes, speeds, and (via the scroll parallax below)
  different parallax rates. Cloud color now blends from near-white to slate-grey based
  on `cloudCover` (previously always the same white/dark-blue regardless of how overcast
  it actually was), with an irregular `border-radius` per cloud instead of a perfect
  ellipse.
- **Richer sunrise/sunset**: the old single warm-orange `goldenGlow` overlay was
  replaced with a peach → pink → lavender 3-stop band (`DAWN_PEACH`/`DAWN_PINK`/
  `DAWN_LAVENDER`), still scaled by the existing `goldenness` factor - no changes to the
  underlying day/night timing math, just the color treatment applied during it.
- **Thunderstorm lightning**: `scene.precipitationKind === "thunderstorm"` (already a
  distinct value from `getPrecipitationKind`, just previously unused) schedules a rare
  (7-22s random gap, never a fixed loop) soft double-flash via a `lightning` state
  value and a `.lightning` full-screen radial overlay with `mix-blend-mode: screen`.
  Never fires for plain rain, only genuine thunderstorm conditions.
- **Scroll parallax**: sun/moon/cloud-layers/stars shift at different rates
  (0.05/0.035-0.015/0.008 of `scrollY`) via a `--parallax-y` CSS custom property
  mutated directly through refs in a capture of `window.scrollY` (not React state -
  scroll fires far too often to re-render on every event) inside an
  `requestAnimationFrame`-throttled scroll handler. Skipped under
  `prefers-reduced-motion`; self-disables under a 640px width check that's re-evaluated
  on **every** tick (not once at mount) - an earlier version checked `innerWidth` only
  when the effect first ran, which meant a viewport that was momentarily unmeasurable
  right at mount (e.g. a backgrounded tab) could permanently disable parallax for that
  entire page load. The atmosphere itself is already `position: fixed` and structurally
  separate from page content, so none of this ever touches the actual app layout.
- **Sky transitions**: added `transition: background-image 1.2s ease` to `.sky` for
  smoother blending when the underlying color target jumps (switching location,
  weather condition changing) rather than drifting continuously as time passes.

A hero-area "frosted glass" look sits on top of this: `--glass-bg`/`--glass-border`/
`--glass-blur` (in `index.css`, themed for both light/dark) back the current-weather
card, the Wind/Humidity/Visibility/Pressure stat cards, the Weather overview donut
card, and the map's border — `background: var(--glass-bg)` +
`backdrop-filter: blur(var(--glass-blur))` instead of the opaque `--color-surface`
used everywhere else, so the animated sky shows through, blurred. This is deliberately
a *separate* token pair from `--color-surface`, not a change to `--color-surface`
itself — dropdown menus, tooltips, and nested cards elsewhere in the app depend on
`--color-surface` staying fully opaque. It's also deliberately theme-aware (translucent
white + dark text in Light, translucent dark + light text in Dark) rather than a single
hardcoded dark-glass-with-white-text look — the latter would be illegible in Light
theme against a bright daytime sky. The map's own tile layer is left unblurred (only
its border uses `--glass-border`) since blurring the actual map content would defeat
its purpose; sections further down the page (Weather details, Forecast calendar,
Overview's Climate summary/News) keep the normal opaque `--color-surface` look.

`InfoTooltip`'s trigger (the small "i" circle used by `MetricCard` on the stat cards)
was bumped from 16px/`--color-text-tertiary` to 20px/`--color-text-secondary` with an
explicit `opacity: 0.8` → `1` on hover, since it read as nearly invisible against the
glass cards above. It's pinned to each card's top-right corner via a `margin-left: auto`
wrapper span in `MetricCard.jsx` (`.infoSlot` in `MetricCard.module.css`) rather than
baking that positioning into `InfoTooltip` itself, since `InfoTooltip` is meant to be
layout-agnostic if it's ever reused somewhere that isn't a left-to-right icon+label row.
**Update**: brought down to 14px / opacity 0.6 → 1 (200ms) - the 20px/0.8 version read
as too heavy once seen next to the rest of the UI; the color stayed
`--color-text-secondary` rather than a hardcoded white, since a fixed white icon would
be invisible against Light theme's pale glass cards. **Update 2**: 14px then turned out
too small to read - settled on 18px (icon glyph 13px) as the middle ground between the
two rejected extremes (16px was also tried and still called too small).

`.infoSlot` also gained `align-self: flex-start` (plus a small `margin-top: 2px` nudge) -
without it, a label that wraps to two lines (e.g. "Dew Point" in the 5-column metrics
grid, which only fits that in one line when the left hero column is wide enough) had the
icon vertically centered against the label's *full* two-line height by `.top`'s own
`align-items: center`, landing it between "Dew" and "Point" rather than next to either.
`align-self` overrides that for just this one flex item, pinning it to the first line
regardless of how many lines the label wraps to.

**Update 3**: "increase every icon 2x" was scoped down (via a clarifying question, since
a literal app-wide 2x risked overflowing tightly-sized contexts like 44px circular
header buttons that were never part of this thread) to just this metrics-card area:
`MetricCard`'s weather-type icon (`Icon size={...}` in `MetricCard.jsx`) went 18px →
36px, and `InfoTooltip`'s trigger went 18px/13px-glyph → 36px/26px-glyph. Nowhere else
in the app was touched. **Update 4**: the 36px weather-type icon triggered a real grid
overflow bug (see `WeatherMetrics` below) and was reverted back to 18px; `InfoTooltip`'s
trigger was left at 36px/26px since only the weather-type icon was reported as the
problem.

Section titles across `WeatherDetails`/`WeatherForecastCalendar`/`WeatherOverview`/
`WeatherNews` are now uniformly 18px/700/`var(--color-text)` -
`WeatherForecastCalendarSection`'s `.title` used to be a distinct 22px/800 gradient-clip
treatment (`background-clip: text`) left over from before the other three sections
adopted the plain-title convention; it was brought in line rather than the other way
around, since 3 of 4 already matched.

The active tab's accent (`LocationChip.jsx`/`.module.css`) now reflects that specific
city's own real day/night state (`data.isDay`, the same live Open-Meteo `is_day` flag
its weather icon already uses) rather than the manual Light/Dark theme toggle - a city
can be in daylight while the user has Dark theme on, or vice versa, so tying this to the
theme toggle would have been the wrong axis. `.chipActiveDay` (sky-blue) and
`.chipActiveNight` (indigo) each carry their own `[data-theme="dark"]` override, since
e.g. a light sky-blue tint needs dark text on a light chip surface but light text once
the surrounding surface itself goes dark - four total combinations, not two. Falls back
to the old neutral `.chipActive` (plain accent color) only for the brief moment before
that chip's own `useWeather` call resolves. The Header's own background switched from
opaque `--color-bg-elevated` to the shared `--glass-bg`/`--glass-border`/`--glass-blur`
tokens, matching the hero cards below it.

Verification note: `getComputedStyle` returned stale/incorrect values for the chip
accent colors in this session's testing (reporting the old orange `--color-accent`
values on an element whose class list and `.matches()` results both proved only the new
rule could apply) while a real screenshot showed the correct sky-blue/indigo rendering -
consistent with this session's broader pattern of the automated browser pane's paint
pipeline being unreliable while reported as hidden/backgrounded. Trust a screenshot or
`.matches()` over `getComputedStyle` if this resurfaces.

All four standalone page section titles (Weather details/forecast/overview/news - not
"Climate information"/"Daily summary" etc., which already sit inside an opaque/glass
card) are now a small glass pill (`--glass-bg`/`--glass-border`/`--glass-blur`,
`border-radius: 999px`) rather than bare text, since they sit directly on the animated
sky (`WeatherAtmosphere`), which varies independently of the manual Light/Dark theme -
plain `color: var(--color-text)` text could land dark-on-dark (Light theme at night) or
light-on-light (Dark theme in bright daylight). The pill's background dampens whatever
sky color is behind it and is already paired with a contrasting text color by the
existing tokens, so contrast holds in all four Light/Dark × day/night combinations.

`CurrentWeather.jsx` shows a live local clock next to the location name ("Singapore,
Singapore • 1:57 AM") via `useLocalClock(weather.timezone)`
(`src/hooks/useLocalClock.js`) - `weather.timezone` is Open-Meteo's own resolved IANA
timezone from `timezone=auto` (e.g. "Asia/Yerevan"), not guessed from coordinates.
Deliberately distinct from `formatClockTime` (used for sunrise/sunset): those are naive
local-wall-clock strings the API already returns in local time, so they're parsed
directly with no timezone conversion; the live clock needs the opposite - converting the
actual current instant into that timezone's wall-clock time - so it uses
`Intl.DateTimeFormat` with the `timeZone` option, ticking via a plain 30s
`setInterval`, correct enough for a "changes every minute" display without needing
alignment to the exact minute boundary. Switching the active location updates the
displayed time immediately, without waiting for the next tick, since the format simply
reapplies to the same current instant using the new `timezone`.

**Update**: `useLocalClock` is now called exactly **once**, in `App.jsx`, and the
resulting `localTime` string is passed down as a prop to both `CurrentWeather` and
`WeatherDetailsSection` - not called separately in each. "Weather details" section's
own heading merges that same value directly into the `<h2>` text ("Weather details
9:51 PM", one space, no separator), replacing the old `.sectionTime` span that used to
show `details.updatedAt` (a "last fetched" timestamp from `useWeatherDetails`, a
different value than the live clock) - `details.updatedAt` itself is untouched and
still used by `PressureCard`. Two components sharing one prop from a common ancestor,
rather than each calling the hook independently, is what guarantees the two headings
can never drift apart by even a tick.

`CurrentWeather` also shows a one-line contextual insight under the condition label
("Overcast" → "Rain is likely later today.") via `buildWeatherInsight` in
`src/utils/weatherInsight.js`, built entirely from `details` (already-fetched hourly
data from `useWeatherDetails` - no new fetch): precipitation probability takes priority
over everything else, then a significant temperature swing, then strong wind, then a
plain cloud-cover description as the fallback. `weather.time` (a naive local string) is
parsed for its hour only to decide "this evening"/"this afternoon"/"today" phrasing -
deliberately not `new Date(weather.time)`, which would parse that naive string against
the *browser's* timezone rather than the location's.

## WhatToWear (outfit recommendation)

`src/components/WhatToWear/` - rendered in `App.jsx` between the hero `.content` grid
and `WeatherDetailsSection` (a sibling section, not nested inside `WeatherDetailsSection`
itself, so that component stays untouched): **Current Weather → What to Wear Today →
Weather details**. Reuses the same `details` object `WeatherDetailsSection` already has
for its cards - no second weather-fetching system. `getOutfitRecommendation`
(`src/utils/outfitAdvisor.js`) combines feels-like temperature, precipitation (current
condition or ≥55% probability), and wind speed (≥30 km/h) rather than temperature
alone - e.g. 24°C with strong wind gets the "windy" outfit set, not the same one as
24°C calm. All thresholds are Celsius, since `details.feelsLike.current`/
`details.temperature.current` are always Celsius internally regardless of the unit
toggle - this makes the whole feature correct under °F for free, with no unit-conversion
logic of its own. Heading and card visually match `WeatherDetails.module.css`'s
`.sectionTitle`/`.card` exactly (same glass pill, same opaque `--color-surface` card
treatment) rather than introducing a new visual language. Icons are plain emoji
(🧥👖👟☂️ etc.), matching the precedent already set by `DayHoverCard.jsx`'s
💧🌡️💨 - not a new icon system.

The card's width is pinned to exactly match the Current Weather card's width (not
full-width) via `.row` in `WhatToWear.module.css`: a `grid-template-columns: 1.4fr 1fr`
grid identical to `App.module.css`'s `.content` (same ratio, same 1024px collapse
breakpoint), with the card placed in the first column and the second left empty. This
was deliberately done in `WhatToWear`'s own CSS rather than moving the component inside
`.content`'s `.leftColumn` - `.content` uses `align-items: stretch` and the map column
stretches to match whatever height `.leftColumn` ends up being, so adding a whole new
card into that same flex column would have made the map stretch taller too. Mirroring
the grid ratio in an independent container gets the exact same width with zero risk to
the map's height.

`.section`'s `margin-top` is `24px`, matching `App.module.css`'s `.leftColumn` gap
exactly (the same spacing already used between the Current Weather card and the metric
cards below it), so the vertical rhythm reads as one continuous column. `.card` uses the
same glass treatment as the Current Weather hero card (`--glass-bg`/`--glass-border`/
`--glass-blur`/`--shadow-md`) rather than the opaque `--color-surface` card style used
further down the page - both those choices came from Anna directly, after an earlier
version used `--color-surface`/28px, and are captured here rather than in git blame
alone. `.insight`'s color was bumped from `--color-text-tertiary` to
`--color-text-secondary` - the same token `CurrentWeather` already uses for its own
secondary text (location line, condition label) against this identical glass
background, so contrast here was already proven, not a guess.

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

## WeatherForecastCalendar ("Weather forecast" 12-month calendar)

`src/components/WeatherForecastCalendar/` — the section below Weather Details: a
forward-looking 12-month selector + full calendar grid, **starting at the current month**
and running 12 months ahead (e.g. Sep 2026 → Aug 2027), defaulting to the current month
on load. `useForecastCalendar.js` is the single hook driving it, and it deliberately
mixes two real, distinct data sources per day rather than ever fabricating a value from
nothing:

- **`source: "live"`** — real data from Open-Meteo's forecast endpoint
  (`src/services/dailyForecastService.js`, `past_days=31&forecast_days=16`), covering
  the actual physical window where day-by-day prediction is reliable (`past_days`
  additionally covers already-elapsed days of the current month with real observed
  data, so "this month" never needs an estimate for a day that's already happened).
- **`source: "estimated"`** — for every date beyond that real window, generated from
  real historical data for the *same calendar date one year earlier*
  (`src/services/historicalWeatherService.js`'s `getHistoricalRange`, Archive API) with
  a small deterministic pseudo-random variation (`seededVariation` in the hook — seeded
  by date string, not `Math.random()`, so values stay stable across re-renders) so
  estimates read as approximate rather than an exact repeat of last year. Every
  estimated cell carries an `estimateBasis` (e.g. "Sep 2025") and renders a small
  "Estimated" badge (`ForecastDayCell.jsx`) plus shows its basis in the per-day hover
  card (`DayHoverCard.jsx`, portal-rendered like `InfoTooltip`). This replaced an
  earlier design spec that asked for fabricated mock data and a fake "AI Trend Insight"
  sentence — both were rejected in favor of this real-data-first approach so nothing in
  the UI is ever presented as a guaranteed forecast when it isn't one.

`DayHoverCard` is `position: fixed` with coordinates computed once (from
`getBoundingClientRect()` in `ForecastDayCell.jsx`'s `show()`), so without a scroll
handler it visually detached from its cell the moment the page scrolled while it was
open. Fixed by closing it on scroll (a capture-phase `window.addEventListener("scroll",
..., true)` in `ForecastDayCell.jsx`, added when `position` is set and removed when it
isn't) rather than continuously recomputing its position - simpler, and reasonable for
what's meant to be a brief hover preview rather than something read while scrolling.
`InfoTooltip` already had the equivalent listener (it recomputes position on scroll
instead of closing) and didn't need this fix.

**Known gotcha, fixed once already**: date math here MUST use local-date components
(`getFullYear()`/`getMonth()`/`getDate()`), never `date.toISOString().slice(0,10)` —
`toISOString()` converts to UTC first, which silently shifts the date backward by one
day whenever the system timezone is ahead of UTC (this exact bug caused Sep 1 to render
as "Aug 31" during testing). Both `isoDate()` helpers (in the hook and in
`historicalWeatherService.js`) were fixed to format from local components instead.

The grid uses `grid-template-columns: repeat(7, minmax(0, 1fr))` (not bare `1fr`) — a
bare `1fr` grid blew out past the viewport on mobile because it doesn't allow tracks to
shrink below their content's min-content width; `minmax(0, 1fr)` plus `min-width: 0` on
`.cell` fixed it. **The exact same bug recurred** in `WeatherMetrics.module.css`'s
5/3/2-column grid (also bare `repeat(N, 1fr)`) once the metric icons were briefly
doubled to 36px: the wider icon+label content forced grid tracks past their fair share,
overflowing `.leftColumn` and visually spilling the last card (Dew Point) onto the map
column next to it. Fixed the same way - `minmax(0, 1fr)` at all three breakpoints plus
`min-width: 0` on `MetricCard`'s `.card` - rather than moving the map, since that would
have papered over the actual overflow instead of fixing it; this holds regardless of
icon size, so it can't recur even if the icons change again later. The glass-panel look
(`.glassPanel` in
`WeatherForecastCalendar.module.css`) uses `color-mix(in srgb, var(--color-surface) 72%,
transparent)` + `backdrop-filter: blur()` so it stays theme-aware rather than a fixed
dark-only background. A standalone "16-Day Forecast" section used to exist separately
(`src/components/DailyForecast/`) but was removed and folded into this one, per explicit
request — don't recreate it as a separate section. Day Detail drawer (hourly chart,
UV/AQI/moon/clothing advisory) is still scoped out of this pass — noted below.

## WeatherOverview (donut chart + multi-select filters)

`src/components/WeatherOverview/` — a Sunny/Rainy/Snowy breakdown donut with independent
multi-select Month and Year filters, plus average high/low. `useWeatherOverview.js`
fetches every real historical day from `EARLIEST_YEAR` (2024) through today **once**
(`historicalWeatherService.getHistoricalRange` — same service the forecast calendar
uses), and `computeOverviewStats` in `src/utils/weatherOverviewHelpers.js` filters/
aggregates that in-memory whenever the month/year selection changes — no refetch per
filter change. `categorizeDayType` buckets every WMO weather code into exactly one of
the 3 categories the donut needs: "Sunny" is clear/mainly clear and fog (no precip
either way), "Snowy" is snow codes, and everything else - partly cloudy, overcast, and
any liquid/mixed/thunderstorm precip - is combined into one "rainy" bucket, labeled
"Cloudy/Rainy days" in the UI. This is a deliberate simplification since the widget only
has 3 slices and every day must land in one; because it's a strict partition of every
WMO code, the three counts always sum to the exact number of real days in the selection
(e.g. a fully-elapsed past month totals to that month's real day count). Year options are
computed as `[currentYear-2 .. currentYear]`
rather than hardcoded, so the widget doesn't silently go stale (no future year is offered,
since there's nothing real to show for it yet). Selecting the un-elapsed months of the
current year correctly shows an honest "no recorded data yet" empty state instead of
fabricating numbers — same real-data-first principle applied throughout this app. The
card has `max-width: 560px` so it doesn't stretch full-width when the donut+legend
content is much narrower than the page.

`MultiSelectFilter.jsx` (shared by both the Month and Year dropdowns) has a "Select all"
option pinned as the first item, and it's a true toggle: everything selected -> clicking
it clears the selection, anything less -> clicking it selects everything (it does *not*
enforce "at least one selected" the way the per-option checkboxes do — that guard only
lives in `toggle()`). Its native-checkbox `indeterminate` flag is set in a `useEffect` —
but that checkbox only exists in the DOM while the dropdown is open (the menu is
`{open && (...)}`), so `open` must be in the effect's dependency array alongside
`allSelected`/`selected.length`. Without it, a filter that starts in a partial-selection
state (e.g. Year defaults to just the current year) never gets its freshly-mounted
"Select all" checkbox flagged indeterminate on first open — the effect already fired once
at mount when the ref was still null.

Month defaults to January-September (`DEFAULT_MONTHS` in `WeatherOverviewSection.jsx`,
indices 0-8) rather than all 12 - October-December of the current year haven't happened
yet. All 12 months stay selectable, though (unlike Year, which drops the future year from
its option list entirely) - removing them from the options list too would also block
picking October-December for a *past* year like 2024/2025, which do have real data.
`MultiSelectFilter`'s trigger summary shows a compact range ("Jan–Sep") instead of "9
selected" whenever the current selection is a contiguous run - each option can carry an
optional `shortLabel` (month options set it to `MONTH_ABBR`) used only for this range
text; the per-option list still shows the full name. This was deliberately not changed to
just say "All" when the default 9 are selected - that would misrepresent the actual
state (and contradict the Select-all checkbox, which correctly shows unchecked/
indeterminate, not checked, for a 9-of-12 selection).

## ClimateSummary (climate extremes + daily summary tables)

`src/components/ClimateSummary/` — two side-by-side cards rendered directly below
Weather overview, reusing the *same* `overviewDays` array `useWeatherOverview` already
fetched (extended to also carry `precipitation`/`windSpeed` per day, which it fetched
from the archive API all along but previously discarded). No separate fetch.
`src/utils/climateSummaryHelpers.js`: `lastTwelveMonths(days)` takes the trailing 365
days relative to the most recent *available* day (not `today`, since the archive has a
few days of lag). `computeClimateExtremes` buckets days by calendar month regardless of
year and picks the month with the highest/lowest *average* of the relevant metric for
hottest/coldest/wettest/windiest — average rather than a monthly total, so a
still-in-progress month isn't penalized for having fewer days than a complete one.
`computeDailySummary` returns max/avg/min for high temp, low temp, precipitation (mm from
the API, displayed in cm — divide by 10), and wind. Both cards stack to one column at
`max-width: 720px` (see `ClimateSummary.module.css`).

## WeatherNews (real climate headlines, not mock data)

`src/components/WeatherNews/` — a "Weather news" section rendered below ClimateSummary,
structured like WeatherDetails/WeatherForecastCalendar: a plain, borderless
`section`/`sectionHeader`/`sectionTitle` above the content, not a title packed inside a
bordered card - the section title should always sit outside the card "skeleton", not
inside it, matching every other section in this app. A spec for this asked for hardcoded
headlines under real bylines (NASA, NOAA, Reuters, Kathmandu Post, etc.) - that's
fabricated journalism attributed to real organizations, a harder line than "don't mock
weather data," so it was declined outright. Built instead on genuinely live headlines:

`src/services/weatherNewsService.js` pulls real RSS feeds from The Guardian
(`environment/climate-crisis`) and BBC News (`science_and_environment`) through
`api.rss2json.com` - a free, keyless RSS->JSON proxy, needed because browsers can't
fetch cross-origin XML and neither publisher sends CORS headers. `Promise.allSettled`
keeps whichever feed(s) succeed (the free rss2json tier can be rate-limited) and only
throws if both fail. `isClimateRelevant` filters every item by keyword match **on the
title only** (not the body) before it's shown, since both feeds carry loosely-tagged
items (general politics op-eds, archaeology, wildlife policy) that aren't actually about
climate/warming, and a keyword appearing anywhere in the body text (e.g. "political
climate") produced false positives when body text was included. Results are deduped (by `link`, falling back to `id` if a link is ever missing - two
feeds can carry the same real story under different guids), sorted newest-first by
`publishedAt`, then capped to the 6 most recent qualifying articles (`MAX_ARTICLES`).
This is a rolling window, not a fixed set: [useWeatherNews.js](weather-app/src/hooks/useWeatherNews.js)
re-runs the whole fetch-dedupe-sort-slice pipeline every 15 minutes
(`REFRESH_INTERVAL_MS`), so as newer articles get published, they naturally displace
older ones from the visible 6 - there's no persisted "the 6 articles," only whichever 6
real, deduped, qualifying items are newest at the moment of each fetch. A refresh that
fails (e.g. a rate-limited feed) keeps showing the last known-good 6 instead of
blanking the section - the error state only surfaces if there's nothing to fall back to
yet. `CLIMATE_KEYWORDS` was widened past the original narrow set (which sometimes let
fewer than 6 real articles qualify even when the feeds had plenty of genuine weather
coverage, e.g. "Sydney reaches 33C in potentially warmest start to spring..." matched
nothing) to also catch phrases like "extreme heat," "record heat," "hurricane," and
bare "hottest"/"warmest"/"coldest" - safe to broaden since both source feeds are
already topically scoped (climate-crisis, science & environment), unlike a general news
feed where those words would be noisy. There is deliberately no category filter UI (an
earlier version had All News/Global Warming/Climate Change tabs - removed per Anna's
request; the service still only sources from climate-focused feeds, so narrowing was
never load-bearing on the tabs). `decodeEntities` un-escapes `&amp;` etc. in
titles/thumbnail URLs - rss2json passes some fields through still HTML-entity-escaped,
which silently breaks an image `src` if left as-is (literal `&amp;` isn't a valid query
separator). Like/dislike counts are pure local UI state seeded at 0, not real published
metrics presented as fact - clicking is a genuine mutually-exclusive single-vote toggle,
not a fabricated existing count; that state is keyed by article `id`, so a vote is
naturally dropped (not carried over to a different story) once its article rolls off
the visible 6 after a refresh.

## SideNav (floating section-jump rail)

`src/components/SideNav/` — a `position: fixed` pill on the left edge, vertically
centered, rendered only when there's an active location (its targets don't exist
otherwise). Collapsed state is just 5 dots; click (or hover, via `onMouseEnter` on the
`<nav>`) expands it to icon+label rows for each section plus a divider and two bottom
actions (scroll to top, refresh). Click-outside and Escape close it, same pattern as
`MultiSelectFilter`'s dropdown.

Each target section (`WeatherDetailsSection`, `WeatherForecastCalendarSection`,
`WeatherOverviewSection`, `WeatherNewsSection`) has a plain DOM `id` added to its
`<section>` (`weather-details`/`weather-forecast`/`weather-overview`/`weather-news`),
plus `scroll-margin-top: 100px` on that section's own `.section` class so
`scrollIntoView` stops below the sticky header instead of tucking the section title
under it. "Current" has no section of its own — it's just `window.scrollTo({top: 0})`.
Refresh is a literal `window.location.reload()`, not a silent in-app refetch - simplest
option that unambiguously satisfies "reloads the dashboard data," though a smoother
non-reloading refetch is possible later if wanted (would need each data hook to expose
a manual refetch handle, which none currently do).

## Open-Meteo Archive API: `end_date` must stay behind "today"

`useWeatherOverview.js` requests real daily history from `EARLIEST_YEAR` through
"today" via the Archive API. Confirmed by direct testing: the Archive API doesn't
just lag by a day for some locations and gracefully return what it has - it hard
**rejects the entire request with HTTP 400** ("`end_date` is out of allowed range")
whenever `end_date` itself is past whatever day the archive has actually finished
processing, for every location, not a partial response. That's the opposite of what
an earlier fix here assumed ("request through today, let the per-day finite-value
filter drop whatever's missing") - the filter never gets a chance to run because the
whole request fails first. Fix: back `end` off by one day (`end.setDate(end.getDate()
- 1)`) before requesting, so the request stays inside the API's accepted range; the
existing finite-value filter still drops anything that lags further than that. This
is why "Weather overview"/"Climate information"/"Daily summary" can go blank (they all
read from this hook's `days`) even though nothing was deleted - `useForecastCalendar.js`
doesn't have this exposure since its historical ranges are always at least a year, or a
full calendar month, in the past.

## Map column height matches the metrics column exactly (no CSS stretch)

`.content` in `App.module.css` used to be `align-items: stretch`, so the CSS grid
forced `.leftColumn` (Current Weather + metrics) to grow to match `.mapColumn`'s
height. Since `.leftColumn` is a flex column with no `justify-content` to redistribute
extra space, whenever `.mapColumn`'s min-height (420px) exceeded the metrics column's
real content height, the difference became invisible dead space *inside* `.leftColumn`,
below the metric cards - pushing "What to Wear Today" down by however much the map
"needed" to reach its floor, unrelated to the actual 24px section margin. Measured on
a real render: 46px of hidden slack plus the normal 24px margin, a ~70px gap where a
28px one was expected. Switching `align-items` alone can't fix this - CSS grid still
sizes the row to `max(leftColumn's natural height, mapColumn's floor)` regardless of
`align-items`, so the slack just moves to whichever column is shorter.

Fix: [useMatchHeight.js](weather-app/src/hooks/useMatchHeight.js) - a small
ResizeObserver hook - measures `.leftColumn`'s real rendered height and writes it as
`--map-height` on `.mapColumn` (wired up in `App.jsx`), so the map's CSS `height`
tracks the metrics column exactly (see `App.module.css`'s `.mapColumn`), with
`min-height: 280px` only as a floor for the instant before the first observer
callback fires. `.content` is now `align-items: start` so `.leftColumn` is never
force-stretched. On mobile (≤1024px, stacked layout) `.mapColumn` reverts to
`height: auto; min-height: 320px` since it's no longer beside the metrics column.
Gotcha hit while building this: the hook's effect only ran once on mount by default,
and both refs were still `null` at that point because they live behind an
`activeLocation &&` conditional render - it needs `activeLocation` in its dependency
array to retry once the elements actually exist. Also, while testing: this Browser
pane's hidden/backgrounded state throttles `ResizeObserver` callbacks the same way it
throttles `requestAnimationFrame` (documented elsewhere in this file for scroll/rAF) -
`document.hidden` must read `false` before trusting a live measurement from it here.

## Forecast calendar grid: the `slice(-0)` gotcha

Clicking a month tab whose 1st falls on a **Sunday** (e.g. Nov 2026, Aug 2027) used to
flood the grid with the *entire* previous month instead of showing zero leading days.
Root cause, in [ForecastGrid.jsx](weather-app/src/components/WeatherForecastCalendar/ForecastGrid.jsx):
`leadingCount = month.days[0]?.weekday ?? 0` correctly evaluates to `0` when day 1 is a
Sunday, but `previousMonth.days.slice(-leadingCount)` then becomes `.slice(-0)` - and in
JS, `-0` is not `< 0` (the slice spec's negativity check is a strict `<`), so it falls
through to the same branch as `.slice(0)` and returns a **full copy of the array**
instead of an empty one. This is a general `Array.prototype.slice` footgun, not specific
to dates - any `arr.slice(-n)` where `n` can legitimately be `0` has the same trap.
Fixed by explicitly short-circuiting `leadingCount === 0` to `[]` before ever calling
`.slice()`, rather than relying on slice's own handling of the zero case. The rest of
the calendar's date math (weekday via `date.getDay()`, month length via
`new Date(y, m+1, 0).getDate()`, month rollover via the `Date` constructor's own
overflow handling in `useForecastCalendar.js`) was already correct and needed no
changes - verified programmatically across all 12 months in the rolling window
(Sep 2026 - Aug 2027), including both Sunday-start months and the Saturday-start month
(May 2027, the year's only 6-day leading case) and the 28-day month (Feb 2027).

## Roadmap ideas (not yet built)

- Optional Google Maps mode behind a `VITE_GOOGLE_MAPS_API_KEY` env var, if Anna decides
  she wants Google's map styling badly enough to set up billing for it.
- Atmosphere follow-ups if wanted: subtle scroll parallax for sun/moon, restrained
  lightning flashes during thunderstorms, very slight wind-driven card jitter.
- Day Detail slide-over drawer for the forecast calendar (hourly chart, UV/AQI/humidity/
  moon-phase breakdown, clothing/activity advisory) when a calendar day is clicked.
