import { useEffect, useState } from "react";
import MonthInsightBanner from "./MonthInsightBanner.jsx";
import MonthSelector from "./MonthSelector.jsx";
import ForecastGrid from "./ForecastGrid.jsx";
import styles from "./WeatherForecastCalendar.module.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "rainy", label: "Rainy Days" },
  { key: "hot", label: "Extreme Heat" },
];

export default function WeatherForecastCalendarSection({ months, leadingPaddingDays, unit, loading }) {
  const [activeKey, setActiveKey] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (months && months.length > 0) setActiveKey(months[0].key);
  }, [months]);

  if (loading && !months) {
    return (
      <section id="weather-forecast" className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>Weather forecast</h2>
        </div>
        <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>Loading the 12-month forecast…</p>
      </section>
    );
  }

  if (!months) return null;

  const activeIndex = months.findIndex((m) => m.key === activeKey);
  const activeMonth = activeIndex >= 0 ? months[activeIndex] : months[0];
  const previousMonth =
    activeIndex > 0
      ? months[activeIndex - 1]
      : leadingPaddingDays && leadingPaddingDays.length > 0
      ? { days: leadingPaddingDays }
      : null;
  const nextMonth = activeIndex >= 0 && activeIndex < months.length - 1 ? months[activeIndex + 1] : null;

  return (
    <section id="weather-forecast" className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Weather forecast</h2>
        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.filterButton} ${filter === f.key ? styles.filterButtonActive : ""}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <MonthInsightBanner month={activeMonth} unit={unit} />
      <MonthSelector months={months} activeKey={activeMonth.key} onSelect={setActiveKey} unit={unit} />
      <ForecastGrid
        month={activeMonth}
        previousMonth={previousMonth}
        nextMonth={nextMonth}
        unit={unit}
        filter={filter}
      />
    </section>
  );
}
