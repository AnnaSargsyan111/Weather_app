import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherForecastCalendar.module.css";

export default function MonthInsightBanner({ month, unit }) {
  if (!month) return null;
  const { hottestDay, rainyDayCount, avgHigh } = month.insight;

  return (
    <div className={styles.insightBanner}>
      <span className={styles.insightIcon} aria-hidden="true">
        📊
      </span>
      <p className={styles.insightText}>
        <strong>{month.label} insight:</strong> average high was{" "}
        <strong>{formatTemp(avgHigh, unit)}</strong>, with{" "}
        <strong>{rainyDayCount}</strong> rainy day{rainyDayCount === 1 ? "" : "s"} recorded
        {hottestDay && (
          <>
            {" "}
            and a hottest day of <strong>{formatTemp(hottestDay.tempMax, unit)}</strong> on{" "}
            {month.label.split(" ")[0]} {hottestDay.day}
          </>
        )}
        . Based on real historical data for this month.
      </p>
    </div>
  );
}
