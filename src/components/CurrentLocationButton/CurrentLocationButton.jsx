import { useEffect } from "react";
import { PiCrosshairSimpleBold, PiSpinnerBold } from "react-icons/pi";
import { useGeolocation } from "../../hooks/useGeolocation.js";
import styles from "./CurrentLocationButton.module.css";

export default function CurrentLocationButton({ onLocate, onError }) {
  const { loading, error, locate } = useGeolocation();

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  async function handleClick() {
    const location = await locate();
    if (location) onLocate(location);
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        aria-label="Use your current location"
        disabled={loading}
      >
        {loading ? (
          <PiSpinnerBold size={18} className={styles.spinning} aria-hidden="true" />
        ) : (
          <PiCrosshairSimpleBold size={18} aria-hidden="true" />
        )}
      </button>
      <span className={styles.tooltip} role="tooltip">
        Your current location
      </span>
    </div>
  );
}
