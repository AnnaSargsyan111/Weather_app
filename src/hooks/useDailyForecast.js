import { useEffect, useState } from "react";
import { getDailyForecast } from "../services/dailyForecastService.js";

export function useDailyForecast(location) {
  const [state, setState] = useState({ days: null, loading: Boolean(location), error: null });

  useEffect(() => {
    if (!location) {
      setState({ days: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ days: null, loading: true, error: null });

    getDailyForecast(location.latitude, location.longitude)
      .then((days) => {
        if (!cancelled) setState({ days, loading: false, error: null });
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
