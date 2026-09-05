import { useEffect, useRef, useState } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { useLocationSearch, MIN_QUERY_LENGTH } from "../../hooks/useLocationSearch.js";
import LocationSuggestions from "../LocationSuggestions/LocationSuggestions.jsx";
import styles from "./LocationSearch.module.css";

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { status, results } = useLocationSearch(query);
  const wrapperRef = useRef(null);
  const listId = "location-suggestions";

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result) {
    onSelect(result);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH && status !== "idle";

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.field}>
        <PiMagnifyingGlassBold size={18} className={styles.icon} aria-hidden="true" />
        <input
          type="text"
          className={styles.input}
          placeholder="Search location"
          aria-label="Search location"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showDropdown && (
        <LocationSuggestions
          status={status}
          results={results}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          onHover={setActiveIndex}
          listId={listId}
        />
      )}
    </div>
  );
}
