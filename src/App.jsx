import { useState } from "react";
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
  // Single source of truth for "the current local time at this location" - shared by
  // CurrentWeather and WeatherDetailsSection so they can never show two different times.
  const localTime = useLocalClock(weather?.timezone);

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
            <div className={styles.leftColumn}>
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

            <div className={styles.mapColumn}>
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
