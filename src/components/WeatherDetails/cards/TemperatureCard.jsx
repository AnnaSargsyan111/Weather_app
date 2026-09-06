import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";
import { buildSmoothPath, scaleToRange } from "../svgPath.js";
import { formatTemp } from "../../../utils/temperature.js";
import styles from "../WeatherDetails.module.css";

const TREND_LABEL = { rising: "Rising", falling: "Falling", steady: "Steady" };

export default function TemperatureCard({ data, unit }) {
  const points = data.hourly.slice(0, 12);
  const ys = scaleToRange(points.map((p) => p.v), 60);
  const xs = points.map((_, i) => (i / (points.length - 1 || 1)) * 100);
  const pathPoints = xs.map((x, i) => ({ x, y: ys[i] }));

  return (
    <DetailCard
      title="Temperature"
      badge={<Badge tone="orange" label={TREND_LABEL[data.trend]} />}
      description={`${TREND_LABEL[data.trend]} with a peak of ${formatTemp(data.peak.value, unit)} at ${data.peak.time}. Overnight low of ${formatTemp(data.low.value, unit)} at ${data.low.time}.`}
    >
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: "100%", height: 70 }}>
        <defs>
          <linearGradient id="tempLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <path d={buildSmoothPath(pathPoints)} fill="none" stroke="url(#tempLine)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={xs[0]} cy={ys[0]} r="4" fill="#fff" stroke="#f43f5e" strokeWidth="2" />
      </svg>
      <span className={styles.bigValue}>{formatTemp(data.current, unit)}</span>
    </DetailCard>
  );
}
