import { createPortal } from "react-dom";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherForecastCalendar.module.css";

export default function DayHoverCard({ day, position, unit }) {
  if (!position) return null;

  return createPortal(
    <div className={styles.hoverCard} style={{ top: position.top, left: position.left }} role="tooltip">
      <div className={styles.hoverRow}>
        <span>💧</span>
        <span>{Math.round(day.precipitationProbability)}%</span>
      </div>
      <div className={styles.hoverRow}>
        <span>🌡️</span>
        <span>
          {formatTemp(day.tempMax, unit)} | {formatTemp(day.tempMin, unit)}
        </span>
      </div>
      {Number.isFinite(day.windSpeed) && (
        <div className={styles.hoverRow}>
          <span>💨</span>
          <span>{Math.round(day.windSpeed)} km/h</span>
        </div>
      )}
      <div className={styles.hoverSource}>
        {day.source === "live" ? "From live forecast" : `From historical estimate (${day.estimateBasis})`}
      </div>
    </div>,
    document.body
  );
}
