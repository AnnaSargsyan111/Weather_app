import styles from "./WeatherDetails.module.css";

const TONE_CLASS = {
  orange: styles.toneOrange,
  blue: styles.toneBlue,
  yellow: styles.toneYellow,
};

export default function Badge({ label, tone = "blue" }) {
  return (
    <span className={`${styles.badge} ${TONE_CLASS[tone] || styles.toneBlue}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      {label}
    </span>
  );
}
