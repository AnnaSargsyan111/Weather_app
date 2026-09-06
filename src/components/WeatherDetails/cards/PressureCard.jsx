import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";
import { buildSmoothPath, scaleToRange } from "../svgPath.js";

const TREND_LABEL = { rising: "Rising", falling: "Falling", steady: "Steady" };

export default function PressureCard({ data, updatedAt }) {
  const points = data.hourly.slice(0, 12);
  const ys = scaleToRange(points.map((p) => p.v), 50);
  const xs = points.map((_, i) => (i / (points.length - 1 || 1)) * 100);
  const pathPoints = xs.map((x, i) => ({ x, y: ys[i] }));
  const last = pathPoints[pathPoints.length - 1];

  return (
    <DetailCard
      title="Pressure"
      badge={<Badge tone="blue" label={TREND_LABEL[data.trend]} />}
      description={`${TREND_LABEL[data.trend]} recently. Expected to change slowly over the next few hours.`}
    >
      <div style={{ width: "100%" }}>
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ width: "100%", height: 50 }}>
          <path d={buildSmoothPath(pathPoints)} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={last.x} cy={last.y} r="4" fill="#38bdf8" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)" }}>{Math.round(data.value)} mb</span>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{updatedAt} (Now)</span>
        </div>
      </div>
    </DetailCard>
  );
}
