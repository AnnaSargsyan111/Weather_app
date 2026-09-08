import { useEffect, useRef, useState } from "react";
import Header from "./components/Header/Header.jsx";
import CurrentWeather from "./components/CurrentWeather/CurrentWeather.jsx";
import WeatherMetrics from "./components/WeatherMetrics/WeatherMetrics.jsx";
import WeatherMap from "./components/WeatherMap/WeatherMap.jsx";
import ErrorState from "./components/ErrorState/ErrorState.jsx";
import DismissibleWarning from "./components/ErrorState/DismissibleWarning.jsx";
import WeatherAtmosphere from "./components/WeatherAtmosphere/WeatherAtmosphere.jsx";
import WeatherDetailsSection from "./components/WeatherDetails/WeatherDetailsSection.jsx";
import WeatherForecastCalendarSection from "./components/WeatherForecastCalendar/WeatherForecastCalendarSection.jsx";
import WeatherOverviewSection from "./components/WeatherOverview/WeatherOverviewSection.jsx";
import ClimateSummarySection from "./components/ClimateSummary/ClimateSummarySection.jsx";
import WeatherNewsSection from "./components/WeatherNews/WeatherNewsSection.jsx";
import WhatToWearSection from "./components/WhatToWear/WhatToWearSection.jsx";
import SideNav from "./components/SideNav/SideNav.jsx";
import { WeatherSkeleton, MetricsSkeleton, MapSkeleton } from "./components/LoadingState/LoadingState.jsx";
import { useSavedLocations } from "./hooks/useSavedLocations.js";
import { useTheme } from "./hooks/useTheme.js";
import { useTemperatureUnit } from "./hooks/useTemperatureUnit.js";
import { useWeather } from "./hooks/useWeather.js";
import { useAtmosphereScene } from "./hooks/useAtmosphereScene.js";
import { useWeatherDetails } from "./hooks/useWeatherDetails.js";
import { useForecastCalendar } from "./hooks/useForecastCalendar.js";
import { useWeatherOverview } from "./hooks/useWeatherOverview.js";
import { useWeatherNews } from "./hooks/useWeatherNews.js";
import { useLocalClock } from "./hooks/useLocalClock.js";
import { useMatchHeight } from "./hooks/useMatchHeight.js";
import styles from "./App.module.css";

export default function App() {
  const { locations, activeLocation, addLocation, removeLocation, selectLocation } = useSavedLocations();
  const [theme, setTheme] = useTheme();
  const [unit, setUnit] = useTemperatureUnit();
  const { data: weather, loading, error } = useWeather(activeLocation);
  const { data: details, loading: detailsLoading } = useWeatherDetails(activeLocation, weather);
  const { months, leadingPaddingDays, loading: monthsLoading } = useForecastCalendar(activeLocation);
  const { days: overviewDays, loading: overviewLoading } = useWeatherOverview(activeLocation);
  const { articles: newsArticles, loading: newsLoading, error: newsError } = useWeatherNews();
  const [geoError, setGeoError] = useState(null);
  const scene = useAtmosphereScene(weather);
  // Light theme + real nighttime is the one combination where every card gets forced to
  // a unified solid dark background with high-contrast text (see index.css's
  // [data-night-light] block) instead of the normal light-theme surfaces - the animated
  // sky background itself is untouched, only what the cards render on top of it. Tied to
  // the same `scene.isNight` the background already uses, so the override activates
  // exactly when the background is actually showing its night look.
  useEffect(() => {
    const isNightLight = theme === "light" && scene?.isNight;
    if (isNightLight) {
      document.documentElement.setAttribute("data-night-light", "true");
    } else {
      document.documentElement.removeAttribute("data-night-light");
    }

    // Keeps the browser's own native chrome (mobile Safari's/in-app browsers' toolbar
    // tint) matched to the app's actual current header color - the same three colors
    // --glass-bg-solid resolves to for each of these states (see index.css). Without
    // this, that native chrome falls back to its own default and can show as a
    // mismatched strip of color above the header, which looks like the header itself
    // is see-through even though it isn't - that chrome is outside the document, no
    // page CSS can reach it, only this meta tag can influence it.
    const themeColor = isNightLight ? "#1e293b" : theme === "dark" ? "#14161c" : "#ffffff";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
  }, [theme, scene?.isNight]);
  // Single source of truth for "the current local time at this location" - shared by
  // CurrentWeather and WeatherDetailsSection so they can never show two different times.
  const localTime = useLocalClock(weather?.timezone);
  // The map column's height is set to exactly match the metrics column's real content
  // height (see useMatchHeight) rather than via CSS grid stretch, which was padding the
  // shorter column with invisible trailing space whenever the map's own min-height
  // exceeded the metrics column's natural height - pushing "What to Wear Today" down.
  const leftColumnRef = useRef(null);
  const mapColumnRef = useRef(null);
  useMatchHeight(leftColumnRef, mapColumnRef, "--map-height", [activeLocation]);

  return (
    <div className={styles.app}>
      <WeatherAtmosphere scene={scene} />
      <Header
        locations={locations}
        activeLocationId={activeLocation?.id}
        unit={unit}
        theme={theme}
        onSelectLocation={selectLocation}
        onRemoveLocation={removeLocation}
        onAddLocation={addLocation}
        onLocate={addLocation}
        onGeoError={setGeoError}
        onThemeChange={setTheme}
        onUnitChange={setUnit}
      />

      {activeLocation && <SideNav />}

      <main className={styles.main}>
        {geoError && <DismissibleWarning message={geoError} onDismiss={() => setGeoError(null)} />}

        {!activeLocation ? (
          <div className={`${styles.card} ${styles.emptyState}`}>
            <p className={styles.emptyStateTitle}>No locations yet</p>
            <p className={styles.emptyStateSubtitle}>Search for a city above to see its weather.</p>
          </div>
        ) : (
          <>
          <div className={styles.content}>
            <div className={styles.leftColumn} ref={leftColumnRef}>
              <div className={styles.card}>
                {loading && !weather ? (
                  <WeatherSkeleton />
                ) : error ? (
                  <ErrorState message={error} />
                ) : weather ? (
                  <CurrentWeather
                    location={activeLocation}
                    weather={weather}
                    unit={unit}
                    localTime={localTime}
                    details={details}
                    scene={scene}
                  />
                ) : null}
              </div>

              <div>
                {loading && !weather ? (
                  <MetricsSkeleton />
                ) : weather ? (
                  <WeatherMetrics weather={weather} unit={unit} />
                ) : null}
              </div>
            </div>

            <div className={styles.mapColumn} ref={mapColumnRef}>
              {loading && !weather ? (
                <MapSkeleton />
              ) : weather ? (
                <WeatherMap location={activeLocation} temperature={weather.temperature} unit={unit} />
              ) : (
                <div className={`${styles.card} ${styles.emptyState}`}>
                  <p className={styles.emptyStateSubtitle}>Map unavailable</p>
                </div>
              )}
            </div>
          </div>

          <WhatToWearSection details={details} weather={weather} />
          <WeatherDetailsSection
            details={details}
            dewPoint={weather?.dewPoint}
            unit={unit}
            loading={detailsLoading}
            localTime={localTime}
          />
          <WeatherForecastCalendarSection
            months={months}
            leadingPaddingDays={leadingPaddingDays}
            unit={unit}
            loading={monthsLoading}
          />
          <WeatherOverviewSection days={overviewDays} unit={unit} loading={overviewLoading} />
          <ClimateSummarySection days={overviewDays} unit={unit} loading={overviewLoading} />
          <WeatherNewsSection articles={newsArticles} loading={newsLoading} error={newsError} />
          </>
        )}
      </main>
    </div>
  );
}
