import { useEffect, useState } from "react";
import { getWeatherNews } from "../services/weatherNewsService.js";

// Real climate news changes on the order of tens of minutes to hours, not seconds -
// polling this often keeps the "latest 6" rolling forward automatically while staying
// well within rss2json's free-tier rate limit (see weatherNewsService.js).
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// Fetched on a timer, not just once - it's global news, not tied to the selected
// location, but it does go stale. Each tick re-derives the current latest 6 from
// scratch (see getWeatherNews), so newer articles naturally push older ones out.
export function useWeatherNews() {
  const [state, setState] = useState({ articles: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    function load() {
      getWeatherNews()
        .then((articles) => {
          if (!cancelled) setState({ articles, loading: false, error: null });
        })
        .catch((error) => {
          if (cancelled) return;
          // A transient refresh failure (e.g. a rate-limited feed) shouldn't blank out
          // articles that are still genuinely the latest known ones - only surface the
          // error state if there's nothing on screen yet to fall back to.
          setState((prev) => ({
            articles: prev.articles,
            loading: false,
            error: prev.articles ? null : error.message,
          }));
        });
    }

    load();
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return state;
}
