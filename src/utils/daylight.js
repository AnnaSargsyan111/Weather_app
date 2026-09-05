// Parses an Open-Meteo naive local-time string ("2026-09-06T06:15") into minutes since midnight.
export function toMinutesSinceMidnight(isoString) {
  const match = /T(\d{2}):(\d{2})/.exec(isoString || "");
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

// Smooth 0->1 ease between edge0 and edge1 (classic smoothstep).
function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const TRANSITION_MIN = 55;
const GOLDEN_WIDTH_MIN = 40;

// Given sunrise/sunset/now (all minutes-since-midnight), returns a continuous
// day/night description - no fixed-hour cutoffs, no abrupt phase switches.
export function computeDaylight(sunriseMin, sunsetMin, nowMin) {
  if (sunriseMin === null || sunsetMin === null || nowMin === null) {
    return { brightness: 0.7, goldenness: 0, dayProgress: 0.5, isNight: false };
  }

  const brightness = clamp01(
    smoothstep(sunriseMin - TRANSITION_MIN, sunriseMin + TRANSITION_MIN, nowMin) -
      smoothstep(sunsetMin - TRANSITION_MIN, sunsetMin + TRANSITION_MIN, nowMin)
  );

  const goldenNearSunrise = Math.exp(-(((nowMin - sunriseMin) / GOLDEN_WIDTH_MIN) ** 2));
  const goldenNearSunset = Math.exp(-(((nowMin - sunsetMin) / GOLDEN_WIDTH_MIN) ** 2));
  const goldenness = Math.max(goldenNearSunrise, goldenNearSunset);

  // Where the sun sits along its daytime arc (0 at sunrise, 1 at sunset).
  const dayProgress = clamp01((nowMin - sunriseMin) / (sunsetMin - sunriseMin));

  return { brightness, goldenness, dayProgress, isNight: brightness < 0.5 };
}

// Where the moon sits along the night arc (0 just after sunset, 1 just before next sunrise).
export function computeNightProgress(sunsetMin, sunriseMin, nowMin) {
  const MINUTES_IN_DAY = 1440;
  const nightLength = (MINUTES_IN_DAY - sunsetMin + sunriseMin + MINUTES_IN_DAY) % MINUTES_IN_DAY || MINUTES_IN_DAY;
  const elapsed = ((nowMin - sunsetMin + MINUTES_IN_DAY) % MINUTES_IN_DAY);
  return clamp01(elapsed / nightLength);
}
