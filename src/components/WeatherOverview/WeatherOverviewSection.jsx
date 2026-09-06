import { useMemo, useState } from "react";
import MultiSelectFilter from "./MultiSelectFilter.jsx";
import DonutChart from "./DonutChart.jsx";
import { MONTH_NAMES, computeOverviewStats, overviewTitle } from "../../utils/weatherOverviewHelpers.js";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherOverview.module.css";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];
const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({ value: index, label: name }));
const YEAR_SELECT_OPTIONS = YEAR_OPTIONS.map((year) => ({ value: year, label: String(year) }));

export default function WeatherOverviewSection({ days, unit, loading }) {
  const [selectedMonths, setSelectedMonths] = useState(MONTH_OPTIONS.map((m) => m.value));
  const [selectedYears, setSelectedYears] = useState([CURRENT_YEAR]);

  const stats = useMemo(() => {
    if (!days) return null;
    return computeOverviewStats(days, selectedMonths, selectedYears);
  }, [days, selectedMonths, selectedYears]);

  if (loading && !days) {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>Weather overview</h2>
        <p style={{ color: "var(--color-text-tertiary)", fontSize: 13, marginTop: 12 }}>Loading historical data…</p>
      </div>
    );
  }

  if (!days) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Weather overview</h2>
        <div className={styles.filters}>
          <MultiSelectFilter
            label="Month"
            options={MONTH_OPTIONS}
            selected={selectedMonths}
            onChange={setSelectedMonths}
          />
          <MultiSelectFilter
            label="Year"
            options={YEAR_SELECT_OPTIONS}
            selected={selectedYears}
            onChange={setSelectedYears}
          />
        </div>
      </div>

      {!stats ? (
        <p className={styles.emptyState}>
          No recorded weather data yet for this selection — it may be entirely in the future.
        </p>
      ) : (
        <div className={styles.body}>
          <div className={styles.chartWrap}>
            <DonutChart stats={stats}>
              <span className={styles.chartCenterPrefix}>Selected date:</span>
              <span className={styles.chartCenterValue}>{overviewTitle(selectedMonths, selectedYears)}</span>
            </DonutChart>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendRow}>
              <span className={styles.legendDot} style={{ background: "#FF6B00" }} />
              Sunny days
              <span className={styles.legendValue} style={{ marginLeft: "auto" }}>
                {stats.sunny.count} days ({stats.sunny.percent}%)
              </span>
            </div>
            <div className={styles.legendRow}>
              <span className={styles.legendDot} style={{ background: "#0094FF" }} />
              Rainy days
              <span className={styles.legendValue} style={{ marginLeft: "auto" }}>
                {stats.rainy.count} days ({stats.rainy.percent}%)
              </span>
            </div>
            <div className={styles.legendRow}>
              <span className={styles.legendDot} style={{ background: "#00E0FF" }} />
              Snowy days
              <span className={styles.legendValue} style={{ marginLeft: "auto" }}>
                {stats.snowy.count} days ({stats.snowy.percent}%)
              </span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.aggregateRow}>
              ↑ Average high
              <span className={styles.aggregateValue} style={{ marginLeft: "auto" }}>
                {formatTemp(stats.avgHigh, unit)}
              </span>
            </div>
            <div className={styles.aggregateRow}>
              ↓ Average low
              <span className={styles.aggregateValue} style={{ marginLeft: "auto" }}>
                {formatTemp(stats.avgLow, unit)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
