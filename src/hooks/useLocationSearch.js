import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/geocodingService.js";

const DEBOUNCE_MS = 350;
export const MIN_QUERY_LENGTH = 2;

// Any character outside Latin script (accented Latin letters like é/ñ/ü are fine),
// digits, whitespace, or common name punctuation - e.g. Armenian/Cyrillic/Arabic text.
const NON_LATIN_PATTERN = /[^\p{Script=Latin}\p{Number}\s'.,-]/u;

// status: 'idle' (query too short / empty - never show a result) | 'loading' | 'done'
const IDLE_STATE = { status: "idle", results: [], loading: false, error: null };
const NO_RESULTS_STATE = { status: "done", results: [], loading: false, error: null };

export function useLocationSearch(query) {
  const [state, setState] = useState(IDLE_STATE);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    // Invalidate any in-flight/pending request from a previous keystroke so its
    // response can never overwrite state for the current query (race condition guard).
    const currentRequest = ++requestId.current;

    if (!trimmed) {
      setState(IDLE_STATE);
      return;
    }

    // Non-Latin script (e.g. Armenian/Cyrillic/Arabic): our geocoding source only
    // matches Latin-script names, so skip the API/debounce entirely and go straight
    // to the existing "no result found" state.
    if (NON_LATIN_PATTERN.test(trimmed)) {
      setState(NO_RESULTS_STATE);
      return;
    }

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
