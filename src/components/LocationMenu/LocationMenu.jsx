import { useEffect, useRef, useState } from "react";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import styles from "./LocationMenu.module.css";

export default function LocationMenu({ onRemove, label }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
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
        aria-label={`Options for ${label}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <PiDotsThreeVerticalBold size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              onRemove();
            }}
          >
            Remove location
          </button>
        </div>
      )}
    </div>
  );
}
