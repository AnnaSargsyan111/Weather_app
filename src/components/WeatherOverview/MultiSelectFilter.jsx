import { useEffect, useRef, useState } from "react";
import { PiCaretDownBold } from "react-icons/pi";
import styles from "./WeatherOverview.module.css";

export default function MultiSelectFilter({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selectAllRef = useRef(null);

  const allSelected = selected.length === options.length;

  useEffect(() => {
    if (selectAllRef.current) {
      // Native checkboxes only support the indeterminate visual via this DOM property -
      // there's no HTML attribute for it. The checkbox only exists in the DOM while the
      // menu is open, so `open` must be a dependency too or reopening a menu that was
      // already in a partial-selection state before it first mounted would leave the
      // freshly-mounted checkbox un-flagged.
      selectAllRef.current.indeterminate = !allSelected && selected.length > 0;
    }
  }, [allSelected, selected.length, open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle(value) {
    if (selected.includes(value)) {
      if (selected.length === 1) return; // keep at least one selected
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function selectAll() {
    onChange(options.map((o) => o.value));
  }

  const summary = allSelected
    ? "All"
    : selected.length === 1
    ? options.find((o) => o.value === selected[0])?.label
    : `${selected.length} selected`;

  return (
    <div className={styles.selectWrapper} ref={wrapperRef}>
      <button type="button" className={styles.selectTrigger} onClick={() => setOpen((prev) => !prev)}>
        {label}: {summary}
        <PiCaretDownBold size={11} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.selectMenu} role="menu">
          <label className={styles.selectOption}>
            <input type="checkbox" ref={selectAllRef} checked={allSelected} onChange={selectAll} />
            <strong>Select all</strong>
          </label>
          <hr className={styles.selectDivider} />
          {options.map((option) => (
            <label key={option.value} className={styles.selectOption}>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
