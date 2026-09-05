import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/geocodingService.js";

const DEBOUNCE_MS = 300;

export function useLocationSearch(query) {
  const [state, setState] = useState({ results: [], loading: false, error: null });
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setState({ results: [], loading: false, error: null });
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      searchLocations(trimmed)
        .then((results) => {
          if (requestId.current === currentRequest) {
            setState({ results, loading: false, error: null });
          }
        })
        .catch((error) => {
          if (requestId.current === currentRequest) {
            setState({ results: [], loading: false, error: error.message });
          }
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return state;
}
