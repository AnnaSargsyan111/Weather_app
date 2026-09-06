import { PiTreeEvergreenBold } from "react-icons/pi";
import styles from "./ClimateLink.module.css";

export default function ClimateLink() {
  return (
    <div className={styles.wrapper}>
      <a
        href="https://www.ipcc.ch/sr15/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        aria-label="Learn more about global warming (opens in a new tab)"
      >
        <PiTreeEvergreenBold size={18} aria-hidden="true" />
      </a>
      <span className={styles.tooltip} role="tooltip">
        The weather changes. Our climate does too. Learn more about global warming.
      </span>
    </div>
  );
}
