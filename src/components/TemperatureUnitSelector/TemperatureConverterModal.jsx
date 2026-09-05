import { useEffect, useRef, useState } from "react";
import { celsiusToFahrenheit, fahrenheitToCelsius, roundForDisplay } from "../../utils/temperature.js";
import styles from "./TemperatureConverterModal.module.css";

const NUMERIC_PATTERN = /^-?\d*\.?\d*$/;
const CLOSE_ANIMATION_MS = 150;

export default function TemperatureConverterModal({ open, onClose }) {
  const [celsius, setCelsius] = useState("");
  const [fahrenheit, setFahrenheit] = useState("");
  const [lastEdited, setLastEdited] = useState(null);
  const [closing, setClosing] = useState(false);
  const celsiusInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const focusTimer = setTimeout(() => celsiusInputRef.current?.focus(), 20);

    function handleKeyDown(event) {
      if (event.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_ANIMATION_MS);
  }

  function handleCelsiusChange(event) {
    const raw = event.target.value;
    if (!NUMERIC_PATTERN.test(raw)) return;
    setCelsius(raw);
    setLastEdited("C");

    const num = parseFloat(raw);
    setFahrenheit(raw === "" || Number.isNaN(num) ? "" : roundForDisplay(celsiusToFahrenheit(num)));
  }

  function handleFahrenheitChange(event) {
    const raw = event.target.value;
    if (!NUMERIC_PATTERN.test(raw)) return;
    setFahrenheit(raw);
    setLastEdited("F");

    const num = parseFloat(raw);
    setCelsius(raw === "" || Number.isNaN(num) ? "" : roundForDisplay(fahrenheitToCelsius(num)));
  }

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
      onMouseDown={handleClose}
    >
      <div
        className={`${styles.modal} ${closing ? styles.modalClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="temp-converter-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="temp-converter-title" className={styles.title}>
            Temperature Converter
          </h2>
          <button type="button" className={styles.closeButton} aria-label="Close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="temp-converter-celsius">
              Celsius (°C)
            </label>
            <input
              ref={celsiusInputRef}
              id="temp-converter-celsius"
              type="text"
              inputMode="decimal"
              className={styles.input}
              value={celsius}
              onChange={handleCelsiusChange}
            />
          </div>
          <span className={styles.equals}>=</span>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="temp-converter-fahrenheit">
              Fahrenheit (°F)
            </label>
            <input
              id="temp-converter-fahrenheit"
              type="text"
              inputMode="decimal"
              className={styles.input}
              value={fahrenheit}
              onChange={handleFahrenheitChange}
            />
          </div>
        </div>

        <p className={styles.formula}>
          Formula
          <span className={styles.formulaValue}>
            {lastEdited === "F" ? "°C = (°F − 32) × 5/9" : "°F = (°C × 9/5) + 32"}
          </span>
        </p>
      </div>
    </div>
  );
}
