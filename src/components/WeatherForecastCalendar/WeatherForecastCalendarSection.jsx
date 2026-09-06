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

export default function WeatherForecastCalendarSection({ months, unit, loading }) {
  const [activeKey, setActiveKey] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (months && months.length > 0) setActiveKey(months[0].key);
  }, [months]);

  if (loading && !months) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>Weather forecast</h2>
        </div>
        <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>Loading the 12-month forecast…</p>
      </section>
    );
  }

  if (!months) return null;

  const activeMonth = months.find((m) => m.key === activeKey) || months[0];

  return (
    <section className={styles.section}>
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
      <ForecastGrid month={activeMonth} unit={unit} filter={filter} />
    </section>
  );
}
