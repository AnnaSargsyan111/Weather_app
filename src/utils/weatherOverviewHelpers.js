// Buckets a WMO weather code into one of exactly 3 categories for the overview donut -
// "Sunny" here means "no precipitation" (clear through overcast/fog), not literally
// cloudless, since the widget only has 3 slices and every day must land in one of them.
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

export function categorizeDayType(weatherCode) {
  if (SNOW_CODES.has(weatherCode)) return "snowy";
  if (RAIN_CODES.has(weatherCode)) return "rainy";
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

export function overviewTitle(selectedMonths, selectedYears) {
  const years = [...selectedYears].sort((a, b) => a - b);
  const months = [...selectedMonths].sort((a, b) => a - b);

  if (months.length === 1 && years.length === 1) {
    return `${years[0]} ${MONTH_ABBR[months[0]]}`;
  }
  if (years.length > 1) {
    return `Selected date: ${years[0]}-${years[years.length - 1]}`;
  }
  if (months.length > 1) {
    return `Selected date: ${MONTH_ABBR[months[0]]}-${MONTH_ABBR[months[months.length - 1]]}, ${years[0]}`;
  }
  return "Selected date";
}
