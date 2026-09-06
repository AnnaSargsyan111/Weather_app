import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";

const BAR_WIDTHS = [100, 82, 64, 46, 28];

export default function VisibilityCard({ data }) {
  return (
    <DetailCard
      title="Visibility"
      badge={<Badge tone="orange" label={data.label} />}
      description={`Improving with a peak visibility distance of ${Math.round(data.peak.value)} km expected at ${data.peak.time}.`}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", alignItems: "center" }}>
          {BAR_WIDTHS.map((width, i) => (
            <div
              key={i}
              style={{
                width: `${width}%`,
                height: 5,
                borderRadius: 999,
                background: `rgba(34, 197, 94, ${1 - i * 0.15})`,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{data.km.toFixed(0)} km</span>
      </div>
    </DetailCard>
  );
}
