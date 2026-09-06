import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherForecastCalendar.module.css";

function heatClass(tempMaxCelsius) {
  if (!Number.isFinite(tempMaxCelsius)) return "";
  if (tempMaxCelsius < 15) return styles.heatCool;
  if (tempMaxCelsius < 25) return styles.heatMild;
  if (tempMaxCelsius < 30) return styles.heatWarm;
  return styles.heatHot;
}

export default function ForecastDayCell({ day, unit, matchesFilter }) {
  if (!day) return <div className={`${styles.cell} ${styles.cellPadding}`} aria-hidden="true" />;

  const classNames = [styles.cell, heatClass(day.tempMax), matchesFilter ? styles.filterMatch : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div className={styles.cellTop}>
        <span className={styles.cellDate}>{day.day}</span>
        {day.isRainy && <span className={styles.cellBadge}>💧 {day.precipitation.toFixed(1)}mm</span>}
      </div>
      <WeatherIcon icon={day.condition.icon} size={28} className={styles.cellIcon} />
      <div className={styles.cellMetrics}>
        <div className={styles.cellMetricsLabel}>Avg</div>
        <div className={styles.cellMax}>{formatTemp(day.tempMax, unit)}</div>
        <div className={styles.cellMin}>{formatTemp(day.tempMin, unit)}</div>
      </div>
    </div>
  );
}
