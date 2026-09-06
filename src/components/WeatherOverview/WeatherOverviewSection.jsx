import { useMemo, useState } from "react";
import MultiSelectFilter from "./MultiSelectFilter.jsx";
import DonutChart from "./DonutChart.jsx";
import { MONTH_NAMES, MONTH_ABBR, computeOverviewStats, overviewTitle } from "../../utils/weatherOverviewHelpers.js";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherOverview.module.css";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];
const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({ value: index, label: name, shortLabel: MONTH_ABBR[index] }));
const YEAR_SELECT_OPTIONS = YEAR_OPTIONS.map((year) => ({ value: year, label: String(year) }));
// Default selection on load: January through September only (indices 0-8) - October
// through December start deselected. Purely the initial state; still fully editable
// afterward through the same multi-select filters.
const DEFAULT_MONTHS = MONTH_OPTIONS.slice(0, 9).map((m) => m.value);

export default function WeatherOverviewSection({ days, unit, loading }) {
  const [selectedMonths, setSelectedMonths] = useState(DEFAULT_MONTHS);
  const [selectedYears, setSelectedYears] = useState([CURRENT_YEAR]);

  const stats = useMemo(() => {
    if (!days) return null;
    return computeOverviewStats(days, selectedMonths, selectedYears);
  }, [days, selectedMonths, selectedYears]);

  if (loading && !days) {
    return (
      <section id="weather-overview" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Weather overview</h2>
        </div>
        <div className={styles.card}>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>Loading historical data…</p>
        </div>
      </section>
    );
  }

  if (!days) return null;

  return (
    <section id="weather-overview" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Weather overview</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.cardFilters}>
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
                Cloudy/Rainy days
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
    </section>
  );
}
