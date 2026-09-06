import DetailCard from "../DetailCard.jsx";

const RADIUS = 28;
const CENTER = 32;

function formatMonthDay(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export default function MoonPhaseCard({ data }) {
  if (!data) return <DetailCard title="Moon phase" description="Moon phase data is unavailable." />;

  // Two overlapping circles: a bright base disc, covered by a dark disc shifted
  // right by (fraction * diameter) - covering none at full moon, all at new moon.
  const offset = (data.percent / 100) * RADIUS * 2;

  return (
    <DetailCard title="Moon phase">
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
          <clipPath id="moonClip">
            <circle cx={CENTER} cy={CENTER} r={RADIUS} />
          </clipPath>
          <g clipPath="url(#moonClip)">
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#fde68a" />
            <circle cx={CENTER + offset} cy={CENTER} r={RADIUS} fill="var(--color-surface)" />
          </g>
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-border-strong)" strokeWidth="1" />
        </svg>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text)" }}>{data.percent}%</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Phase of moon</div>
        </div>
      </div>
      {data.nextFullMoon && (
        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--color-text-secondary)",
            background: "var(--color-bg-elevated)",
            borderRadius: 999,
            padding: "6px 10px",
            width: "fit-content",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fde68a", flexShrink: 0 }} />
          Next full moon: {formatMonthDay(data.nextFullMoon)}
        </div>
      )}
    </DetailCard>
  );
}
