import styles from "./WeatherDetails.module.css";

export default function DetailCard({ title, children, badge, description }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardTitle}>{title}</span>
      <div className={styles.graphic}>{children}</div>
      {badge}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
