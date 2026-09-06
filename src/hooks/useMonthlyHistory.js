import { useEffect, useState } from "react";
import { getMonthlyHistory } from "../services/historicalWeatherService.js";
import { getWeatherCondition } from "../services/weatherCodes.js";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseLocalDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function buildMonths(raw) {
  const buckets = new Map();

  raw.time.forEach((dateStr, i) => {
    const date = parseLocalDate(dateStr);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
        days: [],
      });
    }

    const tempMax = raw.tempMax[i];
    const tempMin = raw.tempMin[i];
    const precipitation = raw.precipitation[i] ?? 0;
    const code = raw.weatherCode[i];

    buckets.get(key).days.push({
      date: dateStr,
      day: date.getDate(),
      weekday: date.getDay(),
      tempMax,
      tempMin,
      precipitation,
      isRainy: precipitation > 1,
      condition: getWeatherCondition(code, true),
    });
  });

  return Array.from(buckets.values()).map((month) => {
    const validMax = month.days.map((d) => d.tempMax).filter((v) => Number.isFinite(v));
    const avgHigh = validMax.reduce((sum, v) => sum + v, 0) / (validMax.length || 1);

    const iconCounts = {};
    month.days.forEach((d) => {
      iconCounts[d.condition.icon] = (iconCounts[d.condition.icon] || 0) + 1;
    });
    const dominantIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "cloudy";

    const rainyDayCount = month.days.filter((d) => d.isRainy).length;
    const hottestDay = month.days.reduce(
      (best, d) => (Number.isFinite(d.tempMax) && (!best || d.tempMax > best.tempMax) ? d : best),
      null
    );

    return {
      ...month,
      avgHigh,
      dominantIcon,
      insight: { hottestDay, rainyDayCount, avgHigh },
    };
  });
}

export function useMonthlyHistory(location) {
  const [state, setState] = useState({ months: null, loading: Boolean(location), error: null });

  useEffect(() => {
    if (!location) {
      setState({ months: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ months: null, loading: true, error: null });

    getMonthlyHistory(location.latitude, location.longitude)
      .then((raw) => {
        if (!cancelled) setState({ months: buildMonths(raw), loading: false, error: null });
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
