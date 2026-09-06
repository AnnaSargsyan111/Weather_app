import { useEffect, useState } from "react";
import { getDailyForecast } from "../services/dailyForecastService.js";
import { getHistoricalRange } from "../services/historicalWeatherService.js";
import { getWeatherCondition } from "../services/weatherCodes.js";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Local-date formatting - NOT toISOString(), which converts to UTC and shifts the date
// backward whenever the system timezone is ahead of UTC (a real bug found in testing:
// local midnight Sep 1 in a UTC+N zone becomes "Aug 31" once run through toISOString()).
function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Deterministic pseudo-random variation from a string seed, in [-magnitude, +magnitude].
// Deterministic (not Math.random()) so estimated values stay stable across re-renders.
function seededVariation(seed, magnitude) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return (normalized - 0.5) * 2 * magnitude;
}

// Builds a 12-month forward calendar (starting this month) mixing real forecast data
// (where the weather API actually has it - today plus the ~16-day reliable window) with
// clearly-marked estimates derived from real historical data for the same calendar dates
// one year earlier, for every date beyond that real window.
export function useForecastCalendar(location) {
  const [state, setState] = useState({ months: null, loading: Boolean(location), error: null });

  useEffect(() => {
    if (!location) {
      setState({ months: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ months: null, loading: true, error: null });

    const today = new Date();
    const startTarget = new Date(today.getFullYear(), today.getMonth(), 1);
    const startBaseline = new Date(startTarget.getFullYear() - 1, startTarget.getMonth(), 1);
    const endBaseline = new Date(startTarget.getFullYear() - 1, startTarget.getMonth() + 12, 0);

    // The month immediately before the 12-month range (e.g. Aug 2026 when the range
    // starts Sep 2026) isn't otherwise fetched anywhere, so the first month's leading
    // calendar-padding days would have no real data to show. It's already in the past
    // by the time this range starts, so fetch its own real (not year-shifted) history -
    // just the last week is enough to cover any leading-padding need (max 6 days).
    const paddingRangeEnd = new Date(startTarget.getTime() - 24 * 60 * 60 * 1000);
    const paddingRangeStart = new Date(paddingRangeEnd.getTime() - 6 * 24 * 60 * 60 * 1000);

    Promise.all([
      getDailyForecast(location.latitude, location.longitude),
      getHistoricalRange(location.latitude, location.longitude, startBaseline, endBaseline),
      getHistoricalRange(location.latitude, location.longitude, paddingRangeStart, paddingRangeEnd),
    ])
      .then(([real, baseline, leadingPaddingRaw]) => {
        if (cancelled) return;

        const realByDate = new Map();
        real.forEach((d) => {
          if (Number.isFinite(d.tempMax)) realByDate.set(d.date, d);
        });

        const leadingPaddingDays = leadingPaddingRaw.time
          .map((dateStr, i) => {
            if (!Number.isFinite(leadingPaddingRaw.tempMax[i])) return null;
            const d = parseLocalDate(dateStr);
            return {
              date: dateStr,
              day: d.getDate(),
              weekday: d.getDay(),
              tempMax: leadingPaddingRaw.tempMax[i],
              tempMin: leadingPaddingRaw.tempMin[i],
              precipitation: leadingPaddingRaw.precipitation[i],
              precipitationProbability: leadingPaddingRaw.precipitation[i] > 1 ? 55 : 5,
              windSpeed: leadingPaddingRaw.windSpeed[i],
              condition: getWeatherCondition(leadingPaddingRaw.weatherCode[i], true),
              isRainy: leadingPaddingRaw.precipitation[i] > 1,
              source: "live",
            };
          })
          .filter(Boolean);

        const baselineByMonthDay = new Map();
        baseline.time.forEach((dateStr, i) => {
          if (!Number.isFinite(baseline.tempMax[i])) return;
          const d = parseLocalDate(dateStr);
          baselineByMonthDay.set(`${d.getMonth()}-${d.getDate()}`, {
            tempMax: baseline.tempMax[i],
            tempMin: baseline.tempMin[i],
            precipitation: baseline.precipitation[i],
            weatherCode: baseline.weatherCode[i],
            windSpeed: baseline.windSpeed[i],
          });
        });

        const months = [];

        for (let m = 0; m < 12; m++) {
          const monthDate = new Date(startTarget.getFullYear(), startTarget.getMonth() + m, 1);
          const year = monthDate.getFullYear();
          const monthIndex = monthDate.getMonth();
          const numDays = daysInMonth(year, monthIndex);
          const days = [];

          for (let day = 1; day <= numDays; day++) {
            const dateObj = new Date(year, monthIndex, day);
            const dateStr = isoDate(dateObj);
            const weekday = dateObj.getDay();
            const realDay = realByDate.get(dateStr);

            if (realDay) {
              days.push({
                date: dateStr,
                day,
                weekday,
                tempMax: realDay.tempMax,
                tempMin: realDay.tempMin,
                precipitation: realDay.precipitationSum,
                precipitationProbability: realDay.precipitationProbability,
                windSpeed: realDay.windSpeed,
                condition: getWeatherCondition(realDay.weatherCode, true),
                isRainy: realDay.precipitationProbability >= 40,
                source: "live",
              });
              continue;
            }

            const base = baselineByMonthDay.get(`${monthIndex}-${day}`);
            if (base) {
              const tempShift = seededVariation(dateStr, 1.5);
              const precipFactor = 1 + seededVariation(`${dateStr}p`, 0.3);
              const estPrecip = Math.max(0, base.precipitation * precipFactor);

              days.push({
                date: dateStr,
                day,
                weekday,
                tempMax: base.tempMax + tempShift,
                tempMin: base.tempMin + tempShift * 0.8,
                precipitation: estPrecip,
                precipitationProbability: estPrecip > 1 ? 55 : estPrecip > 0.2 ? 25 : 5,
                windSpeed: base.windSpeed,
                condition: getWeatherCondition(base.weatherCode, true),
                isRainy: estPrecip > 1,
                source: "estimated",
                estimateBasis: `${MONTH_LABELS[monthIndex]} ${year - 1}`,
              });
            } else {
              days.push(null);
            }
          }

          const validDays = days.filter(Boolean);
          const avgHigh = validDays.reduce((sum, d) => sum + d.tempMax, 0) / (validDays.length || 1);

          const iconCounts = {};
          validDays.forEach((d) => {
            iconCounts[d.condition.icon] = (iconCounts[d.condition.icon] || 0) + 1;
          });
          const dominantIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "cloudy";

          const rainyDayCount = validDays.filter((d) => d.isRainy).length;
          const hottestDay = validDays.reduce((best, d) => (!best || d.tempMax > best.tempMax ? d : best), null);
          const hasEstimated = validDays.some((d) => d.source === "estimated");
          const hasLive = validDays.some((d) => d.source === "live");

          months.push({
            key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
            year,
            month: monthIndex,
            label: `${MONTH_LABELS[monthIndex]} ${year}`,
            days,
            avgHigh,
            dominantIcon,
            insight: { hottestDay, rainyDayCount, avgHigh, hasEstimated, hasLive },
          });
        }

        setState({ months, leadingPaddingDays, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ months: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  return state;
}
