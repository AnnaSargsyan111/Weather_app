import DetailCard from "../DetailCard.jsx";
import Badge from "../Badge.jsx";

export default function CloudCoverCard({ data }) {
  return (
    <DetailCard
      title="Cloud cover"
      badge={<Badge tone="orange" label={`${data.label} (${data.percent}%)`} />}
      description={`Currently ${data.percent}% cloud cover across the sky.`}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle, var(--color-surface-hover) 0%, var(--color-border) 100%)",
          border: "1px solid var(--color-border-strong)",
          textAlign: "center",
          padding: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)" }}>{data.label}</span>
      </div>
    </DetailCard>
  );
}
