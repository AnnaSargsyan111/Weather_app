import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PrecipitationCard({ data }) {
  const cm = (data.next24h / 10).toFixed(2);
  const fillRatio = Math.min(1, data.probability / 100);
  const hasRain = data.next24h > 0.1;

  return (
    <DetailCard
      title="Precipitation"
      badge={<Badge tone="yellow" label={hasRain ? "Light Precipitation" : "No Precipitation"} />}
      description={
        hasRain
          ? `Light rain expected in the next 24 hours (${data.probability}% chance).`
          : "No meaningful precipitation expected in the next 24 hours."
      }
    >
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle
          cx="44"
          cy="44"
          r={RADIUS}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fillRatio)}
          transform="rotate(-90 44 44)"
        />
        <text x="44" y="41" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-text)">
          {cm} cm
        </text>
        <text x="44" y="55" textAnchor="middle" fontSize="8" fill="var(--color-text-tertiary)">
          in next 24h
        </text>
      </svg>
    </DetailCard>
  );
}
