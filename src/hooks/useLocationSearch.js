import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/geocodingService.js";

const DEBOUNCE_MS = 350;
export const MIN_QUERY_LENGTH = 2;

// status: 'idle' (query too short / empty - never show a result) | 'loading' | 'done'
const IDLE_STATE = { status: "idle", results: [], loading: false, error: null };

export function useLocationSearch(query) {
  const [state, setState] = useState(IDLE_STATE);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    // Invalidate any in-flight/pending request from a previous keystroke so its
    // response can never overwrite state for the current query (race condition guard).
    const currentRequest = ++requestId.current;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setState(IDLE_STATE);
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", loading: true, error: null }));

    const timer = setTimeout(() => {
      searchLocations(trimmed)
        .then((results) => {
          if (requestId.current === currentRequest) {
            setState({ status: "done", results, loading: false, error: null });
          }
        })
        .catch((error) => {
          if (requestId.current === currentRequest) {
            setState({ status: "done", results: [], loading: false, error: error.message });
          }
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return state;
}
