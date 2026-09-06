import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_AQI = 200;

const COLOR_BY_LABEL = {
  Good: "#22c55e",
  Moderate: "#eab308",
  "Unhealthy for Sensitive Groups": "#f97316",
  Unhealthy: "#ef4444",
  "Very Unhealthy": "#a855f7",
  Hazardous: "#7f1d1d",
};

export default function AqiCard({ data }) {
  if (!data) {
    return (
      <DetailCard title="AQI" description="Air quality data is currently unavailable.">
        <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>--</span>
      </DetailCard>
    );
  }

  const fillRatio = Math.min(1, data.value / MAX_AQI);
  const color = COLOR_BY_LABEL[data.label] || "var(--color-accent)";

  return (
    <DetailCard
      title="AQI"
      badge={<Badge tone="blue" label={data.label} />}
      description={`Air quality is ${data.label.toLowerCase()}, with primary pollutant ${data.primaryPollutant} at ${data.pollutantValue?.toFixed(1)} µg/m³.`}
    >
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle
          cx="44"
          cy="44"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fillRatio)}
          transform="rotate(-90 44 44)"
        />
        <text x="44" y="49" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--color-text)">
          {Math.round(data.value)}
        </text>
      </svg>
    </DetailCard>
  );
}
