import { MONTH_NAMES } from "./weatherOverviewHelpers.js";

// Days are already sorted oldest -> newest (they come straight off the archive API in
// date order), so "last 12 months" is just the trailing 365 of them relative to the most
// recent real day we have - not relative to "today", since the archive has a few days of
// lag and there's no reason to punch a gap in the window for that.
export function lastTwelveMonths(days) {
  if (!days || days.length === 0) return [];
  const mostRecent = new Date(`${days[days.length - 1].date}T00:00:00`);
  const cutoff = new Date(mostRecent);
  cutoff.setDate(cutoff.getDate() - 365);
  return days.filter((d) => new Date(`${d.date}T00:00:00`) > cutoff);
}

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Buckets days by calendar month (Jan-Dec) regardless of year, then picks the month with
// the highest/lowest average of the relevant metric. "Wettest"/"windiest" use average
// daily precipitation/wind rather than a monthly total, so a month isn't penalized for
// having fewer days of data than another (e.g. an in-progress current month).
function monthlyExtreme(days, metric, pick) {
  const buckets = Array.from({ length: 12 }, () => []);
  days.forEach((d) => buckets[d.month].push(metric(d)));

  let bestMonth = null;
  let bestValue = null;
  buckets.forEach((values, month) => {
    if (values.length === 0) return;
    const avg = average(values);
    if (bestValue === null || pick(avg, bestValue)) {
      bestValue = avg;
      bestMonth = month;
    }
  });

  return bestMonth === null ? null : MONTH_NAMES[bestMonth];
}

// Returns null when there isn't at least one real day of data to summarize, so the UI
// can show an honest empty state instead of fabricating a result.
export function computeClimateExtremes(days) {
  if (!days || days.length === 0) return null;

  return {
    hottestMonth: monthlyExtreme(days, (d) => d.tempMax, (a, b) => a > b),
    coldestMonth: monthlyExtreme(days, (d) => d.tempMin, (a, b) => a < b),
    wettestMonth: monthlyExtreme(days, (d) => d.precipitation, (a, b) => a > b),
    windiestMonth: monthlyExtreme(days, (d) => d.windSpeed, (a, b) => a > b),
  };
}

function stats(values) {
  return {
    max: Math.max(...values),
    avg: average(values),
    min: Math.min(...values),
  };
}

// Precipitation comes from the API in millimeters; the summary table displays it in
// centimeters.
export function computeDailySummary(days) {
  if (!days || days.length === 0) return null;

  return {
    highTemp: stats(days.map((d) => d.tempMax)),
    lowTemp: stats(days.map((d) => d.tempMin)),
    precipitation: stats(days.map((d) => d.precipitation / 10)),
    wind: stats(days.map((d) => d.windSpeed)),
  };
}
