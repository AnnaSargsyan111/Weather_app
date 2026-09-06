import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";

const MAX_UV = 11;

function pointOnArc(ratio, radius, cx, cy) {
  const angle = Math.PI - ratio * Math.PI; // 180deg (left) -> 0deg (right)
  return { x: cx + Math.cos(angle) * radius, y: cy - Math.sin(angle) * radius };
}

export default function UvCard({ data }) {
  const ratio = Math.min(1, data.peak.value / MAX_UV);
  const marker = pointOnArc(ratio, 34, 44, 44);

  return (
    <DetailCard
      title="UV"
      badge={<Badge tone="orange" label={data.label} />}
      description={`Maximum UV exposure for today will be ${data.label.toLowerCase()}, expected at ${data.peak.time}.`}
    >
      <svg width="90" height="56" viewBox="0 0 88 48">
        <defs>
          <linearGradient id="uvArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="65%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d="M 10 44 A 34 34 0 0 1 78 44" fill="none" stroke="url(#uvArc)" strokeWidth="6" strokeLinecap="round" />
        <circle cx={marker.x} cy={marker.y} r="5" fill="#fff" stroke="var(--color-text)" strokeWidth="1.5" />
        <text x="44" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-text)">
          {Math.round(data.peak.value)}
        </text>
      </svg>
    </DetailCard>
  );
}
