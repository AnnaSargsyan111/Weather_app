// Small pure helpers that turn raw hourly arrays into the categorized labels/
// descriptions the "Weather details" cards display - kept independent of any
// fetching/hook so each rule is easy to reason about (and adjust) in isolation.

export function findPeak(times, values, fromIndex = 0, toIndex = values.length) {
  let bestIndex = fromIndex;
  for (let i = fromIndex; i < toIndex; i++) {
    if (values[i] > values[bestIndex]) bestIndex = i;
  }
  return { value: values[bestIndex], time: times[bestIndex] };
}

export function findTrough(times, values, fromIndex = 0, toIndex = values.length) {
  let bestIndex = fromIndex;
  for (let i = fromIndex; i < toIndex; i++) {
    if (values[i] < values[bestIndex]) bestIndex = i;
  }
  return { value: values[bestIndex], time: times[bestIndex] };
}

export function trendFromSlope(recentValues) {
  if (recentValues.length < 2) return "steady";
  const delta = recentValues[recentValues.length - 1] - recentValues[0];
  if (delta > 0.5) return "rising";
  if (delta < -0.5) return "falling";
  return "steady";
}

const BEAUFORT_SCALE = [
  { max: 1, scale: 0, label: "Calm" },
  { max: 5, scale: 1, label: "Light Air" },
  { max: 11, scale: 2, label: "Light Breeze" },
  { max: 19, scale: 3, label: "Gentle Breeze" },
  { max: 28, scale: 4, label: "Moderate Breeze" },
  { max: 38, scale: 5, label: "Fresh Breeze" },
  { max: 49, scale: 6, label: "Strong Breeze" },
  { max: 61, scale: 7, label: "Near Gale" },
  { max: 74, scale: 8, label: "Gale" },
  { max: Infinity, scale: 9, label: "Strong Gale" },
];

export function beaufortForce(speedKmh) {
  const entry = BEAUFORT_SCALE.find((row) => speedKmh <= row.max) ?? BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1];
  return { scale: entry.scale, label: entry.label };
}

export function categorizeCloudCover(percent) {
  if (percent < 15) return "Clear";
  if (percent < 40) return "Mostly Sunny";
  if (percent < 70) return "Partly Cloudy";
  if (percent < 90) return "Mostly Cloudy";
  return "Overcast";
}

export function categorizeUv(value) {
  if (value < 3) return "Low";
  if (value < 6) return "Moderate";
  if (value < 8) return "High";
  if (value < 11) return "Very High";
  return "Extreme";
}

export function categorizeAqi(value) {
  if (value <= 50) return "Good";
  if (value <= 100) return "Moderate";
  if (value <= 150) return "Unhealthy for Sensitive Groups";
  if (value <= 200) return "Unhealthy";
  if (value <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function categorizeHumidity(percent) {
  if (percent < 30) return "Low";
  if (percent < 60) return "Normal";
  return "High";
}

export function categorizeVisibilityKm(km) {
  if (km >= 10) return "Excellent";
  if (km >= 5) return "Good";
  if (km >= 2) return "Moderate";
  return "Poor";
}

// Which factor is pulling "feels like" away from the actual temperature.
export function dominantFeelsLikeFactor(actualC, feelsLikeC, humidityPercent, windKmh) {
  const delta = feelsLikeC - actualC;
  if (Math.abs(delta) < 1) return { factor: "temperature", label: "Comfortable" };
  if (delta > 0 && humidityPercent > 55) return { factor: "humidity", label: "Hot" };
  if (delta < 0 && windKmh > 15) return { factor: "wind", label: "Cold" };
  return { factor: "temperature", label: delta > 0 ? "Warm" : "Cold" };
}

export function formatClockFromDate(date) {
  if (!date) return "--:--";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDurationMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "--";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours} hrs ${minutes} mins`;
}

export function formatHourLabel(isoString) {
  const match = /T(\d{2}):(\d{2})/.exec(isoString || "");
  if (!match) return "--";
  let hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${match[2]} ${suffix}`;
}
