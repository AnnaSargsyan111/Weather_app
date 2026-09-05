import { useEffect, useRef, useState } from "react";
import { PiSunBold, PiMoonBold, PiCaretDownBold, PiCheckBold } from "react-icons/pi";
import styles from "./ThemeSelector.module.css";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function ThemeSelector({ theme, onChange }) {
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
        {theme === "dark" ? <PiMoonBold size={16} aria-hidden="true" /> : <PiSunBold size={16} aria-hidden="true" />}
        Theme
        <PiCaretDownBold size={12} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              className={`${styles.item} ${theme === option.value ? styles.itemSelected : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {theme === option.value && <PiCheckBold size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
