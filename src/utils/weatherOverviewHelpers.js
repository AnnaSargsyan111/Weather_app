// Buckets a WMO weather code into one of exactly 3 categories for the overview donut.
// "Sunny" is clear/mainly clear (and fog, which carries no precipitation either) only -
// partly cloudy and overcast are folded into the "rainy" bucket instead, which the UI
// labels "Cloudy/Rainy days", so every non-clear, non-snowy sky condition lands in one
// combined category rather than being counted as "sunny".
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
const CLOUDY_CODES = new Set([2, 3]); // partly cloudy, overcast

export function categorizeDayType(weatherCode) {
  if (SNOW_CODES.has(weatherCode)) return "snowy";
  if (RAIN_CODES.has(weatherCode) || CLOUDY_CODES.has(weatherCode)) return "rainy";
  return "sunny";
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Filters the flat real-day array by the selected months/years and aggregates it into
// the donut/legend shape. Returns null when nothing in range has real data yet (e.g. a
// future year picked before it happened) so the UI can show an honest empty state.
export function computeOverviewStats(days, selectedMonths, selectedYears) {
  const matching = days.filter((d) => selectedYears.includes(d.year) && selectedMonths.includes(d.month));

  if (matching.length === 0) return null;

  const counts = { sunny: 0, rainy: 0, snowy: 0 };
  let highSum = 0;
  let lowSum = 0;

  matching.forEach((d) => {
    counts[d.type]++;
    highSum += d.tempMax;
    lowSum += d.tempMin;
  });

  const total = matching.length;
  const toPercent = (n) => Math.round((n / total) * 100);

  return {
    totalDays: total,
    sunny: { count: counts.sunny, percent: toPercent(counts.sunny) },
    rainy: { count: counts.rainy, percent: toPercent(counts.rainy) },
    snowy: { count: counts.snowy, percent: toPercent(counts.snowy) },
    avgHigh: highSum / total,
    avgLow: lowSum / total,
  };
}

// Just the value half of the label (the "Selected date:" prefix is rendered separately
// as its own line so the two can be styled/sized independently in the donut center).
export function overviewTitle(selectedMonths, selectedYears) {
  const years = [...selectedYears].sort((a, b) => a - b);
  const months = [...selectedMonths].sort((a, b) => a - b);

  if (months.length === 1 && years.length === 1) {
    return `${years[0]} ${MONTH_ABBR[months[0]]}`;
  }
  if (years.length > 1) {
    return `${years[0]}-${years[years.length - 1]}`;
  }
  if (months.length > 1) {
    return `${MONTH_ABBR[months[0]]}-${MONTH_ABBR[months[months.length - 1]]}, ${years[0]}`;
  }
  return "";
}
