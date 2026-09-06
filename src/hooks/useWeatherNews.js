import { useEffect, useState } from "react";
import { getWeatherNews } from "../services/weatherNewsService.js";

// Fetched once - it's global news, not tied to the selected location.
export function useWeatherNews() {
  const [state, setState] = useState({ articles: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    getWeatherNews()
      .then((articles) => {
        if (!cancelled) setState({ articles, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ articles: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
