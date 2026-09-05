import { useEffect, useState } from "react";
import { toMinutesSinceMidnight, computeDaylight, computeNightProgress } from "../utils/daylight.js";
import { getWeatherCondition, getPrecipitationKind } from "../services/weatherCodes.js";

const RECOMPUTE_INTERVAL_MS = 60 * 1000;

// Derives a plain-data "scene" describing the atmosphere from live weather data.
// Recomputed once a minute so the sky keeps drifting even if the weather itself
// hasn't changed, and whenever the weather payload changes (new location).
export function useAtmosphereScene(weather) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), RECOMPUTE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  if (!weather) return null;

  const sunriseMin = toMinutesSinceMidnight(weather.sunrise);
  const sunsetMin = toMinutesSinceMidnight(weather.sunset);
  const nowMin = toMinutesSinceMidnight(weather.time) ?? new Date().getHours() * 60 + new Date().getMinutes();

  const { brightness, goldenness, dayProgress, isNight } = computeDaylight(sunriseMin, sunsetMin, nowMin);
  const nightProgress =
    sunriseMin !== null && sunsetMin !== null ? computeNightProgress(sunsetMin, sunriseMin, nowMin) : 0.5;

  const condition = getWeatherCondition(weather.weatherCode, weather.isDay);
  const precipitationKind = getPrecipitationKind(condition.icon);

  const cloudCover = clamp01((weather.cloudCover ?? 0) / 100);
  const windSpeed = weather.windSpeed ?? 0;
  const windDirection = weather.windDirection ?? 0;
  const visibilityKm = weather.visibility ? weather.visibility / 1000 : 40;
  const precipitation = weather.precipitation ?? 0;

  // Wind angle for particles: 0 = straight down, positive = leaning toward +x (east).
  // windDirection is "from" direction in degrees; convert to a leaning factor capped
  // at a believable maximum so rain never looks like it's blowing sideways.
  const windLean = clamp(Math.sin((windDirection * Math.PI) / 180) * Math.min(windSpeed / 40, 1), -1, 1);

  return {
    brightness,
    goldenness,
    dayProgress,
    nightProgress,
    isNight,
    cloudCover,
    fogIntensity: clamp01(1 - visibilityKm / 8) * (condition.icon === "fog" ? 1 : 0.6),
    isFoggy: condition.icon === "fog" || visibilityKm < 3,
    precipitationKind,
    precipitationIntensity: clamp01(precipitation / 8) || (precipitationKind !== "none" ? 0.35 : 0),
    windSpeed,
    windLean,
    windStrength: clamp01(windSpeed / 35),
  };
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
