import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherForecastCalendar.module.css";

export default function MonthInsightBanner({ month, unit }) {
  if (!month) return null;
  const { hottestDay, rainyDayCount, avgHigh, hasEstimated, hasLive } = month.insight;

  let sourceNote;
  if (hasEstimated && hasLive) {
    sourceNote = "Based on live forecast where available, with historical-pattern estimates for the rest of the month.";
  } else if (hasEstimated) {
    sourceNote = "Based on historical patterns from the same month last year — not a guaranteed forecast.";
  } else {
    sourceNote = "Based on live forecast data.";
  }

  return (
    <div className={styles.insightBanner}>
      <span className={styles.insightIcon} aria-hidden="true">
        📊
      </span>
      <p className={styles.insightText}>
        <strong>{month.label} insight:</strong> average high{" "}
        <strong>{formatTemp(avgHigh, unit)}</strong>, with <strong>{rainyDayCount}</strong> rainy day
        {rainyDayCount === 1 ? "" : "s"}
        {hottestDay && (
          <>
            {" "}
            and a peak of <strong>{formatTemp(hottestDay.tempMax, unit)}</strong> on{" "}
            {month.label.split(" ")[0]} {hottestDay.day}
          </>
        )}
        . {sourceNote}
      </p>
    </div>
  );
}
