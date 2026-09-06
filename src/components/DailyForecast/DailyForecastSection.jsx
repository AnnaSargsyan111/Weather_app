import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import { getWeatherCondition } from "../../services/weatherCodes.js";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./DailyForecast.module.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseLocalDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function labelFor(date, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return WEEKDAY_LABELS[date.getDay()];
}

export default function DailyForecastSection({ days, unit, loading }) {
  if (loading && !days) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>16-Day Forecast</h2>
        <p className={styles.subtitle}>Loading real forecast data…</p>
      </section>
    );
  }

  if (!days) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>16-Day Forecast</h2>
      <p className={styles.subtitle}>The real limit of reliable day-by-day forecasting — live data, not an estimate.</p>
      <div className={styles.strip}>
        {days.map((day, index) => {
          const date = parseLocalDate(day.date);
          const condition = getWeatherCondition(day.weatherCode, true);
          const isRainy = day.precipitationProbability >= 40;

          return (
            <div key={day.date} className={`${styles.card} ${index === 0 ? styles.cardToday : ""}`}>
              <span className={styles.weekday}>{labelFor(date, index)}</span>
              <span className={styles.date}>
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <WeatherIcon icon={condition.icon} size={30} className={styles.icon} />
              {isRainy && <span className={styles.precipBadge}>💧 {Math.round(day.precipitationProbability)}%</span>}
              <div className={styles.temps}>
                <span className={styles.tempMax}>{formatTemp(day.tempMax, unit)}</span>
                <span className={styles.tempMin}>{formatTemp(day.tempMin, unit)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
