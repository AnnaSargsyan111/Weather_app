import { useEffect, useRef, useState } from "react";
import { PiCaretDownBold, PiCheckBold } from "react-icons/pi";
import styles from "../ThemeSelector/ThemeSelector.module.css";

const OPTIONS = [
  { value: "C", label: "Celsius (°C)" },
  { value: "F", label: "Fahrenheit (°F)" },
];

export default function TemperatureUnitSelector({ unit, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

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

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        °{unit}
        <PiCaretDownBold size={12} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={unit === option.value}
              className={`${styles.item} ${unit === option.value ? styles.itemSelected : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {unit === option.value && <PiCheckBold size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
