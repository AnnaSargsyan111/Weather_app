import { useEffect, useState } from "react";
import { getHistoricalRange } from "../services/historicalWeatherService.js";
import { categorizeDayType } from "../utils/weatherOverviewHelpers.js";

const EARLIEST_YEAR = 2024;

function parseLocalDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

// Fetches every real historical day from EARLIEST_YEAR through today once, then the
// component filters/aggregates it in-memory as the month/year multi-select changes -
// no refetch needed per filter change.
export function useWeatherOverview(location) {
  const [state, setState] = useState({ days: null, loading: Boolean(location), error: null });

  useEffect(() => {
    if (!location) {
      setState({ days: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ days: null, loading: true, error: null });

    const today = new Date();
    const start = new Date(EARLIEST_YEAR, 0, 1);
    const end = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000); // archive lag buffer

    getHistoricalRange(location.latitude, location.longitude, start, end)
      .then((raw) => {
        if (cancelled) return;

        const days = raw.time
          .map((dateStr, i) => {
            if (!Number.isFinite(raw.tempMax[i])) return null;
            const d = parseLocalDate(dateStr);
            return {
              date: dateStr,
              year: d.getFullYear(),
              month: d.getMonth(),
              tempMax: raw.tempMax[i],
              tempMin: raw.tempMin[i],
              precipitation: raw.precipitation[i] ?? 0,
              windSpeed: raw.windSpeed[i] ?? 0,
              type: categorizeDayType(raw.weatherCode[i]),
            };
          })
          .filter(Boolean);

        setState({ days, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ days: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  return state;
}
