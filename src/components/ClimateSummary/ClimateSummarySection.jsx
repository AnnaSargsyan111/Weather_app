import { WiThermometer, WiSnowflakeCold, WiRaindrop, WiStrongWind } from "react-icons/wi";
import { lastTwelveMonths, computeClimateExtremes, computeDailySummary } from "../../utils/climateSummaryHelpers.js";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./ClimateSummary.module.css";

function round(value, decimals) {
  const factor = 10 ** decimals;
  return (Math.round(value * factor) / factor).toString();
}

export default function ClimateSummarySection({ days, unit, loading }) {
  if (loading && !days) {
    return (
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.title}>Climate information</h2>
          <p className={styles.loadingText}>Loading historical data…</p>
        </div>
      </div>
    );
  }

  if (!days) return null;

  const last12 = lastTwelveMonths(days);
  const last12Extremes = computeClimateExtremes(last12);
  const allYearsExtremes = computeClimateExtremes(days);
  const dailySummary = computeDailySummary(last12);

  if (!last12Extremes || !allYearsExtremes || !dailySummary) return null;

  const climateRows = [
    { icon: <WiThermometer />, label: "Hottest month", last12: last12Extremes.hottestMonth, allYears: allYearsExtremes.hottestMonth },
    { icon: <WiSnowflakeCold />, label: "Coldest month", last12: last12Extremes.coldestMonth, allYears: allYearsExtremes.coldestMonth },
    { icon: <WiRaindrop />, label: "Wettest month", last12: last12Extremes.wettestMonth, allYears: allYearsExtremes.wettestMonth },
    { icon: <WiStrongWind />, label: "Windiest month", last12: last12Extremes.windiestMonth, allYears: allYearsExtremes.windiestMonth },
  ];

  const summaryRows = [
    {
      label: "High temperature",
      max: formatTemp(dailySummary.highTemp.max, unit),
      avg: formatTemp(dailySummary.highTemp.avg, unit),
      min: formatTemp(dailySummary.highTemp.min, unit),
    },
    {
      label: "Low temperature",
      max: formatTemp(dailySummary.lowTemp.max, unit),
      avg: formatTemp(dailySummary.lowTemp.avg, unit),
      min: formatTemp(dailySummary.lowTemp.min, unit),
    },
    {
      label: "Precipitation (cm)",
      max: round(dailySummary.precipitation.max, 2),
      avg: round(dailySummary.precipitation.avg, 2),
      min: round(dailySummary.precipitation.min, 2),
    },
    {
      label: "Wind (km/h)",
      max: round(dailySummary.wind.max, 1),
      avg: round(dailySummary.wind.avg, 1),
      min: round(dailySummary.wind.min, 1),
    },
  ];

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <h2 className={styles.title}>Climate information</h2>
        <div className={styles.headerRow}>
          <span className={styles.headerLabel} />
          <span className={styles.headerValue}>Last 12 months</span>
          <span className={styles.headerValue}>All years</span>
        </div>
        {climateRows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={styles.rowLabel}>
              <span className={styles.rowIcon}>{row.icon}</span>
              {row.label}
            </span>
            <span className={styles.rowValue}>{row.last12}</span>
            <span className={styles.rowValue}>{row.allYears}</span>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Daily summary (last 12 months)</h2>
        <div className={styles.summaryHeaderRow}>
          <span className={styles.headerLabel} />
          <span className={styles.headerValue}>Max</span>
          <span className={styles.headerValue}>Average</span>
          <span className={styles.headerValue}>Min</span>
        </div>
        {summaryRows.map((row) => (
          <div key={row.label} className={styles.summaryRow}>
            <span className={styles.rowLabel}>{row.label}</span>
            <span className={styles.rowValue}>{row.max}</span>
            <span className={styles.rowValue}>{row.avg}</span>
            <span className={styles.rowValue}>{row.min}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
