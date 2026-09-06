import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";
import { formatTemp } from "../../../utils/temperature.js";
import styles from "../WeatherDetails.module.css";

const BAR_COUNT = 8;

export default function HumidityCard({ data, dewPoint, unit }) {
  const activeBars = Math.round((data.percent / 100) * BAR_COUNT);

  return (
    <DetailCard
      title="Humidity"
      badge={<Badge tone="blue" label={data.label} />}
      description="Relative humidity levels for the current conditions."
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 12 + i * 4,
                borderRadius: 999,
                background: i < activeBars ? "#38bdf8" : "var(--color-border)",
              }}
            />
          ))}
        </div>
        <div className={styles.metricsRow} style={{ flexDirection: "column", gap: 6 }}>
          <span>
            <strong>{Math.round(data.percent)}%</strong> Relative Humidity
          </span>
          <span>
            <strong>{formatTemp(dewPoint, unit)}</strong> Dew point
          </span>
        </div>
      </div>
    </DetailCard>
  );
}
