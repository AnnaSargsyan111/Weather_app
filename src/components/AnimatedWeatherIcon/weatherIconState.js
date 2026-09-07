import { getWeatherCondition } from "../../services/weatherCodes.js";

// Beaufort force 6 ("Strong Breeze", >38 km/h) is the same threshold this app already
// uses for the Wind detail card (see src/utils/weatherDetailsHelpers.js) - reused here
// rather than inventing a new "windy" cutoff.
const STRONG_WIND_KMH = 38;

// Same formula PrecipitationCanvas.jsx uses for the background rain streaks' angle -
// rain's dominant lean is a deliberate stylistic top-right-to-bottom-left diagonal, with
// real wind only contributing a secondary wobble on top, not the whole angle. Reusing
// this exact formula (not just the same windLean input) is what makes the icon's rain
// angle actually match the background's rain angle instead of merely being "wind-aware"
// in its own, different way.
function rainLeanFromWindLean(windLean) {
  return -1 + windLean * 0.25;
}

// Resolves the real getWeatherCondition() icon key plus the shared atmosphere `scene`
// (see useAtmosphereScene.js - already the single source of truth the background uses)
// into everything AnimatedWeatherIcon's families need. No separate condition logic:
// every threshold here either comes directly from `scene` or reuses a constant already
// established elsewhere in the app (Beaufort force, the background's rain-angle formula).
export function resolveWeatherIconState(weather, scene) {
  const condition = getWeatherCondition(weather.weatherCode, weather.isDay);
  const icon = condition.icon;
  const isDay = weather.isDay;

  const precipitationKind = scene?.precipitationKind ?? "none";
  const intensity = scene?.precipitationIntensity ?? 0;
  const windLean = scene?.windLean ?? 0;
  const windStrength = scene?.windStrength ?? 0;
  const windSpeed = scene?.windSpeed ?? weather.windSpeed ?? 0;
  const cloudCover = scene?.cloudCover ?? 0;
  const isFoggy = scene?.isFoggy ?? icon === "fog";

  // Precipitation always wins - "Rain + Strong Wind" must stay the rain family (with a
  // stronger angle/faster fall), never fall through to a generic wind icon.
  const isWindy = precipitationKind === "none" && !isFoggy && windSpeed >= STRONG_WIND_KMH;

  let family = "cloudy";
  if (icon === "thunderstorm") family = "thunderstorm";
  else if (icon === "fog" || isFoggy) family = "fog";
  else if (icon === "sleet") family = "rain-snow";
  else if (icon === "snow") family = "snow";
  else if (icon === "rain" || icon === "drizzle") family = "rain";
  else if (isWindy) family = "wind";
  else if (icon === "clear" || icon === "clear-night") family = "clear";
  else if (icon === "partly-cloudy" || icon === "partly-cloudy-night") family = "partly-cloudy";
  else family = "cloudy";

  return {
    family,
    isDay,
    intensity,
    windLean,
    windStrength,
    windSpeed,
    cloudCover,
    rainLean: rainLeanFromWindLean(windLean),
  };
}
