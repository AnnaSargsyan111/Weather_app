import { useEffect, useState } from "react";
import { PiWarningCircleBold, PiXBold } from "react-icons/pi";
import styles from "./DismissibleWarning.module.css";

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 200;

export default function DismissibleWarning({ message, onDismiss }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  function handleDismiss() {
    setClosing(true);
    setTimeout(onDismiss, EXIT_ANIMATION_MS);
  }

  return (
    <div className={`${styles.warning} ${closing ? styles.closing : ""}`} role="alert">
      <PiWarningCircleBold size={18} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.closeButton} aria-label="Dismiss" onClick={handleDismiss}>
        <PiXBold size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
