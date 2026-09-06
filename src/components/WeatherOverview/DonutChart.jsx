import styles from "./WeatherOverview.module.css";

const SIZE = 180;
const CENTER = SIZE / 2;
const RADIUS = 76;
// Thinner ring (was 24) so the inner hole is bigger and long center labels never
// overlap the colored segments.
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const COLORS = {
  sunny: "#FF6B00",
  rainy: "#0094FF",
  snowy: "#00E0FF",
};

export default function DonutChart({ stats, children }) {
  let offsetAccumulated = 0;
  const segments = ["sunny", "rainy", "snowy"].map((key) => {
    const fraction = stats[key].percent / 100;
    const length = fraction * CIRCUMFERENCE;
    const segment = { key, length, offset: offsetAccumulated };
    offsetAccumulated += length;
    return segment;
  });

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth={STROKE} />
        {segments.map(
          (segment) =>
            segment.length > 0 && (
              <circle
                key={segment.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={COLORS[segment.key]}
                strokeWidth={STROKE}
                strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                strokeDashoffset={-segment.offset}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
              />
            )
        )}
      </svg>
      {children && <div className={styles.chartCenter}>{children}</div>}
    </div>
  );
}
