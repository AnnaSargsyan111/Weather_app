import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";
import styles from "../WeatherDetails.module.css";

export default function WindCard({ data }) {
  return (
    <DetailCard
      title="Wind"
      badge={<Badge tone="orange" label={`Force: ${data.force.scale} (${data.force.label})`} />}
      description={`Wind from the ${data.directionLabel} at ${Math.round(data.speed)} km/h, gusting to ${Math.round(data.gust)} km/h.`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="32" fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
          {["N", "E", "S", "W"].map((label, i) => {
            const angle = i * 90;
            const rad = (angle - 90) * (Math.PI / 180);
            const x = 36 + Math.cos(rad) * 26;
            const y = 36 + Math.sin(rad) * 26;
            return (
              <text key={label} x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="var(--color-text-tertiary)">
                {label}
              </text>
            );
          })}
          <g transform={`rotate(${data.direction} 36 36)`}>
            <path d="M 36 12 L 41 34 L 36 30 L 31 34 Z" fill="var(--color-accent)" />
          </g>
        </svg>
        <div className={styles.metricsRow} style={{ flexDirection: "column", gap: 8 }}>
          <span>
            <strong>{Math.round(data.speed)} km/h</strong> Wind Speed
          </span>
          <span>
            <strong>{Math.round(data.gust)} km/h</strong> Wind Gust
          </span>
        </div>
      </div>
    </DetailCard>
  );
}
