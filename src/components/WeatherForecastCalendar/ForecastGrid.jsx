import ForecastDayCell from "./ForecastDayCell.jsx";
import styles from "./WeatherForecastCalendar.module.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GRID_SIZE = 7;

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

export default function ForecastGrid({ month, previousMonth, nextMonth, unit, filter }) {
  const leadingCount = month.days[0]?.weekday ?? 0;
  const leadingCells = previousMonth ? previousMonth.days.slice(-leadingCount) : Array(leadingCount).fill(null);

  const totalSoFar = leadingCells.length + month.days.length;
  const trailingCount = (GRID_SIZE - (totalSoFar % GRID_SIZE)) % GRID_SIZE;
  const trailingCells = nextMonth ? nextMonth.days.slice(0, trailingCount) : Array(trailingCount).fill(null);

  const cells = [
    ...leadingCells.map((day) => ({ day, isAdjacent: true })),
    ...month.days.map((day) => ({ day, isAdjacent: false })),
    ...trailingCells.map((day) => ({ day, isAdjacent: true })),
  ];

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
        {cells.map(({ day, isAdjacent }, index) => (
          <ForecastDayCell
            key={day?.date ?? `pad-${index}`}
            day={day}
            unit={unit}
            isAdjacent={isAdjacent}
            isToday={day && !isAdjacent && isSameDate(day.date)}
            matchesFilter={!isAdjacent && filter !== "all" && day && matchesFilter(day, filter)}
          />
        ))}
      </div>
    </div>
  );
}
