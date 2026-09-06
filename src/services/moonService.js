import * as SunCalc from "suncalc";

const DAY_MS = 24 * 60 * 60 * 1000;

// suncalc computes everything astronomically from lat/lon/date - no API/key needed.
export function getMoonData(latitude, longitude, date = new Date()) {
  const illumination = SunCalc.getMoonIllumination(date);
  const times = SunCalc.getMoonTimes(date, latitude, longitude);

  return {
    moonrise: times.rise ?? null,
    moonset: times.set ?? null,
    phaseFraction: illumination.fraction,
    nextFullMoon: findNextFullMoon(date),
  };
}

// Scans forward day-by-day for the date whose phase is closest to 0.5 (full moon).
// A lunar month is ~29.53 days, so 30 days always covers the next occurrence.
function findNextFullMoon(fromDate) {
  let bestDate = fromDate;
  let bestDistance = Infinity;

  for (let offset = 0; offset <= 30; offset++) {
    const candidate = new Date(fromDate.getTime() + offset * DAY_MS);
    const distance = Math.abs(SunCalc.getMoonIllumination(candidate).phase - 0.5);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestDate = candidate;
    }
  }

  return bestDate;
}
