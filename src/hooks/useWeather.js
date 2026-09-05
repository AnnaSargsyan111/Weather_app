import { useEffect, useState } from "react";
import { getWeather } from "../services/weatherService.js";

export function useWeather(location) {
  const [state, setState] = useState({ data: null, loading: Boolean(location), error: null });

  useEffect(() => {
    if (!location) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));

    getWeather(location.latitude, location.longitude)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  return state;
}
