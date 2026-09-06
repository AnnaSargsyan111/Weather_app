import { useEffect, useState } from "react";
import { getAirQuality } from "../services/airQualityService.js";
import { getMoonData } from "../services/moonService.js";
import {
  findPeak,
  findTrough,
  trendFromSlope,
  beaufortForce,
  categorizeCloudCover,
  categorizeUv,
  categorizeAqi,
  categorizeHumidity,
  categorizeVisibilityKm,
  dominantFeelsLikeFactor,
  formatHourLabel,
} from "../utils/weatherDetailsHelpers.js";
import { degreesToCompass } from "../utils/windDirection.js";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HOURLY_PARAMS = [
  "temperature_2m",
  "apparent_temperature",
  "cloud_cover",
  "precipitation",
  "precipitation_probability",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "relative_humidity_2m",
  "uv_index",
  "visibility",
  "surface_pressure",
].join(",");

async function fetchHourly(latitude, longitude) {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=${HOURLY_PARAMS}&current=temperature_2m&forecast_days=2&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather details are currently unavailable.");
  return response.json();
}

function nowIndex(times, nowTime) {
  let index = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] <= nowTime) index = i;
    else break;
  }
  return index;
}

function buildDetails(raw) {
  const hourly = raw.hourly;
  const times = hourly.time;
  const nowTime = raw.current.time;
  const idx = nowIndex(times, nowTime);
  const windowEnd = Math.min(idx + 24, times.length);

  const temperature = hourly.temperature_2m;
  const feelsLike = hourly.apparent_temperature;
  const humidity = hourly.relative_humidity_2m;
  const wind = hourly.wind_speed_10m;
  const pressure = hourly.surface_pressure;

  const tempPeak = findPeak(times, temperature, idx, windowEnd);
  const tempLow = findTrough(times, temperature, idx, windowEnd);
  const uvPeak = findPeak(times, hourly.uv_index, idx, windowEnd);
  const visibilityPeakRaw = findPeak(times, hourly.visibility, idx, windowEnd);

  const precipNext24h = hourly.precipitation.slice(idx, windowEnd).reduce((sum, v) => sum + v, 0);
  const precipProbability = Math.max(...hourly.precipitation_probability.slice(idx, windowEnd));

  const windSpeedNow = wind[idx];
  const windGustNow = hourly.wind_gusts_10m[idx];
  const windDirectionNow = hourly.wind_direction_10m[idx];

  const humidityNow = humidity[idx];
  const cloudNow = hourly.cloud_cover[idx];
  const pressureNow = pressure[idx];
  const pressureRecent = pressure.slice(Math.max(0, idx - 3), idx + 1);
  const pressureTrend = trendFromSlope(pressureRecent);

  const feelsFactor = dominantFeelsLikeFactor(temperature[idx], feelsLike[idx], humidityNow, windSpeedNow);

  return {
    temperature: {
      current: temperature[idx],
      trend: trendFromSlope(temperature.slice(Math.max(0, idx - 2), idx + 1)),
      peak: { value: tempPeak.value, time: formatHourLabel(tempPeak.time) },
      low: { value: tempLow.value, time: formatHourLabel(tempLow.time) },
      hourly: times.slice(idx, windowEnd).map((t, i) => ({ t, v: temperature[idx + i] })),
    },
    feelsLike: {
      current: feelsLike[idx],
      actualTemp: temperature[idx],
      dominantFactor: feelsFactor.factor,
      label: feelsFactor.label,
      hourly: times.slice(idx, windowEnd).map((t, i) => ({ t, v: feelsLike[idx + i] })),
    },
    cloudCover: {
      percent: cloudNow,
      label: categorizeCloudCover(cloudNow),
    },
    precipitation: {
      next24h: precipNext24h,
      probability: Number.isFinite(precipProbability) ? precipProbability : 0,
    },
    wind: {
      speed: windSpeedNow,
      gust: windGustNow,
      direction: windDirectionNow,
      directionLabel: degreesToCompass(windDirectionNow),
      force: beaufortForce(windSpeedNow),
    },
    humidity: {
      percent: humidityNow,
      label: categorizeHumidity(humidityNow),
    },
    uv: {
      current: hourly.uv_index[idx],
      peak: { value: uvPeak.value, time: formatHourLabel(uvPeak.time) },
      label: categorizeUv(uvPeak.value),
    },
    visibility: {
      km: hourly.visibility[idx] / 1000,
      label: categorizeVisibilityKm(hourly.visibility[idx] / 1000),
      peak: { value: visibilityPeakRaw.value / 1000, time: formatHourLabel(visibilityPeakRaw.time) },
    },
    pressure: {
      value: pressureNow,
      trend: pressureTrend,
      hourly: times.slice(idx, windowEnd).map((t, i) => ({ t, v: pressure[idx + i] })),
    },
    updatedAt: formatHourLabel(nowTime),
  };
}

export function useWeatherDetails(location, weather) {
  const [state, setState] = useState({ data: null, loading: Boolean(location), error: null });

  useEffect(() => {
    if (!location) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));

    Promise.all([
      fetchHourly(location.latitude, location.longitude),
      getAirQuality(location.latitude, location.longitude).catch(() => null),
    ])
      .then(([forecast, airQuality]) => {
        if (cancelled) return;

        const details = buildDetails(forecast);
        const moon = getMoonData(location.latitude, location.longitude);

        details.aqi = airQuality
          ? { value: airQuality.aqi, label: categorizeAqi(airQuality.aqi), primaryPollutant: "PM2.5", pollutantValue: airQuality.pm25 }
          : null;

        details.sun =
          weather?.sunrise && weather?.sunset
            ? { sunrise: weather.sunrise, sunset: weather.sunset }
            : null;

        details.moon = {
          moonrise: moon.moonrise,
          moonset: moon.moonset,
        };

        details.moonPhase = {
          percent: Math.round(moon.phaseFraction * 100),
          nextFullMoon: moon.nextFullMoon,
        };

        setState({ data: details, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude, weather?.sunrise, weather?.sunset]);

  return state;
}
