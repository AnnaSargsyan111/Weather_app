import ForecastDayCell from "./ForecastDayCell.jsx";
import styles from "./WeatherForecastCalendar.module.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function matchesFilter(day, filter) {
  if (filter === "rainy") return day.isRainy;
  if (filter === "hot") return day.tempMax >= 32;
  return false;
}

function isSameDate(dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return dateStr === todayStr;
}

export default function ForecastGrid({ month, unit, filter }) {
  const leadingPadding = month.days[0]?.weekday ?? 0;
  const cells = [...Array(leadingPadding).fill(null), ...month.days];

  return (
    <div className={styles.gridPanel}>
      <div className={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className={styles.weekdayLabel}>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, index) => (
          <ForecastDayCell
            key={day?.date ?? `pad-${index}`}
            day={day}
            unit={unit}
            isToday={day && isSameDate(day.date)}
            matchesFilter={filter !== "all" && day && matchesFilter(day, filter)}
          />
        ))}
      </div>
    </div>
  );
}
