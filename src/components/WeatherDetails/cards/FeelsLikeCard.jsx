import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";
import { formatTemp } from "../../../utils/temperature.js";
import styles from "../WeatherDetails.module.css";

const SCALE_MIN = -10;
const SCALE_MAX = 45;

export default function FeelsLikeCard({ data, unit }) {
  const position = Math.min(100, Math.max(0, ((data.current - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

  return (
    <DetailCard
      title="Feels like"
      badge={<Badge tone="orange" label={data.label} />}
      description={
        data.dominantFactor === "humidity"
          ? "Feels warmer than the actual temperature due to the humidity."
          : data.dominantFactor === "wind"
          ? "Feels colder than the actual temperature due to the wind."
          : "Feels about the same as the actual temperature."
      }
    >
      <div style={{ width: "100%" }}>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 10 }}>
          Dominant factor: {data.dominantFactor}
        </div>
        <div
          style={{
            position: "relative",
            height: 6,
            borderRadius: 999,
            background: "linear-gradient(to right, #f43f5e, #ec4899)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${position}%`,
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff",
              border: "3px solid #f43f5e",
            }}
          />
        </div>
        <div className={styles.metricsRow} style={{ marginTop: 14 }}>
          <span>
            Feels like: <strong>{formatTemp(data.current, unit)}</strong>
          </span>
          <span>
            Temperature: <strong>{formatTemp(data.actualTemp, unit)}</strong>
          </span>
        </div>
      </div>
    </DetailCard>
  );
}
