import { PiWarningCircleBold } from "react-icons/pi";
import styles from "./ErrorState.module.css";

export default function ErrorState({ message }) {
  return (
    <div className={styles.error} role="alert">
      <PiWarningCircleBold size={18} className={styles.icon} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
