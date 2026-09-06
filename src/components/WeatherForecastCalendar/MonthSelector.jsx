import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherForecastCalendar.module.css";

export default function MonthSelector({ months, activeKey, onSelect, unit }) {
  return (
    <div className={styles.monthSelector}>
      {months.map((month) => {
        const isActive = month.key === activeKey;
        return (
          <button
            key={month.key}
            type="button"
            className={`${styles.monthTab} ${isActive ? styles.monthTabActive : ""}`}
            onClick={() => onSelect(month.key)}
            aria-pressed={isActive}
          >
            <WeatherIcon icon={month.dominantIcon} size={26} />
            <span className={styles.monthTabLabel}>{month.label}</span>
            <span className={styles.monthTabAvg}>Avg {formatTemp(month.avgHigh, unit)}</span>
          </button>
        );
      })}
    </div>
  );
}
