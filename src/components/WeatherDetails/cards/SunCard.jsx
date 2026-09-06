import DetailCard from "../DetailCard.jsx";
import CelestialArc from "./CelestialArc.jsx";
import { toMinutesSinceMidnight } from "../../../utils/daylight.js";
import { formatHourLabel, formatDurationMinutes } from "../../../utils/weatherDetailsHelpers.js";

export default function SunCard({ data }) {
  if (!data) return <DetailCard title="Sun" description="Sunrise/sunset data is unavailable." />;

  const sunriseMin = toMinutesSinceMidnight(data.sunrise);
  const sunsetMin = toMinutesSinceMidnight(data.sunset);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const progress = sunsetMin > sunriseMin ? (nowMin - sunriseMin) / (sunsetMin - sunriseMin) : 0.5;

  return (
    <DetailCard title="Sun">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <CelestialArc progress={progress} color="#f97316" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginTop: 4 }}>
          {formatDurationMinutes(sunsetMin - sunriseMin)}
        </span>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 10, fontSize: 12 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text)" }}>{formatHourLabel(data.sunrise)}</strong>
            <br />
            Sunrise
          </span>
          <span style={{ color: "var(--color-text-secondary)", textAlign: "right" }}>
            <strong style={{ color: "var(--color-text)" }}>{formatHourLabel(data.sunset)}</strong>
            <br />
            Sunset
          </span>
        </div>
      </div>
    </DetailCard>
  );
}
